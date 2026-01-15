'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDemoPersona, type DemoPersona } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  Dog,
  Check,
  ChevronRight,
  Home,
  ClipboardList,
  Briefcase,
} from 'lucide-react';

const personas = [
  {
    id: 'dog_owner' as DemoPersona,
    title: 'Family',
    subtitle: 'Sarah Anderson',
    description: 'Experience the family portal - view your dogs\' progress, daily reports, photos, and communicate with trainers.',
    icon: Home,
    color: 'blue',
    features: [
      'View daily reports & updates',
      'Browse photo & video gallery',
      'Track training progress',
      'Message trainers',
      'Complete homework assignments',
    ],
    redirectPath: '/parent',
  },
  {
    id: 'trainer' as DemoPersona,
    title: 'Trainer',
    subtitle: 'Mike Johnson',
    description: 'Experience the trainer workflow - manage daily training activities, log sessions, and communicate with families.',
    icon: ClipboardList,
    color: 'green',
    features: [
      'Training board management',
      'Activity & session logging',
      'Photo/video uploads',
      'Daily report creation',
      'Family messaging',
    ],
    redirectPath: '/dashboard',
  },
  {
    id: 'manager' as DemoPersona,
    title: 'Manager',
    subtitle: 'Demo Admin',
    description: 'Experience full facility management - analytics, team management, family invites, and business configuration.',
    icon: Briefcase,
    color: 'purple',
    features: [
      'All trainer features',
      'Team & trainer management',
      'Analytics dashboard',
      'Invite families',
      'Business configuration',
    ],
    redirectPath: '/dashboard',
  },
];

export default function DemoConfigPage() {
  const router = useRouter();
  const { setDemoPersona } = useAuthStore();
  const currentPersona = useDemoPersona();
  const [selectedPersona, setSelectedPersona] = useState<DemoPersona>(currentPersona || 'manager');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDemo = async () => {
    setIsLoading(true);
    setDemoPersona(selectedPersona);

    const persona = personas.find(p => p.id === selectedPersona);
    router.push(persona?.redirectPath || '/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow-amber mb-4 mx-auto">
          <Dog size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">K9 ProTrain Demo</h1>
        <p className="text-surface-400 max-w-md">
          Choose a persona to explore the platform from different perspectives.
        </p>
      </div>

      {/* Persona Selection */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-8">
        {personas.map((persona) => {
          const isSelected = selectedPersona === persona.id;
          const Icon = persona.icon;

          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={cn(
                'relative p-6 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? persona.color === 'blue'
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : persona.color === 'green'
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-purple-500/50 bg-purple-500/10'
                  : 'border-surface-700 bg-surface-800/50 hover:border-surface-600'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                persona.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                persona.color === 'green' && 'bg-green-500/20 text-green-400',
                persona.color === 'purple' && 'bg-purple-500/20 text-purple-400',
              )}>
                <Icon size={32} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white">{persona.title}</h3>
              <p className="text-sm text-surface-500 mb-2">{persona.subtitle}</p>
              <p className="text-sm text-surface-400 mb-4">{persona.description}</p>

              {/* Features */}
              <ul className="space-y-1">
                {persona.features.map((feature) => (
                  <li key={feature} className="text-xs text-surface-500 flex items-center gap-2">
                    <ChevronRight size={12} className={cn(
                      persona.color === 'blue' && 'text-blue-400',
                      persona.color === 'green' && 'text-green-400',
                      persona.color === 'purple' && 'text-purple-400',
                    )} />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <button
        onClick={handleStartDemo}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all',
          'bg-brand-500 hover:bg-brand-600 text-white',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Start Demo as {personas.find(p => p.id === selectedPersona)?.title}
            <ChevronRight size={18} />
          </>
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-surface-500 mt-6 max-w-md text-center">
        Demo mode uses sample data. No real information is stored or transmitted.
        You can switch personas anytime using the floating switcher.
      </p>
    </div>
  );
}
