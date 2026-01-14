-- K9 TrainPro Homework Assignment System
-- Enables trainers to assign homework to pet parents and track completion

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- Homework assignment status
CREATE TYPE homework_status AS ENUM ('draft', 'assigned', 'in_progress', 'completed', 'overdue');

-- Homework submission status
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'approved', 'needs_revision');

-- Homework difficulty level
CREATE TYPE homework_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- ============================================================================
-- TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- HOMEWORK_TEMPLATES
-- Reusable homework templates created by trainers
-- -----------------------------------------------------------------------------
CREATE TABLE homework_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  video_url TEXT, -- Demo video link
  difficulty homework_difficulty NOT NULL DEFAULT 'beginner',
  estimated_duration_minutes INTEGER, -- Expected time to complete
  skill_focus VARCHAR(100)[], -- Array of skills this homework targets
  tips TEXT, -- Additional tips for pet parents
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0, -- Track how often template is used
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- HOMEWORK_ASSIGNMENTS
-- Individual homework assignments given to specific dogs
-- -----------------------------------------------------------------------------
CREATE TABLE homework_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_id UUID REFERENCES homework_templates(id) ON DELETE SET NULL,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Assignment details (can override template or be custom)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  video_url TEXT,
  difficulty homework_difficulty NOT NULL DEFAULT 'beginner',

  -- Scheduling
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date DATE NOT NULL,

  -- Status tracking
  status homework_status NOT NULL DEFAULT 'assigned',
  completed_at TIMESTAMPTZ,

  -- Trainer customizations for this specific assignment
  custom_notes TEXT, -- Special notes for this dog/family
  repetitions_required INTEGER DEFAULT 1, -- How many times to practice

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- HOMEWORK_SUBMISSIONS
-- Pet parent submissions/progress updates for assignments
-- -----------------------------------------------------------------------------
CREATE TABLE homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Submission content
  notes TEXT, -- Pet parent notes/questions
  video_url TEXT, -- Video of practice session
  photo_urls TEXT[], -- Photos of progress

  -- Status
  status submission_status NOT NULL DEFAULT 'pending',

  -- Trainer feedback
  trainer_feedback TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  -- Rating (optional)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Homework Templates
CREATE INDEX idx_homework_templates_facility ON homework_templates(facility_id);
CREATE INDEX idx_homework_templates_created_by ON homework_templates(created_by);
CREATE INDEX idx_homework_templates_active ON homework_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_homework_templates_difficulty ON homework_templates(difficulty);

-- Homework Assignments
CREATE INDEX idx_homework_assignments_facility ON homework_assignments(facility_id);
CREATE INDEX idx_homework_assignments_dog ON homework_assignments(dog_id);
CREATE INDEX idx_homework_assignments_program ON homework_assignments(program_id);
CREATE INDEX idx_homework_assignments_template ON homework_assignments(template_id);
CREATE INDEX idx_homework_assignments_status ON homework_assignments(status);
CREATE INDEX idx_homework_assignments_due_date ON homework_assignments(due_date);
CREATE INDEX idx_homework_assignments_assigned_by ON homework_assignments(assigned_by);
CREATE INDEX idx_homework_assignments_pending ON homework_assignments(dog_id, status)
  WHERE status IN ('assigned', 'in_progress');

-- Homework Submissions
CREATE INDEX idx_homework_submissions_assignment ON homework_submissions(assignment_id);
CREATE INDEX idx_homework_submissions_submitted_by ON homework_submissions(submitted_by);
CREATE INDEX idx_homework_submissions_status ON homework_submissions(status);
CREATE INDEX idx_homework_submissions_pending_review ON homework_submissions(status)
  WHERE status = 'submitted';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update homework_templates.updated_at on modification
CREATE TRIGGER update_homework_templates_updated_at
  BEFORE UPDATE ON homework_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update homework_assignments.updated_at on modification
CREATE TRIGGER update_homework_assignments_updated_at
  BEFORE UPDATE ON homework_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment template usage count when assignment is created
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE homework_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER homework_assignment_increment_template_usage
  AFTER INSERT ON homework_assignments
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- Auto-update assignment status when submission is approved
CREATE OR REPLACE FUNCTION update_assignment_on_submission_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE homework_assignments
    SET status = 'completed', completed_at = NOW(), updated_at = NOW()
    WHERE id = NEW.assignment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER homework_submission_update_assignment
  AFTER UPDATE ON homework_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_assignment_on_submission_approved();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE homework_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- HOMEWORK TEMPLATES POLICIES
-- -----------------------------------------------------------------------------

-- Trainers can view all templates in their facility
CREATE POLICY "Trainers can view homework templates"
  ON homework_templates FOR SELECT
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can create templates
CREATE POLICY "Trainers can create homework templates"
  ON homework_templates FOR INSERT
  WITH CHECK (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update their own templates, admins can update any
CREATE POLICY "Trainers can update own templates"
  ON homework_templates FOR UPDATE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND (created_by = (SELECT id FROM users WHERE auth_id = auth.uid()) OR is_admin_or_owner(auth.uid()))
  );

-- Admins can delete templates
CREATE POLICY "Admins can delete homework templates"
  ON homework_templates FOR DELETE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
  );

-- -----------------------------------------------------------------------------
-- HOMEWORK ASSIGNMENTS POLICIES
-- -----------------------------------------------------------------------------

-- Trainers can view all assignments in their facility
CREATE POLICY "Trainers can view homework assignments"
  ON homework_assignments FOR SELECT
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's assignments
CREATE POLICY "Pet parents can view own assignments"
  ON homework_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = homework_assignments.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can create assignments
CREATE POLICY "Trainers can create homework assignments"
  ON homework_assignments FOR INSERT
  WITH CHECK (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update assignments
CREATE POLICY "Trainers can update homework assignments"
  ON homework_assignments FOR UPDATE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can update status to in_progress
CREATE POLICY "Pet parents can update assignment progress"
  ON homework_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = homework_assignments.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  )
  WITH CHECK (
    -- Pet parents can only change status to in_progress
    status IN ('assigned', 'in_progress')
  );

-- Admins can delete assignments
CREATE POLICY "Admins can delete homework assignments"
  ON homework_assignments FOR DELETE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
  );

-- -----------------------------------------------------------------------------
-- HOMEWORK SUBMISSIONS POLICIES
-- -----------------------------------------------------------------------------

-- Trainers can view all submissions in their facility
CREATE POLICY "Trainers can view homework submissions"
  ON homework_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM homework_assignments ha
      WHERE ha.id = homework_submissions.assignment_id
        AND ha.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their own submissions
CREATE POLICY "Pet parents can view own submissions"
  ON homework_submissions FOR SELECT
  USING (
    submitted_by = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Pet parents can create submissions for their assignments
CREATE POLICY "Pet parents can create submissions"
  ON homework_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homework_assignments ha
      JOIN dogs d ON ha.dog_id = d.id
      JOIN families f ON d.family_id = f.id
      WHERE ha.id = homework_submissions.assignment_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can also create submissions (on behalf of parents)
CREATE POLICY "Trainers can create submissions"
  ON homework_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM homework_assignments ha
      WHERE ha.id = homework_submissions.assignment_id
        AND ha.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update submissions (for feedback)
CREATE POLICY "Trainers can update submissions"
  ON homework_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM homework_assignments ha
      WHERE ha.id = homework_submissions.assignment_id
        AND ha.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can update their own pending submissions
CREATE POLICY "Pet parents can update own submissions"
  ON homework_submissions FOR UPDATE
  USING (
    submitted_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND status = 'pending'
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE homework_templates IS 'Reusable homework templates created by trainers';
COMMENT ON TABLE homework_assignments IS 'Individual homework assignments for specific dogs';
COMMENT ON TABLE homework_submissions IS 'Pet parent submissions and progress updates';
