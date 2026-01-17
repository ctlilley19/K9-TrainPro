'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  X,
  Building2,
  Home,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type AccountType = 'family' | 'business';

interface PlanChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (accountType: AccountType, details: AccountDetails) => Promise<void>;
  currentTier: string;
  newTier: string;
  newTierName: string;
  isUpgrade: boolean;
}

interface AccountDetails {
  accountType: AccountType;
  businessName?: string;
  phone?: string;
}

export function PlanChangeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentTier,
  newTier,
  newTierName,
  isUpgrade,
}: PlanChangeConfirmModalProps) {
  const [step, setStep] = useState<'type' | 'details' | 'confirm'>('type');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [details, setDetails] = useState<AccountDetails>({
    accountType: 'business',
    businessName: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!accountType) return;

    setIsSubmitting(true);
    try {
      await onConfirm(accountType, { ...details, accountType });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAccountType = (type: AccountType) => {
    setAccountType(type);
    setDetails((prev) => ({ ...prev, accountType: type }));
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('type');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-900 border border-surface-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image
                src="/images/k9-logo.png"
                alt="K9 ProTrain"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isUpgrade ? 'Upgrade' : 'Change'} to {newTierName}
              </h2>
              <p className="text-sm text-surface-400">
                Please confirm your account details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-surface-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-surface-800/50 flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            step === 'type' ? 'bg-brand-500' : 'bg-brand-500/30'
          )} />
          <div className={cn(
            'w-12 h-0.5',
            step === 'details' || step === 'confirm' ? 'bg-brand-500' : 'bg-surface-700'
          )} />
          <div className={cn(
            'w-3 h-3 rounded-full',
            step === 'details' || step === 'confirm' ? 'bg-brand-500' : 'bg-surface-700'
          )} />
          <div className={cn(
            'w-12 h-0.5',
            step === 'confirm' ? 'bg-brand-500' : 'bg-surface-700'
          )} />
          <div className={cn(
            'w-3 h-3 rounded-full',
            step === 'confirm' ? 'bg-brand-500' : 'bg-surface-700'
          )} />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Account Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-white font-medium mb-2">
                  Confirm your account type
                </h3>
                <p className="text-sm text-surface-400">
                  This helps us customize your experience for the new plan
                </p>
              </div>

              {/* Family Option */}
              <button
                onClick={() => handleSelectAccountType('family')}
                className="w-full p-4 rounded-xl border-2 border-surface-700 hover:border-purple-500/50 bg-surface-800/50 hover:bg-surface-800 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Home size={24} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                      Family Account
                    </h4>
                    <p className="text-sm text-surface-400">
                      For pet parents tracking their dogs
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-surface-600 group-hover:text-purple-400 transition-colors" />
                </div>
              </button>

              {/* Business Option */}
              <button
                onClick={() => handleSelectAccountType('business')}
                className="w-full p-4 rounded-xl border-2 border-surface-700 hover:border-brand-500/50 bg-surface-800/50 hover:bg-surface-800 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={24} className="text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-brand-300 transition-colors">
                      Business Account
                    </h4>
                    <p className="text-sm text-surface-400">
                      For professional trainers and facilities
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-surface-600 group-hover:text-brand-400 transition-colors" />
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className={cn(
                  'w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center',
                  accountType === 'family' ? 'bg-purple-500/20' : 'bg-brand-500/20'
                )}>
                  {accountType === 'family' ? (
                    <Home size={24} className="text-purple-400" />
                  ) : (
                    <Building2 size={24} className="text-brand-400" />
                  )}
                </div>
                <h3 className="text-white font-medium mb-2">
                  {accountType === 'family' ? 'Family Details' : 'Business Details'}
                </h3>
                <p className="text-sm text-surface-400">
                  Update your contact information
                </p>
              </div>

              {accountType === 'business' && (
                <Input
                  label="Business Name"
                  placeholder="Your Training Facility"
                  leftIcon={<Building2 size={18} />}
                  value={details.businessName || ''}
                  onChange={(e) => setDetails((prev) => ({ ...prev, businessName: e.target.value }))}
                />
              )}

              <Input
                label="Phone Number"
                placeholder="(555) 123-4567"
                type="tel"
                value={details.phone || ''}
                onChange={(e) => setDetails((prev) => ({ ...prev, phone: e.target.value }))}
              />

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setStep('confirm')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} className="text-green-400" />
                </div>
                <h3 className="text-white font-medium mb-2">
                  Confirm Plan Change
                </h3>
                <p className="text-sm text-surface-400">
                  Please review before proceeding
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Account Type</span>
                  <span className="text-white capitalize">{accountType}</span>
                </div>
                {accountType === 'business' && details.businessName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Business Name</span>
                    <span className="text-white">{details.businessName}</span>
                  </div>
                )}
                {details.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Phone</span>
                    <span className="text-white">{details.phone}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-surface-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Current Plan</span>
                    <span className="text-surface-300 capitalize">{currentTier}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-surface-400">New Plan</span>
                    <span className="text-brand-400 font-medium">{newTierName}</span>
                  </div>
                </div>
              </div>

              {/* Warning for downgrade */}
              {!isUpgrade && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-400 font-medium">Downgrade Notice</p>
                    <p className="text-surface-400 mt-1">
                      Some features may be limited on your new plan. Your data will be preserved.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="glow"
                  className="flex-1"
                  onClick={handleConfirm}
                  isLoading={isSubmitting}
                >
                  Confirm & {isUpgrade ? 'Upgrade' : 'Change Plan'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
