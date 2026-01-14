'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDashboardStats, useTrainingBoard } from '@/hooks';
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
  Dog,
  Users,
  Clock,
  Award,
  DollarSign,
  Target,
  Loader2,
} from 'lucide-react';

// Chart data by time range - simulates filtered data from analytics service
const getChartDataByTimeRange = (range: TimeRange) => {
  // Multiplier based on time range to simulate different data volumes
  const multipliers: Record<TimeRange, number> = {
    '7d': 1,
    '30d': 4,
    '90d': 12,
    'ytd': 20,
  };
  const m = multipliers[range];

  return {
    activityByDay: range === '7d' ? [
      { day: 'Mon', training: 24, play: 18, potty: 45, feeding: 48 },
      { day: 'Tue', training: 28, play: 22, potty: 48, feeding: 48 },
      { day: 'Wed', training: 32, play: 20, potty: 46, feeding: 48 },
      { day: 'Thu', training: 26, play: 24, potty: 44, feeding: 48 },
      { day: 'Fri', training: 30, play: 26, potty: 50, feeding: 48 },
      { day: 'Sat', training: 18, play: 30, potty: 42, feeding: 48 },
      { day: 'Sun', training: 12, play: 28, potty: 40, feeding: 48 },
    ] : range === '30d' ? [
      { day: 'Week 1', training: 95, play: 72, potty: 180, feeding: 192 },
      { day: 'Week 2', training: 108, play: 85, potty: 195, feeding: 192 },
      { day: 'Week 3', training: 115, play: 90, potty: 188, feeding: 192 },
      { day: 'Week 4', training: 102, play: 78, potty: 175, feeding: 192 },
    ] : range === '90d' ? [
      { day: 'Jan', training: 320, play: 240, potty: 560, feeding: 576 },
      { day: 'Feb', training: 350, play: 280, potty: 590, feeding: 576 },
      { day: 'Mar', training: 380, play: 310, potty: 620, feeding: 576 },
    ] : [
      { day: 'Q1', training: 850, play: 680, potty: 1400, feeding: 1440 },
      { day: 'Q2', training: 920, play: 740, potty: 1500, feeding: 1440 },
      { day: 'Q3', training: 980, play: 800, potty: 1580, feeding: 1440 },
      { day: 'Q4', training: 1050, play: 860, potty: 1650, feeding: 1440 },
    ],
    programDistribution: [
      { name: 'Board & Train', value: Math.round(8 * m / 4), color: '#6366f1' },
      { name: 'Day Training', value: Math.round(6 * m / 4), color: '#22c55e' },
      { name: 'Private Lessons', value: Math.round(4 * m / 4), color: '#f59e0b' },
    ],
    trainingProgress: range === '7d' ? [
      { week: 'Day 1', avgProgress: 5 },
      { week: 'Day 2', avgProgress: 12 },
      { week: 'Day 3', avgProgress: 18 },
      { week: 'Day 4', avgProgress: 25 },
      { week: 'Day 5', avgProgress: 32 },
      { week: 'Day 6', avgProgress: 38 },
      { week: 'Day 7', avgProgress: 45 },
    ] : range === '30d' ? [
      { week: 'Week 1', avgProgress: 15 },
      { week: 'Week 2', avgProgress: 32 },
      { week: 'Week 3', avgProgress: 48 },
      { week: 'Week 4', avgProgress: 65 },
    ] : range === '90d' ? [
      { week: 'Month 1', avgProgress: 35 },
      { week: 'Month 2', avgProgress: 62 },
      { week: 'Month 3', avgProgress: 88 },
    ] : [
      { week: 'Q1', avgProgress: 25 },
      { week: 'Q2', avgProgress: 48 },
      { week: 'Q3', avgProgress: 72 },
      { week: 'Q4', avgProgress: 92 },
    ],
    badgesByTier: [
      { tier: 'Bronze', count: Math.round(22 * m / 4), color: '#d97706' },
      { tier: 'Silver', count: Math.round(15 * m / 4), color: '#9ca3af' },
      { tier: 'Gold', count: Math.round(6 * m / 4), color: '#eab308' },
      { tier: 'Platinum', count: Math.round(2 * m / 4), color: '#22d3ee' },
    ],
    revenueByMonth: range === '7d' ? [
      { month: 'Mon', revenue: 4200 },
      { month: 'Tue', revenue: 4800 },
      { month: 'Wed', revenue: 5100 },
      { month: 'Thu', revenue: 4600 },
      { month: 'Fri', revenue: 5500 },
      { month: 'Sat', revenue: 3200 },
      { month: 'Sun', revenue: 2100 },
    ] : range === '30d' ? [
      { month: 'Week 1', revenue: 6800 },
      { month: 'Week 2', revenue: 7200 },
      { month: 'Week 3', revenue: 7800 },
      { month: 'Week 4', revenue: 6700 },
    ] : range === '90d' ? [
      { month: 'Jan', revenue: 28500 },
      { month: 'Feb', revenue: 26800 },
      { month: 'Mar', revenue: 31200 },
    ] : [
      { month: 'Aug', revenue: 18500 },
      { month: 'Sep', revenue: 21000 },
      { month: 'Oct', revenue: 24500 },
      { month: 'Nov', revenue: 26000 },
      { month: 'Dec', revenue: 25000 },
      { month: 'Jan', revenue: 28500 },
    ],
    topTrainers: [
      { name: 'Sarah Johnson', dogs: Math.round(8 * m / 4), hours: Math.round(62 * m / 4), badges: Math.round(18 * m / 4) },
      { name: 'John Smith', dogs: Math.round(6 * m / 4), hours: Math.round(48 * m / 4), badges: Math.round(14 * m / 4) },
      { name: 'Mike Wilson', dogs: Math.round(5 * m / 4), hours: Math.round(38 * m / 4), badges: Math.round(10 * m / 4) },
    ],
    recentActivity: [
      { time: '10:30 AM', dog: 'Max', activity: 'Earned Gold Badge', trainer: 'Sarah' },
      { time: '9:45 AM', dog: 'Bella', activity: 'Training Session', trainer: 'John' },
      { time: '9:00 AM', dog: 'Luna', activity: 'Morning Walk', trainer: 'Mike' },
      { time: '8:30 AM', dog: 'Charlie', activity: 'Feeding', trainer: 'Sarah' },
    ],
  };
};

type TimeRange = '7d' | '30d' | '90d' | 'ytd';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: stats, isLoading } = useDashboardStats();
  const { data: trainingBoard } = useTrainingBoard();

  // Get chart data based on selected time range
  const chartData = getChartDataByTimeRange(timeRange);

  // Calculate dogs in facility from training board
  const dogsInFacility = trainingBoard
    ? Object.values(trainingBoard).flat().length
    : 0;

  // Loading state for stats
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

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

      {/* Overview Stats - Connected to real data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Dogs"
          value={stats?.totalDogs || 0}
          icon={<Dog size={20} />}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Active Programs"
          value={stats?.activePrograms || 0}
          icon={<Target size={20} />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Families"
          value={stats?.totalFamilies || 0}
          icon={<Users size={20} />}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Badges Awarded"
          value={stats?.badgesAwarded || 0}
          icon={<Award size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Training Hours"
          value={stats?.trainingHours || 0}
          icon={<Clock size={20} />}
          trend={{ value: 18, isPositive: true }}
        />
        <StatCard
          title="Revenue"
          value={`$${((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}k`}
          icon={<DollarSign size={20} />}
          trend={{ value: 8, isPositive: true }}
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
                <BarChart data={chartData.activityByDay}>
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
                <AreaChart data={chartData.trainingProgress}>
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
                    data={chartData.programDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.programDistribution.map((entry, index) => (
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
              {chartData.programDistribution.map((item) => (
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
                <BarChart data={chartData.badgesByTier} layout="vertical">
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
                    {chartData.badgesByTier.map((entry, index) => (
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
                <LineChart data={chartData.revenueByMonth}>
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
              {chartData.topTrainers.map((trainer, idx) => (
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
              {chartData.recentActivity.map((activity, idx) => (
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
