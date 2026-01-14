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
import {
  useDailyReports,
  useTodaysReports,
  useDraftReports,
  useReadyReports,
  useReportStats,
  useSendReport,
  useBulkSendReports,
  useMarkReportReady,
  useActiveStays,
  useGenerateReport,
} from '@/hooks';
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
  Check,
  Star,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Zap,
  Dog,
} from 'lucide-react';
import type { DailyReportWithDetails, ReportStatus } from '@/types/database';

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const { data: allReports, isLoading, error, refetch } = useDailyReports();
  const { data: todaysReports } = useTodaysReports();
  const { data: draftReports } = useDraftReports();
  const { data: readyReports } = useReadyReports();
  const { data: stats } = useReportStats();
  const { data: activeStays } = useActiveStays();

  const sendReport = useSendReport();
  const bulkSend = useBulkSendReports();
  const markReady = useMarkReportReady();
  const generateReport = useGenerateReport();

  // Dogs without today's report
  const dogsNeedingReports = useMemo(() => {
    if (!activeStays || !todaysReports) return [];
    const reportedDogIds = new Set(todaysReports.map(r => r.dog_id));
    return activeStays.filter(stay => !reportedDogIds.has(stay.dog_id));
  }, [activeStays, todaysReports]);

  const filteredReports = useMemo(() => {
    if (!allReports) return [];

    return allReports.filter((report) => {
      const matchesSearch =
        report.dog?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.auto_summary?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesDate = !dateFilter || report.report_date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allReports, searchQuery, statusFilter, dateFilter]);

  const handleSendReport = async (reportId: string) => {
    try {
      await sendReport.mutateAsync(reportId);
    } catch (err) {
      console.error('Failed to send report:', err);
    }
  };

  const handleBulkSend = async () => {
    if (selectedReports.length === 0) return;
    try {
      await bulkSend.mutateAsync(selectedReports);
      setSelectedReports([]);
    } catch (err) {
      console.error('Failed to send reports:', err);
    }
  };

  const handleMarkReady = async (reportId: string) => {
    try {
      await markReady.mutateAsync(reportId);
    } catch (err) {
      console.error('Failed to mark report ready:', err);
    }
  };

  const handleGenerateReport = async (dogId: string, programId: string | null) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await generateReport.mutateAsync({ dogId, programId, date: today });
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const toggleSelectReport = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAllReady = () => {
    if (!readyReports) return;
    setSelectedReports(readyReports.map(r => r.id));
  };

  const getMoodEmoji = (rating: number | null) => {
    if (!rating) return null;
    if (rating >= 4) return { emoji: '5', color: 'text-green-400' };
    if (rating >= 3) return { emoji: '4', color: 'text-blue-400' };
    if (rating >= 2) return { emoji: '3', color: 'text-yellow-400' };
    return { emoji: '2', color: 'text-red-400' };
  };

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
        description={`${stats?.drafts || 0} drafts, ${readyReports?.length || 0} ready to send`}
        action={
          <div className="flex gap-2">
            {selectedReports.length > 0 && (
              <Button
                variant="primary"
                leftIcon={<Send size={18} />}
                onClick={handleBulkSend}
                disabled={bulkSend.isPending}
              >
                Send {selectedReports.length} Report{selectedReports.length !== 1 ? 's' : ''}
              </Button>
            )}
            <Link href="/reports/new">
              <Button variant="secondary" leftIcon={<Plus size={18} />}>
                Create Report
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.totalToday || 0}</p>
              <p className="text-xs text-surface-500">Today&apos;s Reports</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Edit size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.drafts || 0}</p>
              <p className="text-xs text-surface-500">Drafts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{readyReports?.length || 0}</p>
              <p className="text-xs text-surface-500">Ready to Send</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Star size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.avgMoodRating?.toFixed(1) || '-'}</p>
              <p className="text-xs text-surface-500">Avg. Mood</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dogs Needing Reports */}
      {dogsNeedingReports.length > 0 && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                Generate Reports ({dogsNeedingReports.length})
              </span>
            }
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  dogsNeedingReports.forEach(stay => {
                    handleGenerateReport(stay.dog_id, stay.program_id);
                  });
                }}
                disabled={generateReport.isPending}
              >
                <Zap size={14} className="mr-1" />
                Generate All
              </Button>
            }
          />
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {dogsNeedingReports.map((stay) => (
                <button
                  key={stay.id}
                  type="button"
                  onClick={() => handleGenerateReport(stay.dog_id, stay.program_id)}
                  disabled={generateReport.isPending}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700 hover:border-amber-500/50 transition-all"
                >
                  <Avatar name={stay.dog?.name || ''} size="sm" />
                  <div className="text-left">
                    <p className="font-medium text-white">{stay.dog?.name}</p>
                    <p className="text-xs text-surface-500">
                      {stay.program?.name || 'Board & Train'}
                    </p>
                  </div>
                  <Sparkles size={16} className="text-amber-400 ml-2" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready to Send Section */}
      {readyReports && readyReports.length > 0 && (
        <Card className="mb-6 border-emerald-500/30 bg-emerald-500/5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Send size={18} className="text-emerald-400" />
                Ready to Send ({readyReports.length})
              </span>
            }
            action={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllReady}>
                  Select All
                </Button>
                {selectedReports.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleBulkSend}
                    disabled={bulkSend.isPending}
                  >
                    {bulkSend.isPending ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Send size={14} className="mr-1" />
                    )}
                    Send Selected
                  </Button>
                )}
              </div>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyReports.map((report) => (
                <div
                  key={report.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedReports.includes(report.id)
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-surface-700 hover:border-surface-600'
                  }`}
                  onClick={() => toggleSelectReport(report.id)}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedReports.includes(report.id)
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-surface-600'
                  }`}>
                    {selectedReports.includes(report.id) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <Avatar name={report.dog?.name || ''} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{report.dog?.name}</p>
                    <p className="text-xs text-surface-500">{formatDate(report.report_date)}</p>
                  </div>
                  {report.mood_rating && (
                    <div className={`text-lg ${getMoodEmoji(report.mood_rating)?.color}`}>
                      {report.mood_rating >= 4 ? '5' : report.mood_rating >= 3 ? '4' : report.mood_rating >= 2 ? '3' : '2'}/5
                    </div>
                  )}
                </div>
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ReportStatus)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="ready">Ready</option>
              <option value="sent">Sent</option>
              <option value="opened">Opened</option>
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
          <ReportCard
            key={report.id}
            report={report}
            onSend={() => handleSendReport(report.id)}
            onMarkReady={() => handleMarkReady(report.id)}
            isSending={sendReport.isPending}
          />
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

function ReportCard({
  report,
  onSend,
  onMarkReady,
  isSending,
}: {
  report: DailyReportWithDetails;
  onSend: () => void;
  onMarkReady: () => void;
  isSending: boolean;
}) {
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'draft':
        return <StatusBadge variant="warning" size="xs">Draft</StatusBadge>;
      case 'ready':
        return <StatusBadge variant="info" size="xs">Ready</StatusBadge>;
      case 'sent':
        return <StatusBadge variant="success" size="xs">Sent</StatusBadge>;
      case 'opened':
        return <StatusBadge variant="success" size="xs">Opened</StatusBadge>;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:border-brand-500/30 transition-all" variant="bordered">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        {/* Dog & Summary */}
        <div className="flex items-start gap-4 flex-1">
          <Avatar name={report.dog?.name || ''} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{report.dog?.name}</h3>
              {getStatusBadge(report.status)}
              {report.badge_earned && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                  Badge Earned
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-surface-400 mb-2">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(report.report_date)}
              </span>
              {report.mood_rating && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400" />
                  {report.mood_rating}/5 mood
                </span>
              )}
            </div>
            {report.auto_summary && (
              <p className="text-sm text-surface-500 line-clamp-2">
                {report.auto_summary}
              </p>
            )}
            {report.highlights && report.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {report.highlights.slice(0, 3).map((highlight, i) => (
                  <span
                    key={i}
                    className="text-xs bg-surface-800 text-surface-400 px-2 py-0.5 rounded"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {report.status === 'draft' && (
            <>
              <Link href={`/reports/${report.id}/edit`}>
                <Button variant="outline" size="sm" leftIcon={<Edit size={14} />}>
                  Edit
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<CheckCircle2 size={14} />}
                onClick={onMarkReady}
              >
                Mark Ready
              </Button>
            </>
          )}
          {report.status === 'ready' && (
            <>
              <Link href={`/reports/${report.id}/edit`}>
                <Button variant="ghost" size="sm" leftIcon={<Edit size={14} />}>
                  Edit
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                leftIcon={isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                onClick={onSend}
                disabled={isSending}
              >
                Send
              </Button>
            </>
          )}
          {(report.status === 'sent' || report.status === 'opened') && (
            <div className="flex items-center gap-2">
              {report.sent_at && (
                <span className="text-xs text-surface-500">
                  Sent {formatDate(report.sent_at, 'h:mm a')}
                </span>
              )}
              {report.opened_at && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Eye size={12} />
                  Viewed
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
  );
}
