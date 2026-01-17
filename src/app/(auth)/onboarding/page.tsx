'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { isDemoMode } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Dog,
  Building2,
  Home,
  Users,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

type AccountType = 'family' | 'business' | null;
type Step = 'account_type' | 'details';

interface OnboardingData {
  accountType: AccountType;
  businessName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, facility, isAuthenticated, isLoading, isInitialized, updateProfile } = useAuthStore();
  const [step, setStep] = useState<Step>('account_type');
  const [data, setData] = useState<OnboardingData>({ accountType: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  // In demo mode, skip onboarding
  useEffect(() => {
    if (isDemoMode() && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const selectAccountType = (type: AccountType) => {
    setData({ ...data, accountType: type });
    setStep('details');
  };

  const handleComplete = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // For now, we'll just redirect to dashboard
      // In a full implementation, we would save the onboarding data
      // to the user's profile and facility settings

      // Update the facility subscription tier based on account type
      // This would typically be done via an API call

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete setup');
      setSaving(false);
    }
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-amber">
          <Image
            src="/images/k9-logo.png"
            alt="K9 ProTrain"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <span className="text-2xl font-bold text-gradient">K9 ProTrain</span>
      </div>

      <Card variant="bordered" padding="lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${step === 'account_type' ? 'bg-brand-500' : 'bg-brand-500/30'}`} />
          <div className={`w-12 h-0.5 ${step === 'details' ? 'bg-brand-500' : 'bg-surface-700'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-brand-500' : 'bg-surface-700'}`} />
        </div>

        {step === 'account_type' ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to K9 ProTrain!</h2>
              <p className="text-surface-400">Let&apos;s set up your account. How will you be using K9 ProTrain?</p>
            </div>

            <div className="space-y-4">
              {/* Family Option */}
              <button
                onClick={() => selectAccountType('family')}
                className="w-full p-6 rounded-xl border-2 border-surface-700 hover:border-purple-500/50 bg-surface-800/50 hover:bg-surface-800 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Home size={28} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      Family Account
                    </h3>
                    <p className="text-surface-400 text-sm mb-3">
                      Perfect for pet parents who want to track training progress, manage homework, and stay connected with their trainer.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">Track Progress</span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">View Reports</span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">Homework</span>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-surface-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-2" />
                </div>
              </button>

              {/* Business Option */}
              <button
                onClick={() => selectAccountType('business')}
                className="w-full p-6 rounded-xl border-2 border-surface-700 hover:border-brand-500/50 bg-surface-800/50 hover:bg-surface-800 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={28} className="text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">
                      Business Account
                    </h3>
                    <p className="text-surface-400 text-sm mb-3">
                      For professional trainers and facilities who want to manage clients, track dogs, and streamline operations.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded text-xs bg-brand-500/10 text-brand-400">Client Portal</span>
                      <span className="px-2 py-1 rounded text-xs bg-brand-500/10 text-brand-400">Daily Reports</span>
                      <span className="px-2 py-1 rounded text-xs bg-brand-500/10 text-brand-400">Team Management</span>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-surface-600 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-2" />
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => setStep('account_type')}
                className="flex items-center gap-1 text-surface-400 hover:text-white transition-colors text-sm"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            </div>

            <div className="text-center mb-8">
              <div className={`w-14 h-14 rounded-xl ${data.accountType === 'family' ? 'bg-purple-500/20' : 'bg-brand-500/20'} flex items-center justify-center mx-auto mb-4`}>
                {data.accountType === 'family' ? (
                  <Home size={28} className="text-purple-400" />
                ) : (
                  <Building2 size={28} className="text-brand-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {data.accountType === 'family' ? 'Family Details' : 'Business Details'}
              </h2>
              <p className="text-surface-400">
                {data.accountType === 'family'
                  ? 'Tell us a bit about yourself'
                  : 'Tell us about your training business'
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {data.accountType === 'business' && (
                <Input
                  label="Business Name"
                  placeholder="Your Training Facility"
                  leftIcon={<Building2 size={18} />}
                  value={data.businessName || ''}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                />
              )}

              <Input
                label="Phone Number"
                placeholder="(555) 123-4567"
                type="tel"
                value={data.phone || ''}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />

              <Input
                label="Address"
                placeholder="123 Main St"
                value={data.address || ''}
                onChange={(e) => setData({ ...data, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="City"
                  value={data.city || ''}
                  onChange={(e) => setData({ ...data, city: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="State"
                    placeholder="MD"
                    value={data.state || ''}
                    onChange={(e) => setData({ ...data, state: e.target.value })}
                  />
                  <Input
                    label="ZIP"
                    placeholder="20646"
                    value={data.zip || ''}
                    onChange={(e) => setData({ ...data, zip: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Features preview */}
            <div className="mt-8 p-4 rounded-xl bg-surface-800/50 border border-surface-700">
              <h3 className="text-sm font-medium text-white mb-3">What you&apos;ll get:</h3>
              <div className="space-y-2">
                {data.accountType === 'family' ? (
                  <>
                    <Feature text="Real-time training updates" />
                    <Feature text="Daily reports with photos" />
                    <Feature text="Homework tracking" />
                    <Feature text="Progress badges and achievements" />
                    <Feature text="Direct messaging with trainers" />
                  </>
                ) : (
                  <>
                    <Feature text="Client management dashboard" />
                    <Feature text="Automated daily reports" />
                    <Feature text="Training activity tracking" />
                    <Feature text="Homework assignment system" />
                    <Feature text="Custom branded NFC tags" />
                    <Feature text="Pet parent portal access" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Skip for Now
              </Button>
              <Button
                variant="glow"
                className="flex-1"
                onClick={handleComplete}
                isLoading={saving}
                rightIcon={<ArrowRight size={18} />}
              >
                Complete Setup
              </Button>
            </div>
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-surface-500">
        You can update these details anytime in Settings
      </p>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-surface-300">
      <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
