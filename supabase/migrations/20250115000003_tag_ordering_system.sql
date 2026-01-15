-- NFC/QR Tag Ordering System Migration
-- Supports tag ordering, vendor fulfillment, and lost pet profiles

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE tag_status AS ENUM (
  'pending',        -- Order placed, awaiting production
  'production',     -- Being manufactured
  'shipped',        -- In transit
  'unassigned',     -- Delivered but not assigned to a dog
  'active',         -- Assigned to a dog and in use
  'deactivated'     -- Lost/stolen, URL shows deactivated message
);

CREATE TYPE tag_order_status AS ENUM (
  'pending_payment',
  'paid',
  'sent_to_vendor',
  'in_production',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE tag_design_type AS ENUM (
  'default',        -- K9 ProTrain branded (single sided)
  'custom'          -- Business logo (can be single or double sided)
);

CREATE TYPE tag_product_type AS ENUM (
  'single_sided',   -- Logo front, standard QR back
  'double_sided'    -- Custom both sides
);

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,  -- e.g., 'taptag'
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed TapTag vendor
INSERT INTO vendors (name, code, contact_email, website_url, notes) VALUES
  ('TapTag', 'taptag', 'tyler@taptag.shop', 'https://taptag.shop', 'Primary vendor - NY, 1-2 day production, no MOQ');

-- ============================================================================
-- VENDOR PRICING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_type tag_product_type NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,  -- NULL means unlimited
  unit_cost INTEGER NOT NULL,  -- in cents
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vendor_id, product_type, min_quantity)
);

-- Seed TapTag pricing (Single Sided)
INSERT INTO vendor_pricing (vendor_id, product_type, min_quantity, max_quantity, unit_cost) VALUES
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 1, 4, 2495),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 5, 9, 1590),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 10, 24, 1250),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 25, 49, 950),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 50, 99, 700),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 100, 199, 590),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 200, 499, 450),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'single_sided', 500, NULL, 400);

-- Seed TapTag pricing (Double Sided)
INSERT INTO vendor_pricing (vendor_id, product_type, min_quantity, max_quantity, unit_cost) VALUES
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 1, 4, 2995),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 5, 9, 1795),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 10, 24, 1490),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 25, 49, 1100),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 50, 99, 800),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 100, 199, 690),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 200, 499, 500),
  ((SELECT id FROM vendors WHERE code = 'taptag'), 'double_sided', 500, NULL, 450);

-- ============================================================================
-- OUR PRICING TABLE (What we charge customers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tag_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_type tag_design_type NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,  -- NULL means unlimited
  unit_price INTEGER NOT NULL,  -- in cents
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(design_type, min_quantity)
);

-- Seed our pricing (Default - K9 ProTrain logo, single sided)
INSERT INTO tag_pricing (design_type, min_quantity, max_quantity, unit_price) VALUES
  ('default', 1, 4, 2999),
  ('default', 5, 9, 2299),
  ('default', 10, 24, 1999),
  ('default', 25, 49, 1699),
  ('default', 50, 99, 1399),
  ('default', 100, 199, 899),
  ('default', 200, NULL, 499);

-- Seed our pricing (Custom - Business logo, double sided)
INSERT INTO tag_pricing (design_type, min_quantity, max_quantity, unit_price) VALUES
  ('custom', 1, 4, 3499),
  ('custom', 5, 9, 2699),
  ('custom', 10, 24, 2399),
  ('custom', 25, 49, 1999),
  ('custom', 50, 99, 1699),
  ('custom', 100, 199, 999),
  ('custom', 200, NULL, 550);

-- ============================================================================
-- TAG DESIGN TEMPLATES (Business tiers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tag_design_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- e.g., "Main Logo", "Holiday Design"
  design_type tag_product_type NOT NULL DEFAULT 'double_sided',
  front_image_url TEXT NOT NULL,
  back_image_url TEXT,  -- For double sided
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TAG ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tag_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,  -- Human readable, e.g., "ORD-2026-0001"
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- Order details
  quantity INTEGER NOT NULL,
  design_type tag_design_type NOT NULL DEFAULT 'default',
  product_type tag_product_type NOT NULL DEFAULT 'single_sided',
  design_image_url TEXT,  -- For default designs
  design_template_id UUID REFERENCES tag_design_templates(id) ON DELETE SET NULL,

  -- Pricing
  unit_price INTEGER NOT NULL,  -- What we charged per tag (cents)
  vendor_unit_cost INTEGER NOT NULL,  -- What vendor charged us (cents)
  subtotal INTEGER NOT NULL,  -- Before discounts
  free_tags_applied INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,  -- Final amount charged
  profit_margin INTEGER,  -- Calculated: subtotal - (vendor_unit_cost * quantity)

  -- Shipping
  shipping_name TEXT NOT NULL,
  shipping_company TEXT,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',
  shipping_phone TEXT,

  -- Vendor tracking
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  vendor_email_sent_at TIMESTAMPTZ,
  vendor_confirmed_at TIMESTAMPTZ,

  -- Status
  status tag_order_status NOT NULL DEFAULT 'pending_payment',
  tracking_carrier TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TAGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code TEXT UNIQUE NOT NULL,  -- e.g., "A7X9B2", "K9P001"
  url TEXT NOT NULL,  -- Full URL: app.k9protrain.com/tag/A7X9B2

  -- Ownership
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,  -- NULL if unassigned
  order_id UUID REFERENCES tag_orders(id) ON DELETE SET NULL,

  -- Design
  design_type tag_design_type NOT NULL DEFAULT 'default',
  design_image_url TEXT,

  -- Status
  status tag_status NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deactivated_at TIMESTAMPTZ,
  deactivated_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TAG SCAN LOG (Analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tag_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  -- Who scanned
  scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL if public scan
  is_authenticated BOOLEAN DEFAULT false,
  user_role TEXT,  -- 'trainer', 'owner', 'public'

  -- What happened
  action_taken TEXT,  -- 'quick_log', 'view_profile', 'lost_pet', 'deactivated_view'
  activity_logged TEXT,  -- If quick log: 'walk', 'feed', etc.

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- LOST PET SETTINGS (on dogs table)
-- ============================================================================

ALTER TABLE dogs ADD COLUMN IF NOT EXISTS lost_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS lost_pet_settings JSONB DEFAULT '{
  "show_name": true,
  "show_photo": true,
  "show_description": true,
  "show_lost_message": true,
  "show_owner_phone": true,
  "show_owner_email": true,
  "show_general_location": false,
  "show_vet_info": false,
  "show_medical_info": false,
  "custom_message": "I''m lost! Please help me get home to my family!"
}'::jsonb;

-- ============================================================================
-- ORDER NUMBER SEQUENCE
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS tag_order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_tag_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('tag_order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TAG CODE GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_tag_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- Excludes 0,O,1,I,L
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique tag code
CREATE OR REPLACE FUNCTION generate_unique_tag_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := generate_tag_code();
    SELECT EXISTS(SELECT 1 FROM tags WHERE tag_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PRICING LOOKUP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_tag_unit_price(
  p_design_type tag_design_type,
  p_quantity INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  price INTEGER;
BEGIN
  SELECT unit_price INTO price
  FROM tag_pricing
  WHERE design_type = p_design_type
    AND is_active = true
    AND min_quantity <= p_quantity
    AND (max_quantity IS NULL OR max_quantity >= p_quantity)
  ORDER BY min_quantity DESC
  LIMIT 1;

  RETURN COALESCE(price, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_vendor_unit_cost(
  p_vendor_id UUID,
  p_product_type tag_product_type,
  p_quantity INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  cost INTEGER;
BEGIN
  SELECT unit_cost INTO cost
  FROM vendor_pricing
  WHERE vendor_id = p_vendor_id
    AND product_type = p_product_type
    AND is_active = true
    AND min_quantity <= p_quantity
    AND (max_quantity IS NULL OR max_quantity >= p_quantity)
  ORDER BY min_quantity DESC
  LIMIT 1;

  RETURN COALESCE(cost, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tags_facility ON tags(facility_id);
CREATE INDEX IF NOT EXISTS idx_tags_dog ON tags(dog_id);
CREATE INDEX IF NOT EXISTS idx_tags_order ON tags(order_id);
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags(status);
CREATE INDEX IF NOT EXISTS idx_tags_code ON tags(tag_code);

CREATE INDEX IF NOT EXISTS idx_tag_orders_facility ON tag_orders(facility_id);
CREATE INDEX IF NOT EXISTS idx_tag_orders_status ON tag_orders(status);
CREATE INDEX IF NOT EXISTS idx_tag_orders_number ON tag_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_tag_scans_tag ON tag_scans(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_scans_time ON tag_scans(scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_tag_design_templates_facility ON tag_design_templates(facility_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_scans ENABLE ROW LEVEL SECURITY;

-- Vendors and pricing are public read
CREATE POLICY "Anyone can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can view vendor pricing"
  ON vendor_pricing FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can view tag pricing"
  ON tag_pricing FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Design templates - facility members can view
CREATE POLICY "Facility members can view design templates"
  ON tag_design_templates FOR SELECT
  TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility admins can manage design templates"
  ON tag_design_templates FOR ALL
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Tag orders - facility admins can manage
CREATE POLICY "Facility admins can view orders"
  ON tag_orders FOR SELECT
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Facility admins can create orders"
  ON tag_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Tags - facility members can view, admins can manage
CREATE POLICY "Facility members can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can assign tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin', 'trainer')
    )
  );

-- Tag scans - facility can view their tag scans
CREATE POLICY "Facility can view tag scans"
  ON tag_scans FOR SELECT
  TO authenticated
  USING (
    tag_id IN (
      SELECT id FROM tags
      WHERE facility_id = get_user_facility_id(auth.uid())
    )
  );

-- Allow inserting scans (for logging)
CREATE POLICY "Anyone can log tag scans"
  ON tag_scans FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_tag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tags_timestamp
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_timestamp();

CREATE TRIGGER update_tag_orders_timestamp
  BEFORE UPDATE ON tag_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_timestamp();

CREATE TRIGGER update_tag_design_templates_timestamp
  BEFORE UPDATE ON tag_design_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_timestamp();

CREATE TRIGGER update_vendors_timestamp
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_timestamp();
