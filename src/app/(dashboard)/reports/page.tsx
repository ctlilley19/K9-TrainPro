'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useReports, useDogsNeedingReports, useFamilies } from '@/hooks';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Send,
  Clock,
  Edit,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const { data: reports, isLoading, error, refetch } = useReports();
  const { data: dogsNeedingReports } = useDogsNeedingReports();
  const { data: families } = useFamilies();

  // Create family lookup map
  const familyMap = useMemo(() => {
    const map = new Map<string, string>();
    families?.forEach((family) => {
      map.set(family.id, family.name);
    });
    return map;
  }, [families]);

  const filteredReports = useMemo(() => {
    if (!reports) return [];

    return reports.filter((report) => {
      const matchesSearch =
        report.dog_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.family_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesDate = !dateFilter || report.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reports, searchQuery, statusFilter, dateFilter]);

  const draftCount = reports?.filter((r) => r.status === 'draft').length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Failed to load reports</h2>
          <p className="text-surface-400 max-w-md">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Daily Reports"
        description={`${draftCount} drafts, ${dogsNeedingReports?.length || 0} dogs need reports today`}
        action={
          <Link href="/reports/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Create Report
            </Button>
          </Link>
        }
      />

      {/* Dogs Needing Reports */}
      {dogsNeedingReports && dogsNeedingReports.length > 0 && (
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                Dogs Needing Reports Today
              </span>
            }
          />
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {dogsNeedingReports.map((dog) => (
                <Link
                  key={dog.id}
                  href={`/reports/new?dog=${dog.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-yellow-500/50 transition-all"
                >
                  <Avatar name={dog.name} size="sm" src={dog.photo_url} />
                  <div>
                    <p className="font-medium text-white">{dog.name}</p>
                    <p className="text-xs text-surface-500">
                      {familyMap.get(dog.family_id) || 'Unknown Family'}
                    </p>
                  </div>
                  <Plus size={16} className="text-yellow-400 ml-2" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'sent')}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="sent">Sent</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="hover:border-brand-500/30 transition-all"
            variant="bordered"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              {/* Dog & Date */}
              <div className="flex items-center gap-4">
                <Avatar name={report.dog_name} size="md" src={report.dog_photo_url} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{report.dog_name}</h3>
                    <StatusBadge
                      variant={report.status === 'sent' ? 'success' : 'warning'}
                      size="xs"
                    >
                      {report.status === 'sent' ? 'Sent' : 'Draft'}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-surface-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(report.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {report.family_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trainer & Actions */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-surface-500">{report.trainer_name}</span>

                {report.status === 'draft' ? (
                  <div className="flex gap-2">
                    <Link href={`/reports/${report.id}/edit`}>
                      <Button variant="outline" size="sm" leftIcon={<Edit size={14} />}>
                        Edit
                      </Button>
                    </Link>
                    <Button variant="primary" size="sm" leftIcon={<Send size={14} />}>
                      Send
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {report.sent_at && (
                      <span className="text-xs text-surface-500">
                        Sent {formatDate(report.sent_at, 'h:mm a')}
                      </span>
                    )}
                    <Link href={`/reports/${report.id}`}>
                      <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                        View
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all' || dateFilter
              ? 'Try adjusting your filters'
              : 'Create your first daily report'}
          </p>
          <Link href="/reports/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Create Report
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
