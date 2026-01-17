-- Fix signup function to properly set trial information for new users
-- Also update existing facilities that are on 'free' tier to have trial info

-- Update the signup function to set trial info for new users
CREATE OR REPLACE FUNCTION handle_new_user_signup(
  p_auth_id UUID,
  p_email TEXT,
  p_name TEXT,
  p_facility_name TEXT
)
RETURNS JSON AS $$
DECLARE
  v_facility_id UUID;
  v_user_id UUID;
  v_facility JSON;
  v_user JSON;
  v_trial_end TIMESTAMPTZ;
BEGIN
  -- Calculate 14-day trial end date
  v_trial_end := NOW() + INTERVAL '14 days';

  -- Create facility with 14-day free trial on Starter plan
  INSERT INTO facilities (
    name,
    email,
    timezone,
    subscription_tier,
    subscription_status,
    trial_ends_at,
    current_period_end,
    settings
  ) VALUES (
    p_facility_name,
    p_email,
    'America/New_York',
    'starter',
    'trialing',
    v_trial_end,
    v_trial_end,
    jsonb_build_object(
      'kennel_max_minutes', 240,
      'potty_interval_minutes', 120,
      'daily_report_time', '18:00',
      'enable_realtime_updates', true,
      'enable_photo_sharing', true
    )
  )
  RETURNING id INTO v_facility_id;

  -- Create user profile
  INSERT INTO users (
    auth_id,
    facility_id,
    email,
    name,
    role,
    is_active
  ) VALUES (
    p_auth_id,
    v_facility_id,
    p_email,
    p_name,
    'owner',
    true
  )
  RETURNING id INTO v_user_id;

  -- Get the created records
  SELECT row_to_json(f.*) INTO v_facility FROM facilities f WHERE f.id = v_facility_id;
  SELECT row_to_json(u.*) INTO v_user FROM users u WHERE u.id = v_user_id;

  RETURN jsonb_build_object(
    'facility', v_facility,
    'user', v_user
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing facilities on 'free' tier to have proper trial info
-- Set trial to 14 days from their creation date (or now if created long ago)
UPDATE facilities
SET
  subscription_tier = 'starter',
  subscription_status = 'trialing',
  trial_ends_at = GREATEST(created_at + INTERVAL '14 days', NOW() + INTERVAL '14 days'),
  current_period_end = GREATEST(created_at + INTERVAL '14 days', NOW() + INTERVAL '14 days')
WHERE subscription_tier = 'free'
  AND (subscription_status IS NULL OR subscription_status != 'active');

-- Also fix any facilities with NULL subscription_status
UPDATE facilities
SET
  subscription_status = 'trialing',
  trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '14 days'),
  current_period_end = COALESCE(current_period_end, NOW() + INTERVAL '14 days')
WHERE subscription_status IS NULL;
