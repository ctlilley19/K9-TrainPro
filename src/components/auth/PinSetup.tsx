'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Check, X, AlertCircle } from 'lucide-react';
import { setPin } from '@/services/supabase/pin-auth';

interface PinSetupProps {
  userId: string;
  onComplete: () => void;
  onSkip?: () => void;
  isRequired?: boolean;
}

type Step = 'create' | 'confirm';

export function PinSetup({ userId, onComplete, onSkip, isRequired = false }: PinSetupProps) {
  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', '', '', '']);
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when step changes
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [step]);

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handleChange = (index: number, value: string) => {
    if (value && !/^[0-9]$/.test(value)) return;

    const newPin = [...currentPin];
    newPin[index] = value;
    setCurrentPin(newPin);
    setError(null);

    if (value && index < pinLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-advance when complete
    if (value && index === pinLength - 1) {
      const enteredPin = [...newPin.slice(0, pinLength - 1), value].join('');
      handlePinComplete(enteredPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, pinLength);

    if (pastedData) {
      const newPin = [...currentPin];
      pastedData.split('').forEach((char, i) => {
        if (i < pinLength) newPin[i] = char;
      });
      setCurrentPin(newPin);

      if (pastedData.length === pinLength) {
        handlePinComplete(pastedData);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (step === 'create') {
      // Move to confirm step
      setStep('confirm');
      setConfirmPin(['', '', '', '', '', '']);
    } else {
      // Verify PINs match
      const originalPin = pin.slice(0, pinLength).join('');

      if (enteredPin !== originalPin) {
        setError('PINs do not match. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setConfirmPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Save PIN
      setIsSubmitting(true);
      const result = await setPin(userId, enteredPin);

      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'Failed to set PIN');
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setStep('create');
    setPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
    setError(null);
  };

  const togglePinLength = () => {
    setPinLength(pinLength === 4 ? 6 : 4);
    setPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
    setStep('create');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
            </h2>
            <p className="text-gray-500 mt-2">
              {step === 'create'
                ? 'Set up a quick PIN for faster access to your account'
                : 'Enter your PIN again to confirm'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${step === 'create' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>

          {/* PIN Input */}
          <div
            className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}
            onPaste={handlePaste}
          >
            {Array.from({ length: pinLength }).map((_, index) => (
              <input
                key={`${step}-${index}`}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={currentPin[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isSubmitting}
                className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-xl
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  transition-all duration-200
                  ${currentPin[index] ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  ${error ? 'border-red-300' : ''}
                  ${isSubmitting ? 'opacity-50' : ''}
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

          {/* PIN Length Toggle */}
          <div className="flex justify-center mb-6">
            <button
              onClick={togglePinLength}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Use {pinLength === 4 ? '6-digit' : '4-digit'} PIN instead
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {step === 'confirm' && (
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Start Over
              </button>
            )}

            {onSkip && !isRequired && (
              <button
                onClick={onSkip}
                className="w-full py-3 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                disabled={isSubmitting}
              >
                Skip for now
              </button>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Why use a PIN?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Faster access - no need to type your password</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Secure - your PIN is encrypted and never stored in plain text</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Device-specific - works only on trusted devices</span>
              </li>
            </ul>
          </div>
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
