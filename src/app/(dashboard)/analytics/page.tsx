'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Dog,
  Users,
  Clock,
  Award,
  Calendar,
  DollarSign,
  Activity,
  Target,
  ChevronDown,
} from 'lucide-react';

// Mock analytics data
const mockData = {
  overview: {
    total_dogs: 24,
    dogs_change: 4,
    active_programs: 18,
    programs_change: 2,
    total_families: 16,
    families_change: 3,
    badges_awarded: 45,
    badges_change: 12,
    training_hours: 156,
    hours_change: 18,
    revenue: 28500,
    revenue_change: 8.5,
  },
  activityByDay: [
    { day: 'Mon', training: 24, play: 18, potty: 45, feeding: 48 },
    { day: 'Tue', training: 28, play: 22, potty: 48, feeding: 48 },
    { day: 'Wed', training: 32, play: 20, potty: 46, feeding: 48 },
    { day: 'Thu', training: 26, play: 24, potty: 44, feeding: 48 },
    { day: 'Fri', training: 30, play: 26, potty: 50, feeding: 48 },
    { day: 'Sat', training: 18, play: 30, potty: 42, feeding: 48 },
    { day: 'Sun', training: 12, play: 28, potty: 40, feeding: 48 },
  ],
  programDistribution: [
    { name: 'Board & Train', value: 8, color: '#6366f1' },
    { name: 'Day Training', value: 6, color: '#22c55e' },
    { name: 'Private Lessons', value: 4, color: '#f59e0b' },
  ],
  trainingProgress: [
    { week: 'Week 1', avgProgress: 15 },
    { week: 'Week 2', avgProgress: 32 },
    { week: 'Week 3', avgProgress: 48 },
    { week: 'Week 4', avgProgress: 65 },
    { week: 'Week 5', avgProgress: 78 },
    { week: 'Week 6', avgProgress: 92 },
  ],
  badgesByTier: [
    { tier: 'Bronze', count: 22, color: '#d97706' },
    { tier: 'Silver', count: 15, color: '#9ca3af' },
    { tier: 'Gold', count: 6, color: '#eab308' },
    { tier: 'Platinum', count: 2, color: '#22d3ee' },
  ],
  revenueByMonth: [
    { month: 'Aug', revenue: 18500 },
    { month: 'Sep', revenue: 21000 },
    { month: 'Oct', revenue: 24500 },
    { month: 'Nov', revenue: 26000 },
    { month: 'Dec', revenue: 25000 },
    { month: 'Jan', revenue: 28500 },
  ],
  topTrainers: [
    { name: 'Sarah Johnson', dogs: 8, hours: 62, badges: 18 },
    { name: 'John Smith', dogs: 6, hours: 48, badges: 14 },
    { name: 'Mike Wilson', dogs: 5, hours: 38, badges: 10 },
  ],
  recentActivity: [
    { time: '10:30 AM', dog: 'Max', activity: 'Earned Gold Badge', trainer: 'Sarah' },
    { time: '9:45 AM', dog: 'Bella', activity: 'Training Session', trainer: 'John' },
    { time: '9:00 AM', dog: 'Luna', activity: 'Morning Walk', trainer: 'Mike' },
    { time: '8:30 AM', dog: 'Charlie', activity: 'Feeding', trainer: 'Sarah' },
  ],
};

type TimeRange = '7d' | '30d' | '90d' | 'ytd';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const data = mockData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-surface-400">Track facility performance and training metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'ytd'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'YTD'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Dogs"
          value={data.overview.total_dogs}
          icon={<Dog size={20} />}
          trend={{ value: data.overview.dogs_change, label: 'vs last period' }}
        />
        <StatCard
          title="Active Programs"
          value={data.overview.active_programs}
          icon={<Target size={20} />}
          trend={{ value: data.overview.programs_change, label: 'vs last period' }}
        />
        <StatCard
          title="Families"
          value={data.overview.total_families}
          icon={<Users size={20} />}
          trend={{ value: data.overview.families_change, label: 'vs last period' }}
        />
        <StatCard
          title="Badges Awarded"
          value={data.overview.badges_awarded}
          icon={<Award size={20} />}
          trend={{ value: data.overview.badges_change, label: 'vs last period' }}
        />
        <StatCard
          title="Training Hours"
          value={data.overview.training_hours}
          icon={<Clock size={20} />}
          trend={{ value: data.overview.hours_change, label: 'vs last period' }}
        />
        <StatCard
          title="Revenue"
          value={`$${(data.overview.revenue / 1000).toFixed(1)}k`}
          icon={<DollarSign size={20} />}
          trend={{ value: data.overview.revenue_change, label: '% growth' }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity by Day */}
        <Card>
          <CardHeader title="Activity Overview" />
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="training" fill="#6366f1" name="Training" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="play" fill="#22c55e" name="Play" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="potty" fill="#f59e0b" name="Potty" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader title="Average Training Progress" />
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trainingProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Progress']}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="avgProgress"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#progressGradient)"
                    name="Avg Progress"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Program Distribution */}
        <Card>
          <CardHeader title="Program Distribution" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.programDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.programDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {data.programDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-surface-400">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges by Tier */}
        <Card>
          <CardHeader title="Badges by Tier" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.badgesByTier} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="tier" type="category" stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.badgesByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader title="Revenue Trend" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Trainers */}
        <Card>
          <CardHeader title="Top Trainers" />
          <CardContent>
            <div className="space-y-4">
              {data.topTrainers.map((trainer, idx) => (
                <div
                  key={trainer.name}
                  className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/50"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{trainer.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-surface-500">
                      <span className="flex items-center gap-1">
                        <Dog size={12} />
                        {trainer.dogs} dogs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {trainer.hours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={12} />
                        {trainer.badges} badges
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" />
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/50"
                >
                  <div className="text-xs text-surface-500 w-16">{activity.time}</div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.dog}</span>
                      <span className="text-surface-400"> - {activity.activity}</span>
                    </p>
                    <p className="text-xs text-surface-500">by {activity.trainer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
