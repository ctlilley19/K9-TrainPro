import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendVendorOrderEmail, sendOrderConfirmationEmail } from '@/services/email/vendor-order';


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Map Stripe status to our enum
function mapSubscriptionStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    trialing: 'trialing',
    paused: 'paused',
  };
  return statusMap[stripeStatus] || 'active';
}

// Get tier from price ID
function getTierFromPriceId(priceId: string): string {
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.stripePriceIdMonthly === priceId || config.stripePriceIdAnnual === priceId) {
      return tier;
    }
  }
  return 'starter'; // default
}

// Get free tags allowance for tier
function getFreeTags(tier: string): number {
  const config = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  return config?.limits?.freeTags || 0;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Log the event
  try {
    await getSupabaseAdmin().from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      api_version: event.api_version,
      data: event.data,
    });
  } catch (err) {
    console.error('Failed to log event:', err);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, event.type);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialEnding(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await getSupabaseAdmin()
      .from('stripe_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);

    // Log error
    await getSupabaseAdmin()
      .from('stripe_events')
      .update({
        processed: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        retry_count: 1,
      })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const facilityId = session.metadata?.facility_id;
  const checkoutType = session.metadata?.type;

  if (!facilityId) {
    console.error('No facility ID in checkout session');
    return;
  }

  // Handle tag order checkout
  if (checkoutType === 'tag_order') {
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await handleTagOrderPayment(orderId, session);
    }
    return;
  }

  // Handle subscription checkout
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionChange(subscription, 'customer.subscription.created');
  }
}

async function handleTagOrderPayment(orderId: string, session: Stripe.Checkout.Session) {
  const supabaseAdmin = getSupabaseAdmin();
  // Update order status
  await supabaseAdmin
    .from('tag_orders')
    .update({
      status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('id', orderId);

  // Update tag statuses to production
  await supabaseAdmin
    .from('tags')
    .update({ status: 'production' })
    .eq('order_id', orderId);

  // Get order details for emails
  const { data: order } = await supabaseAdmin
    .from('tag_orders')
    .select(`
      *,
      user:users(name, email)
    `)
    .eq('id', orderId)
    .single();

  if (order) {
    // Send vendor email
    await sendVendorOrderEmail(orderId);

    // Send customer confirmation
    if (order.user?.email) {
      await sendOrderConfirmationEmail(orderId, order.user.email, order.user.name);
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, eventType: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const facilityId = subscription.metadata?.facility_id;

  if (!facilityId) {
    // Try to find facility by customer ID
    const { data: facility } = await supabaseAdmin
      .from('facilities')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!facility) {
      console.error('Could not find facility for subscription');
      return;
    }
  }

  const priceId = subscription.items.data[0]?.price.id;
  const tier = subscription.metadata?.tier || getTierFromPriceId(priceId);
  const interval = subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'year' : 'month';
  const status = mapSubscriptionStatus(subscription.status);

  // Update facility
  const updateData: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
    subscription_tier: tier,
    subscription_status: status,
    billing_interval: interval,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    free_tags_allowance: getFreeTags(tier),
    updated_at: new Date().toISOString(),
  };

  if (subscription.trial_end) {
    updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
  }

  // Find facility by customer ID if not in metadata
  const query = facilityId
    ? supabaseAdmin.from('facilities').update(updateData).eq('id', facilityId)
    : supabaseAdmin.from('facilities').update(updateData).eq('stripe_customer_id', subscription.customer as string);

  await query;

  // Create/update subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: priceId,
    tier,
    status,
    billing_interval: interval,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  }, {
    onConflict: 'stripe_subscription_id',
  });

  // Log subscription event
  await supabaseAdmin.from('subscription_events').insert({
    facility_id: facilityId,
    event_type: eventType.replace('customer.subscription.', ''),
    new_tier: tier,
    new_status: status,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin();
  // Update facility to free tier
  await supabaseAdmin
    .from('facilities')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      free_tags_allowance: 0,
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const supabaseAdmin = getSupabaseAdmin();
  const { data: facility } = await supabaseAdmin
    .from('facilities')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!facility) return;

  // Record the invoice
  await supabaseAdmin.from('invoices').upsert({
    stripe_invoice_id: invoice.id,
    facility_id: facility.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_hosted_invoice_url: invoice.hosted_invoice_url,
    stripe_invoice_pdf: invoice.invoice_pdf,
    invoice_number: invoice.number,
    status: 'paid',
    currency: invoice.currency,
    subtotal: invoice.subtotal,
    tax: invoice.tax || 0,
    total: invoice.total,
    amount_paid: invoice.amount_paid,
    amount_due: invoice.amount_due,
    invoice_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
    paid_at: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : new Date().toISOString(),
    customer_name: invoice.customer_name,
    customer_email: invoice.customer_email,
  }, {
    onConflict: 'stripe_invoice_id',
  });

  // Record payment
  if (invoice.payment_intent) {
    const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent as string);
    const charge = paymentIntent.latest_charge
      ? await stripe.charges.retrieve(paymentIntent.latest_charge as string)
      : null;

    await supabaseAdmin.from('payments').upsert({
      stripe_payment_intent_id: paymentIntent.id,
      facility_id: facility.id,
      stripe_charge_id: charge?.id,
      stripe_payment_method_id: paymentIntent.payment_method as string,
      status: 'succeeded',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method_type: charge?.payment_method_details?.type,
      card_brand: charge?.payment_method_details?.card?.brand,
      card_last4: charge?.payment_method_details?.card?.last4,
      card_exp_month: charge?.payment_method_details?.card?.exp_month,
      card_exp_year: charge?.payment_method_details?.card?.exp_year,
    }, {
      onConflict: 'stripe_payment_intent_id',
    });
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: facility } = await supabaseAdmin
    .from('facilities')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!facility) return;

  // Update invoice status
  await supabaseAdmin
    .from('invoices')
    .update({ status: 'open' })
    .eq('stripe_invoice_id', invoice.id);

  // Update facility subscription status
  await supabaseAdmin
    .from('facilities')
    .update({ subscription_status: 'past_due' })
    .eq('id', facility.id);

  // TODO: Send email notification about failed payment
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  // TODO: Send email notification about trial ending
  console.log('Trial ending soon for subscription:', subscription.id);
}
