'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore, useIsAdminAuthenticated, useAdminLoading, useHasHydrated } from '@/stores/adminStore';
import { Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useIsAdminAuthenticated();
  const isLoading = useAdminLoading();
  const hasHydrated = useHasHydrated();
  const { isInitialized, initialize, pendingMfa, pendingMfaSetup, pendingPasswordChange } = useAdminStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated && !pendingMfa && !pendingMfaSetup) {
      router.replace('/admin/login');
    }
  }, [isInitialized, isLoading, isAuthenticated, pendingMfa, pendingMfaSetup, router]);

  // Redirect to MFA page if pending
  useEffect(() => {
    if (isInitialized && pendingMfa) {
      router.replace('/admin/mfa');
    }
  }, [isInitialized, pendingMfa, router]);

  // Redirect to MFA setup if needed
  useEffect(() => {
    if (isInitialized && pendingMfaSetup) {
      router.replace('/admin/mfa-setup');
    }
  }, [isInitialized, pendingMfaSetup, router]);

  // Redirect to password change if needed
  useEffect(() => {
    if (isInitialized && isAuthenticated && pendingPasswordChange) {
      router.replace('/admin/change-password');
    }
  }, [isInitialized, isAuthenticated, pendingPasswordChange, router]);

  // Loading state - wait for hydration and initialization
  if (!hasHydrated || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || pendingMfa || pendingMfaSetup || pendingPasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
