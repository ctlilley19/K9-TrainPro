'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useDogsWithPrograms } from '@/hooks';
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
  Filter,
  Plus,
  Loader2,
  Lock,
} from 'lucide-react';

// Badge tier configuration
const tierColors = {
  bronze: 'from-orange-600 to-orange-400',
  silver: 'from-gray-400 to-gray-200',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-400 to-cyan-200',
  diamond: 'from-purple-500 to-pink-400',
};

const categoryIcons: Record<string, React.ReactNode> = {
  obedience: <Star size={16} />,
  leash: <Target size={16} />,
  social: <Heart size={16} />,
  behavior: <Zap size={16} />,
  milestone: <Trophy size={16} />,
};

const badgeIcons: Record<string, React.ReactNode> = {
  star: <Star size={16} />,
  target: <Target size={16} />,
  trophy: <Trophy size={16} />,
  heart: <Heart size={16} />,
  shield: <Shield size={16} />,
  crown: <Crown size={16} />,
  zap: <Zap size={16} />,
};

// Mock badge definitions
const badgeDefinitions = [
  {
    id: '1',
    name: 'Sit Master',
    description: 'Master the sit command with 95% reliability',
    category: 'obedience',
    icon: 'star',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    criteria: {
      bronze: '70% reliability',
      silver: '80% reliability',
      gold: '90% reliability',
      platinum: '95% reliability',
      diamond: '99% reliability',
    },
  },
  {
    id: '2',
    name: 'Stay Champion',
    description: 'Master the stay command with duration and distance',
    category: 'obedience',
    icon: 'shield',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    criteria: {
      bronze: '30 seconds stay',
      silver: '1 minute stay',
      gold: '3 minutes stay',
      platinum: '5 minutes stay',
      diamond: '10 minutes stay',
    },
  },
  {
    id: '3',
    name: 'Recall Master',
    description: 'Come when called from any distance',
    category: 'obedience',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    criteria: {
      bronze: '10ft recall',
      silver: '25ft recall',
      gold: '50ft recall',
      platinum: '100ft recall',
      diamond: 'Off-leash recall',
    },
  },
  {
    id: '4',
    name: 'Leash Walking Pro',
    description: 'Walk calmly on leash without pulling',
    category: 'leash',
    icon: 'target',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Minimal pulling',
      silver: 'Loose leash 80%',
      gold: 'Perfect heel',
    },
  },
  {
    id: '5',
    name: 'Social Butterfly',
    description: 'Positive interactions with dogs and people',
    category: 'social',
    icon: 'heart',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Calm with 1 dog',
      silver: 'Calm in group of 3',
      gold: 'Off-leash play skills',
    },
  },
  {
    id: '6',
    name: 'Calm & Collected',
    description: 'Excellent impulse control in various situations',
    category: 'behavior',
    icon: 'zap',
    tiers: ['bronze', 'silver', 'gold'],
    criteria: {
      bronze: 'Wait for food',
      silver: 'Ignore distractions',
      gold: 'Threshold manners',
    },
  },
  {
    id: '7',
    name: 'First Week Star',
    description: 'Complete the first week of training',
    category: 'milestone',
    icon: 'trophy',
    tiers: ['bronze'],
    criteria: {
      bronze: 'Complete 7 days',
    },
  },
  {
    id: '8',
    name: 'Program Graduate',
    description: 'Successfully complete a training program',
    category: 'milestone',
    icon: 'crown',
    tiers: ['gold'],
    criteria: {
      gold: 'Graduate from program',
    },
  },
];

// Mock recently awarded badges
const recentAwards = [
  { id: '1', dog_name: 'Max', dog_photo: null, badge_name: 'Sit Master', tier: 'silver', awarded_at: '2025-01-13', awarded_by: 'Sarah Johnson' },
  { id: '2', dog_name: 'Bella', dog_photo: null, badge_name: 'First Week Star', tier: 'bronze', awarded_at: '2025-01-12', awarded_by: 'John Smith' },
  { id: '3', dog_name: 'Luna', dog_photo: null, badge_name: 'Stay Champion', tier: 'bronze', awarded_at: '2025-01-11', awarded_by: 'Sarah Johnson' },
  { id: '4', dog_name: 'Max', dog_photo: null, badge_name: 'Leash Walking Pro', tier: 'bronze', awarded_at: '2025-01-10', awarded_by: 'Mike Wilson' },
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

  const categories = ['all', 'obedience', 'leash', 'social', 'behavior', 'milestone'];

  const filteredBadges = useMemo(() => {
    return badgeDefinitions.filter((badge) => {
      const matchesSearch =
        badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Badges"
        description="Manage and award training badges"
        action={
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Award Badge
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-brand-500/20 to-brand-500/5">
          <CardContent className="p-4 text-center">
            <Award size={24} className="mx-auto text-brand-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalAwarded}</p>
            <p className="text-xs text-surface-500">Total Awarded</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5">
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
            <p className="text-xs text-surface-500">This Week</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5">
          <CardContent className="p-4 text-center">
            <Star size={24} className="mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.goldBadges}</p>
            <p className="text-xs text-surface-500">Gold Badges</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5">
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.activeDogs}</p>
            <p className="text-xs text-surface-500">Dogs in Training</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Awards */}
      <Card>
        <CardHeader title="Recently Awarded" />
        <CardContent>
          <div className="space-y-3">
            {recentAwards.map((award) => (
              <div
                key={award.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors"
              >
                <Avatar name={award.dog_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {award.dog_name} earned {award.badge_name}
                  </p>
                  <p className="text-xs text-surface-500">
                    Awarded by {award.awarded_by} • {new Date(award.awarded_at).toLocaleDateString()}
                  </p>
                </div>
                <TierBadge tier={award.tier as 'bronze' | 'silver' | 'gold'} size="sm">
                  {badgeIcons[badgeDefinitions.find(b => b.name === award.badge_name)?.icon || 'star']}
                </TierBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Library */}
      <Card>
        <CardHeader
          title="Badge Library"
          action={
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
                className="w-48"
              />
            </div>
          }
        />
        <CardContent>
          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors',
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-xl bg-surface-800/50 border border-surface-700 hover:border-surface-600 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center">
                    {categoryIcons[badge.category] || <Award size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{badge.name}</h3>
                    <p className="text-xs text-surface-500 capitalize">{badge.category}</p>
                  </div>
                </div>
                <p className="text-sm text-surface-400 mb-4">{badge.description}</p>

                {/* Tiers */}
                <div className="flex gap-1.5">
                  {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier) => {
                    const hasTier = badge.tiers.includes(tier);
                    return (
                      <div
                        key={tier}
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center',
                          hasTier
                            ? `bg-gradient-to-br ${tierColors[tier as keyof typeof tierColors]}`
                            : 'bg-surface-700'
                        )}
                        title={hasTier ? `${tier}: ${badge.criteria[tier as keyof typeof badge.criteria]}` : `${tier} not available`}
                      >
                        {hasTier ? (
                          badgeIcons[badge.icon] || <Star size={12} className="text-white" />
                        ) : (
                          <Lock size={10} className="text-surface-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
