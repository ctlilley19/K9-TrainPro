/**
 * Admin Portal Store
 * Zustand store for admin authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AdminAuthState {
  // State
  admin: AdminUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  hasHydrated: boolean;
  error: string | null;

  // Auth flow states
  pendingMfa: boolean;
  pendingMfaSetup: boolean;
  pendingPasswordChange: boolean;
  mfaSetupData: {
    secret: string;
    qrCodeUrl: string;
  } | null;

  // Actions
  setAdmin: (admin: AdminUser | null) => void;
  setSessionToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;

  // Auth flow actions
  setPendingMfa: (pending: boolean) => void;
  setPendingMfaSetup: (pending: boolean) => void;
  setPendingPasswordChange: (pending: boolean) => void;
  setMfaSetupData: (data: { secret: string; qrCodeUrl: string } | null) => void;

  // Complex actions
  loginStart: (admin: AdminUser, requiresMfa: boolean, requiresMfaSetup: boolean, requiresPasswordChange: boolean) => void;
  loginComplete: (admin: AdminUser, sessionToken: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 100,
  billing: 40,
  support: 30,
  moderator: 20,
  analytics: 10,
};

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      admin: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      hasHydrated: false,
      error: null,

      // Auth flow states
      pendingMfa: false,
      pendingMfaSetup: false,
      pendingPasswordChange: false,
      mfaSetupData: null,

      // Basic setters
      setAdmin: (admin) => set({ admin, isAuthenticated: !!admin }),
      setSessionToken: (token) => set({ sessionToken: token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      // Auth flow setters
      setPendingMfa: (pending) => set({ pendingMfa: pending }),
      setPendingMfaSetup: (pending) => set({ pendingMfaSetup: pending }),
      setPendingPasswordChange: (pending) => set({ pendingPasswordChange: pending }),
      setMfaSetupData: (data) => set({ mfaSetupData: data }),

      // Login started - may require MFA or setup
      loginStart: (admin, requiresMfa, requiresMfaSetup, requiresPasswordChange) => {
        set({
          admin,
          pendingMfa: requiresMfa,
          pendingMfaSetup: requiresMfaSetup,
          pendingPasswordChange: requiresPasswordChange,
          isAuthenticated: false, // Not fully authenticated until MFA complete
          error: null,
        });
      },

      // Login completed successfully
      loginComplete: (admin, sessionToken) => {
        set({
          admin,
          sessionToken,
          isAuthenticated: true,
          pendingMfa: false,
          pendingMfaSetup: false,
          mfaSetupData: null,
          error: null,
          isLoading: false,
        });
      },

      // Logout
      logout: () => {
        const { sessionToken } = get();

        // Call logout API
        if (sessionToken) {
          fetch('/api/admin/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionToken }),
          }).catch(console.error);
        }

        set({
          admin: null,
          sessionToken: null,
          isAuthenticated: false,
          pendingMfa: false,
          pendingMfaSetup: false,
          pendingPasswordChange: false,
          mfaSetupData: null,
          error: null,
        });
      },

      // Initialize - validate existing session
      initialize: async () => {
        const { sessionToken, isInitialized } = get();

        if (isInitialized) return;

        set({ isLoading: true });

        if (!sessionToken) {
          set({ isInitialized: true, isLoading: false });
          return;
        }

        try {
          const response = await fetch('/api/admin/auth/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionToken }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.admin) {
              set({
                admin: data.admin,
                isAuthenticated: true,
                pendingPasswordChange: data.admin.mustChangePassword,
              });
            } else {
              set({ sessionToken: null, admin: null, isAuthenticated: false });
            }
          } else {
            set({ sessionToken: null, admin: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Admin session validation error:', error);
          set({ sessionToken: null, admin: null, isAuthenticated: false });
        } finally {
          set({ isInitialized: true, isLoading: false });
        }
      },
    }),
    {
      name: 'k9-admin-auth',
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
        // Persist auth state to prevent redirect loops during navigation
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selector hooks for performance
export const useAdmin = () => useAdminStore((state) => state.admin);
export const useAdminRole = () => useAdminStore((state) => state.admin?.role);
export const useIsAdminAuthenticated = () => useAdminStore((state) => state.isAuthenticated);
export const useAdminLoading = () => useAdminStore((state) => state.isLoading);
export const useAdminError = () => useAdminStore((state) => state.error);
export const usePendingMfa = () => useAdminStore((state) => state.pendingMfa);
export const usePendingMfaSetup = () => useAdminStore((state) => state.pendingMfaSetup);
export const usePendingPasswordChange = () => useAdminStore((state) => state.pendingPasswordChange);
export const useMfaSetupData = () => useAdminStore((state) => state.mfaSetupData);
export const useHasHydrated = () => useAdminStore((state) => state.hasHydrated);

// Permission check utilities
export function hasAdminRole(userRole: AdminRole | undefined, requiredRole: AdminRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccessModule(role: AdminRole | undefined, module: string): boolean {
  if (!role) return false;

  const modulePermissions: Record<string, AdminRole[]> = {
    dashboard: ['super_admin', 'support', 'moderator', 'analytics', 'billing'],
    analytics: ['super_admin', 'support', 'moderator', 'analytics', 'billing'],
    badges: ['super_admin', 'moderator'],
    support: ['super_admin', 'support'],
    users: ['super_admin', 'support', 'billing'],
    billing: ['super_admin', 'billing'],
    moderate: ['super_admin', 'moderator'],
    system: ['super_admin'],
    audit: ['super_admin'],
    settings: ['super_admin'],
    testing: ['super_admin'],
  };

  const allowedRoles = modulePermissions[module];
  return allowedRoles ? allowedRoles.includes(role) : false;
}
