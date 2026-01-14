'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { usePetParentHomework } from '@/hooks';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Video,
  ChevronRight,
  Dog,
  Play,
  FileText,
  Filter,
} from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'completed';

const statusConfig = {
  assigned: { label: 'Pending', color: 'blue', icon: FileText },
  in_progress: { label: 'In Progress', color: 'yellow', icon: Clock },
  completed: { label: 'Completed', color: 'green', icon: CheckCircle2 },
};

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-red-500/20 text-red-400',
};

export default function PetParentHomeworkPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const { data: homework, isLoading } = usePetParentHomework();

  const filteredHomework = homework?.filter((hw) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return hw.status !== 'completed';
    if (statusFilter === 'completed') return hw.status === 'completed';
    return true;
  });

  const pendingCount = homework?.filter((hw) => hw.status !== 'completed').length || 0;
  const completedCount = homework?.filter((hw) => hw.status === 'completed').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Homework</h1>
        <p className="text-surface-400 mt-1">Practice exercises assigned by your trainer</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Clock size={24} className="mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-xs text-surface-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{completedCount}</p>
            <p className="text-xs text-surface-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'pending', 'completed'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors',
              statusFilter === status
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700'
            )}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Homework List */}
      {isLoading ? (
        <div className="text-center py-12 text-surface-500">Loading homework...</div>
      ) : filteredHomework && filteredHomework.length > 0 ? (
        <div className="space-y-4">
          {filteredHomework.map((hw) => {
            const config = statusConfig[hw.status as keyof typeof statusConfig] || statusConfig.assigned;
            const StatusIcon = config.icon;
            const dueDate = new Date(hw.due_date);
            const isOverdue = hw.status !== 'completed' && dueDate < new Date();

            return (
              <Link
                key={hw.id}
                href={`/parent/homework/${hw.id}`}
                className="block"
              >
                <Card
                  className={cn(
                    'hover:border-white/10 transition-all',
                    isOverdue && 'border-red-500/30'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          hw.status === 'completed'
                            ? 'bg-green-500/20'
                            : isOverdue
                            ? 'bg-red-500/20'
                            : 'bg-surface-800'
                        )}
                      >
                        <BookOpen
                          size={24}
                          className={
                            hw.status === 'completed'
                              ? 'text-green-400'
                              : isOverdue
                              ? 'text-red-400'
                              : 'text-surface-400'
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{hw.title}</h3>
                          {hw.video_url && (
                            <Video size={14} className="text-blue-400 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-surface-400 line-clamp-2 mb-3">
                          {hw.description || hw.instructions}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-surface-500">
                            <Dog size={12} />
                            {hw.dog.name}
                          </span>
                          <span
                            className={cn(
                              'flex items-center gap-1',
                              isOverdue ? 'text-red-400' : 'text-surface-500'
                            )}
                          >
                            <Calendar size={12} />
                            Due: {dueDate.toLocaleDateString()}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              difficultyColors[hw.difficulty as keyof typeof difficultyColors]
                            )}
                          >
                            {hw.difficulty}
                          </span>
                        </div>

                        {hw.submissions && hw.submissions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/[0.06]">
                            <div className="flex items-center gap-2 text-xs text-surface-500">
                              <CheckCircle2 size={12} className="text-green-400" />
                              {hw.submissions.length} submission{hw.submissions.length !== 1 ? 's' : ''}
                              {hw.submissions.some((s: { status: string }) => s.status === 'approved') && (
                                <span className="text-green-400">• Approved</span>
                              )}
                            </div>
                          </div>
                        )}
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
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen size={48} className="mx-auto text-surface-600 mb-4" />
            <p className="text-surface-500">No homework assignments yet</p>
            <p className="text-sm text-surface-600 mt-2">
              Your trainer will assign homework as your dog progresses
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
