'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import {
  incidentTypes,
  severityConfig,
  statusConfig,
  type IncidentType,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/services/supabase/incidents';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Shield,
  TrendingDown,
} from 'lucide-react';

// Mock incidents data
const mockIncidents = [
  {
    id: '1',
    incident_number: 'INC-2501-A1B2',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    reporter: { id: 'staff_1', full_name: 'Sarah Johnson' },
    incident_type: 'behavioral' as IncidentType,
    severity: 'medium' as IncidentSeverity,
    status: 'open' as IncidentStatus,
    title: 'Reactivity during group session',
    description: 'Max showed increased reactivity toward other dogs during the afternoon group session.',
    location: 'Training Yard',
    incident_date: '2025-01-13',
    incident_time: '14:30',
    injuries_reported: false,
    medical_attention_required: false,
    parent_notified: false,
    follow_up_required: true,
    created_at: '2025-01-13T14:45:00Z',
  },
  {
    id: '2',
    incident_number: 'INC-2501-C3D4',
    dog: { id: 'b', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
    reporter: { id: 'staff_2', full_name: 'Mike Chen' },
    incident_type: 'injury' as IncidentType,
    severity: 'low' as IncidentSeverity,
    status: 'resolved' as IncidentStatus,
    title: 'Minor paw pad abrasion',
    description: 'Bella sustained a minor abrasion on her front left paw pad during outdoor play.',
    location: 'Play Area',
    incident_date: '2025-01-12',
    incident_time: '10:15',
    injuries_reported: true,
    injury_details: 'Small abrasion on front left paw pad',
    medical_attention_required: false,
    parent_notified: true,
    parent_notified_at: '2025-01-12T10:30:00Z',
    follow_up_required: false,
    resolution_notes: 'Wound cleaned and bandaged. Healing well.',
    resolved_at: '2025-01-12T16:00:00Z',
    created_at: '2025-01-12T10:20:00Z',
  },
  {
    id: '3',
    incident_number: 'INC-2501-E5F6',
    dog: { id: 'c', name: 'Luna', breed: 'Border Collie', photo_url: null },
    reporter: { id: 'staff_1', full_name: 'Sarah Johnson' },
    incident_type: 'near_miss' as IncidentType,
    severity: 'low' as IncidentSeverity,
    status: 'closed' as IncidentStatus,
    title: 'Gate almost left unlatched',
    description: 'Training yard gate was found almost unlatched after a session. No escape occurred.',
    location: 'Training Yard',
    incident_date: '2025-01-10',
    incident_time: '16:00',
    injuries_reported: false,
    medical_attention_required: false,
    parent_notified: false,
    follow_up_required: false,
    resolution_notes: 'Staff reminded about gate latch protocol. Added to daily checklist.',
    resolved_at: '2025-01-10T17:00:00Z',
    created_at: '2025-01-10T16:05:00Z',
  },
  {
    id: '4',
    incident_number: 'INC-2501-G7H8',
    dog: { id: 'd', name: 'Cooper', breed: 'Labrador', photo_url: null },
    reporter: { id: 'staff_3', full_name: 'Emily Rodriguez' },
    incident_type: 'fight' as IncidentType,
    severity: 'high' as IncidentSeverity,
    status: 'investigating' as IncidentStatus,
    title: 'Scuffle with another dog',
    description: 'Cooper got into a brief scuffle with another dog during play time. Both dogs were separated immediately.',
    location: 'Play Area',
    incident_date: '2025-01-11',
    incident_time: '11:45',
    injuries_reported: true,
    injury_details: 'Minor scratch on neck - no puncture',
    medical_attention_required: false,
    parent_notified: true,
    parent_notified_at: '2025-01-11T12:00:00Z',
    follow_up_required: true,
    follow_up_notes: 'Reviewing play group compatibility. May need to adjust groupings.',
    created_at: '2025-01-11T11:50:00Z',
  },
];

// Calculate stats
const openIncidents = mockIncidents.filter((i) => i.status === 'open').length;
const investigatingIncidents = mockIncidents.filter((i) => i.status === 'investigating').length;
const resolvedThisWeek = mockIncidents.filter(
  (i) => i.status === 'resolved' && new Date(i.resolved_at!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
).length;
const highSeverityOpen = mockIncidents.filter(
  (i) => (i.severity === 'high' || i.severity === 'critical') && i.status !== 'closed' && i.status !== 'resolved'
).length;

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredIncidents = mockIncidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.incident_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleNotifyParent = (incidentId: string) => {
    console.log('Notifying parent for incident:', incidentId);
    alert('Parent notification sent!');
  };

  const handleResolve = (incidentId: string) => {
    console.log('Resolving incident:', incidentId);
    alert('Incident marked as resolved!');
  };

  return (
    <div>
      <PageHeader
        title="Incident Reports"
        description="Track and manage safety incidents"
        action={
          <Link href="/incidents/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Report Incident
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Open</p>
              <p className="text-xl font-bold text-white">{openIncidents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Investigating</p>
              <p className="text-xl font-bold text-white">{investigatingIncidents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Resolved This Week</p>
              <p className="text-xl font-bold text-white">{resolvedThisWeek}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">High Priority</p>
              <p className="text-xl font-bold text-white">{highSeverityOpen}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* High Priority Alert */}
      {highSeverityOpen > 0 && (
        <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-orange-400" />
                <div>
                  <p className="font-medium text-white">
                    {highSeverityOpen} high priority incident{highSeverityOpen > 1 ? 's' : ''} need attention
                  </p>
                  <p className="text-sm text-surface-400">
                    Please review and address as soon as possible
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSeverityFilter('high');
                  setStatusFilter('open');
                }}
              >
                View High Priority
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const typeConfig = incidentTypes[incident.incident_type];
          const sevConfig = severityConfig[incident.severity];

          return (
            <Card
              key={incident.id}
              className={cn(
                'hover:border-brand-500/30 transition-all',
                incident.severity === 'high' && incident.status === 'open' && 'border-orange-500/30',
                incident.severity === 'critical' && incident.status === 'open' && 'border-red-500/30'
              )}
              variant="bordered"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                {/* Incident Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar name={incident.dog.name} size="lg" />
                    <div
                      className={cn(
                        'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs',
                        sevConfig.bgColor
                      )}
                    >
                      {typeConfig.icon}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-surface-500">
                        {incident.incident_number}
                      </span>
                      <StatusBadge
                        variant={statusConfig[incident.status].color as any}
                        size="xs"
                      >
                        {statusConfig[incident.status].label}
                      </StatusBadge>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          sevConfig.bgColor,
                          sevConfig.color
                        )}
                      >
                        {sevConfig.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{incident.title}</h3>
                    <p className="text-sm text-surface-400">
                      {incident.dog.name} • {typeConfig.label} • {incident.location}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      {formatDate(incident.incident_date)} at {incident.incident_time} • Reported by {incident.reporter.full_name}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!incident.parent_notified && (incident.injuries_reported || incident.severity === 'high' || incident.severity === 'critical') && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Bell size={14} />}
                      onClick={() => handleNotifyParent(incident.id)}
                    >
                      Notify Parent
                    </Button>
                  )}
                  {incident.parent_notified && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Parent Notified
                    </span>
                  )}
                  {(incident.status === 'open' || incident.status === 'investigating') && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle size={14} />}
                      onClick={() => handleResolve(incident.id)}
                    >
                      Resolve
                    </Button>
                  )}
                  <Link href={`/incidents/${incident.id}`}>
                    <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                      View
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Injury/Follow-up Indicators */}
              {(incident.injuries_reported || incident.follow_up_required) && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    {incident.injuries_reported && (
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Injuries Reported
                      </span>
                    )}
                    {incident.follow_up_required && (
                      <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        Follow-up Required
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredIncidents.length === 0 && (
        <Card className="text-center py-12">
          <Shield size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No incidents found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all' || severityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Great news! No incidents to report.'}
          </p>
          <Link href="/incidents/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Report Incident
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
