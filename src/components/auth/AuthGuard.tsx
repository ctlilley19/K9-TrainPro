'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getPinAuthState, recordFullLogin, type PinAuthState } from '@/services/supabase/pin-auth';
import { PinEntry } from './PinEntry';
import { PinSetup } from './PinSetup';
import { PageLoading } from '@/components/ui/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requirePin?: boolean; // Force PIN requirement for sensitive operations
}

type AuthState = 'loading' | 'authenticated' | 'pin-required' | 'pin-setup' | 'full-auth-required';

export function AuthGuard({ children, requirePin = false }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isDemoModeActive } = useAuthStore();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [pinAuthState, setPinAuthState] = useState<PinAuthState | null>(null);
  const [showPinSetupPrompt, setShowPinSetupPrompt] = useState(false);

  useEffect(() => {
    async function checkAuthState() {
      // Wait for auth store to initialize
      if (isLoading) {
        setAuthState('loading');
        return;
      }

      // Not authenticated at all
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Demo mode bypasses PIN
      if (isDemoModeActive) {
        setAuthState('authenticated');
        return;
      }

      // Check PIN auth state
      const state = await getPinAuthState(user.id);
      setPinAuthState(state);

      // Determine what auth is needed
      if (state.requiredAuthLevel === 'full') {
        // Need full re-authentication (90+ days)
        setAuthState('full-auth-required');
      } else if (requirePin || state.requiredAuthLevel === 'pin') {
        // Need PIN verification (30+ days since last verify or sensitive operation)
        if (state.hasPin) {
          setAuthState('pin-required');
        } else {
          // No PIN set, but PIN is required - show setup
          setAuthState('pin-setup');
        }
      } else if (!state.hasPin && state.daysSinceFullLogin === 0) {
        // First login - prompt to set up PIN (but don't require it)
        setShowPinSetupPrompt(true);
        setAuthState('authenticated');
      } else {
        // All good, no additional auth needed
        setAuthState('authenticated');
      }
    }

    checkAuthState();
  }, [user, isAuthenticated, isLoading, isDemoModeActive, requirePin, router]);

  // Handle PIN verification success
  const handlePinSuccess = async () => {
    setAuthState('authenticated');
  };

  // Handle PIN setup complete
  const handlePinSetupComplete = async () => {
    setShowPinSetupPrompt(false);
    setAuthState('authenticated');
  };

  // Handle skip PIN setup
  const handleSkipPinSetup = () => {
    setShowPinSetupPrompt(false);
    setAuthState('authenticated');
  };

  // Handle request for full re-auth
  const handleRequireFullAuth = () => {
    // Sign out and redirect to login
    useAuthStore.getState().signOut();
    router.push('/login?reason=session_expired');
  };

  // Loading state
  if (authState === 'loading' || isLoading) {
    return <PageLoading />;
  }

  // Full re-auth required (90+ days)
  if (authState === 'full-auth-required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6">
              For your security, please sign in again. Your session has expired after 90 days.
            </p>
            <button
              onClick={handleRequireFullAuth}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PIN required
  if (authState === 'pin-required' && user) {
    return (
      <PinEntry
        userId={user.id}
        userName={user.name}
        userAvatar={user.avatar_url}
        onSuccess={handlePinSuccess}
        onRequireFullAuth={handleRequireFullAuth}
      />
    );
  }

  // PIN setup required
  if (authState === 'pin-setup' && user) {
    return (
      <PinSetup
        userId={user.id}
        onComplete={handlePinSetupComplete}
        isRequired={true}
      />
    );
  }

  // Authenticated - show content
  return (
    <>
      {children}

      {/* Optional PIN setup prompt for first-time users */}
      {showPinSetupPrompt && user && (
        <PinSetupPromptModal
          userId={user.id}
          onSetup={() => {
            setShowPinSetupPrompt(false);
            setAuthState('pin-setup');
          }}
          onSkip={handleSkipPinSetup}
        />
      )}
    </>
  );
}

// Modal prompt for optional PIN setup
function PinSetupPromptModal({
  userId,
  onSetup,
  onSkip,
}: {
  userId: string;
  onSetup: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Up Quick PIN Access</h3>
          <p className="text-gray-600 text-sm mb-6">
            Create a 4-6 digit PIN for faster, secure access to your account.
            You can always sign in with your password too.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSetup}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Set Up PIN
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3 px-4 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
