'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Users,
  Dog,
  Clock,
  TrendingUp,
  UserCog,
  Target,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Calendar,
  Award,
  Briefcase,
  Loader2,
} from 'lucide-react';

// Demo data for manager dashboard
const demoManagerData = {
  stats: {
    totalTrainers: 4,
    activeTrainers: 3,
    dogsInTraining: 7,
    programsActive: 7,
    avgSessionsPerDay: 18,
    badgesThisWeek: 5,
  },
  trainers: [
    {
      id: 't1',
      name: 'Sarah Johnson',
      role: 'Lead Trainer',
      avatar_url: null,
      status: 'active',
      dogsAssigned: 3,
      hoursToday: 5.5,
      completedToday: 8,
      performance: 94,
    },
    {
      id: 't2',
      name: 'John Smith',
      role: 'Trainer',
      avatar_url: null,
      status: 'active',
      dogsAssigned: 2,
      hoursToday: 4.0,
      completedToday: 6,
      performance: 88,
    },
    {
      id: 't3',
      name: 'Mike Wilson',
      role: 'Trainer',
      avatar_url: null,
      status: 'active',
      dogsAssigned: 2,
      hoursToday: 3.5,
      completedToday: 5,
      performance: 85,
    },
    {
      id: 't4',
      name: 'Emily Davis',
      role: 'Trainer',
      avatar_url: null,
      status: 'off_duty',
      dogsAssigned: 0,
      hoursToday: 0,
      completedToday: 0,
      performance: 91,
    },
  ],
  alerts: [
    {
      id: 'a1',
      type: 'warning',
      message: 'Rocky has been kenneled for 3+ hours',
      trainer: 'Sarah Johnson',
      time: '10 min ago',
    },
    {
      id: 'a2',
      type: 'info',
      message: 'Max earned Gold Badge - Sit Master',
      trainer: 'Sarah Johnson',
      time: '25 min ago',
    },
    {
      id: 'a3',
      type: 'success',
      message: 'All morning potty breaks completed',
      trainer: 'Team',
      time: '1 hour ago',
    },
  ],
  todaySchedule: [
    { time: '8:00 AM', event: 'Morning potty breaks', status: 'completed' },
    { time: '9:00 AM', event: 'Training sessions begin', status: 'completed' },
    { time: '12:00 PM', event: 'Lunch & rest period', status: 'in_progress' },
    { time: '2:00 PM', event: 'Afternoon training', status: 'upcoming' },
    { time: '4:00 PM', event: 'Play time / Socialization', status: 'upcoming' },
    { time: '5:00 PM', event: 'Daily reports due', status: 'upcoming' },
  ],
};

export default function ManagerDashboard() {
  const data = demoManagerData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-purple-400" size={28} />
            Manager Dashboard
          </h1>
          <p className="text-surface-400">Oversee trainers, assignments, and facility operations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/manager/trainers">
            <Button variant="outline" leftIcon={<UserCog size={16} />}>
              Manage Trainers
            </Button>
          </Link>
          <Link href="/manager/assignments">
            <Button variant="primary" leftIcon={<Target size={16} />}>
              Assignments
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Active Trainers"
          value={`${data.stats.activeTrainers}/${data.stats.totalTrainers}`}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Dogs in Training"
          value={data.stats.dogsInTraining}
          icon={<Dog size={20} />}
        />
        <StatCard
          title="Active Programs"
          value={data.stats.programsActive}
          icon={<Calendar size={20} />}
        />
        <StatCard
          title="Sessions Today"
          value={data.stats.avgSessionsPerDay}
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Badges This Week"
          value={data.stats.badgesThisWeek}
          icon={<Award size={20} />}
        />
        <StatCard
          title="Avg Performance"
          value="89%"
          icon={<TrendingUp size={20} />}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trainer Status */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Trainer Status"
            action={
              <Link href="/manager/trainers">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            }
          />
          <CardContent>
            <div className="space-y-3">
              {data.trainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                >
                  <Avatar name={trainer.name} size="md" src={trainer.avatar_url} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{trainer.name}</p>
                      <StatusBadge
                        variant={trainer.status === 'active' ? 'success' : 'default'}
                        size="xs"
                      >
                        {trainer.status === 'active' ? 'Active' : 'Off Duty'}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-surface-500">{trainer.role}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-white">{trainer.dogsAssigned}</p>
                      <p className="text-xs text-surface-500">Dogs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">{trainer.completedToday}</p>
                      <p className="text-xs text-surface-500">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white">{trainer.hoursToday}h</p>
                      <p className="text-xs text-surface-500">Today</p>
                    </div>
                    <div className="w-16">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-surface-500">Perf</span>
                        <span className={trainer.performance >= 90 ? 'text-green-400' : 'text-yellow-400'}>
                          {trainer.performance}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            trainer.performance >= 90 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${trainer.performance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader title="Recent Alerts" />
          <CardContent>
            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50"
                >
                  <div className={`mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-400' :
                    alert.type === 'success' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {alert.type === 'warning' ? <AlertTriangle size={16} /> :
                     alert.type === 'success' ? <CheckCircle size={16} /> :
                     <Award size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{alert.message}</p>
                    <p className="text-xs text-surface-500">
                      {alert.trainer} • {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader title="Today's Schedule" />
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {data.todaySchedule.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  item.status === 'completed'
                    ? 'bg-green-500/5 border-green-500/20'
                    : item.status === 'in_progress'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-surface-800/50 border-surface-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'completed' ? 'bg-green-500' :
                  item.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                  'bg-surface-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    item.status === 'completed' ? 'text-green-400' :
                    item.status === 'in_progress' ? 'text-blue-400' :
                    'text-white'
                  }`}>{item.event}</p>
                  <p className="text-xs text-surface-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
