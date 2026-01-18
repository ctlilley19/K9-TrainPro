'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Users, Briefcase, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserType = 'business' | 'family' | null;

const businessFeatures = [
  'Live Training Board',
  'Auto Daily Reports',
  'Unlimited Trainers',
  'Badge & Achievement System',
  'Pet Parent Portal for Clients',
  'Video Library Hosting',
  'Homework Assignment System',
  'Custom Branding',
  'SMS Notifications',
  'Priority Support',
];

const familyFeatures = [
  'Browse & Book Trainers',
  'Daily Progress Updates',
  'Photo & Video Gallery',
  'Direct Messaging with Trainer',
  'Homework Tracking',
  'Badge & Achievement Alerts',
  'Graduation Certificates',
  'Multiple Dogs Support',
];

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedType === 'business') {
      router.push('/register?type=business');
    } else if (selectedType === 'family') {
      router.push('/register?type=family');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-surface-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
              <Sparkles size={16} className="text-brand-400" />
              <span className="text-sm text-brand-400 font-medium">14-Day Free Trial</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome to K9 ProTrain!
            </h2>
            <p className="text-surface-400">
              Tell us about yourself so we can set up the right experience for you.
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Business Owner Option */}
            <button
              onClick={() => setSelectedType('business')}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selectedType === 'business'
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedType === 'business' ? 'bg-brand-500/20' : 'bg-surface-700'
                }`}>
                  <Briefcase size={24} className={selectedType === 'business' ? 'text-brand-400' : 'text-surface-400'} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">I&apos;m a Business Owner</h3>
                  <p className="text-sm text-surface-400">Dog trainer, boarding facility, etc.</p>
                </div>
              </div>
              <ul className="space-y-2">
                {businessFeatures.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                <li className="text-sm text-surface-500">+ {businessFeatures.length - 5} more features</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-surface-700">
                <p className="text-sm text-surface-400">Starting at</p>
                <p className="text-2xl font-bold text-white">$49<span className="text-sm font-normal text-surface-400">/month</span></p>
              </div>
            </button>

            {/* Dog Parent Option */}
            <button
              onClick={() => setSelectedType('family')}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selectedType === 'family'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedType === 'family' ? 'bg-purple-500/20' : 'bg-surface-700'
                }`}>
                  <Users size={24} className={selectedType === 'family' ? 'text-purple-400' : 'text-surface-400'} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">I&apos;m a Dog Parent</h3>
                  <p className="text-sm text-surface-400">Your dog&apos;s care, all in one place</p>
                </div>
              </div>
              <ul className="space-y-2">
                {familyFeatures.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                <li className="text-sm text-surface-500">+ {familyFeatures.length - 5} more features</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-surface-700">
                <p className="text-sm text-surface-400">Starting at</p>
                <p className="text-2xl font-bold text-white">Free<span className="text-sm font-normal text-surface-400"> - $19/month</span></p>
              </div>
            </button>
          </div>

          {/* Feature Comparison (shows when a type is selected) */}
          {selectedType && (
            <div className="mb-8 p-4 rounded-xl bg-surface-800/50 border border-surface-700">
              <h4 className="font-semibold text-white mb-1">
                {selectedType === 'business' ? 'Business Plan Features' : 'What You Get'}
              </h4>
              <p className="text-sm text-surface-500 mb-3">
                {selectedType === 'business'
                  ? 'Everything you need to run your training business'
                  : 'When you book training, your whole family gets access to:'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(selectedType === 'business' ? businessFeatures : familyFeatures).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-surface-300">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="glow"
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={handleContinue}
              disabled={!selectedType}
              className="w-full sm:w-auto"
            >
              Continue to Sign Up
            </Button>
            <p className="text-sm text-surface-500 text-center">
              14-day free trial on all plans. Cancel anytime.<br />
              You can upgrade or downgrade whenever you need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
