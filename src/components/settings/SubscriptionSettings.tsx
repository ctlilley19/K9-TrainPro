'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useFacility, useIsDemoMode } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { redirectToCheckout, redirectToCustomerPortal } from '@/lib/stripe-client';
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Users,
  Star,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
  Crown,
  Sparkles,
} from 'lucide-react';
import { PlanChangeConfirmModal } from './PlanChangeConfirmModal';

// Tier configuration (client-side version)
const BUSINESS_TIERS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 49,
    annualPrice: 499.80,
    features: [
      'Up to 10 active dogs',
      'Basic training board',
      'Daily reports',
      'Photo uploads',
      'Email support',
    ],
    limits: { activeDogs: 10, trainers: 2, freeTags: 0 },
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 99,
    annualPrice: 1009.80,
    features: [
      'Up to 30 active dogs',
      'Advanced training board',
      'Video library',
      'Homework system',
      'Custom branding',
      'Priority support',
    ],
    limits: { activeDogs: 30, trainers: 5, freeTags: 5 },
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 199,
    annualPrice: 2030,
    features: [
      'Unlimited active dogs',
      'All Pro features',
      'Multi-location support',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: { activeDogs: -1, trainers: -1, freeTags: 20 },
  },
};

type TierKey = keyof typeof BUSINESS_TIERS;

interface SubscriptionData {
  tier: string;
  status: string;
  billingInterval: 'month' | 'year';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

interface Invoice {
  id: string;
  invoice_date: string;
  total: number;
  status: string;
  stripe_hosted_invoice_url: string | null;
  stripe_invoice_pdf: string | null;
}

export function SubscriptionSettings() {
  const facility = useFacility();
  const isDemoMode = useIsDemoMode();
  const facilityId = facility?.id;
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [error, setError] = useState<string | null>(null);

  // Plan change confirmation modal state
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [pendingTierChange, setPendingTierChange] = useState<TierKey | null>(null);

  useEffect(() => {
    if (facilityId) {
      fetchSubscriptionData();
      fetchInvoices();
    }
  }, [facilityId]);

  async function fetchSubscriptionData() {
    if (!facilityId) return;

    try {
      const { data, error } = await supabase
        .from('facilities')
        .select(`
          subscription_tier,
          subscription_status,
          billing_interval,
          current_period_end,
          cancel_at_period_end,
          stripe_customer_id
        `)
        .eq('id', facilityId)
        .single();

      if (error) throw error;

      const facilityData = data as {
        subscription_tier?: string;
        subscription_status?: string;
        billing_interval?: 'year' | 'month';
        current_period_end?: string | null;
        cancel_at_period_end?: boolean;
        stripe_customer_id?: string | null;
      };

      setSubscription({
        tier: facilityData.subscription_tier || 'starter',
        status: facilityData.subscription_status || 'active',
        billingInterval: facilityData.billing_interval || 'month',
        currentPeriodEnd: facilityData.current_period_end ?? null,
        cancelAtPeriodEnd: facilityData.cancel_at_period_end || false,
        stripeCustomerId: facilityData.stripe_customer_id ?? null,
      });
    } catch (err) {
      console.error('Error fetching subscription:', err);
      // Use default values for demo
      setSubscription({
        tier: 'professional',
        status: 'active',
        billingInterval: 'month',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoices() {
    if (!facilityId) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_date, total, status, stripe_hosted_invoice_url, stripe_invoice_pdf')
        .eq('facility_id', facilityId)
        .order('invoice_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      // Use mock data for demo
      setInvoices([
        { id: '1', invoice_date: '2025-01-01', total: 9900, status: 'paid', stripe_hosted_invoice_url: null, stripe_invoice_pdf: null },
        { id: '2', invoice_date: '2024-12-01', total: 9900, status: 'paid', stripe_hosted_invoice_url: null, stripe_invoice_pdf: null },
        { id: '3', invoice_date: '2024-11-01', total: 9900, status: 'paid', stripe_hosted_invoice_url: null, stripe_invoice_pdf: null },
      ]);
    }
  }

  // Show confirmation modal before plan change
  function handleUpgrade(tier: TierKey) {
    setPendingTierChange(tier);
    setShowPlanChangeModal(true);
  }

  // Process the actual upgrade after confirmation
  async function handleConfirmedUpgrade(
    accountType: 'family' | 'business',
    details: { accountType: 'family' | 'business'; businessName?: string; phone?: string }
  ) {
    if (!facilityId || !pendingTierChange) return;

    const tier = pendingTierChange;
    setUpgradeLoading(tier);
    setError(null);

    try {
      // First, update the account details
      const updateData: Record<string, string | undefined> = {};
      if (details.phone) updateData.phone = details.phone;
      if (details.businessName) updateData.name = details.businessName;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('facilities')
          .update(updateData)
          .eq('id', facilityId);

        if (updateError) {
          console.error('Error updating facility details:', updateError);
        }
      }

      // Then proceed with the checkout
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          tier,
          billingInterval,
          accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.sessionId) {
        // Use Stripe.js redirect
        await redirectToCheckout(data.sessionId);
      }
    } catch (err) {
      console.error('Error starting checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setUpgradeLoading(null);
      setShowPlanChangeModal(false);
      setPendingTierChange(null);
    }
  }

  async function handleManageBilling() {
    if (!facilityId) return;

    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      if (data.url) {
        await redirectToCustomerPortal(data.url);
      }
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  }

  function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = subscription?.tier as TierKey || 'starter';
  const currentTierConfig = BUSINESS_TIERS[currentTier] || BUSINESS_TIERS.starter;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader title="Current Plan" />
        <CardContent>
          <div className="p-6 rounded-xl bg-gradient-to-r from-brand-500/20 to-purple-500/20 border border-brand-500/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={20} className="text-brand-400" />
                  <p className="text-sm text-brand-400">Current Plan</p>
                </div>
                <p className="text-2xl font-bold text-white">{currentTierConfig.name}</p>
                <p className="text-surface-400 mt-1">
                  {formatCurrency(currentTierConfig.monthlyPrice * 100)}/month
                  {subscription?.billingInterval === 'year' && ' (billed annually)'}
                </p>
                {subscription?.currentPeriodEnd && (
                  <p className="text-sm text-surface-500 mt-2">
                    {subscription.cancelAtPeriodEnd
                      ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                      : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge
                  variant={subscription?.status === 'active' ? 'success' : 'warning'}
                  size="sm"
                >
                  {subscription?.status || 'active'}
                </StatusBadge>
                {subscription?.stripeCustomerId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    isLoading={portalLoading}
                    leftIcon={<ExternalLink size={14} />}
                  >
                    Manage Billing
                  </Button>
                )}
              </div>
            </div>

            {/* Current Plan Features */}
            <div className="mt-6 pt-6 border-t border-surface-700">
              <p className="text-sm font-medium text-surface-300 mb-3">Your features:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {currentTierConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-surface-400">
                    <Check size={14} className="text-green-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      <Card>
        <CardHeader
          title="Available Plans"
          action={
            <div className="flex items-center bg-surface-800 rounded-lg p-1">
              <button
                onClick={() => setBillingInterval('month')}
                className={cn(
                  'px-4 py-2 text-sm rounded-md transition-colors',
                  billingInterval === 'month'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-white'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={cn(
                  'px-4 py-2 text-sm rounded-md transition-colors',
                  billingInterval === 'year'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-white'
                )}
              >
                Annual
                <span className="ml-1 text-xs text-green-400">Save 15%</span>
              </button>
            </div>
          }
        />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {(Object.entries(BUSINESS_TIERS) as [TierKey, typeof BUSINESS_TIERS[TierKey]][]).map(
              ([tierKey, tier]) => {
                const isCurrent = tierKey === currentTier;
                const price = billingInterval === 'year' ? tier.annualPrice / 12 : tier.monthlyPrice;
                const isPopular = 'popular' in tier && tier.popular;

                return (
                  <div
                    key={tierKey}
                    className={cn(
                      'relative p-6 rounded-xl border transition-all',
                      isCurrent
                        ? 'bg-brand-500/10 border-brand-500/50'
                        : 'bg-surface-800/50 border-surface-700 hover:border-surface-600',
                      isPopular && !isCurrent && 'border-purple-500/50'
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-medium bg-purple-500 text-white rounded-full flex items-center gap-1">
                          <Sparkles size={12} />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-white">
                          ${Math.round(price)}
                        </span>
                        <span className="text-surface-400">/month</span>
                      </div>
                      {billingInterval === 'year' && (
                        <p className="text-sm text-green-400 mt-1">
                          ${tier.annualPrice.toFixed(0)} billed annually
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-surface-300">
                          <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {tier.limits.freeTags > 0 && (
                      <p className="text-xs text-surface-500 mb-4">
                        Includes {tier.limits.freeTags} free NFC tags/month
                      </p>
                    )}

                    <Button
                      variant={isCurrent ? 'outline' : isPopular ? 'primary' : 'secondary'}
                      className="w-full"
                      disabled={isCurrent}
                      isLoading={upgradeLoading === tierKey}
                      onClick={() => handleUpgrade(tierKey)}
                    >
                      {isCurrent ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {subscription?.stripeCustomerId && (
        <Card>
          <CardHeader
            title="Payment Method"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManageBilling}
                isLoading={portalLoading}
              >
                Update
              </Button>
            }
          />
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50">
              <div className="w-12 h-8 rounded bg-surface-700 flex items-center justify-center">
                <CreditCard size={20} className="text-surface-400" />
              </div>
              <div>
                <p className="font-medium text-white">Manage in Stripe Portal</p>
                <p className="text-sm text-surface-500">
                  Click &quot;Update&quot; to manage your payment methods
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader title="Billing History" />
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                >
                  <span className="text-surface-400">{formatDate(invoice.invoice_date)}</span>
                  <span className="text-white">{formatCurrency(invoice.total)}</span>
                  <StatusBadge
                    variant={invoice.status === 'paid' ? 'success' : 'warning'}
                    size="xs"
                  >
                    {invoice.status}
                  </StatusBadge>
                  <div className="flex gap-2">
                    {invoice.stripe_hosted_invoice_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.stripe_hosted_invoice_url!, '_blank')}
                        leftIcon={<ExternalLink size={14} />}
                      >
                        View
                      </Button>
                    )}
                    {invoice.stripe_invoice_pdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.stripe_invoice_pdf!, '_blank')}
                        leftIcon={<Download size={14} />}
                      >
                        PDF
                      </Button>
                    )}
                    {!invoice.stripe_hosted_invoice_url && !invoice.stripe_invoice_pdf && (
                      <Button variant="ghost" size="sm" disabled>
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-surface-500 py-8">No billing history yet</p>
          )}
        </CardContent>
      </Card>

      {/* Plan Change Confirmation Modal */}
      {pendingTierChange && (
        <PlanChangeConfirmModal
          isOpen={showPlanChangeModal}
          onClose={() => {
            setShowPlanChangeModal(false);
            setPendingTierChange(null);
          }}
          onConfirm={handleConfirmedUpgrade}
          currentTier={currentTier}
          newTier={pendingTierChange}
          newTierName={BUSINESS_TIERS[pendingTierChange].name}
          isUpgrade={
            Object.keys(BUSINESS_TIERS).indexOf(pendingTierChange) >
            Object.keys(BUSINESS_TIERS).indexOf(currentTier)
          }
        />
      )}
    </div>
  );
}
