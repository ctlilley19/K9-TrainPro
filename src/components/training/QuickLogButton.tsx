'use client';

import { useState } from 'react';
import { cn, activityConfig, type ActivityType } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useActivityConfig } from '@/hooks/useActivityConfig';
import { ICON_REGISTRY } from '@/components/activities/IconBuilder';
import {
  Home,
  Droplets,
  GraduationCap,
  Gamepad2,
  UtensilsCrossed,
  Moon,
  Dog,
  Sparkles,
  Stethoscope,
  Plus,
  X,
  Star,
  Loader2,
} from 'lucide-react';

// Fallback icons for built-in types
const fallbackIcons: Record<string, React.ReactNode> = {
  kennel: <Home size={18} />,
  potty: <Droplets size={18} />,
  training: <GraduationCap size={18} />,
  play: <Gamepad2 size={18} />,
  group_play: <Gamepad2 size={18} />,
  feeding: <UtensilsCrossed size={18} />,
  rest: <Moon size={18} />,
  walk: <Dog size={18} />,
  grooming: <Sparkles size={18} />,
  medical: <Stethoscope size={18} />,
};

interface DogItem {
  id: string;
  name: string;
}

interface QuickLogButtonProps {
  dogs: DogItem[];
  onLog: (dogId: string, activityType: string, notes?: string, customTypeId?: string) => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function QuickLogButton({
  dogs,
  onLog,
  variant = 'primary',
  size = 'md',
}: QuickLogButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'dog' | 'activity'>('dog');
  const [selectedDog, setSelectedDog] = useState<DogItem | null>(null);
  const [notes, setNotes] = useState('');

  const { activityConfigs, isLoading, getQuickLogActivities } = useActivityConfig();

  const handleSelectDog = (dog: DogItem) => {
    setSelectedDog(dog);
    setStep('activity');
  };

  const handleSelectActivity = (activityCode: string, customTypeId?: string) => {
    if (selectedDog) {
      onLog(selectedDog.id, activityCode, notes || undefined, customTypeId);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('dog');
    setSelectedDog(null);
    setNotes('');
  };

  // Get activities to show in quick log, separated by built-in vs custom
  const quickLogActivities = getQuickLogActivities();
  const builtInActivities = quickLogActivities.filter((a) => !a.isCustom);
  const customActivities = quickLogActivities.filter((a) => a.isCustom);

  // Split built-in into common and other
  const commonCodes = ['potty', 'training', 'play', 'feeding', 'rest', 'kennel'];
  const commonActivities = builtInActivities.filter((a) => commonCodes.includes(a.code));
  const otherBuiltIn = builtInActivities.filter((a) => !commonCodes.includes(a.code));

  // Helper to render icon
  const renderIcon = (iconName: string, color: string, activityCode: string) => {
    const IconComponent = ICON_REGISTRY[iconName]?.icon;
    if (IconComponent) {
      return <IconComponent size={18} style={{ color }} />;
    }
    // Fallback to hardcoded icons for built-in types
    if (fallbackIcons[activityCode]) {
      return fallbackIcons[activityCode];
    }
    return <Star size={18} style={{ color }} />;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        leftIcon={<Plus size={16} />}
        onClick={() => setIsOpen(true)}
      >
        Quick Log
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={step === 'dog' ? 'Select Dog' : `Log Activity for ${selectedDog?.name}`}
        size="md"
      >
        {step === 'dog' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => handleSelectDog(dog)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-brand-500/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <Dog size={20} className="text-brand-400" />
                  </div>
                  <span className="font-medium text-white">{dog.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStep('dog')}
              className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
            >
              <X size={14} />
              Change dog
            </button>

            {/* Common Activities */}
            {commonActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-surface-400 mb-3">Common Activities</h4>
                <div className="grid grid-cols-3 gap-2">
                  {commonActivities.map((activity) => (
                    <button
                      key={activity.code}
                      onClick={() => handleSelectActivity(activity.code)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                        'bg-surface-800/50 border-surface-700',
                        'hover:border-brand-500/50 hover:bg-surface-800'
                      )}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: activity.color + '30' }}
                      >
                        {renderIcon(activity.iconName, activity.color, activity.code)}
                      </div>
                      <span className="text-sm font-medium text-white">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other Built-in Activities */}
            {otherBuiltIn.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-surface-400 mb-3">Other Activities</h4>
                <div className="grid grid-cols-4 gap-2">
                  {otherBuiltIn.map((activity) => (
                    <button
                      key={activity.code}
                      onClick={() => handleSelectActivity(activity.code)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                        'bg-surface-800/50 border-surface-700',
                        'hover:border-brand-500/50 hover:bg-surface-800'
                      )}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: activity.color + '30' }}
                      >
                        {renderIcon(activity.iconName, activity.color, activity.code)}
                      </div>
                      <span className="text-xs font-medium text-white">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Activities */}
            {customActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-surface-400 mb-3">Custom Activities</h4>
                <div className="grid grid-cols-3 gap-2">
                  {customActivities.map((activity) => (
                    <button
                      key={activity.code}
                      onClick={() => handleSelectActivity(activity.code, activity.customTypeId)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                        'bg-surface-800/50 border-surface-700',
                        'hover:border-brand-500/50 hover:bg-surface-800'
                      )}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: activity.color + '30' }}
                      >
                        {renderIcon(activity.iconName, activity.color, activity.code)}
                      </div>
                      <span className="text-sm font-medium text-white">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                className="w-full h-20 bg-surface-800 border border-surface-700 rounded-lg p-3 text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// Floating action button version
interface QuickLogFABProps {
  dogs: DogItem[];
  onLog: (dogId: string, activityType: string, notes?: string, customTypeId?: string) => void;
}

export function QuickLogFAB({ dogs, onLog }: QuickLogFABProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <QuickLogButton
        dogs={dogs}
        onLog={onLog}
        variant="primary"
        size="lg"
      />
    </div>
  );
}
