import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logBadgeEvent } from '@/services/admin/audit';


// GET /api/admin/badges - List badges for review
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions - super_admin, moderator can view badges
    if (!['super_admin', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabaseAdmin
      .from('badges')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: badges, error, count } = await query;

    if (error) {
      console.error('Error fetching badges:', error);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Get stats
    const { data: pendingCount } = await supabaseAdmin
      .from('badges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: featuredCount } = await supabaseAdmin
      .from('badges')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true);

    return NextResponse.json({
      badges: badges || [],
      total: count || 0,
      stats: {
        pending: pendingCount || 0,
        featured: featuredCount || 0,
      },
    });
  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/badges - Update badge (approve, reject, feature)
export async function PATCH(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions
    if (!['super_admin', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { badgeId, action, reason, changes } = body;

    if (!badgeId || !action) {
      return NextResponse.json({ error: 'Badge ID and action required' }, { status: 400 });
    }

    // Get current badge
    const { data: badge, error: fetchError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (fetchError || !badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    let updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      reviewed_by: session.admin.id,
      reviewed_at: new Date().toISOString(),
    };

    let eventType: 'badge_approved' | 'badge_rejected' | 'badge_featured' | 'badge_unfeatured' | 'badge_changes_requested';
    let description: string;

    switch (action) {
      case 'approve':
        updates.status = 'approved';
        eventType = 'badge_approved';
        description = `Badge "${badge.name}" approved`;
        break;

      case 'reject':
        updates.status = 'rejected';
        updates.rejection_reason = reason;
        eventType = 'badge_rejected';
        description = `Badge "${badge.name}" rejected: ${reason}`;
        break;

      case 'feature':
        updates.is_featured = true;
        updates.featured_at = new Date().toISOString();
        eventType = 'badge_featured';
        description = `Badge "${badge.name}" featured`;
        break;

      case 'unfeature':
        updates.is_featured = false;
        updates.featured_at = null;
        eventType = 'badge_unfeatured';
        description = `Badge "${badge.name}" unfeatured`;
        break;

      case 'request_changes':
        updates.status = 'changes_requested';
        updates.change_request = changes;
        eventType = 'badge_changes_requested';
        description = `Changes requested for badge "${badge.name}"`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update badge
    const { error: updateError } = await supabaseAdmin
      .from('badges')
      .update(updates)
      .eq('id', badgeId);

    if (updateError) {
      console.error('Error updating badge:', updateError);
      return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
    }

    // Log the action
    await logBadgeEvent(session.admin.id, eventType, badgeId, description, {
      reason: reason || changes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Badge update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
