import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/tags/designs/[id] - Get single design
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('tag_design_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ design: data });
  } catch (error) {
    console.error('Error fetching design:', error);
    return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 });
  }
}

// PATCH /api/tags/designs/[id] - Update design
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      designType,
      frontImageUrl,
      backImageUrl,
      isDefault,
      facilityId,
    } = body;

    const supabaseAdmin = getSupabaseAdmin();

    // If setting as default, unset other defaults
    if (isDefault && facilityId) {
      await supabaseAdmin
        .from('tag_design_templates')
        .update({ is_default: false })
        .eq('facility_id', facilityId)
        .neq('id', id);
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (designType !== undefined) updateData.design_type = designType;
    if (frontImageUrl !== undefined) updateData.front_image_url = frontImageUrl;
    if (backImageUrl !== undefined) updateData.back_image_url = backImageUrl;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    const { data, error } = await supabaseAdmin
      .from('tag_design_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ design: data });
  } catch (error) {
    console.error('Error updating design:', error);
    return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
  }
}

// DELETE /api/tags/designs/[id] - Delete design
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    // Check if design is used by any orders
    const { data: orders } = await supabaseAdmin
      .from('tag_orders')
      .select('id')
      .eq('design_template_id', id)
      .limit(1);

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete design that has been used in orders' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('tag_design_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting design:', error);
    return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
  }
}
