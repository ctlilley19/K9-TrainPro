import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminSession } from '@/services/admin/auth';
import { logBillingEvent } from '@/services/admin/audit';

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/billing - Get billing stats and failed payments
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get billing overview stats
    if (action === 'stats') {
      // In production, this would query Stripe or your billing system
      // For now, return demo data
      const stats = {
        mrr: 18450,
        mrrChange: 8.2,
        arr: 221400,
        activeSubscriptions: 567,
        trialUsers: 89,
        churnRate: 3.2,
        avgRevPerUser: 32.54,
        lifetimeValue: 142,
      };

      return NextResponse.json(stats);
    }

    // Get failed payments
    if (action === 'failed-payments') {
      // In production, query failed payment attempts from Stripe
      const failedPayments = [
        {
          id: 'pi_1',
          user_email: 'john@example.com',
          amount: 29.99,
          plan: 'Pro Monthly',
          failure_reason: 'card_declined',
          failed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          retry_count: 1,
        },
        {
          id: 'pi_2',
          user_email: 'jane@example.com',
          amount: 249.99,
          plan: 'Business Annual',
          failure_reason: 'insufficient_funds',
          failed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          retry_count: 2,
        },
      ];

      return NextResponse.json({ failedPayments });
    }

    // Get recent transactions
    if (action === 'transactions') {
      const limit = parseInt(searchParams.get('limit') || '20', 10);

      // In production, query from Stripe or transactions table
      const transactions = [
        {
          id: 'txn_1',
          user_email: 'alice@example.com',
          type: 'subscription',
          amount: 29.99,
          status: 'succeeded',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 'txn_2',
          user_email: 'bob@example.com',
          type: 'upgrade',
          amount: 49.99,
          status: 'succeeded',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return NextResponse.json({ transactions });
    }

    // Get subscription breakdown
    const subscriptionBreakdown = {
      free: 680,
      basic: 420,
      pro: 280,
      business: 70,
    };

    return NextResponse.json({ subscriptionBreakdown });
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/billing - Perform billing actions
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get('admin_session')?.value;
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
