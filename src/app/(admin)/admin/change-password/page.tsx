'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin, useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Password requirements
const passwordRequirements = [
  { id: 'length', label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ChangePasswordPage() {
  const router = useRouter();
  const admin = useAdmin();
  const { setLoading, setError, isLoading, error } = useAdminStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!admin) {
      router.replace('/admin/login');
    }
  }, [admin, router]);

  // Check password requirements
  const passedRequirements = passwordRequirements.filter((req) => req.test(newPassword));
  const allRequirementsMet = passedRequirements.length === passwordRequirements.length;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      setError('Password does not meet all requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      // Password changed successfully
      router.push('/admin');
    } catch (err) {
      console.error('Password change error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
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
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
          <p className="text-surface-400 mt-2">
            {admin.mustChangePassword
              ? 'You must change your password before continuing'
              : 'Update your account password'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:border-red-500 focus:outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:border-red-500 focus:outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                {passwordRequirements.map((req) => {
                  const passed = req.test(newPassword);
                  return (
                    <div
                      key={req.id}
                      className={`flex items-center gap-2 text-xs ${
                        passed ? 'text-green-400' : 'text-surface-500'
                      }`}
                    >
                      {passed ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-surface-600" />}
                      {req.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 bg-surface-800 border rounded-lg text-white placeholder-surface-500 focus:outline-none pr-12 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-500'
                        : 'border-red-500'
                      : 'border-surface-700 focus:border-red-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-red-500 hover:bg-red-600"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>

            {/* Skip if not required */}
            {!admin.mustChangePassword && (
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="w-full text-sm text-surface-500 hover:text-white transition-colors mt-4"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-surface-600 mt-6">
          Choose a strong, unique password that you don't use elsewhere.
        </p>
      </div>
    </div>
  );
}
