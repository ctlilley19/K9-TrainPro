import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';


// GET /api/admin/analytics - Get analytics data
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

    // Check permissions - super_admin, analytics can view
    if (!['super_admin', 'analytics'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get specific metric
    if (metric) {
      switch (metric) {
        case 'users':
          return NextResponse.json(await getUserMetrics(startDate));
        case 'revenue':
          return NextResponse.json(await getRevenueMetrics(startDate));
        case 'engagement':
          return NextResponse.json(await getEngagementMetrics(startDate));
        case 'retention':
          return NextResponse.json(await getRetentionMetrics(startDate));
        default:
          return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
      }
    }

    // Return all overview metrics
    const [users, revenue, engagement] = await Promise.all([
      getUserMetrics(startDate),
      getRevenueMetrics(startDate),
      getEngagementMetrics(startDate),
    ]);

    return NextResponse.json({
      users,
      revenue,
      engagement,
      range,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get user metrics
async function getUserMetrics(startDate: Date) {
  try {
    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get new users in range
    const { count: newUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get active users (logged in during range)
    const { data: activeData } = await getSupabaseAdmin().auth.admin.listUsers({
      perPage: 1000,
    });

    const activeUsers = activeData?.users.filter(
      (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= startDate
    ).length || 0;

    // Calculate growth rate (mock for demo)
    const growthRate = 12.5;

    return {
      total: totalUsers || 0,
      new: newUsers || 0,
      active: activeUsers,
      growthRate,
    };
  } catch (error) {
    console.error('Error getting user metrics:', error);
    return {
      total: 0,
      new: 0,
      active: 0,
      growthRate: 0,
    };
  }
}

// Get revenue metrics
async function getRevenueMetrics(startDate: Date) {
  // In production, this would query Stripe or your billing system
  // For demo, return mock data
  return {
    mrr: 18450,
    mrrChange: 8.2,
    arr: 221400,
    averageRevenue: 32.54,
    lifetimeValue: 142,
    churnRate: 3.2,
  };
}

// Get engagement metrics
async function getEngagementMetrics(startDate: Date) {
  try {
    // Get total dogs
    const { count: totalDogs } = await supabaseAdmin
      .from('dogs')
      .select('*', { count: 'exact', head: true });

    // Get training sessions (if table exists)
    let totalSessions = 0;
    try {
      const { count } = await supabaseAdmin
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());
      totalSessions = count || 0;
    } catch {
      // Table might not exist
      totalSessions = 12450; // Demo data
    }

    return {
      totalDogs: totalDogs || 0,
      trainingSessions: totalSessions,
      avgSessionsPerUser: 8.2,
      avgSessionDuration: 15.5, // minutes
    };
  } catch (error) {
    console.error('Error getting engagement metrics:', error);
    return {
      totalDogs: 0,
      trainingSessions: 0,
      avgSessionsPerUser: 0,
      avgSessionDuration: 0,
    };
  }
}

// Get retention metrics
async function getRetentionMetrics(startDate: Date) {
  // In production, calculate from actual user activity
  // For demo, return mock cohort data
  return {
    week1: 100,
    week2: 82,
    week4: 68,
    week8: 54,
    week12: 45,
  };
}
