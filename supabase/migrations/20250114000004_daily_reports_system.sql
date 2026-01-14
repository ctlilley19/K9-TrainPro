-- Daily Reports System Migration
-- Supports auto-generated daily reports for dogs in training programs

-- Create enum types
CREATE TYPE report_status AS ENUM ('draft', 'ready', 'sent', 'opened');

-- Daily Reports table
-- Comprehensive daily training reports for each dog
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,

  -- Report details
  report_date DATE NOT NULL,
  status report_status NOT NULL DEFAULT 'draft',

  -- Auto-generated content
  auto_summary TEXT,

  -- Trainer edits
  trainer_notes TEXT,
  highlights TEXT[],

  -- Ratings (1-5 scale)
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  appetite_rating INTEGER CHECK (appetite_rating >= 1 AND appetite_rating <= 5),
  training_focus_rating INTEGER CHECK (training_focus_rating >= 1 AND training_focus_rating <= 5),
  sociability_rating INTEGER CHECK (sociability_rating >= 1 AND sociability_rating <= 5),

  -- Activities summary (aggregated from activities table)
  activities_summary JSONB DEFAULT '[]',
  skills_practiced TEXT[],

  -- Media
  highlight_photos TEXT[],
  highlight_videos TEXT[],

  -- Badge earned
  badge_earned_id UUID REFERENCES badges(id) ON DELETE SET NULL,

  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Unique constraint for one report per dog per day
  UNIQUE(dog_id, report_date)
);

-- Report Templates table
-- Pre-defined templates for common report types
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Template details
  name TEXT NOT NULL,
  description TEXT,

  -- Template content
  summary_template TEXT,
  default_highlights TEXT[],

  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Report Preferences table
-- Family preferences for how they receive reports
CREATE TABLE IF NOT EXISTS report_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE UNIQUE,

  -- Delivery preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Frequency preferences
  daily_reports BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  milestone_alerts BOOLEAN DEFAULT true,

  -- Time preferences
  preferred_delivery_time TIME DEFAULT '18:00:00',
  timezone TEXT DEFAULT 'America/New_York',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report Comments table
-- Pet parents can comment on reports
CREATE TABLE IF NOT EXISTS report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Parent or trainer
  commenter_type TEXT NOT NULL CHECK (commenter_type IN ('parent', 'trainer')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report Reactions table
-- Pet parents can react to reports
CREATE TABLE IF NOT EXISTS report_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Reaction type (emoji or predefined)
  reaction TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint
  UNIQUE(report_id, user_id, reaction)
);

-- Indexes for performance
CREATE INDEX idx_daily_reports_facility ON daily_reports(facility_id);
CREATE INDEX idx_daily_reports_dog ON daily_reports(dog_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE INDEX idx_daily_reports_program ON daily_reports(program_id);

CREATE INDEX idx_report_templates_facility ON report_templates(facility_id);
CREATE INDEX idx_report_preferences_family ON report_preferences(family_id);
CREATE INDEX idx_report_comments_report ON report_comments(report_id);
CREATE INDEX idx_report_reactions_report ON report_reactions(report_id);

-- Triggers for updated_at
CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_preferences_updated_at
  BEFORE UPDATE ON report_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_comments_updated_at
  BEFORE UPDATE ON report_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate report summary
CREATE OR REPLACE FUNCTION generate_report_summary(p_report_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_dog_name TEXT;
  v_activities JSONB;
  v_mood INTEGER;
  v_energy INTEGER;
  v_summary TEXT;
BEGIN
  SELECT
    d.name,
    dr.activities_summary,
    dr.mood_rating,
    dr.energy_level
  INTO v_dog_name, v_activities, v_mood, v_energy
  FROM daily_reports dr
  JOIN dogs d ON dr.dog_id = d.id
  WHERE dr.id = p_report_id;

  -- Generate basic summary
  v_summary := v_dog_name || ' had a ';

  IF v_mood >= 4 THEN
    v_summary := v_summary || 'great day! ';
  ELSIF v_mood >= 3 THEN
    v_summary := v_summary || 'good day. ';
  ELSIF v_mood >= 2 THEN
    v_summary := v_summary || 'decent day. ';
  ELSE
    v_summary := v_summary || 'challenging day. ';
  END IF;

  IF v_energy >= 4 THEN
    v_summary := v_summary || 'Energy levels were high throughout the day.';
  ELSIF v_energy >= 3 THEN
    v_summary := v_summary || 'Energy was steady and balanced.';
  ELSE
    v_summary := v_summary || 'Energy was a bit lower than usual.';
  END IF;

  RETURN v_summary;
END;
$$;

-- Row Level Security Policies

-- Daily Reports policies
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view reports in their facility"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create reports in their facility"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update reports in their facility"
  ON daily_reports FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can delete reports in their facility"
  ON daily_reports FOR DELETE
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Pet parents can view their dog's sent reports
CREATE POLICY "Pet parents can view their dog's reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    status = 'sent' AND
    dog_id IN (
      SELECT d.id FROM dogs d
      JOIN families f ON d.family_id = f.id
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

-- Report Templates policies
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage templates in their facility"
  ON report_templates FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Report Preferences policies
ALTER TABLE report_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family's preferences"
  ON report_preferences FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their family's preferences"
  ON report_preferences FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Report Comments policies
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on reports they can access"
  ON report_comments FOR SELECT
  TO authenticated
  USING (
    report_id IN (
      SELECT id FROM daily_reports WHERE
        facility_id IN (SELECT facility_id FROM user_profiles WHERE user_id = auth.uid())
        OR (
          status = 'sent' AND
          dog_id IN (
            SELECT d.id FROM dogs d
            JOIN families f ON d.family_id = f.id
            JOIN family_members fm ON f.id = fm.family_id
            WHERE fm.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Users can create comments"
  ON report_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON report_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON report_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Report Reactions policies
ALTER TABLE report_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
  ON report_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON report_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions"
  ON report_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
