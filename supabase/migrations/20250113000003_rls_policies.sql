-- K9 TrainPro Row Level Security Policies
-- Implements multi-tenant security at the database level

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FACILITIES POLICIES
-- ============================================================================

-- Users can only see their own facility
CREATE POLICY "Users can view own facility"
  ON facilities FOR SELECT
  USING (id = get_user_facility_id(auth.uid()));

-- Only owners can update facility settings
CREATE POLICY "Owners can update facility"
  ON facilities FOR UPDATE
  USING (id = get_user_facility_id(auth.uid()) AND is_admin_or_owner(auth.uid()));

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can see other users in their facility
CREATE POLICY "Users can view facility users"
  ON users FOR SELECT
  USING (facility_id = get_user_facility_id(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- Admins/Owners can create users in their facility
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
  );

-- Admins/Owners can update any user in their facility
CREATE POLICY "Admins can update facility users"
  ON users FOR UPDATE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
  );

-- Admins/Owners can delete users in their facility
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
    AND auth_id != auth.uid() -- Can't delete self
  );

-- ============================================================================
-- FAMILIES POLICIES
-- ============================================================================

-- Trainers and above can view all families in their facility
CREATE POLICY "Trainers can view families"
  ON families FOR SELECT
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their own family
CREATE POLICY "Pet parents can view own family"
  ON families FOR SELECT
  USING (primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Trainers and above can create families
CREATE POLICY "Trainers can create families"
  ON families FOR INSERT
  WITH CHECK (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers and above can update families
CREATE POLICY "Trainers can update families"
  ON families FOR UPDATE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Admins can delete families
CREATE POLICY "Admins can delete families"
  ON families FOR DELETE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
  );

-- ============================================================================
-- DOGS POLICIES
-- ============================================================================

-- Trainers can view all dogs in their facility
CREATE POLICY "Trainers can view facility dogs"
  ON dogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = dogs.family_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their own dogs
CREATE POLICY "Pet parents can view own dogs"
  ON dogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = dogs.family_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can create dogs
CREATE POLICY "Trainers can create dogs"
  ON dogs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = dogs.family_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update dogs
CREATE POLICY "Trainers can update dogs"
  ON dogs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = dogs.family_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Admins can delete dogs
CREATE POLICY "Admins can delete dogs"
  ON dogs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = dogs.family_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_admin_or_owner(auth.uid())
  );

-- ============================================================================
-- PROGRAMS POLICIES
-- ============================================================================

-- Trainers can view all programs in their facility
CREATE POLICY "Trainers can view programs"
  ON programs FOR SELECT
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's programs
CREATE POLICY "Pet parents can view own programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = programs.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can create programs
CREATE POLICY "Trainers can create programs"
  ON programs FOR INSERT
  WITH CHECK (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update programs
CREATE POLICY "Trainers can update programs"
  ON programs FOR UPDATE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_trainer_or_above(auth.uid())
  );

-- Admins can delete programs
CREATE POLICY "Admins can delete programs"
  ON programs FOR DELETE
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND is_admin_or_owner(auth.uid())
  );

-- ============================================================================
-- ACTIVITIES POLICIES
-- ============================================================================

-- Trainers can view all activities in their facility
CREATE POLICY "Trainers can view activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = activities.program_id
        AND p.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's activities
CREATE POLICY "Pet parents can view own activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = activities.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can create activities
CREATE POLICY "Trainers can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = activities.program_id
        AND p.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update activities
CREATE POLICY "Trainers can update activities"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = activities.program_id
        AND p.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- ============================================================================
-- MEDIA POLICIES
-- ============================================================================

-- Trainers can view all media in their facility
CREATE POLICY "Trainers can view media"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = media.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's media
CREATE POLICY "Pet parents can view own media"
  ON media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = media.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can upload media
CREATE POLICY "Trainers can create media"
  ON media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = media.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update media
CREATE POLICY "Trainers can update media"
  ON media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = media.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can delete their own uploads
CREATE POLICY "Trainers can delete own media"
  ON media FOR DELETE
  USING (
    uploaded_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR is_admin_or_owner(auth.uid())
  );

-- ============================================================================
-- DAILY REPORTS POLICIES
-- ============================================================================

-- Trainers can view all reports in their facility
CREATE POLICY "Trainers can view reports"
  ON daily_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = daily_reports.program_id
        AND p.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's reports
CREATE POLICY "Pet parents can view own reports"
  ON daily_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = daily_reports.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can create reports
CREATE POLICY "Trainers can create reports"
  ON daily_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = daily_reports.program_id
        AND p.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Trainers can update reports
CREATE POLICY "Trainers can update reports"
  ON daily_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = daily_reports.program_id
        AND p.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- ============================================================================
-- BADGES POLICIES
-- ============================================================================

-- Trainers can view all badges in their facility
CREATE POLICY "Trainers can view badges"
  ON badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = badges.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's badges
CREATE POLICY "Pet parents can view own badges"
  ON badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = badges.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can award badges
CREATE POLICY "Trainers can create badges"
  ON badges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = badges.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Admins can delete badges
CREATE POLICY "Admins can delete badges"
  ON badges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = badges.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_admin_or_owner(auth.uid())
  );

-- ============================================================================
-- SKILLS POLICIES
-- ============================================================================

-- Trainers can view all skills in their facility
CREATE POLICY "Trainers can view skills"
  ON skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = skills.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Pet parents can view their dog's skills
CREATE POLICY "Pet parents can view own skills"
  ON skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = skills.dog_id
        AND f.primary_contact_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Trainers can create and update skills
CREATE POLICY "Trainers can create skills"
  ON skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = skills.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

CREATE POLICY "Trainers can update skills"
  ON skills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = skills.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_trainer_or_above(auth.uid())
  );

-- Admins can delete skills
CREATE POLICY "Admins can delete skills"
  ON skills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN families f ON d.family_id = f.id
      WHERE d.id = skills.dog_id
        AND f.facility_id = get_user_facility_id(auth.uid())
    )
    AND is_admin_or_owner(auth.uid())
  );
