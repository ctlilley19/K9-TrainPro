'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAuthStore,
  useDemoPersona,
  useDemoFamilyTier,
  useDemoBusinessTier,
  type DemoPersona,
  type FamilyTier,
  type BusinessTier,
} from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  X,
  Home,
  ClipboardList,
  Briefcase,
  Crown,
  Check,
  Dog,
  MapPin,
  Image,
  FileText,
  BarChart3,
  QrCode,
  Tag,
  Users,
  Zap,
} from 'lucide-react';

interface DemoTierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const personaConfig: Record<DemoPersona, { label: string; description: string; icon: typeof Home; color: string; path: string }> = {
  dog_owner: {
    label: 'Family',
    description: 'Pet parent portal view',
    icon: Home,
    color: 'blue',
    path: '/parent',
  },
  trainer: {
    label: 'Trainer',
    description: 'Staff training view',
    icon: ClipboardList,
    color: 'green',
    path: '/dashboard',
  },
  manager: {
    label: 'Manager',
    description: 'Business management view',
    icon: Briefcase,
    color: 'purple',
    path: '/dashboard',
  },
};

const familyTiers: { tier: FamilyTier; name: string; price: string; priceNote?: string; features: { icon: typeof Dog; text: string }[]; highlight?: boolean }[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    priceNote: 'forever',
    features: [
      { icon: Dog, text: '1 pet' },
      { icon: Image, text: '10 photos/month' },
      { icon: FileText, text: 'Daily reports' },
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '$10',
    priceNote: '/month',
    features: [
      { icon: Dog, text: 'Up to 5 pets' },
      { icon: MapPin, text: 'GPS route tracking' },
      { icon: Image, text: 'Unlimited photos' },
      { icon: FileText, text: 'Medical records' },
      { icon: Users, text: 'Up to 5 caregivers' },
    ],
    highlight: true,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$19',
    priceNote: '/month',
    features: [
      { icon: Check, text: 'Everything in Premium' },
      { icon: BarChart3, text: 'Pet Analytics' },
      { icon: QrCode, text: 'In-app QR code' },
      { icon: Tag, text: '1 free physical tag' },
    ],
  },
];

const businessTiers: { tier: BusinessTier; name: string; price: string; priceNote?: string; features: { icon: typeof Dog; text: string }[]; highlight?: boolean }[] = [
  {
    tier: 'starter',
    name: 'Starter',
    price: '$79',
    priceNote: '/month',
    features: [
      { icon: Dog, text: 'Up to 15 dogs' },
      { icon: Users, text: '2 staff accounts' },
      { icon: FileText, text: 'Daily reports' },
      { icon: Tag, text: '15 free NFC/QR tags' },
    ],
  },
  {
    tier: 'professional',
    name: 'Pro',
    price: '$149',
    priceNote: '/month',
    features: [
      { icon: Dog, text: 'Up to 50 dogs' },
      { icon: Users, text: '5 staff accounts' },
      { icon: BarChart3, text: 'Business Analytics' },
      { icon: Zap, text: 'Priority support' },
      { icon: Tag, text: '15 free NFC/QR tags' },
    ],
    highlight: true,
  },
  {
    tier: 'enterprise',
    name: 'Business',
    price: '$249',
    priceNote: '/month',
    features: [
      { icon: Dog, text: 'Unlimited dogs' },
      { icon: Users, text: 'Unlimited staff' },
      { icon: BarChart3, text: 'Advanced Analytics' },
      { icon: Zap, text: 'Dedicated support' },
      { icon: QrCode, text: 'White-label options' },
      { icon: Tag, text: '15 free NFC/QR tags' },
    ],
  },
];

export function DemoTierModal({ isOpen, onClose }: DemoTierModalProps) {
  const router = useRouter();
  const currentPersona = useDemoPersona();
  const familyTier = useDemoFamilyTier();
  const businessTier = useDemoBusinessTier();
  const { setDemoPersona, setDemoFamilyTier, setDemoBusinessTier } = useAuthStore();

  const [selectedPersona, setSelectedPersona] = useState<DemoPersona>(currentPersona || 'manager');

  if (!isOpen) return null;

  const isFamily = selectedPersona === 'dog_owner';

  const handlePersonaSelect = (persona: DemoPersona) => {
    setSelectedPersona(persona);
  };

  const handleApply = () => {
    if (selectedPersona !== currentPersona) {
      setDemoPersona(selectedPersona);
      const config = personaConfig[selectedPersona];
      router.push(config.path);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-surface-900 border-b border-surface-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Demo Mode Configuration</h2>
            <p className="text-sm text-surface-400">Select a role and subscription tier to preview</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Role Selection */}
          <div>
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Select Role</h3>
            <div className="grid grid-cols-3 gap-4">
              {(Object.entries(personaConfig) as [DemoPersona, typeof personaConfig[DemoPersona]][]).map(([key, config]) => {
                const isSelected = selectedPersona === key;
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handlePersonaSelect(key)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                      config.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                      config.color === 'green' && 'bg-green-500/20 text-green-400',
                      config.color === 'purple' && 'bg-purple-500/20 text-purple-400',
                    )}>
                      <Icon size={24} />
                    </div>
                    <p className="font-semibold text-white">{config.label}</p>
                    <p className="text-sm text-surface-400">{config.description}</p>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-brand-400">
                        <Check size={14} />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
                {isFamily ? 'Family Subscription Tiers' : 'Business Subscription Tiers'}
              </h3>
              {!isFamily && (
                <span className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
                  <Tag size={14} />
                  All plans include 15 free NFC/QR tags
                </span>
              )}
            </div>

            {isFamily ? (
              <div className="grid grid-cols-3 gap-4">
                {familyTiers.map((tierInfo) => {
                  const isSelected = familyTier === tierInfo.tier;
                  return (
                    <button
                      key={tierInfo.tier}
                      onClick={() => setDemoFamilyTier(tierInfo.tier)}
                      className={cn(
                        'p-5 rounded-xl border-2 transition-all text-left relative',
                        isSelected
                          ? tierInfo.tier === 'pro'
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-brand-500 bg-brand-500/10'
                          : 'border-surface-700 hover:border-surface-600 bg-surface-800/50',
                        tierInfo.highlight && !isSelected && 'border-brand-500/50'
                      )}
                    >
                      {tierInfo.highlight && (
                        <span className="absolute -top-3 left-4 px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full">
                          Popular
                        </span>
                      )}
                      {tierInfo.tier === 'pro' && (
                        <Crown size={20} className="absolute top-4 right-4 text-amber-400" />
                      )}
                      <p className="font-bold text-white text-lg">{tierInfo.name}</p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-bold text-white">{tierInfo.price}</span>
                        {tierInfo.priceNote && (
                          <span className="text-sm text-surface-400">{tierInfo.priceNote}</span>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {tierInfo.features.map((feature, idx) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <li key={idx} className="flex items-center gap-2 text-sm text-surface-300">
                              <FeatureIcon size={14} className="text-surface-500" />
                              {feature.text}
                            </li>
                          );
                        })}
                      </ul>
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-surface-700 flex items-center gap-1 text-xs text-brand-400">
                          <Check size={14} />
                          Currently viewing
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {businessTiers.map((tierInfo) => {
                  const isSelected = businessTier === tierInfo.tier;
                  return (
                    <button
                      key={tierInfo.tier}
                      onClick={() => setDemoBusinessTier(tierInfo.tier)}
                      className={cn(
                        'p-5 rounded-xl border-2 transition-all text-left relative',
                        isSelected
                          ? tierInfo.tier === 'enterprise'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-brand-500 bg-brand-500/10'
                          : 'border-surface-700 hover:border-surface-600 bg-surface-800/50',
                        tierInfo.highlight && !isSelected && 'border-brand-500/50'
                      )}
                    >
                      {tierInfo.highlight && (
                        <span className="absolute -top-3 left-4 px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full">
                          Popular
                        </span>
                      )}
                      {tierInfo.tier === 'enterprise' && (
                        <Crown size={20} className="absolute top-4 right-4 text-purple-400" />
                      )}
                      <p className="font-bold text-white text-lg">{tierInfo.name}</p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-bold text-white">{tierInfo.price}</span>
                        {tierInfo.priceNote && (
                          <span className="text-sm text-surface-400">{tierInfo.priceNote}</span>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {tierInfo.features.map((feature, idx) => {
                          const FeatureIcon = feature.icon;
                          const isTagFeature = feature.text.includes('NFC/QR');
                          return (
                            <li key={idx} className={cn(
                              'flex items-center gap-2 text-sm',
                              isTagFeature ? 'text-amber-400' : 'text-surface-300'
                            )}>
                              <FeatureIcon size={14} className={isTagFeature ? 'text-amber-400' : 'text-surface-500'} />
                              {feature.text}
                            </li>
                          );
                        })}
                      </ul>
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-surface-700 flex items-center gap-1 text-xs text-brand-400">
                          <Check size={14} />
                          Currently viewing
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current Selection Summary */}
          <div className="bg-surface-800/50 rounded-xl p-4 border border-surface-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Currently Viewing</p>
                <p className="text-lg font-semibold text-white">
                  {personaConfig[selectedPersona].label} • {' '}
                  {isFamily
                    ? familyTiers.find(t => t.tier === familyTier)?.name
                    : businessTiers.find(t => t.tier === businessTier)?.name
                  } Plan
                </p>
              </div>
              <Button variant="primary" onClick={handleApply}>
                Apply & View
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
