'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { usePetParentDashboard } from '@/hooks';
import {
  Dog,
  Calendar,
  Award,
  FileText,
  Image,
  Clock,
  TrendingUp,
  ChevronRight,
  Star,
  Heart,
  Sparkles,
  Loader2,
} from 'lucide-react';

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'training':
      return <Star size={14} className="text-blue-400" />;
    case 'play':
      return <Heart size={14} className="text-green-400" />;
    case 'feeding':
      return <Sparkles size={14} className="text-purple-400" />;
    default:
      return <Clock size={14} className="text-surface-400" />;
  }
}

export default function PetParentDashboard() {
  const { data, isLoading } = usePetParentDashboard();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {data.family.name}!
        </h1>
        <p className="text-surface-400">
          Here's how your pups are doing today.
        </p>
      </div>

      {/* Dogs Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.dogs.map((dog) => (
          <Card key={dog.id} className="overflow-hidden">
            {/* Dog Header with Gradient */}
            <div className="bg-gradient-to-r from-brand-500/20 to-purple-500/20 p-6">
              <div className="flex items-start gap-4">
                <Avatar name={dog.name} size="xl" src={dog.photo_url} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{dog.name}</h2>
                      <p className="text-sm text-surface-400">{dog.breed}</p>
                    </div>
                    <Link href={`/parent/dogs/${dog.id}`}>
                      <Button variant="ghost" size="sm">
                        View Profile
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Program Progress */}
                  {dog.program && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-surface-300">{dog.program.name}</span>
                        <span className="text-brand-400">{dog.program.progress}%</span>
                      </div>
                      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
                          style={{ width: `${dog.program.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-surface-500 mt-1">
                        {dog.program.days_remaining} days remaining
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <CardContent>
              {/* Today's Activities */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-surface-400 mb-3">Today's Activities</h3>
                <div className="space-y-2">
                  {dog.today_activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-surface-800/50"
                    >
                      <ActivityIcon type={activity.type} />
                      <span className="text-sm text-white capitalize">{activity.type}</span>
                      <span className="text-xs text-surface-500">{activity.duration} min</span>
                      <span className="ml-auto text-xs text-surface-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 pt-4 border-t border-surface-800">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-sm text-white">{dog.stats.badges_earned} badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-sm text-white">{dog.stats.skills_learned} skills</span>
                </div>
                {dog.recent_badges && dog.recent_badges.length > 0 && (
                  <div className="ml-auto">
                    <TierBadge tier={dog.recent_badges[0].tier as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'} size="sm">
                      {dog.recent_badges[0].name}
                    </TierBadge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Badges"
          value={data.dogs.reduce((sum, d) => sum + d.stats.badges_earned, 0)}
          icon={<Award size={20} />}
          trend={{ value: 2, label: 'this week' }}
        />
        <StatCard
          title="Skills Learned"
          value={data.dogs.reduce((sum, d) => sum + d.stats.skills_learned, 0)}
          icon={<TrendingUp size={20} />}
          trend={{ value: 3, label: 'this week' }}
        />
        <StatCard
          title="Photos"
          value={data.recent_photos.length}
          icon={<Image size={20} />}
          trend={{ value: 4, label: 'new today' }}
        />
        <StatCard
          title="Reports"
          value={data.recent_reports.length}
          icon={<FileText size={20} />}
        />
      </div>

      {/* Recent Reports & Photos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card>
          <CardHeader
            title="Recent Reports"
            action={
              <Link href="/parent/reports">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            }
          />
          <CardContent>
            <div className="space-y-3">
              {data.recent_reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/parent/reports/${report.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <FileText size={18} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{report.dog.name}</span>
                      <span className="text-xs text-surface-500">
                        {formatDate(report.date)}
                      </span>
                    </div>
                    <p className="text-sm text-surface-400 truncate">{report.summary}</p>
                  </div>
                  <ChevronRight size={18} className="text-surface-600" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Photos */}
        <Card>
          <CardHeader
            title="Recent Photos"
            action={
              <Link href="/parent/gallery">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            }
          />
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {data.recent_photos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/parent/gallery?photo=${photo.id}`}
                  className="aspect-square rounded-xl bg-surface-800 overflow-hidden hover:ring-2 hover:ring-brand-500/50 transition-all"
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
                      <Dog size={24} className="text-surface-600" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader title="Upcoming" />
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {data.upcoming.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  event.type === 'graduation'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {event.type === 'graduation' ? (
                    <Award size={20} />
                  ) : (
                    <Calendar size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="text-xs text-surface-500">
                    {event.dog_name} • {formatDate(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
