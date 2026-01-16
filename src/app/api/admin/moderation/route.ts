import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';

// GET /api/admin/moderation - Get flagged content
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-admin-session');
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

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Try to fetch from flagged_content table
    let flaggedContent: Array<{
      id: string;
      content_type: string;
      content_preview: string;
      user_id: string;
      user_email: string;
      user_name: string;
      reason: string;
      reported_by: string;
      reported_at: string;
      status: string;
      user_strikes: number;
    }> = [];

    const { data: flaggedData, error: flaggedError } = await supabase
      .from('flagged_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (flaggedError) {
      console.error('Error fetching flagged content:', flaggedError);
      // Table might not exist or no data
    }

    if (flaggedData && flaggedData.length > 0) {
      // Get user info for flagged content
      const userIds = [...new Set(flaggedData.map(f => f.user_id))];
      const { data: users } = await supabase
        .from('users')
        .select('id, email, name')
        .in('id', userIds);

      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      // Get user strikes
      const { data: strikes } = await supabase
        .from('user_strikes')
        .select('user_id')
        .in('user_id', userIds);

      const strikeCount = strikes?.reduce((acc, s) => {
        acc[s.user_id] = (acc[s.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      flaggedContent = flaggedData.map(item => {
        const user = userMap.get(item.user_id);
        return {
          id: item.id,
          content_type: item.content_type || 'post',
          content_preview: item.content_preview || item.content_id,
          user_id: item.user_id,
          user_email: user?.email || 'Unknown',
          user_name: user?.name || 'Unknown User',
          reason: item.reason || 'No reason provided',
          reported_by: item.reported_by_user_id || 'Anonymous',
          reported_at: item.created_at,
          status: item.status || 'pending',
          user_strikes: strikeCount[item.user_id] || 0,
        };
      });
    }

    // Get stats
    const stats = {
      pending: flaggedContent.filter(c => c.status === 'pending').length,
      reviewed: flaggedContent.filter(c => c.status === 'reviewed').length,
      removed: flaggedContent.filter(c => c.status === 'removed').length,
      dismissed: flaggedContent.filter(c => c.status === 'dismissed').length,
    };

    // Get user bans count
    const { count: bannedCount } = await supabase
      .from('user_strikes')
      .select('id', { count: 'exact', head: true })
      .eq('action_taken', 'ban');

    // Filter by status if not 'all'
    const filteredContent = status === 'all'
      ? flaggedContent
      : flaggedContent.filter(c => c.status === status);

    return NextResponse.json({
      flaggedContent: filteredContent,
      stats: {
        ...stats,
        banned: bannedCount || 0,
      },
    });
  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/moderation - Perform moderation action
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-admin-session');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!['super_admin', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { action, contentId, userId, note } = body;

    switch (action) {
      case 'dismiss':
        // Mark content as dismissed
        await supabase
          .from('flagged_content')
          .update({ status: 'dismissed', reviewed_by: session.admin.id, reviewed_at: new Date().toISOString() })
          .eq('id', contentId);
        break;

      case 'remove':
        // Mark content as removed
        await supabase
          .from('flagged_content')
          .update({ status: 'removed', reviewed_by: session.admin.id, reviewed_at: new Date().toISOString() })
          .eq('id', contentId);
        break;

      case 'warn':
        // Add strike to user
        await supabase.from('user_strikes').insert({
          user_id: userId,
          strike_number: 1, // Would need to calculate next strike number
          reason: note || 'Content violation',
          action_taken: 'warning',
          issued_by: session.admin.id,
        });

        // Update content status
        await supabase
          .from('flagged_content')
          .update({ status: 'reviewed', reviewed_by: session.admin.id, reviewed_at: new Date().toISOString() })
          .eq('id', contentId);
        break;

      case 'ban':
        // Add ban strike
        await supabase.from('user_strikes').insert({
          user_id: userId,
          strike_number: 99,
          reason: note || 'Banned by moderator',
          action_taken: 'ban',
          issued_by: session.admin.id,
        });

        // Update content status
        await supabase
          .from('flagged_content')
          .update({ status: 'removed', reviewed_by: session.admin.id, reviewed_at: new Date().toISOString() })
          .eq('id', contentId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log action to audit log
    await supabase.from('audit_log').insert({
      admin_id: session.admin.id,
      admin_email: session.admin.email,
      action: `moderation_${action}`,
      category: 'moderation',
      target_type: 'content',
      target_id: contentId,
      reason: note,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
