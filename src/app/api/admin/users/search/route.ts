import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logUserEvent } from '@/services/admin/audit';


// POST /api/admin/users/search - Search users with audit logging
export async function POST(request: NextRequest) {
  try {
    // Validate session from header
    const sessionToken = request.headers.get('x-admin-session');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions - most admin roles can search users
    if (!['super_admin', 'support', 'billing', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { email, reason } = body;

    // Require email and reason
    if (!email || !reason) {
      return NextResponse.json({ error: 'Email and reason are required' }, { status: 400 });
    }

    // Validate reason
    const validReasons = [
      'support_ticket',
      'billing_inquiry',
      'account_recovery',
      'moderation',
      'legal_request',
      'other',
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    // Get IP for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Search for users in the users table by email
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, created_at, last_login_at')
      .ilike('email', `%${email}%`)
      .limit(10);

    if (usersError) {
      console.error('Error searching users:', usersError);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    // Get dogs count and facility info for each user
    const usersWithDetails = await Promise.all((usersData || []).map(async (user) => {
      const [dogsResult, facilityResult] = await Promise.all([
        supabase
          .from('dogs')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id),
        supabase
          .from('facility_members')
          .select('facility:facilities(subscription_tier)')
          .eq('user_id', user.id)
          .limit(1)
          .single(),
      ]);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        last_login: user.last_login_at,
        is_suspended: false, // Would need a suspended field in users table
        dogs_count: dogsResult.count || 0,
        subscription_tier: facilityResult.data?.facility?.subscription_tier || 'Free',
      };
    }));

    // Log the search
    await logUserEvent(
      session.admin.id,
      'user_search',
      'search',
      `User search: "${email}"`,
      reason,
      { ipAddress, userAgent, metadata: { query: email, results: usersWithDetails.length } }
    );

    return NextResponse.json({ users: usersWithDetails });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/users/search - Get single user details
export async function GET(request: NextRequest) {
  try {
    // Validate session from header
    const sessionToken = request.headers.get('x-admin-session');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!userId || !reason) {
      return NextResponse.json({ error: 'User ID and reason are required' }, { status: 400 });
    }

    // Get user from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get dogs count
    const { count: dogsCount } = await supabase
      .from('dogs')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId);

    // Get facility/subscription info
    const { data: facilityMember } = await supabase
      .from('facility_members')
      .select('facility:facilities(subscription_tier, subscription_status)')
      .eq('user_id', userId)
      .limit(1)
      .single();

    // Log the view
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    await logUserEvent(
      session.admin.id,
      'user_view',
      userId,
      `Viewed user details: ${user.email}`,
      reason,
      { ipAddress, userAgent }
    );

    // Return user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      last_login: user.last_login_at,
      is_suspended: false,
      dogs_count: dogsCount || 0,
      subscription_tier: facilityMember?.facility?.subscription_tier || 'Free',
      subscription_status: facilityMember?.facility?.subscription_status,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
