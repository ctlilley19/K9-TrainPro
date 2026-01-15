'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || key === 'pk_test_xxxxx') {
      console.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
}

// Redirect to Stripe Customer Portal
export async function redirectToCustomerPortal(portalUrl: string): Promise<void> {
  window.location.href = portalUrl;
}
