import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Facility } from '@/types/database';
import { authService } from '@/services/supabase/auth';
import { isDemoMode } from '@/lib/supabase';

// Demo user for testing without Supabase
const demoUser: User = {
  id: 'demo-user-id',
  auth_id: 'demo-auth-id',
  facility_id: 'demo-facility-id',
  email: 'demo@k9trainpro.com',
  name: 'Demo Trainer',
  role: 'admin',
  avatar_url: null,
  phone: '(555) 123-4567',
  is_active: true,
  last_login_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoFacility: Facility = {
  id: 'demo-facility-id',
  name: 'Demo Training Facility',
  logo_url: null,
  address: '123 Training Lane',
  city: 'La Plata',
  state: 'MD',
  zip: '20646',
  phone: '(555) 987-6543',
  email: 'contact@demofacility.com',
  website: 'https://demofacility.com',
  timezone: 'America/New_York',
  subscription_tier: 'professional',
  stripe_customer_id: null,
  settings: {
    kennel_max_minutes: 240,
    potty_interval_minutes: 120,
    daily_report_time: '18:00',
    enable_realtime_updates: true,
    enable_photo_sharing: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthState {
  // State
  user: User | null;
  facility: Facility | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setFacility: (facility: Facility | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth Methods
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { facilityName: string; name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  // Demo Mode
  enableDemoMode: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      facility: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      error: null,

      // Setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setFacility: (facility) => set({ facility }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Initialize - check for existing session
      initialize: async () => {
        const { isInitialized } = get();
        if (isInitialized) return;

        set({ isLoading: true, error: null });

        try {
          // Check if we're in demo mode
          if (isDemoMode()) {
            console.log('K9 TrainPro running in demo mode');
            set({
              user: demoUser,
              facility: demoFacility,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }

          // Try to get existing session
          const { user, facility } = await authService.getSession();

          set({
            user,
            facility,
            isAuthenticated: !!user,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            facility: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: 'Failed to initialize authentication',
          });
        }
      },

      // Sign In
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          if (isDemoMode()) {
            set({
              user: demoUser,
              facility: demoFacility,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }

          const { user, facility } = await authService.signIn(email, password);

          set({
            user,
            facility,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign in failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Sign Up
      signUp: async ({ facilityName, name, email, password }) => {
        set({ isLoading: true, error: null });

        try {
          if (isDemoMode()) {
            throw new Error('Cannot sign up in demo mode');
          }

          const { user, facility } = await authService.signUp({
            facilityName,
            name,
            email,
            password,
          });

          set({
            user,
            facility,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Sign Out
      signOut: async () => {
        set({ isLoading: true, error: null });

        try {
          if (!isDemoMode()) {
            await authService.signOut();
          }

          set({
            user: null,
            facility: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign out failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Reset Password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          if (isDemoMode()) {
            throw new Error('Cannot reset password in demo mode');
          }

          await authService.resetPassword(email);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password reset failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Update Profile
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        set({ isLoading: true, error: null });

        try {
          if (isDemoMode()) {
            set({
              user: { ...user, ...updates },
              isLoading: false,
            });
            return;
          }

          const updatedUser = await authService.updateProfile(user.id, updates);
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Profile update failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Enable Demo Mode
      enableDemoMode: () => {
        set({
          user: demoUser,
          facility: demoFacility,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },
    }),
    {
      name: 'k9-trainpro-auth',
      partialize: (state) => ({
        user: state.user,
        facility: state.facility,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector Hooks for Performance
export const useUser = () => useAuthStore((state) => state.user);
export const useFacility = () => useAuthStore((state) => state.facility);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
