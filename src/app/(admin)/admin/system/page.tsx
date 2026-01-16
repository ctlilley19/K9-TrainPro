'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  Server,
  Database,
  Cloud,
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
  Bell,
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

// Demo data
const demoServices: ServiceStatus[] = [
  { name: 'Web Application', status: 'operational', latency: 45, lastCheck: new Date().toISOString(), uptime: 99.98 },
  { name: 'API Gateway', status: 'operational', latency: 23, lastCheck: new Date().toISOString(), uptime: 99.99 },
  { name: 'Database (Primary)', status: 'operational', latency: 12, lastCheck: new Date().toISOString(), uptime: 99.95 },
  { name: 'Database (Replica)', status: 'operational', latency: 15, lastCheck: new Date().toISOString(), uptime: 99.92 },
  { name: 'File Storage', status: 'operational', latency: 89, lastCheck: new Date().toISOString(), uptime: 99.99 },
  { name: 'Email Service', status: 'degraded', latency: 450, lastCheck: new Date().toISOString(), uptime: 98.5 },
  { name: 'Push Notifications', status: 'operational', latency: 67, lastCheck: new Date().toISOString(), uptime: 99.87 },
  { name: 'Payment Processing', status: 'operational', latency: 234, lastCheck: new Date().toISOString(), uptime: 99.99 },
];

const demoMetrics: SystemMetric[] = [
  { label: 'CPU Usage', value: 42, max: 100, unit: '%', status: 'normal' },
  { label: 'Memory', value: 6.2, max: 16, unit: 'GB', status: 'normal' },
  { label: 'Disk Space', value: 78, max: 100, unit: '%', status: 'warning' },
  { label: 'Network I/O', value: 234, max: 1000, unit: 'MB/s', status: 'normal' },
];

const demoMaintenance: MaintenanceWindow[] = [
  {
    id: '1',
    title: 'Database Maintenance',
    description: 'Routine database optimization and index rebuilding',
    scheduled_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Security Updates',
    description: 'Apply latest security patches to all servers',
    scheduled_start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
];

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
  const [services, setServices] = useState<ServiceStatus[]>(demoServices);
  const [metrics, setMetrics] = useState<SystemMetric[]>(demoMetrics);
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>(demoMaintenance);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate overall status
  const overallStatus = services.some((s) => s.status === 'down')
    ? 'down'
    : services.some((s) => s.status === 'degraded')
    ? 'degraded'
    : 'operational';

  const overallUptime = (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
              onClick={refreshData}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Overall Status Banner */}
      <Card className={`p-4 border-l-4 ${
        overallStatus === 'operational' ? 'border-l-green-500' :
        overallStatus === 'degraded' ? 'border-l-amber-500' : 'border-l-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {overallStatus === 'operational' ? (
              <CheckCircle2 size={24} className="text-green-400" />
            ) : overallStatus === 'degraded' ? (
              <AlertTriangle size={24} className="text-amber-400" />
            ) : (
              <XCircle size={24} className="text-red-400" />
            )}
            <div>
              <h2 className={`font-bold text-lg ${statusConfig[overallStatus].color}`}>
                {overallStatus === 'operational' ? 'All Systems Operational' :
                 overallStatus === 'degraded' ? 'Partial System Degradation' : 'System Outage'}
              </h2>
              <p className="text-sm text-surface-400">
                Overall uptime: {overallUptime}% (30 days)
              </p>
            </div>
          </div>
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
        </div>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-surface-400">{metric.label}</span>
              {metric.label === 'CPU Usage' && <Cpu size={16} className="text-surface-500" />}
              {metric.label === 'Memory' && <Server size={16} className="text-surface-500" />}
              {metric.label === 'Disk Space' && <HardDrive size={16} className="text-surface-500" />}
              {metric.label === 'Network I/O' && <Wifi size={16} className="text-surface-500" />}
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {metric.value}{metric.unit}
            </p>
            <div className="w-full bg-surface-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metricStatusConfig[metric.status]}`}
                style={{ width: `${(metric.value / metric.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-surface-500 mt-1">of {metric.max}{metric.unit}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Status */}
        <Card>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-medium text-white">Service Status</h3>
          </div>
          <div className="divide-y divide-surface-800">
            {services.map((service) => {
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
                    {service.latency && (
                      <p className="text-xs text-surface-500">{service.latency}ms</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Scheduled Maintenance */}
        <Card>
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <h3 className="font-medium text-white">Scheduled Maintenance</h3>
            <Button variant="outline" size="sm" leftIcon={<Calendar size={14} />}>
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
          <div className="p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm text-white">Email Service Degraded</p>
              <p className="text-xs text-surface-500">Increased latency detected - monitoring</p>
              <p className="text-xs text-surface-600 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-green-400 mt-0.5" />
            <div>
              <p className="text-sm text-white">Database Maintenance Completed</p>
              <p className="text-xs text-surface-500">Routine optimization finished successfully</p>
              <p className="text-xs text-surface-600 mt-1">1 day ago</p>
            </div>
          </div>
          <div className="p-4 flex items-start gap-3">
            <Zap size={16} className="text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-white">Auto-scaling Triggered</p>
              <p className="text-xs text-surface-500">Added 2 instances to handle increased load</p>
              <p className="text-xs text-surface-600 mt-1">3 days ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
