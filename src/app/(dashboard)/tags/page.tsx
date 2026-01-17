'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useFacility } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  Tag,
  Plus,
  Search,
  Link2,
  Unlink,
  ShieldX,
  ShieldCheck,
  ExternalLink,
  Package,
  Clock,
  CheckCircle,
  Loader2,
  QrCode,
} from 'lucide-react';

interface TagData {
  id: string;
  tag_code: string;
  url: string;
  status: string;
  design_type: string;
  assigned_at: string | null;
  dog: {
    id: string;
    name: string;
    breed: string;
    photo_url: string | null;
  } | null;
  order: {
    id: string;
    order_number: string;
    created_at: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'warning', icon: <Clock size={14} /> },
  production: { label: 'In Production', variant: 'info', icon: <Package size={14} /> },
  shipped: { label: 'Shipped', variant: 'info', icon: <Package size={14} /> },
  unassigned: { label: 'Unassigned', variant: 'default', icon: <Tag size={14} /> },
  active: { label: 'Active', variant: 'success', icon: <CheckCircle size={14} /> },
  deactivated: { label: 'Deactivated', variant: 'error', icon: <ShieldX size={14} /> },
};

export default function TagsPage() {
  const facility = useFacility();
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (facility?.id) {
      fetchTags();
    }
  }, [facility?.id, statusFilter]);

  async function fetchTags() {
    if (!facility?.id) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({ facilityId: facility.id });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/tags?${params}`);
      const data = await response.json();

      if (data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTagAction(tagId: string, action: string, data?: Record<string, unknown>) {
    setActionLoading(tagId);
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        await fetchTags();
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.tag_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.dog?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: tags.length,
    active: tags.filter((t) => t.status === 'active').length,
    unassigned: tags.filter((t) => t.status === 'unassigned').length,
    pending: tags.filter((t) => ['pending', 'production', 'shipped'].includes(t.status)).length,
  };

  return (
    <div>
      <PageHeader
        title="NFC Tags"
        description="Manage your NFC dog tags"
        action={
          <Link href="/tags/order">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Order Tags
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Tag size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Tags</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Active</p>
              <p className="text-xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center">
              <Unlink size={20} className="text-surface-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Unassigned</p>
              <p className="text-xl font-bold text-white">{stats.unassigned}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Package size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">In Transit</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by tag ID or dog name..."
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
              <option value="active">Active</option>
              <option value="unassigned">Unassigned</option>
              <option value="pending">Pending</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tags List */}
      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        </Card>
      ) : filteredTags.length > 0 ? (
        <div className="space-y-3">
          {filteredTags.map((tag) => {
            const statusConfig = STATUS_CONFIG[tag.status] || STATUS_CONFIG.unassigned;

            return (
              <Card
                key={tag.id}
                className={cn(
                  'hover:border-brand-500/30 transition-all',
                  tag.status === 'deactivated' && 'opacity-60'
                )}
                variant="bordered"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                  {/* Tag Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center">
                      <QrCode size={24} className="text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-brand-400">{tag.tag_code}</span>
                        <StatusBadge variant={statusConfig.variant as 'success' | 'warning' | 'danger' | 'info' | 'default'} size="xs">
                          {statusConfig.label}
                        </StatusBadge>
                      </div>
                      {tag.dog ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={tag.dog.name} src={tag.dog.photo_url} size="xs" />
                          <span className="font-medium text-white">{tag.dog.name}</span>
                          <span className="text-surface-500">•</span>
                          <span className="text-sm text-surface-400">{tag.dog.breed}</span>
                        </div>
                      ) : (
                        <p className="text-surface-500 text-sm">Not assigned to a dog</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tag.url, '_blank')}
                      leftIcon={<ExternalLink size={14} />}
                    >
                      View
                    </Button>

                    {tag.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTagAction(tag.id, 'unassign')}
                        isLoading={actionLoading === tag.id}
                        leftIcon={<Unlink size={14} />}
                      >
                        Unassign
                      </Button>
                    )}

                    {tag.status === 'unassigned' && (
                      <Link href={`/tags/${tag.id}/assign`}>
                        <Button variant="primary" size="sm" leftIcon={<Link2 size={14} />}>
                          Assign
                        </Button>
                      </Link>
                    )}

                    {tag.status !== 'deactivated' && tag.status !== 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTagAction(tag.id, 'deactivate', { reason: 'Manual deactivation' })}
                        isLoading={actionLoading === tag.id}
                        leftIcon={<ShieldX size={14} />}
                        className="text-red-400 hover:text-red-300"
                      >
                        Deactivate
                      </Button>
                    )}

                    {tag.status === 'deactivated' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTagAction(tag.id, 'reactivate')}
                        isLoading={actionLoading === tag.id}
                        leftIcon={<ShieldCheck size={14} />}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Tag size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No tags found</h3>
          <p className="text-surface-400 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Order your first batch of NFC tags'}
          </p>
          <Link href="/tags/order">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Order Tags
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
