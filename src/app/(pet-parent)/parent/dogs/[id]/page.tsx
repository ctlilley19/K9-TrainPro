'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge, TierBadge, ActivityBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Dog,
  Calendar,
  Award,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Clock,
  Image,
  FileText,
  Star,
  Play,
  Heart,
  Utensils,
  Moon,
  Home,
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react';

// Mock data for dog detail
const mockDog = {
  id: 'a',
  name: 'Max',
  breed: 'German Shepherd',
  age: '2 years',
  date_of_birth: '2023-01-15',
  photo_url: null,
  weight: 75,
  gender: 'male',
  color: 'Black and Tan',
  program: {
    name: '3-Week Board & Train',
    type: 'board_train',
    status: 'active',
    start_date: '2025-01-06',
    end_date: '2025-01-27',
    progress: 45,
    days_remaining: 12,
    trainer: {
      name: 'Sarah Johnson',
      photo_url: null,
      title: 'Lead Trainer',
    },
    goals: [
      { id: '1', text: 'Master basic obedience commands', completed: true },
      { id: '2', text: 'Improve leash walking behavior', completed: true },
      { id: '3', text: 'Reduce reactivity to other dogs', completed: false },
      { id: '4', text: 'Build reliable recall', completed: false },
      { id: '5', text: 'Establish calm house manners', completed: false },
    ],
  },
  today_summary: {
    activities: [
      { type: 'kennel', time: '7:00 AM', duration: 60 },
      { type: 'potty', time: '8:00 AM', duration: 10 },
      { type: 'feeding', time: '8:15 AM', duration: 15 },
      { type: 'training', time: '9:00 AM', duration: 45, notes: 'Worked on heel and recall' },
      { type: 'rest', time: '10:00 AM', duration: 60 },
      { type: 'play', time: '11:00 AM', duration: 30 },
      { type: 'feeding', time: '12:00 PM', duration: 15 },
    ],
    trainer_notes: 'Max had a great day! He\'s really improving on his leash walking and showed excellent focus during training. We\'re seeing less reactivity when other dogs pass by.',
    mood: 'Happy & Energetic',
    appetite: 'Good',
    potty: 'Normal',
  },
  badges: [
    { id: '1', name: 'Sit Master', tier: 'gold', description: 'Mastered the sit command', earned_at: '2025-01-10', icon: 'star' },
    { id: '2', name: 'Leash Walking', tier: 'silver', description: 'Improved loose leash walking', earned_at: '2025-01-08', icon: 'target' },
    { id: '3', name: 'First Week', tier: 'bronze', description: 'Completed first week of training', earned_at: '2025-01-13', icon: 'calendar' },
  ],
  skills: [
    { name: 'Sit', level: 4, max_level: 5 },
    { name: 'Stay', level: 3, max_level: 5 },
    { name: 'Come', level: 2, max_level: 5 },
    { name: 'Down', level: 3, max_level: 5 },
    { name: 'Heel', level: 2, max_level: 5 },
    { name: 'Place', level: 1, max_level: 5 },
  ],
  recent_photos: [
    { id: '1', url: null, caption: 'Training session', date: '2025-01-12' },
    { id: '2', url: null, caption: 'Play time', date: '2025-01-11' },
    { id: '3', url: null, caption: 'Learning heel', date: '2025-01-10' },
    { id: '4', url: null, caption: 'Good boy!', date: '2025-01-09' },
  ],
  recent_reports: [
    { id: '1', date: '2025-01-12', summary: 'Great progress on leash walking!' },
    { id: '2', date: '2025-01-11', summary: 'Worked on recall commands' },
    { id: '3', date: '2025-01-10', summary: 'First off-leash training session' },
  ],
};

function ActivityIcon({ type, size = 16 }: { type: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    kennel: <Home size={size} />,
    potty: <Circle size={size} />,
    feeding: <Utensils size={size} />,
    training: <Target size={size} />,
    play: <Heart size={size} />,
    rest: <Moon size={size} />,
  };
  return icons[type] || <Clock size={size} />;
}

function SkillProgressBar({ level, maxLevel }: { level: number; maxLevel: number }) {
  return (
    <div className="flex-1">
      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
          style={{ width: `${(level / maxLevel) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function PetParentDogDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'media'>('overview');

  const dog = mockDog;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/parent/dogs"
        className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        Back to My Dogs
      </Link>

      {/* Dog Profile Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500/20 via-purple-500/10 to-surface-900 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-surface-800 flex items-center justify-center overflow-hidden">
                {dog.photo_url ? (
                  <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                ) : (
                  <Dog size={48} className="text-surface-600" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{dog.name}</h1>
                  <p className="text-surface-400 mt-1">{dog.breed}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-surface-500">
                    <span>{dog.age}</span>
                    <span>•</span>
                    <span>{dog.weight} lbs</span>
                    <span>•</span>
                    <span className="capitalize">{dog.gender}</span>
                    <span>•</span>
                    <span>{dog.color}</span>
                  </div>
                </div>

                <StatusBadge variant="success" size="md">
                  In Training
                </StatusBadge>
              </div>

              {/* Program Progress */}
              <div className="mt-6 p-4 rounded-xl bg-surface-800/50 border border-surface-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-white">{dog.program.name}</p>
                    <p className="text-sm text-surface-500">with {dog.program.trainer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-400">{dog.program.progress}%</p>
                    <p className="text-xs text-surface-500">{dog.program.days_remaining} days left</p>
                  </div>
                </div>
                <div className="h-3 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
                    style={{ width: `${dog.program.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-surface-800">
          <div className="flex gap-1 p-2">
            {(['overview', 'progress', 'media'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Today's Summary</h3>

                {/* Trainer Notes */}
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 mb-4">
                  <p className="text-sm text-surface-300">{dog.today_summary.trainer_notes}</p>
                  <p className="text-xs text-brand-400 mt-2">— {dog.program.trainer.name}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-surface-800/50 text-center">
                    <p className="text-xs text-surface-500">Mood</p>
                    <p className="text-sm font-medium text-white mt-1">{dog.today_summary.mood}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-800/50 text-center">
                    <p className="text-xs text-surface-500">Appetite</p>
                    <p className="text-sm font-medium text-white mt-1">{dog.today_summary.appetite}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-800/50 text-center">
                    <p className="text-xs text-surface-500">Potty</p>
                    <p className="text-sm font-medium text-white mt-1">{dog.today_summary.potty}</p>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-2">
                  {dog.today_summary.activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-surface-800/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center text-surface-400">
                        <ActivityIcon type={activity.type} size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white capitalize">{activity.type}</p>
                        {activity.notes && (
                          <p className="text-xs text-surface-500">{activity.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-surface-400">{activity.time}</p>
                        <p className="text-xs text-surface-500">{activity.duration} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Goals */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Program Goals</h3>
                <div className="space-y-3">
                  {dog.program.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`flex items-start gap-3 p-3 rounded-xl ${
                        goal.completed
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-surface-800/50'
                      }`}
                    >
                      {goal.completed ? (
                        <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={20} className="text-surface-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${goal.completed ? 'text-green-300' : 'text-surface-300'}`}>
                        {goal.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recent Reports Link */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-surface-400 mb-3">Recent Reports</h4>
                  <div className="space-y-2">
                    {dog.recent_reports.slice(0, 3).map((report) => (
                      <Link
                        key={report.id}
                        href={`/parent/reports/${report.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                      >
                        <FileText size={16} className="text-brand-400" />
                        <div className="flex-1">
                          <p className="text-sm text-white">{report.summary}</p>
                          <p className="text-xs text-surface-500">{formatDate(report.date)}</p>
                        </div>
                        <ChevronRight size={16} className="text-surface-600" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Badges */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Badges Earned ({dog.badges.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {dog.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700"
                    >
                      <TierBadge tier={badge.tier as any} size="lg">
                        <Star size={20} />
                      </TierBadge>
                      <div className="flex-1">
                        <p className="font-medium text-white">{badge.name}</p>
                        <p className="text-sm text-surface-500">{badge.description}</p>
                        <p className="text-xs text-surface-600 mt-1">
                          Earned {formatDate(badge.earned_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Skills Progress
                </h3>
                <div className="space-y-4">
                  {dog.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{skill.name}</span>
                        <span className="text-xs text-surface-500">
                          Level {skill.level}/{skill.max_level}
                        </span>
                      </div>
                      <SkillProgressBar level={skill.level} maxLevel={skill.max_level} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Photos & Videos</h3>
                <Link href="/parent/gallery">
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dog.recent_photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl bg-surface-800 overflow-hidden group cursor-pointer"
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
                        <Dog size={32} className="text-surface-600 mb-2" />
                        <p className="text-xs text-surface-500">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
