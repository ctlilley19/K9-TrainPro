/**
 * Admin Authentication Service
 * Handles admin login, MFA, and session management
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { TOTP, generateSecret, generateURI, verify } from 'otplib';
import bcrypt from 'bcryptjs';
import { SupabaseClient } from '@supabase/supabase-js';

// Create TOTP instance
const totp = new TOTP();

// Types
export type AdminRole = 'super_admin' | 'support' | 'moderator' | 'analytics' | 'billing';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  mfaEnabled: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  adminId: string;
  sessionToken: string;
  expiresAt: string;
  lastActivity: string;
}

export interface LoginResult {
  success: boolean;
  requiresMfa: boolean;
  requiresPasswordChange: boolean;
  requiresMfaSetup: boolean;
  admin?: AdminUser;
  sessionToken?: string;
  error?: string;
}

export interface MfaSetupResult {
  success: boolean;
  secret?: string;
  qrCodeUrl?: string;
  error?: string;
}

// Constants
const SESSION_DURATION_MINUTES = 30;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

/**
 * Authenticate admin with email and password
 */
export async function adminLogin(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const supabase = getSupabaseAdmin();

  try {
    // Find admin by email
    const { data: admin, error: findError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (findError || !admin) {
      // Log failed attempt (don't reveal if email exists)
      await logAuthEvent(supabase, null, 'login_failed', 'Invalid credentials', ipAddress, userAgent);
      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'Invalid email or password' };
    }

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      await logAuthEvent(supabase, admin.id, 'login_locked', 'Account locked due to failed attempts', ipAddress, userAgent);
      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'Account is temporarily locked. Please try again later.' };
    }

    // Check if account is active
    if (!admin.is_active) {
      await logAuthEvent(supabase, admin.id, 'login_inactive', 'Inactive account login attempt', ipAddress, userAgent);
      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'Account is disabled. Please contact support.' };
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, admin.password_hash);

    if (!passwordValid) {
      // Increment failed attempts
      const newAttempts = (admin.failed_login_attempts || 0) + 1;
      const updates: Record<string, unknown> = { failed_login_attempts: newAttempts };

      // Lock account if too many attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
      }

      await supabase.from('admin_users').update(updates).eq('id', admin.id);
      await logAuthEvent(supabase, admin.id, 'login_failed', `Invalid password (attempt ${newAttempts})`, ipAddress, userAgent);

      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'Invalid email or password' };
    }

    // Password correct - reset failed attempts
    await supabase.from('admin_users').update({ failed_login_attempts: 0, locked_until: null }).eq('id', admin.id);

    // Check if MFA is required but not set up
    if (!admin.mfa_enabled) {
      await logAuthEvent(supabase, admin.id, 'login_mfa_required', 'MFA setup required', ipAddress, userAgent);
      return {
        success: true,
        requiresMfa: false,
        requiresPasswordChange: admin.must_change_password,
        requiresMfaSetup: true,
        admin: transformAdmin(admin),
      };
    }

    // MFA is enabled - require verification
    await logAuthEvent(supabase, admin.id, 'login_mfa_pending', 'MFA verification required', ipAddress, userAgent);
    return {
      success: true,
      requiresMfa: true,
      requiresPasswordChange: admin.must_change_password,
      requiresMfaSetup: false,
      admin: transformAdmin(admin),
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'An error occurred during login' };
  }
}

/**
 * Verify MFA code and create session
 */
export async function verifyMfa(
  adminId: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const supabase = getSupabaseAdmin();

  try {
    // Get admin with MFA secret
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error || !admin || !admin.mfa_secret) {
      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'Invalid admin or MFA not configured' };
    }

    // Verify TOTP code
    const isValid = totp.verify({ token: code, secret: admin.mfa_secret });

    if (!isValid) {
      // Check backup codes
      const backupCodes = admin.mfa_backup_codes || [];
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        await logAuthEvent(supabase, adminId, 'mfa_failed', 'Invalid MFA code', ipAddress, userAgent);
        return { success: false, requiresMfa: true, requiresPasswordChange: false, requiresMfaSetup: false, error: 'Invalid verification code' };
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await supabase.from('admin_users').update({ mfa_backup_codes: backupCodes }).eq('id', adminId);
      await logAuthEvent(supabase, adminId, 'mfa_backup_used', 'Backup code used for MFA', ipAddress, userAgent);
    }

    // Create session
    const session = await createAdminSession(supabase, adminId, ipAddress, userAgent);

    // Update last login
    await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', adminId);

    await logAuthEvent(supabase, adminId, 'login_success', 'Successful login with MFA', ipAddress, userAgent);

    return {
      success: true,
      requiresMfa: false,
      requiresPasswordChange: admin.must_change_password,
      requiresMfaSetup: false,
      admin: transformAdmin(admin),
      sessionToken: session.session_token,
    };
  } catch (error) {
    console.error('MFA verification error:', error);
    return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: false, error: 'An error occurred during verification' };
  }
}

/**
 * Set up MFA for admin
 */
export async function setupMfa(adminId: string): Promise<MfaSetupResult> {
  const supabase = getSupabaseAdmin();

  try {
    // Get admin
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('email')
      .eq('id', adminId)
      .single();

    if (error || !admin) {
      return { success: false, error: 'Admin not found' };
    }

    // Generate secret
    const secret = generateSecret();

    // Generate QR code URL (otpauth URL for authenticator apps)
    const otpauthUrl = generateURI({
      issuer: 'K9 ProTrain Admin',
      label: admin.email,
      secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Store secret (not yet enabled)
    await supabase.from('admin_users').update({ mfa_secret: secret }).eq('id', adminId);

    return {
      success: true,
      secret,
      qrCodeUrl: otpauthUrl,
    };
  } catch (error) {
    console.error('MFA setup error:', error);
    return { success: false, error: 'Failed to set up MFA' };
  }
}

/**
 * Complete MFA setup by verifying first code
 */
export async function completeMfaSetup(
  adminId: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const supabase = getSupabaseAdmin();

  try {
    // Get admin with secret
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error || !admin || !admin.mfa_secret) {
      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: true, error: 'MFA not initialized' };
    }

    // Verify code
    const isValid = totp.verify({ token: code, secret: admin.mfa_secret });

    if (!isValid) {
      return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: true, error: 'Invalid verification code' };
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Enable MFA
    await supabase.from('admin_users').update({
      mfa_enabled: true,
      mfa_backup_codes: backupCodes,
      last_login: new Date().toISOString(),
    }).eq('id', adminId);

    // Create session
    const session = await createAdminSession(supabase, adminId, ipAddress, userAgent);

    await logAuthEvent(supabase, adminId, 'mfa_enabled', 'MFA successfully enabled', ipAddress, userAgent);

    return {
      success: true,
      requiresMfa: false,
      requiresPasswordChange: admin.must_change_password,
      requiresMfaSetup: false,
      admin: transformAdmin({ ...admin, mfa_enabled: true }),
      sessionToken: session.session_token,
    };
  } catch (error) {
    console.error('MFA completion error:', error);
    return { success: false, requiresMfa: false, requiresPasswordChange: false, requiresMfaSetup: true, error: 'Failed to complete MFA setup' };
  }
}

/**
 * Change admin password
 */
export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();

  try {
    // Get admin
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('id', adminId)
      .single();

    if (error || !admin) {
      return { success: false, error: 'Admin not found' };
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!passwordValid) {
      await logAuthEvent(supabase, adminId, 'password_change_failed', 'Invalid current password', ipAddress, userAgent);
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await supabase.from('admin_users').update({
      password_hash: newHash,
      must_change_password: false,
    }).eq('id', adminId);

    await logAuthEvent(supabase, adminId, 'password_changed', 'Password successfully changed', ipAddress, userAgent);

    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

export interface ValidatedSession {
  sessionId: string;
  admin: AdminUser;
  expiresAt: string;
}

/**
 * Validate session token
 */
export async function validateSession(sessionToken: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();

  try {
    // Find session
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session) {
      return null;
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('admin_sessions').delete().eq('id', session.id);
      return null;
    }

    // Update last activity and extend session
    await supabase.from('admin_sessions').update({
      last_activity: new Date().toISOString(),
      expires_at: new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString(),
    }).eq('id', session.id);

    return transformAdmin(session.admin_users);
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Validate session and return full session info
 */
export async function validateAdminSession(sessionToken: string): Promise<ValidatedSession | null> {
  const supabase = getSupabaseAdmin();

  try {
    // Find session
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session) {
      return null;
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('admin_sessions').delete().eq('id', session.id);
      return null;
    }

    // Update last activity and extend session
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString();
    await supabase.from('admin_sessions').update({
      last_activity: new Date().toISOString(),
      expires_at: newExpiresAt,
    }).eq('id', session.id);

    return {
      sessionId: session.id,
      admin: transformAdmin(session.admin_users),
      expiresAt: newExpiresAt,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Logout admin (invalidate session)
 */
export async function adminLogout(
  sessionToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  try {
    // Get session to log the admin
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('admin_id')
      .eq('session_token', sessionToken)
      .single();

    if (session) {
      await logAuthEvent(supabase, session.admin_id, 'logout', 'Admin logged out', ipAddress, userAgent);
    }

    // Delete session
    await supabase.from('admin_sessions').delete().eq('session_token', sessionToken);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Get admin by ID
 */
export async function getAdminById(adminId: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return null;
    }

    return transformAdmin(data);
  } catch (error) {
    console.error('Get admin error:', error);
    return null;
  }
}

// Helper functions

async function createAdminSession(
  supabase: SupabaseClient,
  adminId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AdminSession> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('admin_sessions')
    .insert({
      admin_id: adminId,
      session_token: sessionToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create session');
  }

  return data;
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function logAuthEvent(
  supabase: SupabaseClient,
  adminId: string | null,
  action: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const entry: Record<string, unknown> = {
      admin_id: adminId,
      admin_email: adminId ? 'pending' : 'unknown',
      admin_role: 'super_admin', // Will be updated if adminId exists
      action,
      category: 'system',
      severity: action.includes('failed') ? 'medium' : 'low',
      reason,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    if (adminId) {
      const { data: admin } = await supabase
        .from('admin_users')
        .select('email, role')
        .eq('id', adminId)
        .single();

      if (admin) {
        entry.admin_email = admin.email;
        entry.admin_role = admin.role;
      }
    }

    await supabase.from('audit_log').insert(entry);
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAdmin(data: any): AdminUser {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    mfaEnabled: data.mfa_enabled,
    isActive: data.is_active,
    mustChangePassword: data.must_change_password,
    lastLogin: data.last_login,
    createdAt: data.created_at,
  };
}
