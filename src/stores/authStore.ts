import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Facility } from '@/types/database';
import { authService } from '@/services/supabase/auth';
import { isDemoMode } from '@/lib/supabase';

// Demo Persona Types
export type DemoPersona = 'dog_owner' | 'trainer' | 'manager';

// Demo Tier Types
export type FamilyTier = 'free' | 'premium' | 'pro';
export type BusinessTier = 'starter' | 'professional' | 'enterprise';

// Demo facility (shared across personas)
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
  free_tags_allowance: 10,
  free_tags_used: 0,
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

// Demo user configurations for each persona
const demoPersonaConfigs: Record<DemoPersona, { user: User; familyId?: string }> = {
  dog_owner: {
    user: {
      id: 'demo-parent-id',
      auth_id: 'demo-parent-auth-id',
      facility_id: 'demo-facility-id',
      email: 'sarah.anderson@demo.com',
      name: 'Sarah Anderson',
      role: 'pet_parent',
      avatar_url: null,
      phone: '(555) 234-5678',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    familyId: 'fam-1', // Links to Max and Rocky's family
  },
  trainer: {
    user: {
      id: 'demo-trainer-id',
      auth_id: 'demo-trainer-auth-id',
      facility_id: 'demo-facility-id',
      email: 'mike.johnson@demofacility.com',
      name: 'Mike Johnson',
      role: 'trainer',
      avatar_url: null,
      phone: '(555) 345-6789',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  manager: {
    user: {
      id: 'demo-user-id',
      auth_id: 'demo-auth-id',
      facility_id: 'demo-facility-id',
      email: 'admin@demofacility.com',
      name: 'Demo Admin',
      role: 'admin',
      avatar_url: null,
      phone: '(555) 123-4567',
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

// Default demo user (manager)
const demoUser = demoPersonaConfigs.manager.user;

interface AuthState {
  // State
  user: User | null;
  facility: Facility | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Demo Mode State
  demoPersona: DemoPersona | null;
  demoFamilyTier: FamilyTier;
  demoBusinessTier: BusinessTier;
  isDemoModeActive: boolean;

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
  setDemoPersona: (persona: DemoPersona) => void;
  setDemoFamilyTier: (tier: FamilyTier) => void;
  setDemoBusinessTier: (tier: BusinessTier) => void;
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
      demoPersona: null,
      demoFamilyTier: 'premium',
      demoBusinessTier: 'professional',
      isDemoModeActive: false,

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
            console.log('K9 ProTrain running in demo mode');
            set({
              user: demoUser,
              facility: demoFacility,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              isDemoModeActive: true,
              demoPersona: 'manager',
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
          // In demo mode, create a demo user with the provided info
          if (isDemoMode()) {
            const demoUserWithInfo: User = {
              ...demoUser,
              name,
              email,
            };
            const demoFacilityWithInfo: Facility = {
              ...demoFacility,
              name: facilityName,
            };
            set({
              user: demoUserWithInfo,
              facility: demoFacilityWithInfo,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }

          const { user, facility } = await authService.signUp({
            facilityName,
            name,
            email,
            password,
          });

          // If user/facility is null, email confirmation is required
          // Don't set authenticated - user needs to confirm email first
          if (!user || !facility) {
            set({
              user: null,
              facility: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

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
          isDemoModeActive: true,
          demoPersona: 'manager',
        });
      },

      // Set Demo Persona - switch between dog_owner, trainer, manager
      setDemoPersona: (persona: DemoPersona) => {
        const config = demoPersonaConfigs[persona];
        set({
          user: config.user,
          facility: demoFacility,
          demoPersona: persona,
          isDemoModeActive: true,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      },

      // Set Demo Family Tier - free, premium, pro
      setDemoFamilyTier: (tier: FamilyTier) => {
        set({ demoFamilyTier: tier });
      },

      // Set Demo Business Tier - starter, professional, business
      setDemoBusinessTier: (tier: BusinessTier) => {
        const { facility } = get();
        if (facility) {
          set({
            demoBusinessTier: tier,
            facility: { ...facility, subscription_tier: tier },
          });
        } else {
          set({ demoBusinessTier: tier });
        }
      },
    }),
    {
      name: 'k9-protrain-auth',
      partialize: (state) => ({
        user: state.user,
        facility: state.facility,
        isAuthenticated: state.isAuthenticated,
        demoPersona: state.demoPersona,
        demoFamilyTier: state.demoFamilyTier,
        demoBusinessTier: state.demoBusinessTier,
        isDemoModeActive: state.isDemoModeActive,
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

// Demo Mode Selector Hooks
export const useDemoPersona = () => useAuthStore((state) => state.demoPersona);
export const useIsDemoMode = () => useAuthStore((state) => state.isDemoModeActive);
export const useDemoFamilyTier = () => useAuthStore((state) => state.demoFamilyTier);
export const useDemoBusinessTier = () => useAuthStore((state) => state.demoBusinessTier);
export const useDemoFamilyId = () => {
  const persona = useAuthStore((state) => state.demoPersona);
  return persona ? demoPersonaConfigs[persona]?.familyId : null;
};
