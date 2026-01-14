'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import {
  GitCompare,
  Plus,
  Search,
  Eye,
  Share2,
  Star,
  Play,
  Image,
  Calendar,
  TrendingUp,
  ExternalLink,
  MoreVertical,
  Copy,
  Trash2,
} from 'lucide-react';

// Mock comparisons
const mockComparisons = [
  {
    id: '1',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    title: "Max's Heel Transformation",
    description: 'Watch the amazing progress in loose leash walking!',
    skill: 'Heel',
    before_media: { type: 'video', url: '/before.mp4', thumbnail_url: null },
    after_media: { type: 'video', url: '/after.mp4', thumbnail_url: null },
    before_date: '2024-12-15',
    after_date: '2025-01-10',
    before_skill_level: 1,
    after_skill_level: 5,
    is_public: true,
    is_featured: true,
    views_count: 245,
    created_at: '2025-01-10T12:00:00Z',
  },
  {
    id: '2',
    dog: { id: 'b', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
    title: "Bella's Recall Journey",
    description: 'From ignoring calls to coming every time!',
    skill: 'Recall',
    before_media: { type: 'image', url: '/before.jpg', thumbnail_url: null },
    after_media: { type: 'image', url: '/after.jpg', thumbnail_url: null },
    before_date: '2025-01-05',
    after_date: '2025-01-12',
    before_skill_level: 2,
    after_skill_level: 4,
    is_public: true,
    is_featured: false,
    views_count: 89,
    created_at: '2025-01-12T14:00:00Z',
  },
  {
    id: '3',
    dog: { id: 'c', name: 'Luna', breed: 'Border Collie', photo_url: null },
    title: "Luna's Training Journey",
    description: 'See the complete transformation!',
    skill: 'Overall',
    before_media: { type: 'video', url: '/before.mp4', thumbnail_url: null },
    after_media: { type: 'video', url: '/after.mp4', thumbnail_url: null },
    before_date: '2024-11-01',
    after_date: '2025-01-08',
    before_skill_level: 0,
    after_skill_level: 5,
    is_public: false,
    is_featured: false,
    views_count: 12,
    created_at: '2025-01-08T10:00:00Z',
  },
];

const skillLevelLabels = ['Not Started', 'Introduced', 'Learning', 'Developing', 'Proficient', 'Mastered'];

export default function ComparisonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'featured'>('all');

  const filteredComparisons = mockComparisons.filter((comp) => {
    const matchesSearch =
      comp.dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'public' && comp.is_public) ||
      (filter === 'featured' && comp.is_featured);
    return matchesSearch && matchesFilter;
  });

  const copyShareLink = (id: string) => {
    const link = `${window.location.origin}/showcase/compare/${id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <div>
      <PageHeader
        title="Before & After"
        description="Showcase training transformations"
        action={
          <Link href="/comparisons/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Create Comparison
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-brand-400">
            {mockComparisons.length}
          </div>
          <div className="text-sm text-surface-400">Total Comparisons</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-green-400">
            {mockComparisons.filter((c) => c.is_public).length}
          </div>
          <div className="text-sm text-surface-400">Public</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-yellow-400">
            {mockComparisons.filter((c) => c.is_featured).length}
          </div>
          <div className="text-sm text-surface-400">Featured</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-purple-400">
            {mockComparisons.reduce((sum, c) => sum + c.views_count, 0)}
          </div>
          <div className="text-sm text-surface-400">Total Views</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search comparisons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'public', 'featured'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'public' ? 'Public' : 'Featured'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Comparisons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComparisons.map((comparison) => (
          <Card
            key={comparison.id}
            className="overflow-hidden hover:border-brand-500/30 transition-all"
            variant="bordered"
          >
            {/* Preview */}
            <div className="relative aspect-video bg-surface-800">
              <div className="absolute inset-0 grid grid-cols-2">
                {/* Before */}
                <div className="relative border-r border-surface-700">
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-800">
                    {comparison.before_media.type === 'video' ? (
                      <Play size={32} className="text-surface-500" />
                    ) : (
                      <Image size={32} className="text-surface-500" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2">
                    <span className="text-xs text-white/80">Before</span>
                  </div>
                </div>
                {/* After */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-800">
                    {comparison.after_media.type === 'video' ? (
                      <Play size={32} className="text-surface-500" />
                    ) : (
                      <Image size={32} className="text-surface-500" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2">
                    <span className="text-xs text-white/80">After</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {comparison.is_featured && (
                  <span className="px-2 py-0.5 rounded bg-yellow-500/90 text-yellow-900 text-xs font-medium flex items-center gap-1">
                    <Star size={10} /> Featured
                  </span>
                )}
                {comparison.is_public && (
                  <span className="px-2 py-0.5 rounded bg-green-500/90 text-green-900 text-xs font-medium">
                    Public
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={comparison.dog.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {comparison.title}
                  </h3>
                  <p className="text-sm text-surface-400">
                    {comparison.dog.name} • {comparison.skill}
                  </p>
                </div>
              </div>

              {/* Skill Progress */}
              {comparison.before_skill_level !== undefined && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-surface-800/50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-surface-500">
                        {skillLevelLabels[comparison.before_skill_level]}
                      </span>
                      <span className="text-green-400">
                        {skillLevelLabels[comparison.after_skill_level!]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                          style={{
                            width: `${(comparison.after_skill_level! / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <TrendingUp size={14} className="text-green-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-surface-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {comparison.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(comparison.created_at, 'MMM d')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyShareLink(comparison.id)}
                  >
                    <Share2 size={14} />
                  </Button>
                  <Link href={`/comparisons/${comparison.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <ExternalLink size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredComparisons.length === 0 && (
        <Card className="text-center py-12">
          <GitCompare size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No comparisons found
          </h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first before & after comparison'}
          </p>
          <Link href="/comparisons/new">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Create Comparison
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
