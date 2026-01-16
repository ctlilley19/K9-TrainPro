import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/activities/icons - List available icons from library
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('icon_library')
      .select('*')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      // Search in name and tags
      query = query.or(`name.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get unique categories for filtering
    const { data: categoriesData } = await supabaseAdmin
      .from('icon_library')
      .select('category')
      .order('category');

    const categories = [...new Set(categoriesData?.map((c) => c.category) || [])];

    return NextResponse.json({
      icons: data,
      categories,
    });
  } catch (error) {
    console.error('Error fetching icons:', error);
    return NextResponse.json({ error: 'Failed to fetch icons' }, { status: 500 });
  }
}
