'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore, useMfaSetupData, useAdmin, useIsAdminAuthenticated, useHasHydrated } from '@/stores/adminStore';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

export default function MfaSetupPage() {
  const router = useRouter();
  const admin = useAdmin();
  const mfaSetupData = useMfaSetupData();
  const isAuthenticated = useIsAdminAuthenticated();
  const hasHydrated = useHasHydrated();
  const { loginComplete, setError, setLoading, isLoading, error, pendingMfaSetup, isInitialized, initialize } = useAdminStore();

  const [code, setCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Generate QR code on mount
  useEffect(() => {
    if (mfaSetupData?.qrCodeUrl) {
      QRCode.toDataURL(mfaSetupData.qrCodeUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#00000000',
        },
      }).then(setQrCodeDataUrl);
    }
  }, [mfaSetupData?.qrCodeUrl]);

  // Redirect logic - only after store is hydrated
  useEffect(() => {
    // Wait for zustand to hydrate from localStorage
    if (!hasHydrated) return;

    if (isAuthenticated) {
      // Already authenticated, go to admin dashboard
      router.replace('/admin');
      return;
    }
    // Only redirect to login if we're not in the MFA setup flow
    if (!pendingMfaSetup && !admin) {
      router.replace('/admin/login');
    }
  }, [hasHydrated, pendingMfaSetup, admin, router, isAuthenticated]);

  const handleCopySecret = () => {
    if (mfaSetupData?.secret) {
      navigator.clipboard.writeText(mfaSetupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          code,
          isSetup: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      // MFA setup complete
      loginComplete(data.admin, data.sessionToken);

      if (data.requiresPasswordChange) {
        router.push('/admin/change-password');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error('MFA setup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loader while hydrating or if missing required data
  if (!hasHydrated || !mfaSetupData || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set Up Two-Factor Authentication</h1>
          <p className="text-surface-400 mt-2">MFA is required for all admin accounts</p>
        </div>

        {/* Setup Form */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-6">
          {/* Step 1: Scan QR Code */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">
              1. Scan this QR code with your authenticator app
            </h3>
            <div className="flex justify-center p-4 bg-surface-800 rounded-lg">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="MFA QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-surface-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-surface-500 text-center mt-2">
              Compatible with Google Authenticator, Authy, 1Password, etc.
            </p>
          </div>

          {/* Manual Entry */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">
              Or enter this code manually:
            </h3>
            <div className="flex items-center gap-2 p-3 bg-surface-800 rounded-lg">
              <code className="flex-1 text-sm font-mono text-brand-400 break-all">
                {mfaSetupData.secret}
              </code>
              <button
                onClick={handleCopySecret}
                className="p-2 text-surface-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Step 2: Verify */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white mb-3">
                2. Enter the 6-digit code from your app
              </h3>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-surface-600 focus:border-red-500 focus:outline-none"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-red-500 hover:bg-red-600"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify & Enable MFA'
              )}
            </Button>
          </form>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-surface-600 mt-6">
          You will receive backup codes after enabling MFA. Store them securely.
        </p>
      </div>
    </div>
  );
}
