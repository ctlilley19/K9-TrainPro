-- K9 ProTrain Functions and Triggers Migration
-- Database functions, triggers, and stored procedures

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Updated At Trigger Function
-- Automatically updates the updated_at column on row modification
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Calculate Activity Duration
-- Calculates duration in minutes when an activity ends
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_activity_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- Apply to all tables with updated_at column
-- ============================================================================

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON dogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ACTIVITY TRIGGERS
-- ============================================================================

-- Calculate duration when activity ends
CREATE TRIGGER calculate_activity_duration_trigger
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION calculate_activity_duration();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Get Facility ID for User
-- Returns the facility_id for a given auth user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_facility_id(user_auth_id UUID)
RETURNS UUID AS $$
DECLARE
  facility_id UUID;
BEGIN
  SELECT u.facility_id INTO facility_id
  FROM users u
  WHERE u.auth_id = user_auth_id;

  RETURN facility_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Get User Role
-- Returns the role for a given auth user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id UUID)
RETURNS user_role AS $$
DECLARE
  role user_role;
BEGIN
  SELECT u.role INTO role
  FROM users u
  WHERE u.auth_id = user_auth_id;

  RETURN role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Check if User is Admin or Owner
-- Returns true if user has admin/owner privileges
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin_or_owner(user_auth_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT u.role INTO user_role
  FROM users u
  WHERE u.auth_id = user_auth_id;

  RETURN user_role IN ('admin', 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Check if User is Trainer or Above
-- Returns true if user has trainer, admin, or owner role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_trainer_or_above(user_auth_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT u.role INTO user_role
  FROM users u
  WHERE u.auth_id = user_auth_id;

  RETURN user_role IN ('trainer', 'admin', 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ACTIVITY HELPER FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- End Current Activity for Dog
-- Ends any active (non-ended) activity for a dog
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION end_current_activity(p_dog_id UUID, p_trainer_id UUID)
RETURNS UUID AS $$
DECLARE
  ended_activity_id UUID;
BEGIN
  UPDATE activities
  SET ended_at = NOW()
  WHERE dog_id = p_dog_id
    AND ended_at IS NULL
  RETURNING id INTO ended_activity_id;

  RETURN ended_activity_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Start New Activity for Dog
-- Ends current activity and starts a new one
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION start_activity(
  p_dog_id UUID,
  p_program_id UUID,
  p_type activity_type,
  p_trainer_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_buddy_dog_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_activity_id UUID;
BEGIN
  -- End any current activity
  PERFORM end_current_activity(p_dog_id, p_trainer_id);

  -- Start new activity
  INSERT INTO activities (dog_id, program_id, type, trainer_id, notes, buddy_dog_id)
  VALUES (p_dog_id, p_program_id, p_type, p_trainer_id, p_notes, p_buddy_dog_id)
  RETURNING id INTO new_activity_id;

  RETURN new_activity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REPORTING FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Get Dog Activity Summary for Date
-- Returns a summary of activities for a dog on a given date
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dog_daily_summary(p_dog_id UUID, p_date DATE)
RETURNS TABLE (
  activity_type activity_type,
  total_count INTEGER,
  total_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.type,
    COUNT(*)::INTEGER,
    COALESCE(SUM(a.duration_minutes), 0)::INTEGER
  FROM activities a
  WHERE a.dog_id = p_dog_id
    AND DATE(a.started_at) = p_date
  GROUP BY a.type
  ORDER BY total_minutes DESC;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Generate Daily Report Summary
-- Auto-generates a text summary for daily reports
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_report_summary(p_dog_id UUID, p_date DATE)
RETURNS TEXT AS $$
DECLARE
  summary TEXT;
  training_mins INTEGER;
  play_mins INTEGER;
  potty_count INTEGER;
  dog_name VARCHAR;
BEGIN
  -- Get dog name
  SELECT name INTO dog_name FROM dogs WHERE id = p_dog_id;

  -- Get activity totals
  SELECT
    COALESCE(SUM(CASE WHEN type = 'training' THEN duration_minutes ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type IN ('play', 'group_play') THEN duration_minutes ELSE 0 END), 0),
    COUNT(CASE WHEN type = 'potty' THEN 1 END)
  INTO training_mins, play_mins, potty_count
  FROM activities
  WHERE dog_id = p_dog_id
    AND DATE(started_at) = p_date;

  -- Build summary
  summary := dog_name || ' had a great day! ';

  IF training_mins > 0 THEN
    summary := summary || 'Training: ' || training_mins || ' minutes. ';
  END IF;

  IF play_mins > 0 THEN
    summary := summary || 'Play time: ' || play_mins || ' minutes. ';
  END IF;

  IF potty_count > 0 THEN
    summary := summary || 'Potty breaks: ' || potty_count || '. ';
  END IF;

  RETURN summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BADGE FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Award Badge to Dog
-- Awards a badge if not already earned (handles duplicates gracefully)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION award_badge(
  p_dog_id UUID,
  p_badge_type VARCHAR,
  p_tier badge_tier,
  p_awarded_by UUID,
  p_program_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  badge_id UUID;
BEGIN
  INSERT INTO badges (dog_id, badge_type, tier, awarded_by, program_id, notes)
  VALUES (p_dog_id, p_badge_type, p_tier, p_awarded_by, p_program_id, p_notes)
  ON CONFLICT (dog_id, badge_type, tier) DO NOTHING
  RETURNING id INTO badge_id;

  RETURN badge_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STATISTICS FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Get Facility Statistics
-- Returns key metrics for a facility dashboard
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_facility_stats(p_facility_id UUID)
RETURNS TABLE (
  active_dogs BIGINT,
  active_programs BIGINT,
  trainers_count BIGINT,
  badges_this_month BIGINT,
  activities_today BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM dogs d
     JOIN families f ON d.family_id = f.id
     WHERE f.facility_id = p_facility_id AND d.is_active = true),
    (SELECT COUNT(*) FROM programs WHERE facility_id = p_facility_id AND status = 'active'),
    (SELECT COUNT(*) FROM users WHERE facility_id = p_facility_id AND role IN ('trainer', 'admin', 'owner') AND is_active = true),
    (SELECT COUNT(*) FROM badges b
     JOIN dogs d ON b.dog_id = d.id
     JOIN families f ON d.family_id = f.id
     WHERE f.facility_id = p_facility_id
       AND b.earned_at >= DATE_TRUNC('month', CURRENT_DATE)),
    (SELECT COUNT(*) FROM activities a
     JOIN programs p ON a.program_id = p.id
     WHERE p.facility_id = p_facility_id
       AND DATE(a.started_at) = CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Get Dogs Needing Attention
-- Returns dogs that have been in kennel too long or need potty
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dogs_needing_attention(
  p_facility_id UUID,
  p_kennel_max_minutes INTEGER DEFAULT 240,
  p_potty_max_minutes INTEGER DEFAULT 180
)
RETURNS TABLE (
  dog_id UUID,
  dog_name VARCHAR,
  current_activity activity_type,
  minutes_in_activity INTEGER,
  alert_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH current_activities AS (
    SELECT DISTINCT ON (a.dog_id)
      a.dog_id,
      d.name AS dog_name,
      a.type,
      EXTRACT(EPOCH FROM (NOW() - a.started_at)) / 60 AS minutes_elapsed
    FROM activities a
    JOIN dogs d ON a.dog_id = d.id
    JOIN families f ON d.family_id = f.id
    JOIN programs p ON a.program_id = p.id
    WHERE p.facility_id = p_facility_id
      AND p.status = 'active'
      AND a.ended_at IS NULL
    ORDER BY a.dog_id, a.started_at DESC
  )
  SELECT
    ca.dog_id,
    ca.dog_name,
    ca.type,
    ca.minutes_elapsed::INTEGER,
    CASE
      WHEN ca.type = 'kennel' AND ca.minutes_elapsed > p_kennel_max_minutes THEN 'kennel_overtime'
      WHEN ca.type != 'potty' AND ca.minutes_elapsed > p_potty_max_minutes THEN 'needs_potty'
      ELSE 'normal'
    END AS alert_type
  FROM current_activities ca
  WHERE (ca.type = 'kennel' AND ca.minutes_elapsed > p_kennel_max_minutes)
     OR (ca.type != 'potty' AND ca.minutes_elapsed > p_potty_max_minutes);
END;
$$ LANGUAGE plpgsql;
