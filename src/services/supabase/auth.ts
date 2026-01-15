import { supabase } from '@/lib/supabase';
import type { User, Facility } from '@/types/database';
import { recordFullLogin } from './pin-auth';

interface AuthResult {
  user: User | null;
  facility: Facility | null;
}

interface SignUpData {
  facilityName: string;
  name: string;
  email: string;
  password: string;
}

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from sign in');

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User profile not found');

    // Fetch facility
    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', user.facility_id)
      .single();

    if (facilityError) throw facilityError;

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Record full login for PIN auth session tracking
    await recordFullLogin(user.id);

    return { user, facility };
  },

  /**
   * Sign up a new user and create their facility
   */
  async signUp({ facilityName, name, email, password }: SignUpData): Promise<AuthResult> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from sign up');

    try {
      // Create facility
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .insert({
          name: facilityName,
          email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          subscription_tier: 'free',
          settings: {
            kennel_max_minutes: 240,
            potty_interval_minutes: 120,
            daily_report_time: '18:00',
            enable_realtime_updates: true,
            enable_photo_sharing: true,
          },
        })
        .select()
        .single();

      if (facilityError) throw facilityError;

      // Create user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user.id,
          facility_id: facility.id,
          email,
          name,
          role: 'owner',
          is_active: true,
        })
        .select()
        .single();

      if (userError) throw userError;

      return { user, facility };
    } catch (error) {
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {
        // Ignore cleanup errors
      });
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session and user data
   */
  async getSession(): Promise<AuthResult> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!sessionData.session?.user) {
      return { user: null, facility: null };
    }

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', sessionData.session.user.id)
      .single();

    if (userError || !user) {
      return { user: null, facility: null };
    }

    // Fetch facility
    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', user.facility_id)
      .single();

    if (facilityError) {
      return { user: null, facility: null };
    }

    return { user, facility };
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
