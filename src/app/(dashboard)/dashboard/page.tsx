'use client';

import { useUser, useFacility } from '@/stores/authStore';
import { PageHeader } from '@/components/layout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Dog,
  Users,
  Clock,
  Award,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Plus,
} from 'lucide-react';

// Mock data for demo
const stats = [
  {
    title: 'Dogs in Training',
    value: 12,
    icon: <Dog size={24} />,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Active Programs',
    value: 15,
    icon: <Calendar size={24} />,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Badges Earned Today',
    value: 4,
    icon: <Award size={24} />,
    trend: { value: 25, isPositive: true },
  },
  {
    title: 'Pending Alerts',
    value: 2,
    icon: <AlertTriangle size={24} />,
    trend: { value: 50, isPositive: false },
  },
];

const recentDogs = [
  { name: 'Max', breed: 'German Shepherd', program: 'Board & Train', status: 'training' },
  { name: 'Bella', breed: 'Golden Retriever', program: 'Day Training', status: 'play' },
  { name: 'Charlie', breed: 'Labrador', program: 'Board & Train', status: 'rest' },
  { name: 'Luna', breed: 'Border Collie', program: 'Private Lessons', status: 'training' },
];

const upcomingTasks = [
  { time: '10:00 AM', task: 'Group play session', dogs: 4 },
  { time: '11:30 AM', task: 'Training - Max (recall)', dogs: 1 },
  { time: '12:00 PM', task: 'Feeding time', dogs: 12 },
  { time: '2:00 PM', task: 'Parent video call - Luna', dogs: 1 },
];

export default function DashboardPage() {
  const user = useUser();
  const facility = useFacility();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'Trainer'}!`}
        description={`Here's what's happening at ${facility?.name || 'your facility'} today`}
        action={
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Quick Log
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dogs Overview */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Dogs in Facility</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentDogs.map((dog, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center">
                    <Dog size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{dog.name}</p>
                    <p className="text-sm text-surface-400">{dog.breed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-surface-400 hidden sm:block">
                    {dog.program}
                  </span>
                  <StatusBadge
                    variant={
                      dog.status === 'training'
                        ? 'info'
                        : dog.status === 'play'
                        ? 'success'
                        : 'default'
                    }
                  >
                    {dog.status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
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
      <Card className="mt-6" variant="bordered">
        <div className="flex items-center gap-3 text-yellow-400">
          <AlertTriangle size={20} />
          <div>
            <p className="font-medium">Kennel Time Alert</p>
            <p className="text-sm text-surface-400">
              Max has been kenneled for 3h 45m. Consider scheduling a potty break.
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Take Action
          </Button>
        </div>
      </Card>
    </div>
  );
}
