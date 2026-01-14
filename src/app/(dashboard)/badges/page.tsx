'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { BadgeCard, TierDots, AwardBadgeModal, type BadgeTier } from '@/components/badges';
import { cn } from '@/lib/utils';
import {
  Award,
  Star,
  Trophy,
  Target,
  Heart,
  Shield,
  Crown,
  Zap,
  Search,
  Plus,
  Dog,
  Calendar,
  Flame,
  GraduationCap,
} from 'lucide-react';

// Tier colors for styling
const tierColors: Record<BadgeTier, string> = {
  bronze: '#cd7f32',
  silver: '#94a3b8',
  gold: '#f59e0b',
  platinum: '#22d3ee',
  diamond: '#c084fc',
};

// Badge icon components
const badgeIcons: Record<string, (color: string, size?: number) => React.ReactNode> = {
  star: (color, size = 32) => <Star size={size} stroke={color} />,
  target: (color, size = 32) => <Target size={size} stroke={color} />,
  shield: (color, size = 32) => <Shield size={size} stroke={color} />,
  trophy: (color, size = 32) => <Trophy size={size} stroke={color} />,
  crown: (color, size = 32) => <Crown size={size} stroke={color} />,
  zap: (color, size = 32) => <Zap size={size} stroke={color} />,
  heart: (color, size = 32) => <Heart size={size} stroke={color} />,
  dog: (color, size = 32) => <Dog size={size} stroke={color} />,
  flame: (color, size = 32) => <Flame size={size} stroke={color} />,
  graduation: (color, size = 32) => <GraduationCap size={size} stroke={color} />,
};

// Badge definitions with full tier support
const skillBadges = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'First steps in training',
    tier: 'bronze' as BadgeTier,
    icon: 'dog',
    category: 'tier',
  },
  {
    id: 'novice',
    name: 'Novice',
    description: 'Building foundations',
    tier: 'silver' as BadgeTier,
    icon: 'dog',
    category: 'tier',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Mastering skills',
    tier: 'gold' as BadgeTier,
    icon: 'star',
    category: 'tier',
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Elite trainer status',
    tier: 'platinum' as BadgeTier,
    icon: 'crown',
    category: 'tier',
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Legendary achievement',
    tier: 'diamond' as BadgeTier,
    icon: 'crown',
    category: 'tier',
  },
];

const achievementBadges = [
  {
    id: 'recall-pro',
    name: 'Recall Pro',
    description: 'Perfect recall at distance',
    color: 'green' as const,
    icon: 'target',
  },
  {
    id: 'heel-master',
    name: 'Heel Master',
    description: 'Perfect heel position',
    color: 'blue' as const,
    icon: 'target',
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: '15+ min place/stay',
    color: 'purple' as const,
    icon: 'shield',
  },
  {
    id: 'star-pupil',
    name: 'Star Pupil',
    description: 'Learned 3 skills in 1 day',
    color: 'yellow' as const,
    icon: 'star',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: '10 successful play sessions',
    color: 'pink' as const,
    icon: 'heart',
  },
  {
    id: 'graduate',
    name: 'Graduate',
    description: 'Completed full program',
    color: 'orange' as const,
    icon: 'graduation',
  },
];

const milestoneBadges = [
  {
    id: 'day-1',
    name: 'Day 1',
    description: 'First day in training',
    color: 'cyan' as const,
    icon: 'flame',
  },
  {
    id: 'week-1',
    name: 'Week 1',
    description: '7 days of progress',
    color: 'purple' as const,
    icon: 'trophy',
  },
  {
    id: 'perfect-potty',
    name: 'Perfect Potty',
    description: 'No accidents for 7 days',
    color: 'green' as const,
    icon: 'star',
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Mastered skill in <3 days',
    color: 'yellow' as const,
    icon: 'zap',
  },
];

// Badge library definitions (for trainers to award)
const badgeLibrary = [
  {
    id: 'sit-master',
    name: 'Sit Master',
    description: 'Master the sit command with reliability',
    category: 'obedience',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'stay-champion',
    name: 'Stay Champion',
    description: 'Master the stay command with duration',
    category: 'obedience',
    icon: 'shield',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'recall-master',
    name: 'Recall Master',
    description: 'Come when called from any distance',
    category: 'obedience',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as BadgeTier[],
  },
  {
    id: 'leash-walking',
    name: 'Leash Walking Pro',
    description: 'Walk calmly on leash without pulling',
    category: 'leash',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Positive interactions with dogs and people',
    category: 'social',
    icon: 'heart',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Extended place/stay command mastery',
    category: 'behavior',
    icon: 'zap',
    tiers: ['bronze', 'silver', 'gold'] as BadgeTier[],
  },
  {
    id: 'first-week',
    name: 'First Week Star',
    description: 'Complete the first week of training',
    category: 'milestone',
    icon: 'trophy',
    tiers: ['bronze'] as BadgeTier[],
  },
  {
    id: 'graduate',
    name: 'Program Graduate',
    description: 'Successfully complete a training program',
    category: 'milestone',
    icon: 'crown',
    tiers: ['gold'] as BadgeTier[],
  },
];

// Mock recently awarded badges
const recentAwards = [
  { id: '1', dog_name: 'Max', dog_photo: null, badge_name: 'Sit Master', tier: 'silver' as BadgeTier, awarded_at: '2025-01-13', awarded_by: 'Sarah Johnson' },
  { id: '2', dog_name: 'Bella', dog_photo: null, badge_name: 'First Week Star', tier: 'bronze' as BadgeTier, awarded_at: '2025-01-12', awarded_by: 'John Smith' },
  { id: '3', dog_name: 'Luna', dog_photo: null, badge_name: 'Stay Champion', tier: 'bronze' as BadgeTier, awarded_at: '2025-01-11', awarded_by: 'Sarah Johnson' },
  { id: '4', dog_name: 'Max', dog_photo: null, badge_name: 'Leash Walking Pro', tier: 'bronze' as BadgeTier, awarded_at: '2025-01-10', awarded_by: 'Mike Wilson' },
];

// Stats
const stats = {
  totalAwarded: 156,
  thisWeek: 12,
  goldBadges: 23,
  activeDogs: 18,
};

export default function BadgesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  const categories = ['all', 'obedience', 'leash', 'social', 'behavior', 'milestone'];

  const filteredBadges = useMemo(() => {
    return badgeLibrary.filter((badge) => {
      const matchesSearch =
        badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Badges"
        description="Manage and award training badges"
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setIsAwardModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400"
          >
            Award Badge
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Award size={24} className="mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalAwarded}</p>
            <p className="text-xs text-surface-500">Total Awarded</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
            <p className="text-xs text-surface-500">This Week</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Star size={24} className="mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.goldBadges}</p>
            <p className="text-xs text-surface-500">Gold Badges</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.activeDogs}</p>
            <p className="text-xs text-surface-500">Dogs in Training</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Tier Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Skill Tier Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {skillBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              tier={badge.tier}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(tierColors[badge.tier]) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Special Achievement Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Special Achievement Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {achievementBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              achievementColor={badge.color}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(
                badge.color === 'green' ? '#4ade80' :
                badge.color === 'blue' ? '#60a5fa' :
                badge.color === 'purple' ? '#a78bfa' :
                badge.color === 'yellow' ? '#facc15' :
                badge.color === 'pink' ? '#f472b6' :
                badge.color === 'orange' ? '#fb923c' : '#9ca3af'
              ) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Milestone Badges */}
      <section>
        <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4 pb-3 border-b border-white/[0.06]">
          Milestone Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {milestoneBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              achievementColor={badge.color}
              title={badge.name}
              description={badge.description}
              icon={badgeIcons[badge.icon]?.(
                badge.color === 'cyan' ? '#22d3ee' :
                badge.color === 'purple' ? '#a78bfa' :
                badge.color === 'green' ? '#4ade80' :
                badge.color === 'yellow' ? '#facc15' : '#9ca3af'
              ) || <Award size={32} />}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Recent Awards */}
      <Card>
        <CardHeader title="Recently Awarded" />
        <CardContent>
          <div className="space-y-3">
            {recentAwards.map((award) => {
              const badge = badgeLibrary.find(b => b.name === award.badge_name);
              return (
                <div
                  key={award.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                >
                  <Avatar name={award.dog_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {award.dog_name} earned <span className="text-amber-400">{award.badge_name}</span>
                    </p>
                    <p className="text-xs text-surface-500">
                      Awarded by {award.awarded_by} • {new Date(award.awarded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(145deg, ${tierColors[award.tier]}33, ${tierColors[award.tier]}1a)`,
                      boxShadow: `0 0 12px ${tierColors[award.tier]}66`,
                    }}
                  >
                    {badgeIcons[badge?.icon || 'star']?.(tierColors[award.tier], 20) || <Star size={20} />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Library */}
      <Card>
        <CardHeader
          title="Badge Library"
          action={
            <Input
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="w-48"
            />
          }
        />
        <CardContent>
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors',
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-xl bg-gradient-to-br from-surface-800/90 to-surface-900/95 border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, rgba(107,114,128,0.15), rgba(107,114,128,0.08))' }}
                  >
                    {badgeIcons[badge.icon]?.('#9ca3af', 20) || <Award size={20} className="text-surface-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{badge.name}</h3>
                    <p className="text-xs text-surface-500 capitalize">{badge.category}</p>
                  </div>
                </div>
                <p className="text-sm text-surface-400 mb-4">{badge.description}</p>
                <TierDots availableTiers={badge.tiers} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Award Badge Modal */}
      <AwardBadgeModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onSuccess={() => {
          // Refresh data
          console.log('Badge awarded successfully');
        }}
      />

      {/* Mobile FAB */}
      <button
        onClick={() => setIsAwardModalOpen(true)}
        className="fixed bottom-20 right-4 sm:hidden w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-400 active:scale-95 transition-all z-40"
        style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
        aria-label="Award Badge"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
