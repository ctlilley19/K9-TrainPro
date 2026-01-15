-- Billing System Migration
-- Supports Stripe subscriptions, invoices, and payments

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded',
  'canceled'
);

CREATE TYPE billing_interval AS ENUM ('month', 'year');

-- ============================================================================
-- ADD STRIPE FIELDS TO FACILITIES
-- ============================================================================

ALTER TABLE facilities ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'active';
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS billing_interval billing_interval DEFAULT 'month';
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Free tag tracking for subscription tiers
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS free_tags_allowance INTEGER DEFAULT 0;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS free_tags_used INTEGER DEFAULT 0;

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Subscription details
  tier TEXT NOT NULL, -- 'starter', 'professional', 'enterprise', etc.
  status subscription_status NOT NULL DEFAULT 'active',
  billing_interval billing_interval NOT NULL DEFAULT 'month',

  -- Period tracking
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one active subscription per facility
  UNIQUE(facility_id, stripe_subscription_id)
);

-- ============================================================================
-- SUBSCRIPTION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL, -- 'created', 'updated', 'canceled', 'renewed', 'upgraded', 'downgraded'
  previous_tier TEXT,
  new_tier TEXT,
  previous_status subscription_status,
  new_status subscription_status,

  -- Stripe event reference
  stripe_event_id TEXT,

  -- Additional context
  reason TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Stripe IDs
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_hosted_invoice_url TEXT,
  stripe_invoice_pdf TEXT,

  -- Invoice details
  invoice_number TEXT,
  status invoice_status NOT NULL DEFAULT 'draft',
  currency TEXT DEFAULT 'usd',

  -- Amounts (in cents)
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER NOT NULL DEFAULT 0,

  -- Dates
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,

  -- Customer info snapshot
  customer_name TEXT,
  customer_email TEXT,
  billing_address JSONB,

  -- Description
  description TEXT,
  footer TEXT,
  memo TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INVOICE LINE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Stripe ID
  stripe_invoice_item_id TEXT,

  -- Item details
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount INTEGER NOT NULL, -- in cents
  amount INTEGER NOT NULL, -- quantity * unit_amount

  -- Optional references
  price_id TEXT, -- Stripe price ID if applicable
  product_id TEXT, -- Product reference

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Stripe IDs
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_payment_method_id TEXT,

  -- Payment details
  status payment_status NOT NULL DEFAULT 'pending',
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  payment_method_type TEXT, -- 'card', 'bank_transfer', etc.

  -- Card details (for display)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Refund tracking
  refunded_amount INTEGER DEFAULT 0,
  refund_reason TEXT,

  -- Error handling
  failure_code TEXT,
  failure_message TEXT,

  -- Description
  description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STRIPE WEBHOOK EVENTS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  api_version TEXT,

  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Full event data
  data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Stripe ID
  stripe_payment_method_id TEXT UNIQUE NOT NULL,

  -- Type and details
  type TEXT NOT NULL, -- 'card', 'us_bank_account', etc.
  is_default BOOLEAN DEFAULT false,

  -- Card details
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_funding TEXT, -- 'credit', 'debit', 'prepaid'

  -- Bank account details
  bank_name TEXT,
  bank_last4 TEXT,

  -- Billing details
  billing_name TEXT,
  billing_email TEXT,
  billing_address JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_facility ON subscriptions(facility_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscription_events_facility ON subscription_events(facility_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);

CREATE INDEX IF NOT EXISTS idx_invoices_facility ON invoices(facility_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_payments_facility ON payments(facility_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_stripe_id ON stripe_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_facility ON payment_methods(facility_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Subscriptions: facility members can view
CREATE POLICY "Users can view facility subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

-- Subscription events: facility admins can view
CREATE POLICY "Admins can view subscription events"
  ON subscription_events FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Invoices: facility admins can view
CREATE POLICY "Admins can view facility invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Invoice items: inherit from invoice access
CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE facility_id = get_user_facility_id(auth.uid())
    )
  );

-- Payments: facility admins can view
CREATE POLICY "Admins can view facility payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Payment methods: facility owners can manage
CREATE POLICY "Owners can view payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update facility subscription status from Stripe webhook
CREATE OR REPLACE FUNCTION update_facility_subscription(
  p_facility_id UUID,
  p_stripe_subscription_id TEXT,
  p_status subscription_status,
  p_tier TEXT,
  p_interval billing_interval,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE facilities
  SET
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_status = p_status,
    subscription_tier = p_tier::subscription_tier,
    billing_interval = p_interval,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = NOW()
  WHERE id = p_facility_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get free tags remaining for a facility
CREATE OR REPLACE FUNCTION get_free_tags_remaining(p_facility_id UUID)
RETURNS INTEGER AS $$
DECLARE
  allowance INTEGER;
  used INTEGER;
BEGIN
  SELECT free_tags_allowance, free_tags_used
  INTO allowance, used
  FROM facilities
  WHERE id = p_facility_id;

  RETURN GREATEST(0, COALESCE(allowance, 0) - COALESCE(used, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use free tags
CREATE OR REPLACE FUNCTION use_free_tags(p_facility_id UUID, p_count INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  remaining INTEGER;
BEGIN
  remaining := get_free_tags_remaining(p_facility_id);

  IF remaining < p_count THEN
    RETURN FALSE;
  END IF;

  UPDATE facilities
  SET free_tags_used = COALESCE(free_tags_used, 0) + p_count
  WHERE id = p_facility_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_billing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_timestamp();

CREATE TRIGGER update_invoices_timestamp
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_timestamp();

CREATE TRIGGER update_payments_timestamp
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_timestamp();

CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_timestamp();
