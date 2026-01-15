'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle, ArrowLeft, Fingerprint } from 'lucide-react';
import { verifyPin, getPinAuthState, type PinAuthState } from '@/services/supabase/pin-auth';

interface PinEntryProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  onRequireFullAuth: () => void;
}

export function PinEntry({
  userId,
  userName,
  userAvatar,
  onSuccess,
  onCancel,
  onRequireFullAuth,
}: PinEntryProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [pinLength, setPinLength] = useState(4);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authState, setAuthState] = useState<PinAuthState | null>(null);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load auth state on mount
  useEffect(() => {
    async function loadState() {
      const state = await getPinAuthState(userId);
      setAuthState(state);

      // If full auth required, notify parent
      if (state.requiredAuthLevel === 'full') {
        onRequireFullAuth();
      }
    }
    loadState();
  }, [userId, onRequireFullAuth]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto-submit when PIN is complete
  useEffect(() => {
    const enteredPin = pin.slice(0, pinLength).join('');
    if (enteredPin.length === pinLength && !isVerifying) {
      handleVerify(enteredPin);
    }
  }, [pin, pinLength, isVerifying]);

  const handleVerify = async (enteredPin: string) => {
    setIsVerifying(true);
    setError(null);

    const result = await verifyPin(userId, enteredPin);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Incorrect PIN');
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Clear PIN
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Refresh auth state to get updated attempts
      const newState = await getPinAuthState(userId);
      setAuthState(newState);

      // If locked or requires full auth, notify parent
      if (newState.isLocked || newState.requiredAuthLevel === 'full') {
        setTimeout(() => onRequireFullAuth(), 1500);
      }
    }

    setIsVerifying(false);
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^[0-9]$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Move to next input
    if (value && index < pinLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, pinLength);

    if (pastedData) {
      const newPin = [...pin];
      pastedData.split('').forEach((char, i) => {
        if (i < pinLength) newPin[i] = char;
      });
      setPin(newPin);

      // Focus last filled or next empty
      const focusIndex = Math.min(pastedData.length, pinLength - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  if (authState?.isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Temporarily Locked</h2>
            <p className="text-gray-600 mb-6">
              Too many incorrect PIN attempts. Please try again later or sign in with your password.
            </p>
            <button
              onClick={onRequireFullAuth}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In with Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* User Info */}
          <div className="text-center mb-8">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || 'User'}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold text-blue-600">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}
            </h2>
            <p className="text-gray-500 mt-1">Enter your PIN to continue</p>
          </div>

          {/* PIN Input */}
          <div
            className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}
            onPaste={handlePaste}
          >
            {Array.from({ length: pinLength }).map((_, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pin[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isVerifying}
                className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-xl
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  transition-all duration-200
                  ${pin[index] ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  ${error ? 'border-red-300' : ''}
                  ${isVerifying ? 'opacity-50' : ''}
                `}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Attempts Remaining */}
          {authState && authState.attemptsRemaining < 5 && (
            <p className="text-center text-sm text-gray-500 mb-4">
              {authState.attemptsRemaining} attempts remaining
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onRequireFullAuth}
              className="w-full py-3 px-4 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Sign in with password instead
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
        </div>

        {/* Biometric Hint (for future implementation) */}
        <div className="mt-6 text-center">
          <button className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors">
            <Fingerprint className="w-5 h-5" />
            <span>Use biometrics</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
