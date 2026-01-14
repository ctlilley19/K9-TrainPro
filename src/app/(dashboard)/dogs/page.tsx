'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { useDogsWithPrograms, useFamilies, useDogBadges } from '@/hooks';
import {
  Dog as DogIcon,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Calendar,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { differenceInYears, differenceInMonths, parseISO } from 'date-fns';

type ViewMode = 'grid' | 'list';

function getProgramTypeColor(type: string): 'info' | 'success' | 'purple' | 'warning' {
  switch (type) {
    case 'board_train':
      return 'info';
    case 'day_train':
      return 'success';
    case 'private_lesson':
      return 'purple';
    default:
      return 'warning';
  }
}

function getProgramTypeLabel(type: string): string {
  switch (type) {
    case 'board_train':
      return 'Board & Train';
    case 'day_train':
      return 'Day Training';
    case 'private_lesson':
      return 'Private';
    case 'group_class':
      return 'Group';
    default:
      return type;
  }
}

function calculateAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return 'Unknown age';

  const birthDate = parseISO(dateOfBirth);
  const now = new Date();
  const years = differenceInYears(now, birthDate);

  if (years >= 1) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const months = differenceInMonths(now, birthDate);
  return months === 1 ? '1 month' : `${months} months`;
}

export default function DogsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: dogs, isLoading, error, refetch } = useDogsWithPrograms();
  const { data: families } = useFamilies();

  // Create a map of family IDs to family names for display
  const familyMap = useMemo(() => {
    const map = new Map<string, string>();
    families?.forEach((family) => {
      map.set(family.id, family.name);
    });
    return map;
  }, [families]);

  const filteredDogs = useMemo(() => {
    if (!dogs) return [];

    return dogs.filter((dog) => {
      const familyName = familyMap.get(dog.family_id) || '';
      const matchesSearch =
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dog.breed?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        familyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterActive === 'all' ||
        (filterActive === 'active' && dog.activeProgram) ||
        (filterActive === 'inactive' && !dog.activeProgram);

      return matchesSearch && matchesFilter;
    });
  }, [dogs, searchQuery, filterActive, familyMap]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading dogs...</p>
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
          <h2 className="text-xl font-semibold text-white">Failed to load dogs</h2>
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
        title="Dogs"
        description="Manage all dogs in your facility"
        action={
          <Link href="/dogs/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add Dog
            </Button>
          </Link>
        }
      />

      {/* Filters Bar */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input
              placeholder="Search dogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface-800 rounded-lg">
              {(['all', 'active', 'inactive'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterActive(filter)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    filterActive === filter
                      ? 'bg-brand-500 text-white'
                      : 'text-surface-400 hover:text-white'
                  )}
                >
                  {filter === 'all' ? 'All' : filter === 'active' ? 'In Training' : 'Not Active'}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-surface-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-surface-700 text-white'
                    : 'text-surface-400 hover:text-white'
                )}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-surface-700 text-white'
                    : 'text-surface-400 hover:text-white'
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Dogs Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDogs.map((dog) => {
            const familyName = familyMap.get(dog.family_id) || 'Unknown Family';
            const age = calculateAge(dog.date_of_birth);

            return (
              <Link key={dog.id} href={`/dogs/${dog.id}`}>
                <Card
                  className="h-full hover:border-brand-500/30 transition-all cursor-pointer group"
                  variant="bordered"
                >
                  <div className="flex flex-col items-center text-center">
                    <Avatar
                      src={dog.photo_url}
                      name={dog.name}
                      size="xl"
                      className="mb-3"
                    />
                    <h3 className="font-semibold text-white text-lg group-hover:text-brand-400 transition-colors">
                      {dog.name}
                    </h3>
                    <p className="text-sm text-surface-400">{dog.breed || 'Unknown breed'}</p>
                    <p className="text-xs text-surface-500 mt-1">{familyName}</p>

                    {/* Program Status */}
                    <div className="mt-4 w-full">
                      {dog.activeProgram ? (
                        <StatusBadge variant={getProgramTypeColor(dog.activeProgram.type)}>
                          {getProgramTypeLabel(dog.activeProgram.type)}
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="default">No Active Program</StatusBadge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-surface-700 w-full">
                      <div className="flex items-center gap-1 text-surface-400">
                        <Calendar size={14} />
                        <span className="text-xs">{age}</span>
                      </div>
                      <div className="flex items-center gap-1 text-surface-400">
                        <Award size={14} />
                        <span className="text-xs">badges</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-surface-700">
            {filteredDogs.map((dog) => {
              const familyName = familyMap.get(dog.family_id) || 'Unknown Family';
              const age = calculateAge(dog.date_of_birth);

              return (
                <Link
                  key={dog.id}
                  href={`/dogs/${dog.id}`}
                  className="flex items-center justify-between p-4 hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={dog.photo_url} name={dog.name} size="md" />
                    <div>
                      <h3 className="font-medium text-white">{dog.name}</h3>
                      <p className="text-sm text-surface-400">
                        {dog.breed || 'Unknown breed'} • {familyName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {dog.activeProgram ? (
                      <div className="hidden sm:block text-right">
                        <p className="text-sm text-white">{dog.activeProgram.name}</p>
                        <StatusBadge
                          variant={getProgramTypeColor(dog.activeProgram.type)}
                          size="xs"
                        >
                          {getProgramTypeLabel(dog.activeProgram.type)}
                        </StatusBadge>
                      </div>
                    ) : (
                      <StatusBadge variant="default" size="xs">
                        No Program
                      </StatusBadge>
                    )}

                    <div className="flex items-center gap-1 text-surface-400">
                      <Calendar size={16} />
                      <span className="text-sm">{age}</span>
                    </div>

                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredDogs.length === 0 && (
        <Card className="text-center py-12">
          <DogIcon size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No dogs found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Add your first dog to get started'}
          </p>
          <Link href="/dogs/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add Dog
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
