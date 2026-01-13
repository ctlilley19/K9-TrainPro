'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge, TierBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Dog,
  Calendar,
  Award,
  TrendingUp,
  ChevronRight,
  Clock,
  Heart,
  Star,
  Shield,
} from 'lucide-react';

// Mock data
const mockDogs = [
  {
    id: 'a',
    name: 'Max',
    breed: 'German Shepherd',
    age: '2 years',
    photo_url: null,
    weight: 75,
    gender: 'male',
    program: {
      name: '3-Week Board & Train',
      type: 'board_train',
      status: 'active',
      start_date: '2025-01-06',
      end_date: '2025-01-27',
      progress: 45,
      trainer: 'Sarah Johnson',
    },
    stats: {
      badges_earned: 3,
      skills_learned: 5,
      training_hours: 12,
      days_in_program: 7,
    },
    recent_badges: [
      { id: '1', name: 'Sit Master', tier: 'gold', earned_at: '2025-01-10' },
      { id: '2', name: 'Leash Walking', tier: 'silver', earned_at: '2025-01-08' },
    ],
    skills: [
      { name: 'Sit', level: 4 },
      { name: 'Stay', level: 3 },
      { name: 'Come', level: 2 },
      { name: 'Down', level: 3 },
      { name: 'Heel', level: 2 },
    ],
  },
  {
    id: 'b',
    name: 'Bella',
    breed: 'Golden Retriever',
    age: '1 year',
    photo_url: null,
    weight: 55,
    gender: 'female',
    program: {
      name: 'Puppy Foundations',
      type: 'day_train',
      status: 'active',
      start_date: '2025-01-06',
      end_date: '2025-02-14',
      progress: 25,
      trainer: 'John Smith',
    },
    stats: {
      badges_earned: 1,
      skills_learned: 2,
      training_hours: 4,
      days_in_program: 7,
    },
    recent_badges: [
      { id: '3', name: 'First Steps', tier: 'bronze', earned_at: '2025-01-07' },
    ],
    skills: [
      { name: 'Sit', level: 2 },
      { name: 'Name Recognition', level: 3 },
    ],
  },
];

function SkillBar({ level, maxLevel = 5 }: { level: number; maxLevel?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < level ? 'bg-brand-500' : 'bg-surface-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function PetParentDogsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">My Dogs</h1>
        <p className="text-surface-400">
          Track your dogs' training progress and achievements.
        </p>
      </div>

      {/* Dogs List */}
      <div className="space-y-6">
        {mockDogs.map((dog) => (
          <Card key={dog.id} className="overflow-hidden">
            {/* Dog Profile Header */}
            <div className="bg-gradient-to-r from-brand-500/20 via-purple-500/10 to-surface-900 p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4">
                  <Avatar name={dog.name} size="xl" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{dog.name}</h2>
                    <p className="text-surface-400">{dog.breed}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
                      <span>{dog.age}</span>
                      <span>•</span>
                      <span>{dog.weight} lbs</span>
                      <span>•</span>
                      <span className="capitalize">{dog.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-8">
                  <div className="text-center p-3 rounded-xl bg-surface-800/50">
                    <Award size={20} className="mx-auto text-yellow-400 mb-1" />
                    <p className="text-xl font-bold text-white">{dog.stats.badges_earned}</p>
                    <p className="text-xs text-surface-500">Badges</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-800/50">
                    <TrendingUp size={20} className="mx-auto text-green-400 mb-1" />
                    <p className="text-xl font-bold text-white">{dog.stats.skills_learned}</p>
                    <p className="text-xs text-surface-500">Skills</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-800/50">
                    <Clock size={20} className="mx-auto text-blue-400 mb-1" />
                    <p className="text-xl font-bold text-white">{dog.stats.training_hours}h</p>
                    <p className="text-xs text-surface-500">Training</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-800/50">
                    <Calendar size={20} className="mx-auto text-purple-400 mb-1" />
                    <p className="text-xl font-bold text-white">{dog.stats.days_in_program}</p>
                    <p className="text-xs text-surface-500">Days</p>
                  </div>
                </div>

                {/* View Button */}
                <Link href={`/parent/dogs/${dog.id}`}>
                  <Button variant="primary">
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Current Program */}
                <div>
                  <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
                    <Shield size={14} />
                    Current Program
                  </h3>
                  <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{dog.program.name}</span>
                      <StatusBadge variant="success" size="xs">Active</StatusBadge>
                    </div>
                    <p className="text-sm text-surface-500 mb-3">
                      Trainer: {dog.program.trainer}
                    </p>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-surface-400">Progress</span>
                        <span className="text-brand-400">{dog.program.progress}%</span>
                      </div>
                      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${dog.program.progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-surface-500">
                      {formatDate(dog.program.start_date)} - {formatDate(dog.program.end_date)}
                    </p>
                  </div>
                </div>

                {/* Recent Badges */}
                <div>
                  <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
                    <Award size={14} />
                    Recent Badges
                  </h3>
                  <div className="space-y-2">
                    {dog.recent_badges.length > 0 ? (
                      dog.recent_badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50"
                        >
                          <TierBadge tier={badge.tier as any} size="sm">
                            <Star size={12} />
                          </TierBadge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{badge.name}</p>
                            <p className="text-xs text-surface-500">
                              {formatDate(badge.earned_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-surface-800/50 text-center">
                        <p className="text-sm text-surface-500">No badges yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Progress */}
                <div>
                  <h3 className="text-sm font-medium text-surface-400 mb-3 flex items-center gap-2">
                    <TrendingUp size={14} />
                    Skills Progress
                  </h3>
                  <div className="space-y-3">
                    {dog.skills.length > 0 ? (
                      dog.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-surface-800/50"
                        >
                          <span className="text-sm text-white">{skill.name}</span>
                          <SkillBar level={skill.level} />
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-surface-800/50 text-center">
                        <p className="text-sm text-surface-500">No skills tracked yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
