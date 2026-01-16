import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/tags/designs - List design templates for a facility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tag_design_templates')
      .select('*')
      .eq('facility_id', facilityId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ designs: data });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

// POST /api/tags/designs - Create new design template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facilityId,
      userId,
      name,
      designType,
      frontImageUrl,
      backImageUrl,
      isDefault,
    } = body;

    if (!facilityId || !userId || !name || !frontImageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabaseAdmin
        .from('tag_design_templates')
        .update({ is_default: false })
        .eq('facility_id', facilityId);
    }

    const { data, error } = await supabaseAdmin
      .from('tag_design_templates')
      .insert({
        facility_id: facilityId,
        name,
        design_type: designType || 'double_sided',
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        is_default: isDefault || false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ design: data });
  } catch (error) {
    console.error('Error creating design:', error);
    return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
  }
}
