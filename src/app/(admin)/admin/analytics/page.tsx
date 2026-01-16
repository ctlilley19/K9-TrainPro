'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/adminStore';
import {
  Users,
  DollarSign,
  Activity,
  Dog,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

// Types
interface AnalyticsData {
  metrics: {
    activeUsers: number;
    activeUsersChange: number;
    mrr: number;
    mrrChange: number;
    activeDogs: number;
    dogsChange: number;
    avgSessions: number;
    sessionsChange: number;
  };
  userGrowthData: { month: string; users: number; active: number }[];
  revenueData: { month: string; mrr: number; arr: number }[];
  subscriptionData: { name: string; value: number; color: string }[];
  sessionData: { day: string; sessions: number }[];
  retentionData: { week: string; rate: number }[];
  additionalMetrics: {
    conversionRate: number;
    churnRate: number;
    avgSubscriptionLength: number;
    ltv: number;
  };
}

// Time range options
const timeRanges = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'YTD', value: 'ytd' },
];

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor,
  iconBg,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && change !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUpRight size={14} className="text-green-400" />
              ) : (
                <ArrowDownRight size={14} className="text-red-400" />
              )}
              <span className={change >= 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && <span className="text-surface-500 text-sm">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}

// Empty state for charts
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center text-surface-500">
      {message}
    </div>
  );
}

export default function AnalyticsPage() {
  const { sessionToken } = useAdminStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!sessionToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'x-admin-session': sessionToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionToken, timeRange]);

  const hasData = data && (
    data.metrics.activeUsers > 0 ||
    data.metrics.mrr > 0 ||
    data.metrics.activeDogs > 0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Business intelligence and metrics overview"
        action={
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex bg-surface-800 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range.value
                      ? 'bg-brand-500 text-white'
                      : 'text-surface-400 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />}
              onClick={fetchData}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {isLoading && !data ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center text-red-400">{error}</Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Monthly Active Users"
              value={data?.metrics.activeUsers.toLocaleString() || '0'}
              change={data?.metrics.activeUsersChange}
              changeLabel="MTD"
              icon={<Users size={20} />}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/10"
            />
            <StatCard
              title="Monthly Recurring Revenue"
              value={`$${(data?.metrics.mrr || 0).toLocaleString()}`}
              change={data?.metrics.mrrChange}
              changeLabel="MTD"
              icon={<DollarSign size={20} />}
              iconColor="text-green-400"
              iconBg="bg-green-500/10"
            />
            <StatCard
              title="Active Dogs"
              value={(data?.metrics.activeDogs || 0).toLocaleString()}
              change={data?.metrics.dogsChange}
              changeLabel="MTD"
              icon={<Dog size={20} />}
              iconColor="text-brand-400"
              iconBg="bg-brand-500/10"
            />
            <StatCard
              title="Avg Sessions/User"
              value={data?.metrics.avgSessions || '0'}
              change={data?.metrics.sessionsChange}
              changeLabel="vs last month"
              icon={<Activity size={20} />}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/10"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <div className="p-4 border-b border-surface-800">
                <h3 className="font-medium text-white">User Growth</h3>
                <p className="text-sm text-surface-500">Total vs Active Users</p>
              </div>
              <div className="p-4 h-[300px]">
                {hasData && data?.userGrowthData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="users" name="Total Users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="active" name="Active Users" stroke="#22c55e" fillOpacity={1} fill="url(#colorActive)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No user data yet" />
                )}
              </div>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <div className="p-4 border-b border-surface-800">
                <h3 className="font-medium text-white">Revenue</h3>
                <p className="text-sm text-surface-500">MRR and ARR Trends</p>
              </div>
              <div className="p-4 h-[300px]">
                {data?.metrics.mrr && data.metrics.mrr > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="mrr" name="MRR" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No revenue data yet" />
                )}
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Breakdown */}
            <Card>
              <div className="p-4 border-b border-surface-800">
                <h3 className="font-medium text-white">Subscription Breakdown</h3>
                <p className="text-sm text-surface-500">By plan type</p>
              </div>
              <div className="p-4 h-[250px]">
                {data?.subscriptionData && data.subscriptionData.some(d => d.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={data.subscriptionData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {data.subscriptionData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4">
                      {data.subscriptionData.filter(d => d.value > 0).map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-surface-400">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyChart message="No subscriptions yet" />
                )}
              </div>
            </Card>

            {/* Sessions by Day */}
            <Card>
              <div className="p-4 border-b border-surface-800">
                <h3 className="font-medium text-white">Sessions by Day</h3>
                <p className="text-sm text-surface-500">Training sessions this week</p>
              </div>
              <div className="p-4 h-[250px]">
                {data?.sessionData && data.sessionData.some(d => d.sessions > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.sessionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                      <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No session data yet" />
                )}
              </div>
            </Card>

            {/* User Retention */}
            <Card>
              <div className="p-4 border-b border-surface-800">
                <h3 className="font-medium text-white">User Retention</h3>
                <p className="text-sm text-surface-500">Cohort retention rate</p>
              </div>
              <div className="p-4 h-[250px]">
                {hasData && data?.retentionData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.retentionData}>
                      <defs>
                        <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value: number) => [`${value}%`, 'Retention']} />
                      <Area type="monotone" dataKey="rate" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRetention)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Not enough data for retention" />
                )}
              </div>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight size={16} className="text-green-400" />
                <span className="text-sm text-surface-400">Conversion Rate</span>
              </div>
              <p className="text-xl font-bold text-white">{data?.additionalMetrics.conversionRate || 0}%</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight size={16} className="text-red-400" />
                <span className="text-sm text-surface-400">Churn Rate</span>
              </div>
              <p className="text-xl font-bold text-white">{data?.additionalMetrics.churnRate || 0}%</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-sm text-surface-400">Avg. Subscription</span>
              </div>
              <p className="text-xl font-bold text-white">{data?.additionalMetrics.avgSubscriptionLength || 0} months</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-400" />
                <span className="text-sm text-surface-400">LTV</span>
              </div>
              <p className="text-xl font-bold text-white">${data?.additionalMetrics.ltv || 0}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
