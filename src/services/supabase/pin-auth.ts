import { supabase } from '@/lib/supabase';

// Generate a unique device ID for this browser/device
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  let deviceId = localStorage.getItem('k9-device-id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('k9-device-id', deviceId);
  }
  return deviceId;
}

// Get device info for session tracking
export function getDeviceInfo(): Record<string, string> {
  if (typeof window === 'undefined') {
    return { device_type: 'server' };
  }

  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone|iPad/.test(ua)) {
    deviceType = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
  }

  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    device_type: deviceType,
    browser,
    os,
    device_name: `${browser} on ${os}`,
  };
}

export type AuthLevel = 'full' | 'pin' | 'none';

export interface PinAuthState {
  hasPin: boolean;
  isLocked: boolean;
  lockExpiresAt: string | null;
  attemptsRemaining: number;
  requiredAuthLevel: AuthLevel;
  daysSinceFullLogin: number;
  daysSincePinVerify: number;
}

// Check if user has PIN set up and what auth level is required
export async function getPinAuthState(userId: string): Promise<PinAuthState> {
  const deviceId = getDeviceId();

  // Get user's PIN status
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('pin_hash, pin_locked_until, pin_attempts, last_full_login, last_pin_verify')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return {
      hasPin: false,
      isLocked: false,
      lockExpiresAt: null,
      attemptsRemaining: 5,
      requiredAuthLevel: 'full',
      daysSinceFullLogin: 999,
      daysSincePinVerify: 999,
    };
  }

  const hasPin = !!user.pin_hash;
  const isLocked = user.pin_locked_until && new Date(user.pin_locked_until) > new Date();
  const attemptsRemaining = Math.max(0, 5 - (user.pin_attempts || 0));

  // Get required auth level from database function
  const { data: authLevel } = await supabase.rpc('get_required_auth_level', {
    user_uuid: userId,
    device: deviceId,
  });

  // Calculate days
  const now = new Date();
  const daysSinceFullLogin = user.last_full_login
    ? Math.floor((now.getTime() - new Date(user.last_full_login).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const daysSincePinVerify = user.last_pin_verify
    ? Math.floor((now.getTime() - new Date(user.last_pin_verify).getTime()) / (1000 * 60 * 60 * 24))
    : daysSinceFullLogin;

  return {
    hasPin,
    isLocked: !!isLocked,
    lockExpiresAt: user.pin_locked_until,
    attemptsRemaining,
    requiredAuthLevel: (authLevel as AuthLevel) || 'full',
    daysSinceFullLogin,
    daysSincePinVerify,
  };
}

// Set up or change PIN
export async function setPin(userId: string, pin: string): Promise<{ success: boolean; error?: string }> {
  // Validate PIN format
  if (!/^[0-9]{4,6}$/.test(pin)) {
    return { success: false, error: 'PIN must be 4-6 digits' };
  }

  const { data, error } = await supabase.rpc('set_user_pin', {
    user_uuid: userId,
    new_pin: pin,
  });

  if (error) {
    console.error('Error setting PIN:', error);
    return { success: false, error: 'Failed to set PIN' };
  }

  return { success: data === true };
}

// Verify PIN
export async function verifyPin(userId: string, pin: string): Promise<{ success: boolean; error?: string }> {
  const deviceId = getDeviceId();

  // Log the attempt
  await supabase.from('pin_attempts_log').insert({
    user_id: userId,
    device_id: deviceId,
    success: false, // Will update if successful
  });

  const { data, error } = await supabase.rpc('verify_pin', {
    user_uuid: userId,
    pin,
  });

  if (error) {
    console.error('Error verifying PIN:', error);
    return { success: false, error: 'Failed to verify PIN' };
  }

  if (data === true) {
    // Update session on successful PIN verify
    await supabase.rpc('update_session_pin_verify', {
      user_uuid: userId,
      device: deviceId,
    });

    return { success: true };
  }

  // Check if account is now locked
  const state = await getPinAuthState(userId);
  if (state.isLocked) {
    return { success: false, error: 'Account locked. Try again in 15 minutes.' };
  }

  return {
    success: false,
    error: `Incorrect PIN. ${state.attemptsRemaining} attempts remaining.`
  };
}

// Record full login (after email/password auth)
export async function recordFullLogin(userId: string): Promise<void> {
  const deviceId = getDeviceId();
  const deviceInfo = getDeviceInfo();

  await supabase.rpc('update_session_full_login', {
    user_uuid: userId,
    device: deviceId,
    device_info: deviceInfo,
  });
}

// Get user's active sessions
export async function getUserSessions(userId: string) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_activity', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
}

// Invalidate a specific session
export async function invalidateSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, auth_level: 'expired' })
    .eq('id', sessionId);

  return !error;
}

// Invalidate all sessions (security event)
export async function invalidateAllSessions(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('invalidate_all_sessions', {
    user_uuid: userId,
  });

  if (error) {
    console.error('Error invalidating sessions:', error);
    return 0;
  }

  return data || 0;
}

// Check if PIN is required for current session
export async function isPinRequired(userId: string): Promise<boolean> {
  const state = await getPinAuthState(userId);

  // No PIN set = don't require it
  if (!state.hasPin) {
    return false;
  }

  // Need PIN verification if auth level is 'pin'
  return state.requiredAuthLevel === 'pin';
}

// Check if full re-auth is required
export async function isFullAuthRequired(userId: string): Promise<boolean> {
  const state = await getPinAuthState(userId);
  return state.requiredAuthLevel === 'full';
}
