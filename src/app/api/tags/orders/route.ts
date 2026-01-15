import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/tags/orders - List orders for a facility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tag_orders')
      .select(`
        *,
        tags:tags(count),
        vendor:vendors(name, code)
      `)
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/tags/orders - Create new tag order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      userId,
      quantity,
      designType = 'default',
      productType = 'single_sided',
      designTemplateId,
      shippingAddress,
      successUrl,
      cancelUrl,
    } = body;

    // Validate required fields
    if (!facilityId || !userId || !quantity || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get facility details
    const { data: facility, error: facilityError } = await supabaseAdmin
      .from('facilities')
      .select('id, name, subscription_tier, free_tags_allowance, free_tags_used, stripe_customer_id')
      .eq('id', facilityId)
      .single();

    if (facilityError || !facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    // Check tier access
    const tier = facility.subscription_tier;
    const canOrderCustom = ['starter', 'professional', 'enterprise'].includes(tier);
    const canOrder = tier === 'family_pro' || canOrderCustom;

    if (!canOrder) {
      return NextResponse.json(
        { error: 'Your subscription tier does not allow tag ordering' },
        { status: 403 }
      );
    }

    if (designType === 'custom' && !canOrderCustom) {
      return NextResponse.json(
        { error: 'Custom designs require a Business tier subscription' },
        { status: 403 }
      );
    }

    // Get pricing
    const { data: pricing } = await supabaseAdmin
      .from('tag_pricing')
      .select('unit_price')
      .eq('design_type', designType)
      .eq('is_active', true)
      .lte('min_quantity', quantity)
      .or(`max_quantity.gte.${quantity},max_quantity.is.null`)
      .order('min_quantity', { ascending: false })
      .limit(1)
      .single();

    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 500 });
    }

    // Get vendor pricing (TapTag)
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('id')
      .eq('code', 'taptag')
      .single();

    const vendorProductType = designType === 'custom' ? 'double_sided' : 'single_sided';
    const { data: vendorPricing } = await supabaseAdmin
      .from('vendor_pricing')
      .select('unit_cost')
      .eq('vendor_id', vendor?.id)
      .eq('product_type', vendorProductType)
      .eq('is_active', true)
      .lte('min_quantity', quantity)
      .or(`max_quantity.gte.${quantity},max_quantity.is.null`)
      .order('min_quantity', { ascending: false })
      .limit(1)
      .single();

    const unitPrice = pricing.unit_price;
    const vendorUnitCost = vendorPricing?.unit_cost || 0;

    // Calculate free tags
    const freeTagsRemaining = Math.max(0, (facility.free_tags_allowance || 0) - (facility.free_tags_used || 0));
    const freeTagsToApply = Math.min(freeTagsRemaining, quantity);
    const chargeableQuantity = quantity - freeTagsToApply;

    // Calculate totals
    const subtotal = chargeableQuantity * unitPrice;
    const totalAmount = subtotal; // No tax for now
    const profitMargin = subtotal - (chargeableQuantity * vendorUnitCost);

    // Generate order number
    const { data: orderNum } = await supabaseAdmin.rpc('generate_tag_order_number');
    const orderNumber = orderNum || `ORD-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('tag_orders')
      .insert({
        order_number: orderNumber,
        facility_id: facilityId,
        user_id: userId,
        quantity,
        design_type: designType,
        product_type: productType,
        design_template_id: designTemplateId,
        unit_price: unitPrice,
        vendor_unit_cost: vendorUnitCost,
        subtotal,
        free_tags_applied: freeTagsToApply,
        total_amount: totalAmount,
        profit_margin: profitMargin,
        shipping_name: shippingAddress.name,
        shipping_company: shippingAddress.company,
        shipping_address_line1: shippingAddress.line1,
        shipping_address_line2: shippingAddress.line2,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip: shippingAddress.zip,
        shipping_country: shippingAddress.country || 'US',
        shipping_phone: shippingAddress.phone,
        vendor_id: vendor?.id,
        status: totalAmount > 0 ? 'pending_payment' : 'paid',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Generate tag codes for this order
    const tagCodes: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const { data: tagCode } = await supabaseAdmin.rpc('generate_unique_tag_code');
      tagCodes.push(tagCode);
    }

    // Create tags
    const tagsToInsert = tagCodes.map((code) => ({
      tag_code: code,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/tag/${code}`,
      facility_id: facilityId,
      order_id: order.id,
      design_type: designType,
      status: 'pending',
    }));

    const { error: tagsError } = await supabaseAdmin
      .from('tags')
      .insert(tagsToInsert);

    if (tagsError) throw tagsError;

    // Update free tags used
    if (freeTagsToApply > 0) {
      await supabaseAdmin
        .from('facilities')
        .update({ free_tags_used: (facility.free_tags_used || 0) + freeTagsToApply })
        .eq('id', facilityId);
    }

    // If free order (all free tags), process immediately
    if (totalAmount === 0) {
      // Send to vendor (would trigger email here)
      await supabaseAdmin
        .from('tag_orders')
        .update({
          status: 'sent_to_vendor',
          vendor_email_sent_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      return NextResponse.json({
        order,
        tagCodes,
        isFree: true,
      });
    }

    // Create Stripe checkout session for paid orders
    let customerId = facility.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { facility_id: facilityId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('facilities')
        .update({ stripe_customer_id: customerId })
        .eq('id', facilityId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `NFC Dog Tags (${quantity}x)`,
              description: `${designType === 'custom' ? 'Custom' : 'Default'} design - ${productType.replace('_', ' ')}`,
            },
            unit_amount: unitPrice,
          },
          quantity: chargeableQuantity,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/tags?order=${order.id}&success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/tags/order?canceled=true`,
      metadata: {
        order_id: order.id,
        facility_id: facilityId,
        type: 'tag_order',
      },
    });

    // Update order with checkout session
    await supabaseAdmin
      .from('tag_orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      order,
      tagCodes,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
