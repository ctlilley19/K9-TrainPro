'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/adminStore';
import {
  Flag,
  Eye,
  Trash2,
  AlertTriangle,
  Ban,
  MessageSquare,
  Image,
  User,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

// Types
interface FlaggedContent {
  id: string;
  content_type: 'post' | 'comment' | 'image' | 'profile';
  content_preview: string;
  user_id: string;
  user_email: string;
  user_name: string;
  reason: string;
  reported_by: string;
  reported_at: string;
  status: 'pending' | 'reviewed' | 'removed' | 'dismissed';
  user_strikes: number;
}

interface Stats {
  pending: number;
  reviewed: number;
  removed: number;
  dismissed: number;
  banned: number;
}

// Content type icons
const contentTypeIcons: Record<string, React.ReactNode> = {
  post: <MessageSquare size={14} />,
  comment: <MessageSquare size={14} />,
  image: <Image size={14} />,
  profile: <User size={14} />,
};

// Status config
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  removed: { label: 'Removed', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  dismissed: { label: 'Dismissed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
};

export default function ModeratePage() {
  const { sessionToken } = useAdminStore();
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, reviewed: 0, removed: 0, dismissed: 0, banned: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FlaggedContent | null>(null);
  const [actionModal, setActionModal] = useState<{ type: string; item: FlaggedContent } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState<string | null>(null);

  // Fetch flagged content
  const fetchFlaggedContent = async () => {
    if (!sessionToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/moderation?status=${filter}`, {
        headers: {
          'x-admin-session': sessionToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlaggedContent(data.flaggedContent || []);
        setStats(data.stats || { pending: 0, reviewed: 0, removed: 0, dismissed: 0, banned: 0 });
      } else if (response.status === 403) {
        setError('Insufficient permissions to view moderation queue');
      } else {
        setError('Failed to load moderation queue');
      }
    } catch (err) {
      console.error('Error fetching flagged content:', err);
      setError('Failed to load moderation queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedContent();
  }, [sessionToken, filter]);

  // Handle moderation action
  const handleAction = async (action: string, item: FlaggedContent, note?: string) => {
    if (!sessionToken) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          action,
          contentId: item.id,
          userId: item.user_id,
          note,
        }),
      });

      if (response.ok) {
        // Update local state
        setFlaggedContent((prev) =>
          prev.map((c) => {
            if (c.id === item.id) {
              switch (action) {
                case 'remove':
                  return { ...c, status: 'removed' as const };
                case 'dismiss':
                  return { ...c, status: 'dismissed' as const };
                case 'warn':
                  return { ...c, status: 'reviewed' as const, user_strikes: c.user_strikes + 1 };
                case 'ban':
                  return { ...c, status: 'removed' as const };
                default:
                  return c;
              }
            }
            return c;
          })
        );

        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          [action === 'dismiss' ? 'dismissed' : action === 'remove' || action === 'ban' ? 'removed' : 'reviewed']:
            prev[action === 'dismiss' ? 'dismissed' : action === 'remove' || action === 'ban' ? 'removed' : 'reviewed'] + 1,
        }));
      }

      setActionModal(null);
      setActionNote('');
    } catch (err) {
      console.error('Error performing action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Moderation"
        description="Review and moderate flagged content"
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />}
            onClick={fetchFlaggedContent}
            disabled={isLoading}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Flag size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Pending Review</p>
              <p className="text-xl font-bold text-white">{isLoading ? '...' : stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Removed</p>
              <p className="text-xl font-bold text-white">{isLoading ? '...' : stats.removed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Reviewed</p>
              <p className="text-xl font-bold text-white">{isLoading ? '...' : stats.reviewed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Ban size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Users Banned</p>
              <p className="text-xl font-bold text-white">{isLoading ? '...' : stats.banned}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Flagged Content Queue */}
      <Card>
        <div className="p-4 border-b border-surface-800">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Flagged Content Queue</h3>
            <div className="flex bg-surface-800 rounded-lg p-1">
              {['pending', 'reviewed', 'removed', 'all'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors capitalize ${
                    filter === status
                      ? 'bg-brand-500 text-white'
                      : 'text-surface-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-surface-800">
          {isLoading ? (
            <div className="p-8 text-center text-surface-500">
              <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
              Loading moderation queue...
            </div>
          ) : flaggedContent.length === 0 ? (
            <div className="p-8 text-center text-surface-500">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
              No flagged content to review
            </div>
          ) : (
            flaggedContent.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Content Type Icon */}
                  <div className="p-2 bg-surface-800 rounded-lg text-surface-400">
                    {contentTypeIcons[item.content_type] || <MessageSquare size={14} />}
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded border ${statusConfig[item.status]?.color}`}>
                        {statusConfig[item.status]?.label}
                      </span>
                      <span className="text-xs text-surface-500 capitalize">{item.content_type}</span>
                      {item.user_strikes > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                          {item.user_strikes} strike{item.user_strikes !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-white mb-2 line-clamp-2">{item.content_preview}</p>

                    <div className="flex items-center gap-4 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {item.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag size={12} />
                        {item.reason}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(item.reported_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('dismiss', item)}
                        className="text-green-400 border-green-500/30"
                      >
                        <CheckCircle2 size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionModal({ type: 'remove', item })}
                        className="text-red-400 border-red-500/30"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <div className="p-4 border-b border-surface-800 flex items-center justify-between">
              <h3 className="font-medium text-white">Content Review</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-surface-500 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Content */}
              <div>
                <label className="text-xs text-surface-500 mb-1 block">Flagged Content</label>
                <div className="p-4 bg-surface-800 rounded-lg">
                  <p className="text-white">{selectedItem.content_preview}</p>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-surface-500">Posted By</label>
                  <p className="text-sm text-white">{selectedItem.user_name}</p>
                  <p className="text-xs text-surface-500">{selectedItem.user_email}</p>
                </div>
                <div>
                  <label className="text-xs text-surface-500">Reported By</label>
                  <p className="text-sm text-white">{selectedItem.reported_by}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-surface-500">Reason</label>
                  <p className="text-sm text-white">{selectedItem.reason}</p>
                </div>
                <div>
                  <label className="text-xs text-surface-500">User Strikes</label>
                  <p className="text-sm text-white">{selectedItem.user_strikes}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-surface-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleAction('dismiss', selectedItem);
                    setSelectedItem(null);
                  }}
                  className="text-green-400 border-green-500/30"
                >
                  <CheckCircle2 size={14} className="mr-1" />
                  Dismiss Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setActionModal({ type: 'warn', item: selectedItem });
                  }}
                  className="text-amber-400 border-amber-500/30"
                >
                  <AlertTriangle size={14} className="mr-1" />
                  Warn User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setActionModal({ type: 'remove', item: selectedItem });
                  }}
                  className="text-red-400 border-red-500/30"
                >
                  <Trash2 size={14} className="mr-1" />
                  Remove Content
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setActionModal({ type: 'ban', item: selectedItem });
                  }}
                  className="text-red-400 border-red-500/30"
                >
                  <Ban size={14} className="mr-1" />
                  Ban User
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-medium text-white capitalize">{actionModal.type} Content</h3>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-surface-400">
                {actionModal.type === 'remove' && 'This will remove the content and notify the user.'}
                {actionModal.type === 'warn' && 'This will issue a warning strike to the user.'}
                {actionModal.type === 'ban' && 'This will permanently ban the user from the platform.'}
              </p>
              <div>
                <label className="text-sm text-surface-400 mb-2 block">Note (optional)</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Add a note about this action..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActionModal(null);
                    setActionNote('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction(actionModal.type, actionModal.item, actionNote)}
                  disabled={isSubmitting}
                  className={actionModal.type === 'ban' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${actionModal.type}`}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
