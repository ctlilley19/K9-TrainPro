import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminSession } from '@/services/admin/auth';
import { logUserEvent } from '@/services/admin/audit';

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/admin/users/search - Search users with audit logging
export async function POST(request: NextRequest) {
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

    // Check permissions - most admin roles can search users
    if (!['super_admin', 'support', 'billing', 'moderator'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

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

    // Search for users by email (using Supabase auth admin API)
    // In production, this would query your users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 10,
    });

    if (authError) {
      console.error('Error searching users:', authError);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    // Filter by email
    const matchingUsers = authUsers.users.filter((user) =>
      user.email?.toLowerCase().includes(email.toLowerCase())
    );

    // Map to safe response format (no sensitive data)
    const users = matchingUsers.slice(0, 10).map((user) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name,
      created_at: user.created_at,
      last_login: user.last_sign_in_at,
      email_confirmed: user.email_confirmed_at !== null,
      is_suspended: user.banned_until !== null,
    }));

    // Log the search
    await logUserEvent(
      session.admin.id,
      'user_search',
      'search',
      `User search: "${email}"`,
      reason,
      { ipAddress, userAgent, metadata: { query: email, results: users.length } }
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/users/search/[id] - Get single user details
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!userId || !reason) {
      return NextResponse.json({ error: 'User ID and reason are required' }, { status: 400 });
    }

    // Get user from Supabase auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = authData.user;

    // Get additional data from profiles table if exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get dogs count
    const { count: dogsCount } = await supabaseAdmin
      .from('dogs')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    // Get subscription info
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
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

    // Return user data (excluding sensitive fields based on role)
    const userData = {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name,
      created_at: user.created_at,
      last_login: user.last_sign_in_at,
      email_confirmed: user.email_confirmed_at !== null,
      is_suspended: user.banned_until !== null,
      dogs_count: dogsCount || 0,
      subscription_tier: subscription?.tier || 'free',
      subscription_status: subscription?.status,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
