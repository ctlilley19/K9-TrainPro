'use client';

import Link from 'next/link';
import { useUser, useFacility } from '@/stores/authStore';
import { useDashboardStats, useDogsWithPrograms, useTrainingBoard } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Dog,
  Users,
  Clock,
  Award,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Plus,
  Loader2,
} from 'lucide-react';

// Helper to get activity status label
function getActivityStatusLabel(activityType: string): string {
  const labels: Record<string, string> = {
    kennel: 'Kenneled',
    potty: 'Potty',
    training: 'Training',
    play: 'Playing',
    group_play: 'Group Play',
    feeding: 'Feeding',
    rest: 'Resting',
    walk: 'Walking',
    grooming: 'Grooming',
    medical: 'Medical',
  };
  return labels[activityType] || activityType;
}

function getActivityStatusColor(status: string): 'info' | 'success' | 'warning' | 'default' {
  switch (status) {
    case 'training':
      return 'info';
    case 'play':
    case 'group_play':
      return 'success';
    case 'kennel':
      return 'warning';
    default:
      return 'default';
  }
}

export default function DashboardPage() {
  const user = useUser();
  const facility = useFacility();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: dogsWithPrograms, isLoading: dogsLoading } = useDogsWithPrograms();
  const { data: trainingBoard, isLoading: boardLoading } = useTrainingBoard();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get dogs currently in training (from the training board)
  const dogsInFacility = trainingBoard
    ? Object.entries(trainingBoard).flatMap(([activityType, dogs]) =>
        dogs.map((dog) => ({
          ...dog,
          currentActivity: activityType,
        }))
      )
    : [];

  // Static schedule for now (could be from a bookings service later)
  const upcomingTasks = [
    { time: '10:00 AM', task: 'Group play session', dogs: 4 },
    { time: '11:30 AM', task: 'Training - Max (recall)', dogs: 1 },
    { time: '12:00 PM', task: 'Feeding time', dogs: stats?.totalDogs || 0 },
    { time: '2:00 PM', task: 'Parent video call', dogs: 1 },
  ];

  // Check for alerts (dogs kenneled too long)
  const kennelAlerts = dogsInFacility.filter((dog) => {
    if (dog.currentActivity !== 'kennel') return false;
    const elapsedMinutes = Math.floor((Date.now() - dog.startedAt.getTime()) / 60000);
    return elapsedMinutes >= 180; // 3 hours
  });

  const dashboardStats = [
    {
      title: 'Dogs in Training',
      value: stats?.totalDogs || 0,
      icon: <Dog size={24} />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Active Programs',
      value: stats?.activePrograms || 0,
      icon: <Calendar size={24} />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Badges Earned',
      value: stats?.badgesAwarded || 0,
      icon: <Award size={24} />,
      trend: { value: 25, isPositive: true },
    },
    {
      title: 'Pending Alerts',
      value: kennelAlerts.length,
      icon: <AlertTriangle size={24} />,
      trend: kennelAlerts.length > 0 ? { value: 100, isPositive: false } : undefined,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'Trainer'}!`}
        description={`Here's what's happening at ${facility?.name || 'your facility'} today`}
        action={
          <Link href="/training">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Training Board
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-surface-700 rounded" />
            </Card>
          ))
        ) : (
          dashboardStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dogs Overview */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Dogs in Facility</h3>
            <Link href="/dogs">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {boardLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : dogsInFacility.length === 0 ? (
            <div className="text-center py-8 text-surface-400">
              <Dog size={40} className="mx-auto mb-2 opacity-50" />
              <p>No dogs currently in facility</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dogsInFacility.slice(0, 5).map((dog) => (
                <Link
                  key={dog.dogId}
                  href={`/dogs/${dog.dogId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={dog.photoUrl} name={dog.dogName} size="sm" />
                    <div>
                      <p className="font-medium text-white">{dog.dogName}</p>
                      <p className="text-sm text-surface-400">{dog.dogBreed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-surface-400 hidden sm:block">
                      {dog.trainer}
                    </span>
                    <StatusBadge variant={getActivityStatusColor(dog.currentActivity)}>
                      {getActivityStatusLabel(dog.currentActivity)}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
              {dogsInFacility.length > 5 && (
                <p className="text-center text-sm text-surface-500 pt-2">
                  +{dogsInFacility.length - 5} more dogs
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today&apos;s Schedule</h3>
            <Button variant="ghost" size="sm">
              Full Calendar
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-800/50"
              >
                <div className="flex-shrink-0 w-16">
                  <p className="text-sm font-medium text-brand-400">{task.time}</p>
                </div>
                <div>
                  <p className="text-sm text-white">{task.task}</p>
                  <p className="text-xs text-surface-500">
                    {task.dogs} {task.dogs === 1 ? 'dog' : 'dogs'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {kennelAlerts.length > 0 && (
        <Card className="mt-6" variant="bordered">
          {kennelAlerts.map((dog) => {
            const elapsedMinutes = Math.floor((Date.now() - dog.startedAt.getTime()) / 60000);
            const hours = Math.floor(elapsedMinutes / 60);
            const minutes = elapsedMinutes % 60;

            return (
              <div key={dog.dogId} className="flex items-center gap-3 text-yellow-400">
                <AlertTriangle size={20} />
                <div className="flex-1">
                  <p className="font-medium">Kennel Time Alert</p>
                  <p className="text-sm text-surface-400">
                    {dog.dogName} has been kenneled for {hours}h {minutes}m. Consider scheduling a potty break.
                  </p>
                </div>
                <Link href="/training">
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                </Link>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
