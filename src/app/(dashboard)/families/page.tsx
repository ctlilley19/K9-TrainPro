'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useFamilies, useDogs, useActivePrograms } from '@/hooks';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Dog,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function FamiliesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: families, isLoading, error, refetch } = useFamilies();
  const { data: dogs } = useDogs();
  const { data: programs } = useActivePrograms();

  // Create lookup maps for dogs and active programs per family
  const familyDogsMap = useMemo(() => {
    const map = new Map<string, Array<{ id: string; name: string; breed: string | null; photo_url: string | null }>>();
    dogs?.forEach((dog) => {
      const existing = map.get(dog.family_id) || [];
      existing.push({
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        photo_url: dog.photo_url,
      });
      map.set(dog.family_id, existing);
    });
    return map;
  }, [dogs]);

  const familyProgramsMap = useMemo(() => {
    const map = new Map<string, number>();
    programs?.forEach((program) => {
      const dog = dogs?.find((d) => d.id === program.dog_id);
      if (dog) {
        const count = map.get(dog.family_id) || 0;
        map.set(dog.family_id, count + 1);
      }
    });
    return map;
  }, [programs, dogs]);

  const filteredFamilies = useMemo(() => {
    if (!families) return [];

    return families.filter(
      (family) =>
        family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (family.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (family.phone || '').includes(searchQuery)
    );
  }, [families, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading families...</p>
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
          <h2 className="text-xl font-semibold text-white">Failed to load families</h2>
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
        title="Families"
        description="Manage pet parent families and their dogs"
        action={
          <Link href="/families/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add Family
            </Button>
          </Link>
        }
      />

      {/* Search Bar */}
      <Card className="mb-6" padding="sm">
        <div className="max-w-md">
          <Input
            placeholder="Search families..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
      </Card>

      {/* Families List */}
      <div className="space-y-4">
        {filteredFamilies.map((family) => {
          const familyDogs = familyDogsMap.get(family.id) || [];
          const activePrograms = familyProgramsMap.get(family.id) || 0;

          return (
            <Card
              key={family.id}
              className="hover:border-brand-500/30 transition-all"
              variant="bordered"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Family Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <Link
                      href={`/families/${family.id}`}
                      className="text-lg font-semibold text-white hover:text-brand-400 transition-colors"
                    >
                      {family.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-surface-400">
                      {family.phone && (
                        <a
                          href={`tel:${family.phone}`}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          <Phone size={14} />
                          {family.phone}
                        </a>
                      )}
                      {family.email && (
                        <a
                          href={`mailto:${family.email}`}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          <Mail size={14} />
                          {family.email}
                        </a>
                      )}
                      {family.city && family.state && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {family.city}, {family.state}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dogs & Actions */}
                <div className="flex items-center gap-6 pl-16 lg:pl-0">
                  {/* Dogs */}
                  {familyDogs.length > 0 && (
                    <div className="flex -space-x-2">
                      {familyDogs.slice(0, 3).map((dog) => (
                        <Avatar key={dog.id} name={dog.name} size="sm" src={dog.photo_url} showBorder />
                      ))}
                      {familyDogs.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-surface-600 flex items-center justify-center text-xs text-surface-300 ring-2 ring-surface-800">
                          +{familyDogs.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-surface-400">
                    <Dog size={16} />
                    <span className="text-sm">{familyDogs.length} dogs</span>
                  </div>

                  {activePrograms > 0 && (
                    <div className="hidden sm:block px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                      {activePrograms} active
                    </div>
                  )}

                  <Link href={`/families/${family.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Dogs List Preview */}
              {familyDogs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-700">
                  <div className="flex flex-wrap gap-2">
                    {familyDogs.map((dog) => (
                      <Link
                        key={dog.id}
                        href={`/dogs/${dog.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors"
                      >
                        <Avatar name={dog.name} size="xs" src={dog.photo_url} />
                        <span className="text-sm text-white">{dog.name}</span>
                        {dog.breed && (
                          <span className="text-xs text-surface-500">{dog.breed}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFamilies.length === 0 && (
        <Card className="text-center py-12">
          <Users size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No families found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Add your first family to get started'}
          </p>
          <Link href="/families/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Add Family
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
