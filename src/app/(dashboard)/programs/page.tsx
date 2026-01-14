'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { usePrograms, useFamilies } from '@/hooks';
import {
  Plus,
  Search,
  Calendar,
  Dog,
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';

const programTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'board_train', label: 'Board & Train' },
  { value: 'day_train', label: 'Day Training' },
  { value: 'private_lesson', label: 'Private Lessons' },
  { value: 'group_class', label: 'Group Class' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getProgramTypeLabel(type: string): string {
  switch (type) {
    case 'board_train':
      return 'Board & Train';
    case 'day_train':
      return 'Day Training';
    case 'private_lesson':
      return 'Private Lesson';
    case 'group_class':
      return 'Group Class';
    default:
      return type;
  }
}

function getStatusVariant(status: string): 'success' | 'warning' | 'default' | 'danger' {
  switch (status) {
    case 'active':
      return 'success';
    case 'scheduled':
      return 'warning';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
}

function calculateProgress(startDate: string, endDate: string | null, status: string): number {
  if (status !== 'active') {
    return status === 'completed' ? 100 : 0;
  }

  if (!endDate) return 50; // If no end date, show 50%

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const now = new Date();

  if (isBefore(now, start)) return 0;
  if (isAfter(now, end)) return 100;

  const totalDays = differenceInDays(end, start);
  const elapsedDays = differenceInDays(now, start);

  if (totalDays <= 0) return 100;
  return Math.round((elapsedDays / totalDays) * 100);
}

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: programs, isLoading, error, refetch } = usePrograms();
  const { data: families } = useFamilies();

  // Create family lookup map
  const familyMap = useMemo(() => {
    const map = new Map<string, string>();
    families?.forEach((family) => {
      map.set(family.id, family.name);
    });
    return map;
  }, [families]);

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];

    return programs.filter((program) => {
      const dogName = program.dog?.name || '';
      const familyName = program.dog?.family?.name || familyMap.get(program.dog?.family_id || '') || '';

      const matchesSearch =
        dogName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || program.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [programs, searchQuery, typeFilter, statusFilter, familyMap]);

  const activeCount = programs?.filter((p) => p.status === 'active').length || 0;
  const scheduledCount = programs?.filter((p) => p.status === 'scheduled').length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading programs...</p>
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
          <h2 className="text-xl font-semibold text-white">Failed to load programs</h2>
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
        title="Programs"
        description={`${activeCount} active, ${scheduledCount} scheduled`}
        action={
          <Link href="/programs/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              New Program
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              {programTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.map((program) => {
          const progress = calculateProgress(program.start_date, program.end_date, program.status);
          const dogName = program.dog?.name || 'Unknown Dog';
          const familyName = program.dog?.family?.name || 'Unknown Family';
          const trainerName = program.trainer?.name || 'Unassigned';

          return (
            <Card
              key={program.id}
              className="hover:border-brand-500/30 transition-all"
              variant="bordered"
            >
              <div className="flex flex-col lg:flex-row gap-4 p-4">
                {/* Dog & Program Info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar name={dogName} size="lg" src={program.dog?.photo_url} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/programs/${program.id}`}
                        className="text-lg font-semibold text-white hover:text-brand-400 transition-colors"
                      >
                        {program.name}
                      </Link>
                      <StatusBadge variant={getStatusVariant(program.status)} size="xs">
                        {program.status}
                      </StatusBadge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-400">
                      <Link
                        href={`/dogs/${program.dog_id}`}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <Dog size={14} />
                        {dogName}
                      </Link>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {familyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(program.start_date)}
                        {program.end_date && ` - ${formatDate(program.end_date)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center gap-6">
                  {/* Progress */}
                  {program.status === 'active' && (
                    <div className="w-32">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-surface-500">Progress</span>
                        <span className="text-brand-400">{progress}%</span>
                      </div>
                      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 rounded-lg bg-surface-800 text-sm text-surface-300">
                      {getProgramTypeLabel(program.type)}
                    </span>
                  </div>

                  {/* Trainer */}
                  <div className="hidden md:flex items-center gap-2 text-sm text-surface-400">
                    <Avatar name={trainerName} size="xs" src={program.trainer?.avatar_url} />
                    {trainerName}
                  </div>

                  {/* Actions */}
                  <Link href={`/programs/${program.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPrograms.length === 0 && (
        <Card className="text-center py-12">
          <Calendar size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No programs found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first program to get started'}
          </p>
          <Link href="/programs/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              New Program
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
