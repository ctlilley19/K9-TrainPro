'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  useHomeworkAssignments,
  useHomeworkDashboardStats,
  usePendingHomeworkReviews,
  useOverdueHomework,
} from '@/hooks';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Play,
  Eye,
  MessageSquare,
  Dog,
  ChevronRight,
  Inbox,
  ListTodo,
} from 'lucide-react';

type FilterStatus = 'all' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

const statusConfig = {
  assigned: { label: 'Assigned', color: 'blue', icon: FileText },
  in_progress: { label: 'In Progress', color: 'yellow', icon: Clock },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'red', icon: AlertCircle },
  draft: { label: 'Draft', color: 'gray', icon: FileText },
};

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

export default function HomeworkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const { data: assignments, isLoading: assignmentsLoading } = useHomeworkAssignments();
  const { data: stats } = useHomeworkDashboardStats();
  const { data: pendingReviews } = usePendingHomeworkReviews();
  const { data: overdueAssignments } = useOverdueHomework();

  const filteredAssignments = assignments?.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.dog?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      assignment.status === statusFilter ||
      (statusFilter === 'overdue' && assignment.status !== 'completed' && new Date(assignment.due_date) < new Date());
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        description="Manage homework assignments for pet parents"
        action={
          <div className="flex gap-3">
            <Link href="/homework/templates">
              <Button variant="secondary" leftIcon={<ListTodo size={18} />}>
                Templates
              </Button>
            </Link>
            <Link href="/homework/new">
              <Button variant="primary" leftIcon={<Plus size={18} />}>
                New Assignment
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <BookOpen size={24} className="mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.totalAssignments || 0}</p>
            <p className="text-xs text-surface-500">Total Assignments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock size={24} className="mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.pendingAssignments || 0}</p>
            <p className="text-xs text-surface-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/20">
          <CardContent className="p-4 text-center">
            <AlertCircle size={24} className="mx-auto text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.overdueAssignments || 0}</p>
            <p className="text-xs text-surface-500">Overdue</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.completedThisWeek || 0}</p>
            <p className="text-xs text-surface-500">Completed This Week</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Inbox size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.pendingReviews || 0}</p>
            <p className="text-xs text-surface-500">Pending Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Section */}
      {pendingReviews && pendingReviews.length > 0 && (
        <Card className="border-purple-500/30">
          <CardHeader
            title="Submissions Pending Review"
            icon={<MessageSquare className="text-purple-400" />}
          />
          <CardContent>
            <div className="space-y-3">
              {pendingReviews.slice(0, 3).map((submission: { id: string; assignment?: { dog?: { name?: string }; title?: string }; created_at?: string }) => (
                <Link
                  key={submission.id}
                  href={`/homework/${submission.assignment?.id || submission.id}?review=${submission.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Dog size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {submission.assignment?.dog?.name || 'Unknown'} submitted homework
                    </p>
                    <p className="text-xs text-surface-500">
                      {submission.assignment?.title || 'Assignment'} • {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Review
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Assignments Alert */}
      {overdueAssignments && overdueAssignments.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader
            title="Overdue Assignments"
            icon={<AlertCircle className="text-red-400" />}
          />
          <CardContent>
            <div className="space-y-3">
              {overdueAssignments.slice(0, 3).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/homework/${assignment.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 transition-colors"
                >
                  <Avatar name={assignment.dog?.name || ''} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{assignment.title}</p>
                    <p className="text-xs text-red-400">
                      Due: {new Date(assignment.due_date).toLocaleDateString()} • {assignment.dog?.name}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-surface-500" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <Card>
        <CardHeader
          title="All Assignments"
          action={
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="w-56"
            />
          }
        />
        <CardContent>
          {/* Status Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'assigned', 'in_progress', 'completed', 'overdue'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  statusFilter === status
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
                )}
              >
                {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig]?.label || status}
              </button>
            ))}
          </div>

          {/* Assignments Grid */}
          {assignmentsLoading ? (
            <div className="text-center py-12 text-surface-500">Loading assignments...</div>
          ) : filteredAssignments && filteredAssignments.length > 0 ? (
            <div className="space-y-3">
              {filteredAssignments.map((assignment) => {
                const config = statusConfig[assignment.status as keyof typeof statusConfig] || statusConfig.assigned;
                const StatusIcon = config.icon;
                const isOverdue = assignment.status !== 'completed' && new Date(assignment.due_date) < new Date();

                return (
                  <Link
                    key={assignment.id}
                    href={`/homework/${assignment.id}`}
                    className={cn(
                      'block p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-all border border-transparent',
                      isOverdue && 'border-red-500/30'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar name={assignment.dog?.name || ''} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">{assignment.title}</h3>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              difficultyColors[assignment.difficulty as keyof typeof difficultyColors]
                            )}
                          >
                            {assignment.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-surface-400 line-clamp-1 mb-2">
                          {assignment.description || assignment.instructions}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Dog size={12} />
                            {assignment.dog?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          {assignment.submissions && assignment.submissions.length > 0 && (
                            <span className="flex items-center gap-1 text-purple-400">
                              <MessageSquare size={12} />
                              {assignment.submissions.length} submission{assignment.submissions.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            isOverdue
                              ? 'bg-red-500/20 text-red-400'
                              : config.color === 'blue'
                              ? 'bg-blue-500/20 text-blue-400'
                              : config.color === 'yellow'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : config.color === 'green'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-surface-700 text-surface-400'
                          )}
                        >
                          <StatusIcon size={12} />
                          {isOverdue ? 'Overdue' : config.label}
                        </span>
                        <ChevronRight size={18} className="text-surface-500" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-surface-600 mb-4" />
              <p className="text-surface-500">No assignments found</p>
              <Link href="/homework/new">
                <Button variant="secondary" className="mt-4" leftIcon={<Plus size={16} />}>
                  Create First Assignment
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
