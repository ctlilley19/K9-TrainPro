'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TierBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Award,
  Star,
  Trophy,
  Target,
  Zap,
  Heart,
  Shield,
  Crown,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';

// Badge definitions
const badgeCategories = [
  {
    id: 'obedience',
    name: 'Obedience',
    icon: <Star size={16} />,
    badges: [
      { id: 'sit', name: 'Sit Master', description: 'Mastered the sit command' },
      { id: 'stay', name: 'Stay Champion', description: 'Mastered the stay command' },
      { id: 'come', name: 'Recall Master', description: 'Mastered the recall command' },
      { id: 'down', name: 'Down Expert', description: 'Mastered the down command' },
      { id: 'place', name: 'Place Pro', description: 'Mastered the place command' },
    ],
  },
  {
    id: 'leash',
    name: 'Leash Skills',
    icon: <Target size={16} />,
    badges: [
      { id: 'loose_leash', name: 'Loose Leash Walker', description: 'Walks without pulling' },
      { id: 'heel', name: 'Heel Master', description: 'Walks in perfect heel position' },
      { id: 'distraction', name: 'Distraction Pro', description: 'Ignores distractions on walks' },
    ],
  },
  {
    id: 'behavior',
    name: 'Behavior',
    icon: <Zap size={16} />,
    badges: [
      { id: 'impulse', name: 'Impulse Control', description: 'Shows excellent self-control' },
      { id: 'calm', name: 'Calm & Collected', description: 'Remains calm in exciting situations' },
      { id: 'focus', name: 'Focus Champion', description: 'Maintains attention on handler' },
    ],
  },
  {
    id: 'social',
    name: 'Socialization',
    icon: <Heart size={16} />,
    badges: [
      { id: 'dog_friendly', name: 'Dog Friendly', description: 'Plays well with other dogs' },
      { id: 'people_friendly', name: 'People Friendly', description: 'Greets people politely' },
      { id: 'new_places', name: 'Explorer', description: 'Confident in new environments' },
    ],
  },
  {
    id: 'milestone',
    name: 'Milestones',
    icon: <Trophy size={16} />,
    badges: [
      { id: 'first_day', name: 'First Steps', description: 'Completed first training day' },
      { id: 'first_week', name: 'Week Champion', description: 'Completed first week' },
      { id: 'graduation', name: 'Graduate', description: 'Completed training program' },
    ],
  },
];

const tiers = [
  { id: 'bronze', name: 'Bronze', color: 'from-orange-600 to-orange-400' },
  { id: 'silver', name: 'Silver', color: 'from-gray-400 to-gray-200' },
  { id: 'gold', name: 'Gold', color: 'from-yellow-500 to-yellow-300' },
  { id: 'platinum', name: 'Platinum', color: 'from-cyan-400 to-cyan-200' },
  { id: 'diamond', name: 'Diamond', color: 'from-purple-500 to-pink-400' },
];

interface BadgeAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: { id: string; name: string; photo_url: string | null };
  onAward: (badge: { badgeId: string; name: string; tier: string; notes?: string }) => void;
}

export function BadgeAwardModal({
  isOpen,
  onClose,
  dog,
  onAward,
}: BadgeAwardModalProps) {
  const [step, setStep] = useState<'category' | 'badge' | 'tier' | 'confirm'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<{ id: string; name: string; description: string } | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('badge');
  };

  const handleBadgeSelect = (badge: { id: string; name: string; description: string }) => {
    setSelectedBadge(badge);
    setStep('tier');
  };

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    setStep('confirm');
  };

  const handleAward = () => {
    if (selectedBadge && selectedTier) {
      onAward({
        badgeId: selectedBadge.id,
        name: selectedBadge.name,
        tier: selectedTier,
        notes: notes || undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedBadge(null);
    setSelectedTier(null);
    setNotes('');
    setSearchQuery('');
    onClose();
  };

  const handleBack = () => {
    switch (step) {
      case 'badge':
        setStep('category');
        setSelectedCategory(null);
        break;
      case 'tier':
        setStep('badge');
        setSelectedBadge(null);
        break;
      case 'confirm':
        setStep('tier');
        setSelectedTier(null);
        break;
    }
  };

  const currentCategory = badgeCategories.find((c) => c.id === selectedCategory);

  const allBadges = badgeCategories.flatMap((cat) =>
    cat.badges.map((b) => ({ ...b, category: cat.name }))
  );

  const filteredBadges = searchQuery
    ? allBadges.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'category'
          ? `Award Badge to ${dog.name}`
          : step === 'badge'
          ? `Select Badge - ${currentCategory?.name}`
          : step === 'tier'
          ? `Select Tier for ${selectedBadge?.name}`
          : 'Confirm Badge Award'
      }
      size="md"
    >
      <div className="space-y-4">
        {/* Dog Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50">
          <Avatar name={dog.name} size="md" />
          <div>
            <p className="font-medium text-white">{dog.name}</p>
            <p className="text-sm text-surface-500">Receiving badge</p>
          </div>
        </div>

        {/* Search (on category step) */}
        {step === 'category' && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}

        {/* Search Results */}
        {searchQuery && filteredBadges.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => {
                  setSelectedBadge(badge);
                  setSearchQuery('');
                  setStep('tier');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors text-left"
              >
                <Award size={20} className="text-brand-400" />
                <div>
                  <p className="font-medium text-white">{badge.name}</p>
                  <p className="text-sm text-surface-500">{badge.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Category Selection */}
        {step === 'category' && !searchQuery && (
          <div className="grid grid-cols-2 gap-3">
            {badgeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-brand-500/50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium text-white">{category.name}</p>
                  <p className="text-xs text-surface-500">{category.badges.length} badges</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Badge Selection */}
        {step === 'badge' && currentCategory && (
          <div className="space-y-2">
            <button
              onClick={handleBack}
              className="text-sm text-surface-400 hover:text-white"
            >
              ← Back to categories
            </button>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentCategory.badges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeSelect(badge)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-brand-500/50 transition-all text-left"
                >
                  <Award size={20} className="text-brand-400" />
                  <div>
                    <p className="font-medium text-white">{badge.name}</p>
                    <p className="text-sm text-surface-500">{badge.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tier Selection */}
        {step === 'tier' && (
          <div className="space-y-2">
            <button
              onClick={handleBack}
              className="text-sm text-surface-400 hover:text-white"
            >
              ← Back to badges
            </button>
            <div className="grid grid-cols-5 gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => handleTierSelect(tier.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                    selectedTier === tier.id
                      ? 'bg-surface-800 border-brand-500'
                      : 'bg-surface-800/50 border-surface-700 hover:border-surface-600'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center',
                      tier.color
                    )}
                  >
                    <Star size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-white">{tier.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === 'confirm' && selectedBadge && selectedTier && (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="text-sm text-surface-400 hover:text-white"
            >
              ← Back to tier selection
            </button>

            <div className="flex items-center justify-center p-6 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20">
              <div className="text-center">
                <TierBadge tier={selectedTier as any} size="xl">
                  <Award size={32} />
                </TierBadge>
                <p className="text-xl font-bold text-white mt-4">{selectedBadge.name}</p>
                <p className="text-surface-400 capitalize">{selectedTier} Tier</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about why this badge was earned..."
                className="w-full h-24 bg-surface-800 border border-surface-700 rounded-lg p-3 text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAward}
                className="flex-1"
                leftIcon={<Sparkles size={16} />}
              >
                Award Badge
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Quick badge award button
interface QuickBadgeAwardProps {
  dog: { id: string; name: string; photo_url: string | null };
  onAward: (badge: { badgeId: string; name: string; tier: string; notes?: string }) => void;
}

export function QuickBadgeAward({ dog, onAward }: QuickBadgeAwardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Award size={16} />}
        onClick={() => setIsOpen(true)}
      >
        Award Badge
      </Button>
      <BadgeAwardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        dog={dog}
        onAward={onAward}
      />
    </>
  );
}
