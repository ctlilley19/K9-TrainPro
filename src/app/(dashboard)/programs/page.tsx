'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Dog,
  User,
  ChevronRight,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
} from 'lucide-react';

// Mock programs data
const mockPrograms = [
  {
    id: '1',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    family: { id: 'f1', name: 'Anderson Family' },
    type: 'board_train',
    name: '3-Week Board & Train',
    status: 'active',
    start_date: '2025-01-06',
    end_date: '2025-01-27',
    progress: 45,
    trainer: { id: 't1', name: 'Sarah Johnson' },
    price: 2500,
  },
  {
    id: '2',
    dog: { id: 'b', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
    family: { id: 'f1', name: 'Anderson Family' },
    type: 'day_train',
    name: 'Puppy Foundations',
    status: 'active',
    start_date: '2025-01-06',
    end_date: '2025-02-14',
    progress: 25,
    trainer: { id: 't2', name: 'John Smith' },
    price: 1800,
  },
  {
    id: '3',
    dog: { id: 'c', name: 'Luna', breed: 'Border Collie', photo_url: null },
    family: { id: 'f2', name: 'Martinez Family' },
    type: 'board_train',
    name: '2-Week Board & Train',
    status: 'active',
    start_date: '2025-01-08',
    end_date: '2025-01-22',
    progress: 60,
    trainer: { id: 't1', name: 'Sarah Johnson' },
    price: 1800,
  },
  {
    id: '4',
    dog: { id: 'd', name: 'Rocky', breed: 'Rottweiler', photo_url: null },
    family: { id: 'f2', name: 'Martinez Family' },
    type: 'private_lesson',
    name: 'Behavioral Consultation',
    status: 'scheduled',
    start_date: '2025-01-15',
    end_date: '2025-01-15',
    progress: 0,
    trainer: { id: 't1', name: 'Sarah Johnson' },
    price: 150,
  },
  {
    id: '5',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    family: { id: 'f1', name: 'Anderson Family' },
    type: 'private_lesson',
    name: 'Initial Evaluation',
    status: 'completed',
    start_date: '2024-12-20',
    end_date: '2024-12-20',
    progress: 100,
    trainer: { id: 't1', name: 'Sarah Johnson' },
    price: 100,
  },
];

const programTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'board_train', label: 'Board & Train' },
  { value: 'day_train', label: 'Day Training' },
  { value: 'private_lesson', label: 'Private Lessons' },
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

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPrograms = mockPrograms.filter((program) => {
    const matchesSearch =
      program.dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || program.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = mockPrograms.filter((p) => p.status === 'active').length;
  const scheduledCount = mockPrograms.filter((p) => p.status === 'scheduled').length;

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
        {filteredPrograms.map((program) => (
          <Card
            key={program.id}
            className="hover:border-brand-500/30 transition-all"
            variant="bordered"
          >
            <div className="flex flex-col lg:flex-row gap-4 p-4">
              {/* Dog & Program Info */}
              <div className="flex items-start gap-4 flex-1">
                <Avatar name={program.dog.name} size="lg" />
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
                      href={`/dogs/${program.dog.id}`}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <Dog size={14} />
                      {program.dog.name}
                    </Link>
                    <Link
                      href={`/families/${program.family.id}`}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <User size={14} />
                      {program.family.name}
                    </Link>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(program.start_date)} - {formatDate(program.end_date)}
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
                      <span className="text-brand-400">{program.progress}%</span>
                    </div>
                    <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${program.progress}%` }}
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
                  <Avatar name={program.trainer.name} size="xs" />
                  {program.trainer.name}
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    ${program.price.toLocaleString()}
                  </p>
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
        ))}
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
