'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/adminStore';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Percent,
} from 'lucide-react';

// Types
interface FailedPayment {
  id: string;
  user_email: string;
  amount: number;
  plan: string;
  failure_reason: string;
  failed_at: string;
  retry_count: number;
}

interface Transaction {
  id: string;
  user_email: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

interface BillingStats {
  mrr: number;
  mrrChange: number;
  arr: number;
  activeSubscriptions: number;
  trialUsers: number;
  churnRate: number;
  avgRevPerUser: number;
  lifetimeValue: number;
  recoveryRate: number;
}

// Empty initial state
const emptyStats: BillingStats = {
  mrr: 0,
  mrrChange: 0,
  arr: 0,
  activeSubscriptions: 0,
  trialUsers: 0,
  churnRate: 0,
  avgRevPerUser: 0,
  lifetimeValue: 0,
  recoveryRate: 0,
};

// Failure reason labels
const failureReasonLabels: Record<string, string> = {
  card_declined: 'Card Declined',
  insufficient_funds: 'Insufficient Funds',
  expired_card: 'Expired Card',
  processing_error: 'Processing Error',
  authentication_required: 'Authentication Required',
};

export default function BillingPage() {
  const { sessionToken } = useAdminStore();
  const [stats, setStats] = useState<BillingStats>(emptyStats);
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchBillingData = async () => {
    if (!sessionToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/billing', {
        headers: {
          'x-admin-session': sessionToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const data = await response.json();
      setStats(data.stats);
      setFailedPayments(data.failedPayments || []);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [sessionToken]);

  // Handle payment action
  const handlePaymentAction = async (action: string, payment: FailedPayment) => {
    if (!sessionToken) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          action,
          paymentId: payment.id,
          amount: payment.amount,
        }),
      });

      if (response.ok) {
        // Remove from failed payments list on success
        setFailedPayments((prev) => prev.filter((p) => p.id !== payment.id));
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
        title="Billing Dashboard"
        description="Revenue metrics and payment management"
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />}
            onClick={fetchBillingData}
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

      {/* Revenue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-400 mb-1">MRR</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? '...' : formatCurrency(stats.mrr)}
              </p>
              {stats.mrrChange !== 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {stats.mrrChange > 0 ? (
                    <ArrowUpRight size={14} className="text-green-400" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-400" />
                  )}
                  <span className={stats.mrrChange > 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                    {stats.mrrChange > 0 ? '+' : ''}{stats.mrrChange}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <DollarSign size={20} className="text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-400 mb-1">ARR</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? '...' : formatCurrency(stats.arr)}
              </p>
              <p className="text-surface-500 text-sm mt-2">Projected annual</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <TrendingUp size={20} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-400 mb-1">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats.activeSubscriptions}
              </p>
              <p className="text-surface-500 text-sm mt-2">{stats.trialUsers} in trial</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Users size={20} className="text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-400 mb-1">Churn Rate</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? '...' : `${stats.churnRate}%`}
              </p>
              <p className="text-surface-500 text-sm mt-2">Last 30 days</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <TrendingDown size={20} className="text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-surface-400" />
            <span className="text-sm text-surface-400">ARPU</span>
          </div>
          <p className="text-xl font-bold text-white">
            {isLoading ? '...' : formatCurrency(stats.avgRevPerUser)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-surface-400" />
            <span className="text-sm text-surface-400">LTV</span>
          </div>
          <p className="text-xl font-bold text-white">
            {isLoading ? '...' : formatCurrency(stats.lifetimeValue)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm text-surface-400">Failed Payments</span>
          </div>
          <p className="text-xl font-bold text-white">
            {isLoading ? '...' : failedPayments.length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={16} className="text-surface-400" />
            <span className="text-sm text-surface-400">Recovery Rate</span>
          </div>
          <p className="text-xl font-bold text-white">
            {isLoading ? '...' : `${stats.recoveryRate}%`}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Payments */}
        <Card>
          <div className="p-4 border-b border-surface-800 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Failed Payments</h3>
              <p className="text-sm text-surface-500">Requires attention</p>
            </div>
            {failedPayments.length > 0 && (
              <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-sm">
                {failedPayments.length} pending
              </span>
            )}
          </div>
          <div className="divide-y divide-surface-800">
            {isLoading ? (
              <div className="p-8 text-center text-surface-500">
                Loading...
              </div>
            ) : failedPayments.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
                No failed payments
              </div>
            ) : (
              failedPayments.map((payment) => (
                <div key={payment.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{payment.user_email}</p>
                      <p className="text-sm text-surface-500">{payment.plan}</p>
                    </div>
                    <p className="font-bold text-white">{formatCurrency(payment.amount)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-surface-500">
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded">
                        {failureReasonLabels[payment.failure_reason] || payment.failure_reason}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(payment.failed_at)}
                      </span>
                      <span>Retry #{payment.retry_count}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePaymentAction('retry_payment', payment)}
                        disabled={isSubmitting}
                      >
                        <RotateCcw size={12} className="mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="p-4 border-b border-surface-800">
            <h3 className="font-medium text-white">Recent Transactions</h3>
            <p className="text-sm text-surface-500">Last 24 hours</p>
          </div>
          <div className="divide-y divide-surface-800">
            {isLoading ? (
              <div className="p-8 text-center text-surface-500">
                Loading...
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                No recent transactions
              </div>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      txn.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {txn.amount >= 0 ? (
                        <ArrowUpRight size={16} className="text-green-400" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{txn.user_email}</p>
                      <p className="text-xs text-surface-500 capitalize">{txn.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${txn.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                    </p>
                    <p className="text-xs text-surface-500">{formatRelativeTime(txn.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-surface-800">
            <Button variant="outline" size="sm" className="w-full" disabled>
              View All Transactions
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-4 border-b border-surface-800">
          <h3 className="font-medium text-white">Quick Actions</h3>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" leftIcon={<Percent size={14} />} disabled>
            Create Promo Code
          </Button>
          <Button variant="outline" size="sm" leftIcon={<CreditCard size={14} />} disabled>
            Export Invoices
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Users size={14} />} disabled>
            View Subscriptions
          </Button>
          <Button variant="outline" size="sm" leftIcon={<TrendingUp size={14} />} disabled>
            Revenue Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
