import Stripe from 'stripe';

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Subscription tier pricing configuration
export const SUBSCRIPTION_TIERS = {
  // Family tiers
  family_free: {
    name: 'Family Free',
    type: 'family' as const,
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: [
      'View daily reports',
      'Photo gallery access',
      'Basic progress tracking',
    ],
    limits: {
      dogs: 2,
      photoStorage: 100, // MB
    },
  },
  family_premium: {
    name: 'Family Premium',
    type: 'family' as const,
    monthlyPrice: 1000, // $10.00 in cents
    annualPrice: 10200, // $102.00/year (15% discount)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_FAMILY_PREMIUM_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_FAMILY_PREMIUM_ANNUAL,
    features: [
      'Everything in Free',
      'Video access',
      'Homework tracking',
      'Priority support',
    ],
    limits: {
      dogs: 5,
      photoStorage: 1000, // MB
    },
  },
  family_pro: {
    name: 'Family Pro',
    type: 'family' as const,
    monthlyPrice: 1900, // $19.00
    annualPrice: 19380, // $193.80/year (15% discount)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_FAMILY_PRO_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_FAMILY_PRO_ANNUAL,
    features: [
      'Everything in Premium',
      'NFC tag ordering',
      'Advanced analytics',
      'Multi-pet management',
    ],
    limits: {
      dogs: 10,
      photoStorage: 5000, // MB
      freeTags: 1,
    },
  },

  // Business tiers
  starter: {
    name: 'Business Starter',
    type: 'business' as const,
    monthlyPrice: 4900, // $49.00
    annualPrice: 49980, // $499.80/year (15% discount)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    features: [
      'Up to 10 active dogs',
      'Basic training board',
      'Daily reports',
      'Photo uploads',
      'Email support',
    ],
    limits: {
      activeDogs: 10,
      trainers: 2,
      storage: 5, // GB
      freeTags: 0,
    },
  },
  professional: {
    name: 'Business Pro',
    type: 'business' as const,
    monthlyPrice: 9900, // $99.00
    annualPrice: 100980, // $1009.80/year (15% discount)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL,
    features: [
      'Up to 30 active dogs',
      'Advanced training board',
      'Video library',
      'Homework system',
      'Custom branding',
      'Priority support',
    ],
    limits: {
      activeDogs: 30,
      trainers: 5,
      storage: 25, // GB
      freeTags: 5,
    },
  },
  enterprise: {
    name: 'Business Enterprise',
    type: 'business' as const,
    monthlyPrice: 19900, // $199.00
    annualPrice: 203000, // $2030/year (15% discount)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
    features: [
      'Unlimited active dogs',
      'All Pro features',
      'Multi-location support',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: {
      activeDogs: -1, // unlimited
      trainers: -1, // unlimited
      storage: 100, // GB
      freeTags: 20,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type TierType = 'family' | 'business';

// Helper to get tier config
export function getTierConfig(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier];
}

// Helper to format price for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Helper to calculate annual savings
export function calculateAnnualSavings(tier: SubscriptionTier): number {
  const config = SUBSCRIPTION_TIERS[tier];
  const monthlyTotal = config.monthlyPrice * 12;
  return monthlyTotal - config.annualPrice;
}
