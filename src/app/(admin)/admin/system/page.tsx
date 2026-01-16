'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/adminStore';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Calendar,
  Info,
} from 'lucide-react';

// Types
interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  lastCheck: string;
  uptime: number;
}

interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
}

// Status config
const statusConfig = {
  operational: { label: 'Operational', color: 'text-green-400', bg: 'bg-green-500', icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: 'text-amber-400', bg: 'bg-amber-500', icon: AlertTriangle },
  down: { label: 'Down', color: 'text-red-400', bg: 'bg-red-500', icon: XCircle },
};

// Metric status config
const metricStatusConfig = {
  normal: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

export default function SystemHealthPage() {
  const { sessionToken } = useAdminStore();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchSystemHealth = async () => {
    if (!sessionToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/system', {
        headers: {
          'x-admin-session': sessionToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system health data');
      }

      const data = await response.json();
      setServices(data.services || []);
      setMetrics(data.metrics || []);
      setMaintenance(data.maintenance || []);
      setAlerts(data.alerts || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching system health:', err);
      setError('Failed to load system health data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
  }, [sessionToken]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  // Calculate overall status
  const overallStatus = services.some((s) => s.status === 'down')
    ? 'down'
    : services.some((s) => s.status === 'degraded')
    ? 'degraded'
    : 'operational';

  const overallUptime = services.length > 0
    ? (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2)
    : '0';

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Monitor system status and performance"
        action={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Clock size={14} />
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />}
              onClick={fetchSystemHealth}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Overall Status Banner */}
      <Card className={`p-4 border-l-4 ${
        overallStatus === 'operational' ? 'border-l-green-500' :
        overallStatus === 'degraded' ? 'border-l-amber-500' : 'border-l-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <RefreshCw size={24} className="text-surface-400 animate-spin" />
            ) : overallStatus === 'operational' ? (
              <CheckCircle2 size={24} className="text-green-400" />
            ) : overallStatus === 'degraded' ? (
              <AlertTriangle size={24} className="text-amber-400" />
            ) : (
              <XCircle size={24} className="text-red-400" />
            )}
            <div>
              <h2 className={`font-bold text-lg ${isLoading ? 'text-surface-400' : statusConfig[overallStatus].color}`}>
                {isLoading ? 'Checking Systems...' :
                 overallStatus === 'operational' ? 'All Systems Operational' :
                 overallStatus === 'degraded' ? 'Partial System Degradation' : 'System Outage'}
              </h2>
              <p className="text-sm text-surface-400">
                Overall uptime: {overallUptime}% (30 days)
              </p>
            </div>
          </div>
          {!isLoading && services.length > 0 && (
            <div className="flex gap-2">
              {['operational', 'degraded', 'down'].map((status) => {
                const count = services.filter((s) => s.status === status).length;
                if (count === 0) return null;
                return (
                  <span
                    key={status}
                    className={`px-3 py-1 rounded-full text-sm ${
                      status === 'operational' ? 'bg-green-500/10 text-green-400' :
                      status === 'degraded' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {count} {status}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.length > 0 ? (
          metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-400">{metric.label}</span>
                {metric.label === 'CPU Usage' && <Cpu size={16} className="text-surface-500" />}
                {metric.label === 'Memory' && <Server size={16} className="text-surface-500" />}
                {metric.label === 'Disk Space' && <HardDrive size={16} className="text-surface-500" />}
                {metric.label === 'Network I/O' && <Wifi size={16} className="text-surface-500" />}
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                {metric.value > 0 ? `${metric.value}${metric.unit}` : 'N/A'}
              </p>
              <div className="w-full bg-surface-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${metric.value > 0 ? metricStatusConfig[metric.status] : 'bg-surface-700'}`}
                  style={{ width: metric.value > 0 ? `${(metric.value / metric.max) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-surface-500 mt-1">
                {metric.value > 0 ? `of ${metric.max}${metric.unit}` : 'Monitoring not configured'}
              </p>
            </Card>
          ))
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-400">CPU Usage</span>
                <Cpu size={16} className="text-surface-500" />
              </div>
              <p className="text-2xl font-bold text-surface-500 mb-2">N/A</p>
              <p className="text-xs text-surface-500">Monitoring not configured</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-400">Memory</span>
                <Server size={16} className="text-surface-500" />
              </div>
              <p className="text-2xl font-bold text-surface-500 mb-2">N/A</p>
              <p className="text-xs text-surface-500">Monitoring not configured</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-400">Disk Space</span>
                <HardDrive size={16} className="text-surface-500" />
              </div>
              <p className="text-2xl font-bold text-surface-500 mb-2">N/A</p>
              <p className="text-xs text-surface-500">Monitoring not configured</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-400">Network I/O</span>
                <Wifi size={16} className="text-surface-500" />
              </div>
              <p className="text-2xl font-bold text-surface-500 mb-2">N/A</p>
              <p className="text-xs text-surface-500">Monitoring not configured</p>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Status */}
        <Card>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-medium text-white">Service Status</h3>
          </div>
          <div className="divide-y divide-surface-800">
            {isLoading ? (
              <div className="p-8 text-center text-surface-500">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                Checking services...
              </div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <Server size={24} className="mx-auto mb-2 opacity-50" />
                No services configured
              </div>
            ) : (
              services.map((service) => {
                const StatusIcon = statusConfig[service.status].icon;
                return (
                  <div key={service.name} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon size={16} className={statusConfig[service.status].color} />
                      <div>
                        <p className="text-sm font-medium text-white">{service.name}</p>
                        <p className="text-xs text-surface-500">Uptime: {service.uptime}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${statusConfig[service.status].color}`}>
                        {statusConfig[service.status].label}
                      </p>
                      {service.latency !== undefined && service.latency > 0 && (
                        <p className="text-xs text-surface-500">{service.latency}ms</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Scheduled Maintenance */}
        <Card>
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <h3 className="font-medium text-white">Scheduled Maintenance</h3>
            <Button variant="outline" size="sm" leftIcon={<Calendar size={14} />} disabled>
              Schedule
            </Button>
          </div>
          <div className="divide-y divide-surface-800">
            {maintenance.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <Calendar size={24} className="mx-auto mb-2 opacity-50" />
                No scheduled maintenance
              </div>
            ) : (
              maintenance.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{item.title}</h4>
                      <p className="text-sm text-surface-400">{item.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      item.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                      item.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(item.scheduled_start)}
                    </span>
                    <span>→</span>
                    <span>{formatDate(item.scheduled_end)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <div className="p-4 border-b border-surface-800">
          <h3 className="font-medium text-white">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-surface-800">
          {isLoading ? (
            <div className="p-8 text-center text-surface-500">
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-surface-500">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
              No recent alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-4 flex items-start gap-3">
                {alert.type === 'error' ? (
                  <XCircle size={16} className="text-red-400 mt-0.5" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle size={16} className="text-amber-400 mt-0.5" />
                ) : (
                  <Info size={16} className="text-blue-400 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-white">{alert.title}</p>
                  {alert.description && (
                    <p className="text-xs text-surface-500">{alert.description}</p>
                  )}
                  <p className="text-xs text-surface-600 mt-1">{formatTimeAgo(alert.time)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
