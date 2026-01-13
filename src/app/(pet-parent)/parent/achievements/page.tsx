'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Award,
  Star,
  Trophy,
  Target,
  Zap,
  Heart,
  Shield,
  Crown,
  Lock,
  ChevronRight,
} from 'lucide-react';

// Badge tier configuration
const tierColors = {
  bronze: 'from-orange-600 to-orange-400',
  silver: 'from-gray-400 to-gray-200',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-400 to-cyan-200',
  diamond: 'from-purple-500 to-pink-400',
};

// Mock achievements data
const mockAchievements = {
  dogs: [
    {
      id: 'a',
      name: 'Max',
      photo_url: null,
      badges: [
        {
          id: '1',
          name: 'Sit Master',
          tier: 'gold',
          icon: 'star',
          description: 'Mastered the sit command with 95% accuracy',
          earned_at: '2025-01-10',
          category: 'obedience',
        },
        {
          id: '2',
          name: 'Leash Walking Pro',
          tier: 'silver',
          icon: 'target',
          description: 'Demonstrated excellent loose leash walking',
          earned_at: '2025-01-08',
          category: 'leash',
        },
        {
          id: '3',
          name: 'First Week Champion',
          tier: 'bronze',
          icon: 'trophy',
          description: 'Completed the first week of training',
          earned_at: '2025-01-13',
          category: 'milestone',
        },
      ],
      total_badges: 3,
      next_badge: {
        name: 'Recall Master',
        tier: 'gold',
        progress: 70,
        description: 'Master recall command at 50ft distance',
      },
    },
    {
      id: 'b',
      name: 'Bella',
      photo_url: null,
      badges: [
        {
          id: '4',
          name: 'First Steps',
          tier: 'bronze',
          icon: 'heart',
          description: 'Completed first training session',
          earned_at: '2025-01-07',
          category: 'milestone',
        },
      ],
      total_badges: 1,
      next_badge: {
        name: 'Sit Star',
        tier: 'silver',
        progress: 45,
        description: 'Master sit command with 80% accuracy',
      },
    },
  ],
  available_badges: [
    {
      name: 'Sit Master',
      tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      description: 'Master the sit command',
      category: 'obedience',
    },
    {
      name: 'Stay Champion',
      tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      description: 'Master the stay command',
      category: 'obedience',
    },
    {
      name: 'Recall Master',
      tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      description: 'Master the recall command',
      category: 'obedience',
    },
    {
      name: 'Leash Walking Pro',
      tiers: ['bronze', 'silver', 'gold'],
      description: 'Demonstrate excellent leash manners',
      category: 'leash',
    },
    {
      name: 'Social Butterfly',
      tiers: ['bronze', 'silver', 'gold'],
      description: 'Excel in socialization with other dogs',
      category: 'social',
    },
    {
      name: 'Calm & Collected',
      tiers: ['bronze', 'silver', 'gold'],
      description: 'Show excellent impulse control',
      category: 'behavior',
    },
  ],
  stats: {
    total_badges: 4,
    gold_badges: 1,
    silver_badges: 1,
    bronze_badges: 2,
    categories_unlocked: 3,
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  obedience: <Star size={16} />,
  leash: <Target size={16} />,
  social: <Heart size={16} />,
  behavior: <Zap size={16} />,
  milestone: <Trophy size={16} />,
};

const badgeIcons: Record<string, React.ReactNode> = {
  star: <Star />,
  target: <Target />,
  trophy: <Trophy />,
  heart: <Heart />,
  shield: <Shield />,
  crown: <Crown />,
  zap: <Zap />,
};

function BadgeIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const IconComponent = badgeIcons[icon] || <Award />;
  return <span style={{ fontSize: size }}>{IconComponent}</span>;
}

export default function PetParentAchievementsPage() {
  const [selectedDog, setSelectedDog] = useState<string>('all');

  const data = mockAchievements;
  const allBadges = data.dogs.flatMap((dog) =>
    dog.badges.map((badge) => ({ ...badge, dog_name: dog.name, dog_id: dog.id }))
  );

  const filteredBadges =
    selectedDog === 'all'
      ? allBadges
      : allBadges.filter((b) => b.dog_id === selectedDog);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-surface-400">
          Track your dogs' training badges and milestones
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-brand-500/20 to-brand-500/5">
          <CardContent className="p-4 text-center">
            <Award size={24} className="mx-auto text-brand-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.stats.total_badges}</p>
            <p className="text-xs text-surface-500">Total Badges</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5">
          <CardContent className="p-4 text-center">
            <Star size={24} className="mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.stats.gold_badges}</p>
            <p className="text-xs text-surface-500">Gold</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-400/20 to-gray-400/5">
          <CardContent className="p-4 text-center">
            <Star size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-2xl font-bold text-white">{data.stats.silver_badges}</p>
            <p className="text-xs text-surface-500">Silver</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5">
          <CardContent className="p-4 text-center">
            <Star size={24} className="mx-auto text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.stats.bronze_badges}</p>
            <p className="text-xs text-surface-500">Bronze</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5">
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{data.stats.categories_unlocked}</p>
            <p className="text-xs text-surface-500">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Dog Progress Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.dogs.map((dog) => (
          <Card key={dog.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={dog.name} size="lg" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{dog.name}</h3>
                  <p className="text-sm text-surface-500">
                    {dog.total_badges} badges earned
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {dog.badges.slice(0, 3).map((badge) => (
                    <TierBadge key={badge.id} tier={badge.tier as any} size="sm">
                      <BadgeIcon icon={badge.icon} size={12} />
                    </TierBadge>
                  ))}
                </div>
              </div>

              {/* Next Badge Progress */}
              {dog.next_badge && (
                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        Next: {dog.next_badge.name}
                      </span>
                      <TierBadge tier={dog.next_badge.tier as any} size="xs">
                        <Star size={10} />
                      </TierBadge>
                    </div>
                    <span className="text-sm text-brand-400">{dog.next_badge.progress}%</span>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${dog.next_badge.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-surface-500">{dog.next_badge.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Badges */}
      <Card>
        <CardHeader
          title="Earned Badges"
          action={
            <select
              value={selectedDog}
              onChange={(e) => setSelectedDog(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Dogs</option>
              {data.dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          }
        />
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700 hover:border-surface-600 transition-colors"
              >
                <TierBadge tier={badge.tier as any} size="lg">
                  <BadgeIcon icon={badge.icon} size={20} />
                </TierBadge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{badge.name}</p>
                  </div>
                  <p className="text-sm text-surface-500 truncate">{badge.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-surface-600">{badge.dog_name}</span>
                    <span className="text-xs text-surface-600">•</span>
                    <span className="text-xs text-surface-600">
                      {formatDate(badge.earned_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Badges */}
      <Card>
        <CardHeader title="All Available Badges" />
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.available_badges.map((badge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-800/30 border border-surface-800"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-surface-400">
                    {categoryIcons[badge.category] || <Award size={16} />}
                  </span>
                  <p className="font-medium text-white">{badge.name}</p>
                </div>
                <p className="text-sm text-surface-500 mb-3">{badge.description}</p>
                <div className="flex gap-1">
                  {badge.tiers.map((tier) => {
                    const earned = allBadges.some(
                      (b) => b.name === badge.name && b.tier === tier
                    );
                    return (
                      <div
                        key={tier}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          earned
                            ? `bg-gradient-to-br ${tierColors[tier as keyof typeof tierColors]}`
                            : 'bg-surface-700'
                        }`}
                      >
                        {earned ? (
                          <Star size={12} className="text-white" />
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
