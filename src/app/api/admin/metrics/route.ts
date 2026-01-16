import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';

export async function GET(request: Request) {
  try {
    // Validate admin session
    const sessionToken = request.headers.get('x-admin-session');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch all metrics in parallel
    const [
      usersResult,
      usersLastMonthResult,
      dogsResult,
      facilitiesResult,
      ticketsResult,
      badgesResult,
      activitiesTodayResult,
      flaggedResult,
      recentActivityResult,
    ] = await Promise.all([
      // Active users (users who logged in within 30 days)
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('last_login_at', thirtyDaysAgo.toISOString()),

      // Users from previous 30 days (for comparison)
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),

      // Active dogs
      supabase
        .from('dogs')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Facilities with active subscriptions (for MRR calculation)
      supabase
        .from('facilities')
        .select('subscription_tier, subscription_status')
        .eq('subscription_status', 'active'),

      // Open support tickets
      supabase
        .from('support_tickets')
        .select('id, priority', { count: 'exact' })
        .in('status', ['open', 'in_progress']),

      // Pending badge reviews
      supabase
        .from('earned_badges')
        .select('id', { count: 'exact', head: true })
        .eq('verified', false),

      // Activities/sessions today
      supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .gte('start_time', startOfToday.toISOString()),

      // Flagged content (placeholder - using reported users for now)
      supabase
        .from('audit_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'moderation')
        .gte('created_at', thirtyDaysAgo.toISOString()),

      // Recent activity from audit log
      supabase
        .from('audit_log')
        .select('id, action, category, reason, created_at, admin_email')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Calculate MRR based on subscription tiers
    const tierPricing: Record<string, number> = {
      starter: 79,
      professional: 149,
      enterprise: 249,
      free: 0,
    };

    let mrr = 0;
    if (facilitiesResult.data) {
      facilitiesResult.data.forEach((facility) => {
        const tier = facility.subscription_tier?.toLowerCase() || 'free';
        mrr += tierPricing[tier] || 0;
      });
    }

    // Calculate urgent tickets
    const urgentTickets = ticketsResult.data?.filter(
      (t) => t.priority === 'urgent'
    ).length || 0;

    // Get previous month MRR for comparison (simplified - assume same)
    const mrrChange = mrr > 0 ? 0 : 0; // Would need historical data for real comparison

    // Active users change calculation
    const activeUsers = usersResult.count || 0;
    const newUsersThisMonth = usersLastMonthResult.count || 0;
    const activeUsersChange = activeUsers > 0
      ? Math.round((newUsersThisMonth / activeUsers) * 100)
      : 0;

    // Format recent activity
    const recentActivity = (recentActivityResult.data || []).map((item) => {
      const timeAgo = getTimeAgo(new Date(item.created_at));
      return {
        action: formatAction(item.action),
        detail: item.reason || item.admin_email || '',
        time: timeAgo,
        type: item.category,
      };
    });

    const metrics = {
      activeUsers,
      activeUsersChange,
      mrr,
      mrrChange,
      openTickets: ticketsResult.count || 0,
      urgentTickets,
      badgeQueue: badgesResult.count || 0,
      featuredBadges: 0, // Would need a featured flag in schema
      dogsActive: dogsResult.count || 0,
      dogsNew: 0, // Would need to filter by created_at
      sessionsToday: activitiesTodayResult.count || 0,
      avgSessions: 0, // Would need historical calculation
      systemHealth: 99.9, // Placeholder - could integrate with monitoring
      flaggedContent: flaggedResult.count || 0,
      recentActivity,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Helper function to format action names
function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    login_success: 'Admin logged in',
    login_failed: 'Failed login attempt',
    logout: 'Admin logged out',
    mfa_enabled: 'MFA enabled',
    mfa_failed: 'MFA verification failed',
    password_changed: 'Password changed',
    user_search: 'User search performed',
    badge_approved: 'Badge approved',
    badge_rejected: 'Badge rejected',
    ticket_created: 'Support ticket created',
    ticket_resolved: 'Support ticket resolved',
    content_flagged: 'Content flagged',
    user_suspended: 'User suspended',
  };

  return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
