import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/tags - List tags for a facility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');
    const dogId = searchParams.get('dogId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Missing facility ID' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('tags')
      .select(`
        *,
        dog:dogs(id, name, breed, photo_url),
        order:tag_orders(id, order_number, created_at)
      `)
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (dogId) {
      query = query.eq('dog_id', dogId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tags: data });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
