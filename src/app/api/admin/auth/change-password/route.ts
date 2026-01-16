import { NextRequest, NextResponse } from 'next/server';
import { changePassword, validateAdminSession } from '@/services/admin/auth';

// POST /api/admin/auth/change-password
export async function POST(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate session
    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain an uppercase letter' }, { status: 400 });
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain a lowercase letter' }, { status: 400 });
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain a number' }, { status: 400 });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain a special character' }, { status: 400 });
    }

    // Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Change password
    const result = await changePassword(
      session.admin.id,
      currentPassword,
      newPassword,
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
