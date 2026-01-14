'use client';

import { useState, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { BadgeCard, TierDots, type BadgeTier } from './BadgeDisplay';
import { cn } from '@/lib/utils';
import { useDogsWithPrograms } from '@/hooks';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  Dog,
  Award,
  Star,
  Target,
  Shield,
  Trophy,
  Crown,
  Zap,
  Heart,
  Loader2,
} from 'lucide-react';

interface AwardBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Badge definitions
const badgeDefinitions = [
  {
    id: 'sit-master',
    name: 'Sit Master',
    description: 'Master the sit command with reliability',
    category: 'obedience',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
    criteria: {
      bronze: '70% reliability',
      silver: '80% reliability',
      gold: '90% reliability',
      platinum: '95% reliability',
      diamond: '99% reliability',
    },
  },
  {
    id: 'stay-champion',
    name: 'Stay Champion',
    description: 'Master the stay command with duration',
    category: 'obedience',
    icon: 'shield',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
    criteria: {
      bronze: '30 seconds stay',
      silver: '1 minute stay',
      gold: '3 minutes stay',
      platinum: '5 minutes stay',
      diamond: '10 minutes stay',
    },
  },
  {
    id: 'recall-master',
    name: 'Recall Master',
    description: 'Come when called from any distance',
    category: 'obedience',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
    criteria: {
      bronze: '10ft recall',
      silver: '25ft recall',
      gold: '50ft recall',
      platinum: '100ft recall',
      diamond: 'Off-leash recall',
    },
  },
  {
    id: 'leash-walking',
    name: 'Leash Walking Pro',
    description: 'Walk calmly on leash without pulling',
    category: 'leash',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
    criteria: {
      bronze: 'Minimal pulling',
      silver: 'Loose leash 80%',
      gold: 'Perfect heel',
    },
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Positive interactions with dogs and people',
    category: 'social',
    icon: 'heart',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
    criteria: {
      bronze: 'Calm with 1 dog',
      silver: 'Calm in group of 3',
      gold: 'Off-leash play skills',
    },
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Extended place/stay command mastery',
    category: 'behavior',
    icon: 'zap',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
    criteria: {
      bronze: '5 minute place',
      silver: '10 minute place',
      gold: '15+ minute place',
    },
  },
  {
    id: 'first-week',
    name: 'First Week Star',
    description: 'Complete the first week of training',
    category: 'milestone',
    icon: 'trophy',
    tiers: ['bronze'] as BadgeTier[],
    criteria: {
      bronze: 'Complete 7 days',
    },
  },
  {
    id: 'graduate',
    name: 'Program Graduate',
    description: 'Successfully complete a training program',
    category: 'milestone',
    icon: 'crown',
    tiers: ['gold'] as BadgeTier[],
    criteria: {
      gold: 'Graduate from program',
    },
  },
];

const badgeIcons: Record<string, (color: string) => React.ReactNode> = {
  star: (color) => <Star size={32} stroke={color} />,
  target: (color) => <Target size={32} stroke={color} />,
  shield: (color) => <Shield size={32} stroke={color} />,
  trophy: (color) => <Trophy size={32} stroke={color} />,
  crown: (color) => <Crown size={32} stroke={color} />,
  zap: (color) => <Zap size={32} stroke={color} />,
  heart: (color) => <Heart size={32} stroke={color} />,
};

const tierColors: Record<BadgeTier, string> = {
  bronze: '#cd7f32',
  silver: '#94a3b8',
  gold: '#f59e0b',
  platinum: '#22d3ee',
  diamond: '#c084fc',
};

const STEPS = [
  { id: 1, title: 'Dog', description: 'Select the dog' },
  { id: 2, title: 'Badge', description: 'Choose a badge' },
  { id: 3, title: 'Tier', description: 'Select tier level' },
  { id: 4, title: 'Confirm', description: 'Review and award' },
];

export function AwardBadgeModal({ isOpen, onClose, onSuccess }: AwardBadgeModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<BadgeTier | ''>('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: dogs, isLoading: dogsLoading } = useDogsWithPrograms();
  const totalSteps = STEPS.length;

  // Filter dogs
  const filteredDogs = useMemo(() => {
    if (!dogs) return [];
    if (!searchQuery) return dogs;
    return dogs.filter(
      (dog) =>
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dog.breed?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [dogs, searchQuery]);

  // Filter badges by category
  const filteredBadges = useMemo(() => {
    if (categoryFilter === 'all') return badgeDefinitions;
    return badgeDefinitions.filter((b) => b.category === categoryFilter);
  }, [categoryFilter]);

  // Get selected items
  const selectedDog = dogs?.find((d) => d.id === selectedDogId);
  const selectedBadge = badgeDefinitions.find((b) => b.id === selectedBadgeId);

  const categories = ['all', 'obedience', 'leash', 'social', 'behavior', 'milestone'];

  // Navigation validation
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!selectedDogId;
      case 2:
        return !!selectedBadgeId;
      case 3:
        return !!selectedTier;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDogId('');
    setSelectedBadgeId('');
    setSelectedTier('');
    setNotes('');
    setSearchQuery('');
    setCategoryFilter('all');
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      console.log('Awarding badge:', {
        dogId: selectedDogId,
        badgeId: selectedBadgeId,
        tier: selectedTier,
        notes,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to award badge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" raw closeOnOverlayClick={false}>
      {/* Header */}
      <ModalHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Award Badge</h2>
            <p className="text-sm text-surface-400">
              Step {step} of {totalSteps}: {STEPS[step - 1].description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-surface-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={cn(
                  'text-xs transition-colors',
                  step >= s.id ? 'text-amber-400 font-medium' : 'text-surface-500'
                )}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="min-h-[360px]">
        {/* Step 1: Select Dog */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Dog size={32} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Select a Dog</h3>
              <p className="text-sm text-surface-400">Choose which dog to award the badge to</p>
            </div>

            <Input
              placeholder="Search dogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />

            {dogsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {filteredDogs.map((dog) => (
                  <button
                    key={dog.id}
                    type="button"
                    onClick={() => setSelectedDogId(dog.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                      selectedDogId === dog.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                    )}
                  >
                    <Avatar name={dog.name} src={dog.photo_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium', selectedDogId === dog.id ? 'text-white' : 'text-surface-300')}>
                        {dog.name}
                      </p>
                      <p className="text-xs text-surface-500 truncate">{dog.breed || 'Unknown breed'}</p>
                    </div>
                    {selectedDogId === dog.id && <Check size={20} className="text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Badge */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Award size={32} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Select a Badge</h3>
              <p className="text-sm text-surface-400">Choose which badge to award to {selectedDog?.name}</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors',
                    categoryFilter === cat
                      ? 'bg-amber-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:text-white'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto">
              {filteredBadges.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => {
                    setSelectedBadgeId(badge.id);
                    setSelectedTier(''); // Reset tier when badge changes
                  }}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all text-left',
                    selectedBadgeId === badge.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center">
                      {badgeIcons[badge.icon]?.('#9ca3af') || <Award size={16} className="text-surface-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', selectedBadgeId === badge.id ? 'text-white' : 'text-surface-300')}>
                        {badge.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 line-clamp-2">{badge.description}</p>
                  <div className="mt-2">
                    <TierDots availableTiers={badge.tiers} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Tier */}
        {step === 3 && selectedBadge && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Star size={32} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Select Tier Level</h3>
              <p className="text-sm text-surface-400">Choose the tier for {selectedBadge.name}</p>
            </div>

            <div className="space-y-3">
              {selectedBadge.tiers.map((tier) => {
                const color = tierColors[tier];
                const criteria = selectedBadge.criteria[tier as keyof typeof selectedBadge.criteria];

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      selectedTier === tier
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                    )}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(145deg, ${color}33, ${color}1a)`,
                        boxShadow: `0 0 15px ${color}66`,
                      }}
                    >
                      {badgeIcons[selectedBadge.icon]?.(color) || <Award size={24} stroke={color} />}
                    </div>
                    <div className="flex-1">
                      <p className={cn('font-medium capitalize', selectedTier === tier ? 'text-white' : 'text-surface-300')}>
                        {tier}
                      </p>
                      <p className="text-xs text-surface-500">{criteria}</p>
                    </div>
                    {selectedTier === tier && <Check size={20} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedDog && selectedBadge && selectedTier && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Confirm Award</h3>
              <p className="text-sm text-surface-400">Review and confirm the badge award</p>
            </div>

            {/* Preview Card */}
            <div className="rounded-xl border border-surface-700 bg-surface-800/50 overflow-hidden">
              <div className="p-4 flex items-center gap-4 border-b border-surface-700">
                <Avatar name={selectedDog.name} src={selectedDog.photo_url} size="lg" />
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedDog.name}</h4>
                  <p className="text-sm text-surface-400">{selectedDog.breed || 'Unknown breed'}</p>
                </div>
              </div>

              <div className="p-6 flex justify-center">
                <BadgeCard
                  tier={selectedTier}
                  title={selectedBadge.name}
                  description={selectedBadge.criteria[selectedTier as keyof typeof selectedBadge.criteria] || ''}
                  icon={badgeIcons[selectedBadge.icon]?.(tierColors[selectedTier]) || <Award size={32} />}
                  size="lg"
                />
              </div>
            </div>

            {/* Notes */}
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this achievement..."
              className="mt-4"
            />
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="justify-between">
        <Button variant="ghost" onClick={step === 1 ? handleClose : prevStep} disabled={isSubmitting}>
          <ArrowLeft size={16} className="mr-2" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        <Button
          variant="primary"
          onClick={nextStep}
          disabled={!canProceed() || isSubmitting}
          isLoading={isSubmitting}
          className="bg-amber-500 hover:bg-amber-400"
        >
          {step === totalSteps ? (
            <>
              <Award size={16} className="mr-2" />
              Award Badge
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AwardBadgeModal;
