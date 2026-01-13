'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Download,
  Share2,
  Printer,
  Star,
  Heart,
  Utensils,
  Moon,
  Home,
  Target,
  Droplets,
  TrendingUp,
  CheckCircle,
  Image,
  Dog,
} from 'lucide-react';

// Mock report data
const mockReport = {
  id: '1',
  dog: {
    id: 'a',
    name: 'Max',
    breed: 'German Shepherd',
    photo_url: null,
    age: '2 years',
  },
  date: '2025-01-12',
  trainer: {
    name: 'Sarah Johnson',
    title: 'Lead Trainer',
    photo_url: null,
  },
  program: {
    name: '3-Week Board & Train',
    day: 7,
    total_days: 21,
  },
  summary:
    "Max had an excellent day today! He showed great progress on his leash walking skills and maintained focus throughout all training sessions. His recall is improving steadily, and he's becoming more confident in new environments.",
  mood: 'Happy & Energetic',
  energy_level: 'High',
  appetite: 'Good - ate all meals',
  potty: 'Normal - no issues',
  sleep: 'Slept well overnight',
  activities: [
    { time: '7:00 AM', type: 'kennel', duration: 60, notes: 'Morning rest' },
    { time: '8:00 AM', type: 'potty', duration: 10, notes: 'Morning break' },
    { time: '8:15 AM', type: 'feeding', duration: 15, notes: 'Breakfast - ate well' },
    {
      time: '9:00 AM',
      type: 'training',
      duration: 45,
      notes: 'Heel work and leash manners. Max showed 90% accuracy on heel command.',
    },
    { time: '10:00 AM', type: 'rest', duration: 60, notes: 'Crate rest' },
    {
      time: '11:00 AM',
      type: 'play',
      duration: 30,
      notes: 'Structured play in yard. Good energy release.',
    },
    { time: '12:00 PM', type: 'feeding', duration: 15, notes: 'Lunch - ate all food' },
    { time: '1:00 PM', type: 'potty', duration: 10, notes: 'Afternoon break' },
    {
      time: '2:00 PM',
      type: 'training',
      duration: 30,
      notes: 'Recall practice. Successfully recalled from 30ft distance.',
    },
    { time: '3:00 PM', type: 'rest', duration: 90, notes: 'Afternoon nap' },
    { time: '5:00 PM', type: 'potty', duration: 10, notes: 'Evening break' },
    { time: '5:30 PM', type: 'feeding', duration: 15, notes: 'Dinner - ate well' },
    { time: '6:00 PM', type: 'play', duration: 20, notes: 'Evening enrichment' },
    { time: '7:00 PM', type: 'kennel', duration: null, notes: 'Settled for the night' },
  ],
  training_summary: {
    total_minutes: 75,
    skills_practiced: [
      { name: 'Heel', progress: 90, notes: 'Excellent progress - nearly mastered' },
      { name: 'Recall', progress: 70, notes: 'Good improvement today' },
      { name: 'Stay', progress: 85, notes: 'Solid foundation' },
    ],
    achievements: ['First successful 30ft recall', 'Heel at 90% accuracy'],
  },
  highlights: [
    'Mastered heel command at 90% accuracy',
    'Reduced leash pulling by 50%',
    'Successfully completed first off-leash recall at 30ft',
    'Showed excellent impulse control during play',
  ],
  areas_to_improve: [
    'Continue building recall distance',
    'Work on duration for stay command',
    'Practice calm greetings with people',
  ],
  photos: [
    { id: '1', url: null, caption: 'Training session - heel work', timestamp: '9:15 AM' },
    { id: '2', url: null, caption: 'Recall practice', timestamp: '2:30 PM' },
    { id: '3', url: null, caption: 'Play time in yard', timestamp: '11:15 AM' },
    { id: '4', url: null, caption: 'Good boy resting', timestamp: '3:30 PM' },
  ],
  videos: [{ id: '1', url: null, caption: 'Heel training session', duration: '0:45' }],
  badge_earned: {
    name: 'Leash Walking Pro',
    tier: 'silver',
    description: 'Demonstrated excellent loose leash walking skills',
  },
  tomorrow_focus: 'We will continue working on recall at longer distances and introduce some distraction training.',
};

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ReactNode; color: string }> = {
    kennel: { icon: <Home size={16} />, color: 'text-gray-400' },
    potty: { icon: <Droplets size={16} />, color: 'text-yellow-400' },
    feeding: { icon: <Utensils size={16} />, color: 'text-purple-400' },
    training: { icon: <Target size={16} />, color: 'text-blue-400' },
    play: { icon: <Heart size={16} />, color: 'text-green-400' },
    rest: { icon: <Moon size={16} />, color: 'text-sky-400' },
  };
  const config = icons[type] || { icon: <Clock size={16} />, color: 'text-surface-400' };
  return <span className={config.color}>{config.icon}</span>;
}

export default function ReportDetailPage() {
  const params = useParams();
  const report = mockReport;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/parent/reports"
        className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Reports
      </Link>

      {/* Report Header */}
      <Card>
        <div className="p-6 border-b border-surface-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={report.dog.name} size="xl" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Daily Report: {report.dog.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-surface-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(report.date, 'EEEE, MMMM d, yyyy')}
                  </span>
                  <span>•</span>
                  <span>
                    Day {report.program.day} of {report.program.total_days}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={<Share2 size={14} />}>
                Share
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Printer size={14} />}>
                Print
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Download size={14} />}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Trainer & Summary */}
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar name={report.trainer.name} size="md" />
            <div>
              <p className="font-medium text-white">{report.trainer.name}</p>
              <p className="text-sm text-surface-500">{report.trainer.title}</p>
            </div>
          </div>
          <p className="text-surface-300 leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm">
          <div className="text-center py-2">
            <p className="text-xs text-surface-500 mb-1">Mood</p>
            <p className="text-sm font-medium text-white">{report.mood}</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center py-2">
            <p className="text-xs text-surface-500 mb-1">Energy</p>
            <p className="text-sm font-medium text-white">{report.energy_level}</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center py-2">
            <p className="text-xs text-surface-500 mb-1">Appetite</p>
            <p className="text-sm font-medium text-white">Good</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center py-2">
            <p className="text-xs text-surface-500 mb-1">Potty</p>
            <p className="text-sm font-medium text-white">Normal</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center py-2">
            <p className="text-xs text-surface-500 mb-1">Sleep</p>
            <p className="text-sm font-medium text-white">Good</p>
          </div>
        </Card>
      </div>

      {/* Badge Earned */}
      {report.badge_earned && (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TierBadge tier={report.badge_earned.tier as any} size="xl">
                <Star size={24} />
              </TierBadge>
              <div>
                <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">
                  Badge Earned Today!
                </p>
                <p className="text-xl font-bold text-white">{report.badge_earned.name}</p>
                <p className="text-surface-400">{report.badge_earned.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Summary */}
      <Card>
        <CardHeader title="Training Summary" />
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-brand-400" />
            <span className="text-white font-medium">
              {report.training_summary.total_minutes} minutes of training today
            </span>
          </div>

          <div className="space-y-4">
            {report.training_summary.skills_practiced.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{skill.name}</span>
                  <span className="text-sm text-brand-400">{skill.progress}%</span>
                </div>
                <div className="h-2 bg-surface-700 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
                <p className="text-xs text-surface-500">{skill.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Highlights & Areas to Improve */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Today's Highlights" />
          <CardContent className="p-6">
            <div className="space-y-3">
              {report.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-surface-300">{highlight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Areas to Continue Working On" />
          <CardContent className="p-6">
            <div className="space-y-3">
              {report.areas_to_improve.map((area, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <TrendingUp size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-surface-300">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader title="Daily Activity Timeline" />
        <CardContent className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-700" />

            <div className="space-y-4">
              {report.activities.map((activity, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {/* Timeline Dot */}
                  <div className="w-8 h-8 rounded-full bg-surface-800 border-2 border-surface-700 flex items-center justify-center z-10">
                    <ActivityIcon type={activity.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-surface-500">{activity.time}</span>
                      <span className="text-sm font-medium text-white capitalize">
                        {activity.type}
                      </span>
                      {activity.duration && (
                        <span className="text-xs text-surface-500">
                          ({activity.duration} min)
                        </span>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-surface-400">{activity.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader
          title={`Photos (${report.photos.length})`}
          action={
            <Link href="/parent/gallery">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          }
        />
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square rounded-xl bg-surface-800 overflow-hidden group cursor-pointer"
              >
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800 p-3">
                    <Dog size={24} className="text-surface-600 mb-2" />
                    <p className="text-xs text-surface-500 text-center">{photo.caption}</p>
                    <p className="text-xs text-surface-600 mt-1">{photo.timestamp}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tomorrow's Focus */}
      <Card className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-brand-500/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Tomorrow's Focus</h3>
          <p className="text-surface-300">{report.tomorrow_focus}</p>
        </CardContent>
      </Card>
    </div>
  );
}
