import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Create admin Supabase client for server-side operations

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityId, tier, billingInterval, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!facilityId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!SUBSCRIPTION_TIERS[tier as SubscriptionTier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as SubscriptionTier];
    const interval = billingInterval === 'year' ? 'year' : 'month';

    // Get price ID based on interval
    const priceId = interval === 'year'
      ? tierConfig.stripePriceIdAnnual
      : tierConfig.stripePriceIdMonthly;

    // For free tier, just update the facility
    if (tierConfig.monthlyPrice === 0) {
      await supabaseAdmin
        .from('facilities')
        .update({
          subscription_tier: 'free',
          subscription_status: 'active',
        })
        .eq('id', facilityId);

      return NextResponse.json({ success: true, tier: 'free' });
    }

    // Check if price ID is configured
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this tier' },
        { status: 500 }
      );
    }

    // Get facility and check for existing customer
    const { data: facility, error: facilityError } = await supabaseAdmin
      .from('facilities')
      .select('id, name, email, stripe_customer_id')
      .eq('id', facilityId)
      .single();

    if (facilityError || !facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = facility.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: facility.email,
        name: facility.name,
        metadata: {
          facility_id: facilityId,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await supabaseAdmin
        .from('facilities')
        .update({ stripe_customer_id: customerId })
        .eq('id', facilityId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          facility_id: facilityId,
          tier,
        },
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&canceled=true`,
      metadata: {
        facility_id: facilityId,
        tier,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
