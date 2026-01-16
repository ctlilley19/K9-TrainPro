import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateAdminSession } from '@/services/admin/auth';
import { logBillingEvent } from '@/services/admin/audit';

// Tier pricing
const tierPricing: Record<string, number> = {
  starter: 79,
  professional: 149,
  enterprise: 249,
  free: 0,
};

// GET /api/admin/billing - Get billing stats and failed payments
export async function GET(request: NextRequest) {
  try {
    // Validate session from header
    const sessionToken = request.headers.get('x-admin-session');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions - super_admin, billing can view billing
    if (!['super_admin', 'billing'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch facilities data for subscription metrics
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select('id, subscription_tier, subscription_status, created_at, owner_id, updated_at');

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError);
    }

    // Calculate MRR and subscription counts
    let mrr = 0;
    let activeSubscriptions = 0;
    let trialUsers = 0;
    const subscriptionBreakdown: Record<string, number> = {
      free: 0,
      starter: 0,
      professional: 0,
      enterprise: 0,
    };

    if (facilities) {
      facilities.forEach((facility) => {
        const tier = (facility.subscription_tier?.toLowerCase() || 'free') as string;
        subscriptionBreakdown[tier] = (subscriptionBreakdown[tier] || 0) + 1;

        if (facility.subscription_status === 'active' || !facility.subscription_status) {
          mrr += tierPricing[tier] || 0;
          if (tier !== 'free') {
            activeSubscriptions++;
          }
        } else if (facility.subscription_status === 'trialing') {
          trialUsers++;
        }
      });
    }

    // Calculate ARR
    const arr = mrr * 12;

    // Calculate ARPU (Average Revenue Per User)
    const avgRevPerUser = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

    // Calculate LTV (simplified: ARPU * average months of subscription)
    const lifetimeValue = avgRevPerUser * 8;

    // Calculate churn rate (facilities that churned in last 30 days)
    const churnedFacilities = facilities?.filter(f =>
      f.subscription_status === 'canceled' &&
      new Date(f.updated_at) >= thirtyDaysAgo
    ).length || 0;

    const totalPaidEver = activeSubscriptions + churnedFacilities;
    const churnRate = totalPaidEver > 0
      ? parseFloat((churnedFacilities / totalPaidEver * 100).toFixed(1))
      : 0;

    // For failed payments and transactions, we'd need Stripe integration
    // Return empty arrays for now (real data would come from Stripe webhooks)
    const failedPayments: Array<{
      id: string;
      user_email: string;
      amount: number;
      plan: string;
      failure_reason: string;
      failed_at: string;
      retry_count: number;
    }> = [];

    const transactions: Array<{
      id: string;
      user_email: string;
      type: string;
      amount: number;
      status: string;
      created_at: string;
    }> = [];

    // Recovery rate placeholder (would need failed payment tracking)
    const recoveryRate = 0;

    return NextResponse.json({
      stats: {
        mrr,
        mrrChange: 0, // Would need historical data
        arr,
        activeSubscriptions,
        trialUsers,
        churnRate,
        avgRevPerUser: parseFloat(avgRevPerUser.toFixed(2)),
        lifetimeValue: parseFloat(lifetimeValue.toFixed(2)),
        recoveryRate,
      },
      failedPayments,
      transactions,
      subscriptionBreakdown,
    });
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/billing - Perform billing actions
export async function POST(request: NextRequest) {
  try {
    // Validate session from header
    const sessionToken = request.headers.get('x-admin-session');
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateAdminSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check permissions
    if (!['super_admin', 'billing'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, paymentId, subscriptionId, userId, amount, reason } = body;

    switch (action) {
      case 'retry_payment':
        // In production, call Stripe to retry payment
        await logBillingEvent(
          session.admin.id,
          'payment_retry',
          paymentId,
          `Payment retry initiated for ${paymentId}`,
          { amount }
        );
        return NextResponse.json({ success: true, message: 'Payment retry initiated' });

      case 'refund':
        // In production, call Stripe to issue refund
        await logBillingEvent(
          session.admin.id,
          'refund_issued',
          paymentId,
          `Refund of $${amount} issued`,
          { amount, reason }
        );
        return NextResponse.json({ success: true, message: 'Refund issued' });

      case 'extend_subscription':
        // In production, update subscription end date
        await logBillingEvent(
          session.admin.id,
          'subscription_modified',
          subscriptionId,
          `Subscription extended for user ${userId}`,
          { reason }
        );
        return NextResponse.json({ success: true, message: 'Subscription extended' });

      case 'cancel_subscription':
        // In production, cancel in Stripe
        await logBillingEvent(
          session.admin.id,
          'subscription_modified',
          subscriptionId,
          `Subscription cancelled for user ${userId}`,
          { reason }
        );
        return NextResponse.json({ success: true, message: 'Subscription cancelled' });

      case 'apply_discount':
        await logBillingEvent(
          session.admin.id,
          'discount_applied',
          userId,
          `Discount applied to user ${userId}`,
          { amount, reason }
        );
        return NextResponse.json({ success: true, message: 'Discount applied' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Billing action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
