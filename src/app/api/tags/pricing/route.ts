import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/tags/pricing - Get tag pricing tiers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const designType = searchParams.get('designType') || 'default';
    const quantity = parseInt(searchParams.get('quantity') || '1', 10);

    const supabaseAdmin = getSupabaseAdmin();

    // Get all pricing tiers
    const { data: allPricing, error: pricingError } = await supabaseAdmin
      .from('tag_pricing')
      .select('*')
      .eq('is_active', true)
      .order('design_type')
      .order('min_quantity');

    if (pricingError) throw pricingError;

    // Get specific unit price for quantity
    const { data: unitPriceData } = await supabaseAdmin
      .from('tag_pricing')
      .select('unit_price')
      .eq('design_type', designType)
      .eq('is_active', true)
      .lte('min_quantity', quantity)
      .or(`max_quantity.gte.${quantity},max_quantity.is.null`)
      .order('min_quantity', { ascending: false })
      .limit(1)
      .single();

    // Group pricing by design type
    const pricingByType: Record<string, Array<{
      minQuantity: number;
      maxQuantity: number | null;
      unitPrice: number;
      displayPrice: string;
    }>> = {};

    for (const tier of allPricing) {
      const type = tier.design_type;
      if (!pricingByType[type]) {
        pricingByType[type] = [];
      }
      pricingByType[type].push({
        minQuantity: tier.min_quantity,
        maxQuantity: tier.max_quantity,
        unitPrice: tier.unit_price,
        displayPrice: `$${(tier.unit_price / 100).toFixed(2)}`,
      });
    }

    const unitPrice = unitPriceData?.unit_price || 0;
    const subtotal = unitPrice * quantity;

    return NextResponse.json({
      pricingTiers: pricingByType,
      calculatedPrice: {
        designType,
        quantity,
        unitPrice,
        unitPriceDisplay: `$${(unitPrice / 100).toFixed(2)}`,
        subtotal,
        subtotalDisplay: `$${(subtotal / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
