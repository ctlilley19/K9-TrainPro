import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';


// GET /api/tags/[id] - Get single tag details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('tags')
      .select(`
        *,
        dog:dogs(id, name, breed, photo_url, family_id),
        order:tag_orders(id, order_number, created_at, status),
        facility:facilities(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ tag: data });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

// PATCH /api/tags/[id] - Update tag (assign, unassign, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, dogId, userId, reason } = body;

    // Get current tag
    const { data: tag, error: tagError } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (tagError || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'assign':
        if (!dogId) {
          return NextResponse.json({ error: 'Dog ID required' }, { status: 400 });
        }
        updateData = {
          dog_id: dogId,
          status: 'active',
          assigned_at: new Date().toISOString(),
          assigned_by: userId,
        };
        break;

      case 'unassign':
        updateData = {
          dog_id: null,
          status: 'unassigned',
          assigned_at: null,
          assigned_by: null,
        };
        break;

      case 'deactivate':
        updateData = {
          status: 'deactivated',
          deactivated_at: new Date().toISOString(),
          deactivated_reason: reason || 'Lost or stolen',
        };
        break;

      case 'reactivate':
        updateData = {
          status: tag.dog_id ? 'active' : 'unassigned',
          deactivated_at: null,
          deactivated_reason: null,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ tag: data });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}
