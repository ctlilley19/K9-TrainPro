-- Business Mode Configuration System
-- Allows facilities to configure between Family Training Mode and Facility Mode

-- Business mode types
CREATE TYPE business_mode AS ENUM (
  'family_training',   -- 1:1 personal training relationships
  'facility'           -- Board & train, daycare, group training
);

-- Facility configuration table
CREATE TABLE facility_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Core mode setting
  business_mode business_mode DEFAULT 'family_training' NOT NULL,

  -- Branding & Display
  business_name TEXT,
  tagline TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#059669',

  -- Contact Info
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  timezone TEXT DEFAULT 'America/New_York',

  -- Feature Flags - Family Training Mode
  enable_pet_parent_portal BOOLEAN DEFAULT true,
  enable_homework_system BOOLEAN DEFAULT true,
  enable_messaging BOOLEAN DEFAULT true,
  enable_daily_reports BOOLEAN DEFAULT true,
  enable_video_library BOOLEAN DEFAULT true,
  enable_progress_tracking BOOLEAN DEFAULT true,
  enable_before_after_comparisons BOOLEAN DEFAULT true,
  enable_badges BOOLEAN DEFAULT true,
  enable_certificates BOOLEAN DEFAULT true,

  -- Feature Flags - Facility Mode
  enable_boarding BOOLEAN DEFAULT false,
  enable_daycare BOOLEAN DEFAULT false,
  enable_grooming BOOLEAN DEFAULT false,
  enable_training_board BOOLEAN DEFAULT false,
  enable_live_status_feed BOOLEAN DEFAULT false,
  enable_kennel_tracking BOOLEAN DEFAULT true,
  enable_activity_timer BOOLEAN DEFAULT true,
  enable_multi_trainer BOOLEAN DEFAULT false,
  enable_calendar_scheduling BOOLEAN DEFAULT false,

  -- Operational Settings
  max_dogs_per_trainer INTEGER DEFAULT 6,
  max_kennel_time_minutes INTEGER DEFAULT 240,
  default_potty_interval_minutes INTEGER DEFAULT 120,
  business_hours_start TIME DEFAULT '07:00',
  business_hours_end TIME DEFAULT '19:00',
  operating_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- Mon-Fri by default

  -- Notification Preferences
  send_arrival_notifications BOOLEAN DEFAULT true,
  send_departure_notifications BOOLEAN DEFAULT true,
  send_activity_notifications BOOLEAN DEFAULT true,
  send_report_notifications BOOLEAN DEFAULT true,
  daily_report_time TIME DEFAULT '17:00',

  -- Billing & Pricing (for future use)
  currency TEXT DEFAULT 'USD',
  enable_online_booking BOOLEAN DEFAULT false,
  enable_online_payments BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mode-specific feature presets
CREATE TABLE feature_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  business_mode business_mode NOT NULL,
  features JSONB NOT NULL, -- Stores all feature flags as JSON
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default presets
INSERT INTO feature_presets (name, description, business_mode, features, is_default) VALUES
(
  'Family Training - Standard',
  'Perfect for independent trainers working with individual families',
  'family_training',
  '{
    "enable_pet_parent_portal": true,
    "enable_homework_system": true,
    "enable_messaging": true,
    "enable_daily_reports": true,
    "enable_video_library": true,
    "enable_progress_tracking": true,
    "enable_before_after_comparisons": true,
    "enable_badges": true,
    "enable_certificates": true,
    "enable_boarding": false,
    "enable_daycare": false,
    "enable_grooming": false,
    "enable_training_board": false,
    "enable_live_status_feed": false,
    "enable_kennel_tracking": false,
    "enable_activity_timer": false,
    "enable_multi_trainer": false,
    "enable_calendar_scheduling": true
  }',
  true
),
(
  'Family Training - Premium',
  'Enhanced features for premium training services',
  'family_training',
  '{
    "enable_pet_parent_portal": true,
    "enable_homework_system": true,
    "enable_messaging": true,
    "enable_daily_reports": true,
    "enable_video_library": true,
    "enable_progress_tracking": true,
    "enable_before_after_comparisons": true,
    "enable_badges": true,
    "enable_certificates": true,
    "enable_boarding": false,
    "enable_daycare": false,
    "enable_grooming": false,
    "enable_training_board": false,
    "enable_live_status_feed": true,
    "enable_kennel_tracking": false,
    "enable_activity_timer": false,
    "enable_multi_trainer": false,
    "enable_calendar_scheduling": true
  }',
  false
),
(
  'Board & Train Facility',
  'Full-featured board and train facility with all capabilities',
  'facility',
  '{
    "enable_pet_parent_portal": true,
    "enable_homework_system": true,
    "enable_messaging": true,
    "enable_daily_reports": true,
    "enable_video_library": true,
    "enable_progress_tracking": true,
    "enable_before_after_comparisons": true,
    "enable_badges": true,
    "enable_certificates": true,
    "enable_boarding": true,
    "enable_daycare": true,
    "enable_grooming": true,
    "enable_training_board": true,
    "enable_live_status_feed": true,
    "enable_kennel_tracking": true,
    "enable_activity_timer": true,
    "enable_multi_trainer": true,
    "enable_calendar_scheduling": true
  }',
  true
),
(
  'Daycare Only',
  'For facilities focused on daycare services',
  'facility',
  '{
    "enable_pet_parent_portal": true,
    "enable_homework_system": false,
    "enable_messaging": true,
    "enable_daily_reports": true,
    "enable_video_library": false,
    "enable_progress_tracking": false,
    "enable_before_after_comparisons": false,
    "enable_badges": false,
    "enable_certificates": false,
    "enable_boarding": false,
    "enable_daycare": true,
    "enable_grooming": false,
    "enable_training_board": true,
    "enable_live_status_feed": true,
    "enable_kennel_tracking": true,
    "enable_activity_timer": true,
    "enable_multi_trainer": true,
    "enable_calendar_scheduling": true
  }',
  false
);

-- Trigger for updated_at
CREATE TRIGGER update_facility_config_updated_at
  BEFORE UPDATE ON facility_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for quick facility lookup
CREATE INDEX idx_facility_config_facility ON facility_config(facility_id);

-- RLS Policies
ALTER TABLE facility_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_presets ENABLE ROW LEVEL SECURITY;

-- Owners and admins can manage facility config
CREATE POLICY "Facility members can view config"
  ON facility_config FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage facility config"
  ON facility_config FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Anyone can view presets
CREATE POLICY "Anyone can view presets"
  ON feature_presets FOR SELECT
  TO authenticated
  USING (true);

-- Function to initialize facility config with default preset
CREATE OR REPLACE FUNCTION initialize_facility_config()
RETURNS TRIGGER AS $$
DECLARE
  default_preset JSONB;
BEGIN
  -- Get default family training preset
  SELECT features INTO default_preset
  FROM feature_presets
  WHERE business_mode = 'family_training' AND is_default = true
  LIMIT 1;

  INSERT INTO facility_config (
    facility_id,
    business_mode,
    enable_pet_parent_portal,
    enable_homework_system,
    enable_messaging,
    enable_daily_reports,
    enable_video_library,
    enable_progress_tracking,
    enable_before_after_comparisons,
    enable_badges,
    enable_certificates,
    enable_boarding,
    enable_daycare,
    enable_grooming,
    enable_training_board,
    enable_live_status_feed,
    enable_kennel_tracking,
    enable_activity_timer,
    enable_multi_trainer,
    enable_calendar_scheduling
  )
  VALUES (
    NEW.id,
    'family_training',
    COALESCE((default_preset->>'enable_pet_parent_portal')::boolean, true),
    COALESCE((default_preset->>'enable_homework_system')::boolean, true),
    COALESCE((default_preset->>'enable_messaging')::boolean, true),
    COALESCE((default_preset->>'enable_daily_reports')::boolean, true),
    COALESCE((default_preset->>'enable_video_library')::boolean, true),
    COALESCE((default_preset->>'enable_progress_tracking')::boolean, true),
    COALESCE((default_preset->>'enable_before_after_comparisons')::boolean, true),
    COALESCE((default_preset->>'enable_badges')::boolean, true),
    COALESCE((default_preset->>'enable_certificates')::boolean, true),
    COALESCE((default_preset->>'enable_boarding')::boolean, false),
    COALESCE((default_preset->>'enable_daycare')::boolean, false),
    COALESCE((default_preset->>'enable_grooming')::boolean, false),
    COALESCE((default_preset->>'enable_training_board')::boolean, false),
    COALESCE((default_preset->>'enable_live_status_feed')::boolean, false),
    COALESCE((default_preset->>'enable_kennel_tracking')::boolean, false),
    COALESCE((default_preset->>'enable_activity_timer')::boolean, false),
    COALESCE((default_preset->>'enable_multi_trainer')::boolean, false),
    COALESCE((default_preset->>'enable_calendar_scheduling')::boolean, true)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create config when facility is created
CREATE TRIGGER create_facility_config_on_facility_insert
  AFTER INSERT ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION initialize_facility_config();
