'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/adminStore';
import {
  Search,
  AlertTriangle,
  Shield,
  User,
  Mail,
  Calendar,
  Dog,
  Ban,
  CheckCircle2,
  Eye,
  Lock,
  FileText,
  RefreshCw,
} from 'lucide-react';

// Types
interface UserResult {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_login?: string;
  subscription_tier?: string;
  is_suspended: boolean;
  dogs_count: number;
}

export default function UserManagementPage() {
  const { sessionToken } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchReason, setSearchReason] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim() || !searchReason.trim() || !sessionToken) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          email: searchQuery,
          reason: searchReason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else if (response.status === 403) {
        setError('Insufficient permissions to search users');
        setSearchResults([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Search failed');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Search and manage user accounts"
      />

      {/* Privacy Notice */}
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-400 mb-1">Privacy-First Design</h3>
            <p className="text-sm text-surface-400">
              User data access is logged and audited. You must provide a valid business reason
              for each search. Browsing user lists is not permitted. Only search by email address
              is allowed.
            </p>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Search Form */}
      <Card>
        <div className="p-4 border-b border-surface-800">
          <h3 className="font-medium text-white">Search Users</h3>
        </div>
        <form onSubmit={handleSearch} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter email address..."
                className="w-full pl-10 pr-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder-surface-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-400 mb-2">
              <Lock size={14} className="inline mr-1" />
              Reason for Access (Required)
            </label>
            <select
              value={searchReason}
              onChange={(e) => setSearchReason(e.target.value)}
              className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select a reason...</option>
              <option value="support_ticket">Support Ticket Resolution</option>
              <option value="billing_inquiry">Billing Inquiry</option>
              <option value="account_recovery">Account Recovery Request</option>
              <option value="moderation">Content Moderation</option>
              <option value="legal_request">Legal/Compliance Request</option>
              <option value="other">Other (specify in notes)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-surface-500">
            <FileText size={12} />
            <span>This search will be logged in the audit trail</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!searchQuery.trim() || !searchReason || isSearching}
            leftIcon={isSearching ? <RefreshCw size={14} className="animate-spin" /> : undefined}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-medium text-white">
              Search Results
              <span className="text-surface-500 font-normal ml-2">
                ({searchResults.length} found)
              </span>
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-surface-500">
              <User size={24} className="mx-auto mb-2 opacity-50" />
              No users found matching your search
            </div>
          ) : (
            <div className="divide-y divide-surface-800">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{user.name || 'Unknown'}</h4>
                        {user.is_suspended && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                            Suspended
                          </span>
                        )}
                        {user.subscription_tier && (
                          <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded text-xs">
                            {user.subscription_tier}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-surface-400 mb-2">
                        <Mail size={12} />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Joined {formatDate(user.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          Last login {formatDate(user.last_login)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Dog size={12} />
                          {user.dogs_count} dog{user.dogs_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-surface-800 flex items-center justify-between">
              <h3 className="font-medium text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-surface-500 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center">
                  <User size={24} className="text-surface-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedUser.name || 'Unknown'}</h2>
                  <p className="text-sm text-surface-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <h4 className="text-sm font-medium text-surface-400 mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-surface-500">Status</label>
                    <p className={`text-sm ${selectedUser.is_suspended ? 'text-red-400' : 'text-green-400'}`}>
                      {selectedUser.is_suspended ? 'Suspended' : 'Active'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500">Subscription</label>
                    <p className="text-sm text-white">{selectedUser.subscription_tier || 'Free'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500">Member Since</label>
                    <p className="text-sm text-white">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500">Last Login</label>
                    <p className="text-sm text-white">{formatDate(selectedUser.last_login)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500">Dogs Registered</label>
                    <p className="text-sm text-white">{selectedUser.dogs_count}</p>
                  </div>
                  <div>
                    <label className="text-xs text-surface-500">User ID</label>
                    <p className="text-sm text-white font-mono text-xs">{selectedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Protected Data Notice */}
              <div className="p-3 bg-surface-800 rounded-lg">
                <div className="flex items-center gap-2 text-surface-400 text-sm">
                  <Lock size={14} />
                  <span>Additional PII (phone, address) requires elevated access</span>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-medium text-surface-400 mb-3">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Mail size={14} className="mr-1" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <FileText size={14} className="mr-1" />
                    View Tickets
                  </Button>
                  {selectedUser.is_suspended ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-400 border-green-500/30"
                      disabled
                    >
                      <CheckCircle2 size={14} className="mr-1" />
                      Unsuspend Account
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-500/30"
                      disabled
                    >
                      <Ban size={14} className="mr-1" />
                      Suspend Account
                    </Button>
                  )}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5" />
                  <div className="text-xs text-surface-400">
                    <span className="text-amber-400 font-medium">Audit Notice:</span> Your access to
                    this user's data has been logged. Reason: {searchReason || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
