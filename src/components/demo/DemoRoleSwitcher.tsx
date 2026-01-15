'use client';

import { useState } from 'react';
import {
  useDemoPersona,
  useIsDemoMode,
  useDemoFamilyTier,
  useDemoBusinessTier,
  type DemoPersona,
} from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { DemoTierModal } from './DemoTierModal';
import {
  Home,
  ClipboardList,
  Briefcase,
  Sparkles,
  Crown,
} from 'lucide-react';

const personaConfig: Record<DemoPersona, { label: string; icon: typeof Home; color: string }> = {
  dog_owner: {
    label: 'Family',
    icon: Home,
    color: 'blue',
  },
  trainer: {
    label: 'Trainer',
    icon: ClipboardList,
    color: 'green',
  },
  manager: {
    label: 'Manager',
    icon: Briefcase,
    color: 'purple',
  },
};

const familyTierLabels = {
  free: { label: 'Free', color: 'surface' },
  premium: { label: 'Premium', color: 'brand' },
  pro: { label: 'Pro', color: 'amber' },
};

const businessTierLabels = {
  starter: { label: 'Starter', color: 'surface' },
  professional: { label: 'Pro', color: 'brand' },
  enterprise: { label: 'Business', color: 'purple' },
};

export function DemoRoleSwitcher() {
  const isDemoMode = useIsDemoMode();
  const currentPersona = useDemoPersona();
  const familyTier = useDemoFamilyTier();
  const businessTier = useDemoBusinessTier();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show in demo mode
  if (!isDemoMode) return null;

  const current = currentPersona ? personaConfig[currentPersona] : null;
  const isFamily = currentPersona === 'dog_owner';
  const currentTier = isFamily ? familyTierLabels[familyTier] : businessTierLabels[businessTier];

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all',
            'bg-surface-800 border border-surface-700 hover:border-surface-600 hover:scale-105'
          )}
        >
          {current ? (
            <>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center',
                current.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                current.color === 'green' && 'bg-green-500/20 text-green-400',
                current.color === 'purple' && 'bg-purple-500/20 text-purple-400',
              )}>
                <current.icon size={14} />
              </div>
              <span className="text-sm font-medium text-white">{current.label}</span>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded flex items-center gap-1',
                currentTier.color === 'amber' && 'bg-amber-500/20 text-amber-400',
                currentTier.color === 'brand' && 'bg-brand-500/20 text-brand-400',
                currentTier.color === 'purple' && 'bg-purple-500/20 text-purple-400',
                currentTier.color === 'surface' && 'bg-surface-700 text-surface-300',
              )}>
                {(currentTier.color === 'amber' || currentTier.color === 'purple') && <Crown size={10} />}
                {currentTier.label}
              </span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-500/20 text-brand-400">
                <Sparkles size={14} />
              </div>
              <span className="text-sm font-medium text-white">Demo</span>
            </>
          )}
        </button>
      </div>

      {/* Modal */}
      <DemoTierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
