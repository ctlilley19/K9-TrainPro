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

    // Try to fetch user profile
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    // If user profile doesn't exist, create it (first login after email confirmation)
    if (userError || !existingUser) {
      // Get signup data from user metadata
      const metadata = authData.user.user_metadata;
      const facilityName = metadata?.facility_name || 'My Facility';
      const userName = metadata?.full_name || email.split('@')[0];

      // Create profile using the secure signup function
      const { data, error } = await supabase.rpc('handle_new_user_signup', {
        p_auth_id: authData.user.id,
        p_email: email,
        p_name: userName,
        p_facility_name: facilityName,
      });

      if (error) throw error;
      if (!data) throw new Error('Failed to create user profile');

      const result = data as { user: User; facility: Facility };

      // Record full login for PIN auth session tracking
      await recordFullLogin(result.user.id);

      return { user: result.user, facility: result.facility };
    }

    // Fetch facility
    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', existingUser.facility_id)
      .single();

    if (facilityError) throw facilityError;

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', existingUser.id);

    // Record full login for PIN auth session tracking
    await recordFullLogin(existingUser.id);

    return { user: existingUser, facility };
  },

  /**
   * Sign up a new user and create their facility
   */
  async signUp({ facilityName, name, email, password }: SignUpData): Promise<AuthResult> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Store signup data in user metadata for profile creation after confirmation
          facility_name: facilityName,
          full_name: name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from sign up');

    // Check if email confirmation is required (no session means confirmation pending)
    const emailConfirmationRequired = !authData.session;

    if (emailConfirmationRequired) {
      // Email confirmation is required - profile will be created on first login
      // Return null user/facility to indicate pending confirmation
      return { user: null, facility: null };
    }

    try {
      // Session exists - create profile immediately
      // Use the secure signup function to create facility and user profile
      const { data, error } = await supabase.rpc('handle_new_user_signup', {
        p_auth_id: authData.user.id,
        p_email: email,
        p_name: name,
        p_facility_name: facilityName,
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned from signup');

      const result = data as { user: User; facility: Facility };
      return { user: result.user, facility: result.facility };
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
