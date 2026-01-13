-- K9 TrainPro Seed Data
-- Demo data for development and testing
-- Note: Run this AFTER migrations and AFTER creating auth users

-- ============================================================================
-- DEMO FACILITY
-- ============================================================================

INSERT INTO facilities (
  id,
  name,
  logo_url,
  address,
  city,
  state,
  zip,
  phone,
  email,
  website,
  timezone,
  subscription_tier,
  settings
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Ultimate K9 Training',
  NULL,
  '1234 Training Way',
  'La Plata',
  'MD',
  '20646',
  '(301) 555-0123',
  'info@ultimatek9.com',
  'https://ultimatek9.com',
  'America/New_York',
  'professional',
  '{
    "kennel_max_minutes": 240,
    "potty_interval_minutes": 120,
    "daily_report_time": "18:00",
    "enable_realtime_updates": true,
    "enable_photo_sharing": true,
    "branding_primary_color": "#f59e0b"
  }'::jsonb
);

-- ============================================================================
-- DEMO USERS
-- Note: auth_id should match Supabase Auth users when created
-- For demo mode, these use placeholder UUIDs
-- ============================================================================

-- Owner/Admin
INSERT INTO users (id, auth_id, facility_id, email, name, role, phone, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'owner@ultimatek9.com', 'John Smith', 'owner', '(301) 555-0101', true);

-- Trainers
INSERT INTO users (id, auth_id, facility_id, email, name, role, phone, is_active) VALUES
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'sarah@ultimatek9.com', 'Sarah Johnson', 'trainer', '(301) 555-0102', true),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'mike@ultimatek9.com', 'Mike Williams', 'trainer', '(301) 555-0103', true);

-- ============================================================================
-- DEMO FAMILIES
-- ============================================================================

INSERT INTO families (id, facility_id, primary_contact_id, name, address, city, state, zip, phone, email, emergency_contact_name, emergency_contact_phone, vet_name, vet_phone) VALUES
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', NULL, 'The Anderson Family', '456 Oak Street', 'Waldorf', 'MD', '20601', '(301) 555-1001', 'anderson@email.com', 'Jane Anderson', '(301) 555-1002', 'Waldorf Animal Hospital', '(301) 555-8001'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NULL, 'The Martinez Family', '789 Pine Ave', 'La Plata', 'MD', '20646', '(301) 555-2001', 'martinez@email.com', 'Carlos Martinez', '(301) 555-2002', 'La Plata Pet Clinic', '(301) 555-8002'),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', NULL, 'The Thompson Family', '321 Maple Dr', 'Brandywine', 'MD', '20613', '(301) 555-3001', 'thompson@email.com', 'Lisa Thompson', '(301) 555-3002', 'Brandywine Vet', '(301) 555-8003');

-- ============================================================================
-- DEMO DOGS
-- ============================================================================

INSERT INTO dogs (id, family_id, name, breed, date_of_birth, weight, gender, color, medical_notes, behavior_notes, feeding_instructions, is_active) VALUES
  -- Anderson Family Dogs
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Max', 'German Shepherd', '2022-03-15', 85.5, 'male', 'Black and Tan', 'No known allergies', 'High energy, loves to play fetch', '2 cups morning, 2 cups evening - Purina Pro Plan', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'Bella', 'Golden Retriever', '2023-01-20', 65.0, 'female', 'Golden', 'Sensitive stomach', 'Very friendly, good with other dogs', '1.5 cups morning, 1.5 cups evening - Hill''s Science Diet', true),

  -- Martinez Family Dogs
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 'Luna', 'Border Collie', '2021-08-10', 42.0, 'female', 'Black and White', NULL, 'Extremely intelligent, needs mental stimulation', '1.5 cups twice daily', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', 'Rocky', 'Rottweiler', '2020-05-22', 110.0, 'male', 'Black and Mahogany', 'Hip dysplasia - avoid jumping', 'Protective, needs confident handling', '2.5 cups twice daily with glucosamine supplement', true),

  -- Thompson Family Dogs
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'Charlie', 'Labrador Retriever', '2022-11-05', 72.0, 'male', 'Yellow', NULL, 'Food motivated, eager to please', '2 cups twice daily', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', 'Daisy', 'Beagle', '2023-04-18', 25.0, 'female', 'Tricolor', 'Seasonal allergies', 'Strong nose, easily distracted by scents', '1 cup twice daily', true);

-- ============================================================================
-- DEMO PROGRAMS
-- ============================================================================

INSERT INTO programs (id, dog_id, facility_id, type, name, start_date, end_date, status, assigned_trainer_id, goals, notes, price) VALUES
  -- Active Board & Train Programs
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'board_train', '3-Week Board & Train', '2025-01-06', '2025-01-27', 'active', '33333333-3333-3333-3333-333333333333', ARRAY['Reliable recall', 'Loose leash walking', 'Place command'], 'Max is doing great with basic obedience. Working on recall with distractions.', 3500.00),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'board_train', '2-Week Intensive', '2025-01-08', '2025-01-22', 'active', '44444444-4444-4444-4444-444444444444', ARRAY['Advanced obedience', 'Off-leash reliability', 'Trick training'], 'Luna is excelling! Very quick learner.', 2800.00),
  ('33333333-aaaa-aaaa-aaaa-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'board_train', '3-Week Board & Train', '2025-01-10', '2025-01-31', 'active', '33333333-3333-3333-3333-333333333333', ARRAY['Impulse control', 'Calm greetings', 'Public access manners'], 'Rocky is making progress with impulse control. Being careful with high-impact activities.', 3500.00),

  -- Day Training Programs
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'day_train', 'Day Training - Puppy Foundations', '2025-01-06', '2025-02-14', 'active', '44444444-4444-4444-4444-444444444444', ARRAY['House training support', 'Basic commands', 'Socialization'], 'Bella is a sweetheart! Working on sit, down, and crate training.', 1200.00),
  ('55555555-aaaa-aaaa-aaaa-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'day_train', 'Day Training - Obedience Refresh', '2025-01-13', '2025-02-07', 'scheduled', '33333333-3333-3333-3333-333333333333', ARRAY['Recall reliability', 'Duration stays'], 'Charlie knows basics but needs consistency work.', 800.00),

  -- Completed Program
  ('66666666-aaaa-aaaa-aaaa-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'board_train', '2-Week Board & Train', '2024-12-09', '2024-12-23', 'completed', '44444444-4444-4444-4444-444444444444', ARRAY['Recall', 'Leash manners', 'Place command'], 'Daisy graduated with flying colors! Great improvement on scent distractions.', 2800.00);

-- ============================================================================
-- DEMO ACTIVITIES (Today's activities)
-- ============================================================================

-- Max's activities today
INSERT INTO activities (program_id, dog_id, type, started_at, ended_at, duration_minutes, trainer_id, notes) VALUES
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'potty', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 50 minutes', 10, '33333333-3333-3333-3333-333333333333', 'Successful potty break'),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'feeding', NOW() - INTERVAL '5 hours 50 minutes', NOW() - INTERVAL '5 hours 30 minutes', 20, '33333333-3333-3333-3333-333333333333', 'Ate all breakfast'),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'training', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 15 minutes', 45, '33333333-3333-3333-3333-333333333333', 'Worked on recall with long line. Good progress!'),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'play', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 30 minutes', 30, '33333333-3333-3333-3333-333333333333', 'Fetch session in yard'),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'kennel', NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '1 hour', 150, '33333333-3333-3333-3333-333333333333', 'Rest time'),
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'potty', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '55 minutes', 5, '33333333-3333-3333-3333-333333333333', NULL);

-- Currently active activity for Max
INSERT INTO activities (program_id, dog_id, type, started_at, trainer_id, notes) VALUES
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'training', NOW() - INTERVAL '45 minutes', '33333333-3333-3333-3333-333333333333', 'Working on place command duration');

-- Luna's activities today
INSERT INTO activities (program_id, dog_id, type, started_at, ended_at, duration_minutes, trainer_id, notes) VALUES
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'potty', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 55 minutes', 5, '44444444-4444-4444-4444-444444444444', NULL),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'training', NOW() - INTERVAL '4 hours 30 minutes', NOW() - INTERVAL '3 hours 45 minutes', 45, '44444444-4444-4444-4444-444444444444', 'Trick training - spin and weave. She loves it!'),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'group_play', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 15 minutes', 45, '44444444-4444-4444-4444-444444444444', 'Played with Bella - great energy match');

-- Currently active for Luna
INSERT INTO activities (program_id, dog_id, type, started_at, trainer_id, notes) VALUES
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'rest', NOW() - INTERVAL '2 hours', '44444444-4444-4444-4444-444444444444', 'Nap time after play session');

-- Rocky - in kennel longer (will trigger alert)
INSERT INTO activities (program_id, dog_id, type, started_at, trainer_id, notes) VALUES
  ('33333333-aaaa-aaaa-aaaa-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'kennel', NOW() - INTERVAL '3 hours 45 minutes', '33333333-3333-3333-3333-333333333333', 'Scheduled for afternoon training session');

-- Bella - day training
INSERT INTO activities (program_id, dog_id, type, started_at, trainer_id, notes) VALUES
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'play', NOW() - INTERVAL '25 minutes', '44444444-4444-4444-4444-444444444444', 'Free play in yard');

-- ============================================================================
-- DEMO BADGES
-- ============================================================================

INSERT INTO badges (dog_id, badge_type, tier, awarded_by, program_id, notes) VALUES
  -- Max's badges
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'skill_tier', 'bronze', '33333333-3333-3333-3333-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Completed basic obedience foundations'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'day_one', NULL, '33333333-3333-3333-3333-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'First day of training!'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'week_one', NULL, '33333333-3333-3333-3333-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Completed first week'),

  -- Luna's badges
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'skill_tier', 'silver', '44444444-4444-4444-4444-444444444444', '22222222-aaaa-aaaa-aaaa-222222222222', 'Advanced to silver tier'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'star_pupil', NULL, '44444444-4444-4444-4444-444444444444', '22222222-aaaa-aaaa-aaaa-222222222222', 'Learned 3 new tricks in one day!'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'quick_learner', NULL, '44444444-4444-4444-4444-444444444444', '22222222-aaaa-aaaa-aaaa-222222222222', 'Mastered recall in less than 3 days'),

  -- Rocky's badges
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'skill_tier', 'bronze', '33333333-3333-3333-3333-333333333333', '33333333-aaaa-aaaa-aaaa-333333333333', 'Good foundation work'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'zen_master', NULL, '33333333-3333-3333-3333-333333333333', '33333333-aaaa-aaaa-aaaa-333333333333', 'Held place for 15 minutes!'),

  -- Daisy's badges (graduated program)
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'skill_tier', 'gold', '44444444-4444-4444-4444-444444444444', '66666666-aaaa-aaaa-aaaa-666666666666', 'Completed program with excellence'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'graduate', NULL, '44444444-4444-4444-4444-444444444444', '66666666-aaaa-aaaa-aaaa-666666666666', 'Successfully completed Board & Train'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'recall_pro', NULL, '44444444-4444-4444-4444-444444444444', '66666666-aaaa-aaaa-aaaa-666666666666', 'Perfect recall at 50+ feet'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'perfect_potty', NULL, '44444444-4444-4444-4444-444444444444', '66666666-aaaa-aaaa-aaaa-666666666666', 'No accidents for 7 consecutive days');

-- ============================================================================
-- DEMO SKILLS
-- ============================================================================

INSERT INTO skills (dog_id, program_id, skill_name, proficiency, notes, practice_count) VALUES
  -- Max's skills
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-111111111111', 'Sit', 'mastered', 'Reliable with duration', 50),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-111111111111', 'Down', 'mastered', NULL, 45),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-111111111111', 'Place', 'practicing', 'Working on duration and distance', 30),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-111111111111', 'Recall', 'practicing', 'Good in low distraction, working on proofing', 35),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-aaaa-aaaa-111111111111', 'Loose Leash Walking', 'learning', 'Making progress', 20),

  -- Luna's skills
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-aaaa-aaaa-aaaa-222222222222', 'Sit', 'mastered', NULL, 60),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-aaaa-aaaa-aaaa-222222222222', 'Down', 'mastered', NULL, 55),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-aaaa-aaaa-aaaa-222222222222', 'Place', 'mastered', 'Can hold for 30+ minutes', 50),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-aaaa-aaaa-aaaa-222222222222', 'Recall', 'mastered', 'Reliable off-leash', 65),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-aaaa-aaaa-aaaa-222222222222', 'Spin', 'mastered', 'Both directions', 25),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-aaaa-aaaa-aaaa-222222222222', 'Weave', 'practicing', 'Through legs', 15),

  -- Rocky's skills
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-aaaa-aaaa-aaaa-333333333333', 'Sit', 'mastered', NULL, 40),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-aaaa-aaaa-aaaa-333333333333', 'Down', 'practicing', 'Working on immediate response', 30),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-aaaa-aaaa-aaaa-333333333333', 'Place', 'practicing', 'Duration focus', 35),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-aaaa-aaaa-aaaa-333333333333', 'Calm Greetings', 'learning', 'Main focus area', 20);

-- ============================================================================
-- DEMO DAILY REPORT (for yesterday)
-- ============================================================================

INSERT INTO daily_reports (program_id, dog_id, date, auto_summary, trainer_notes, mood_rating, energy_level, appetite_rating, potty_success_rate, sent_at, opened_at) VALUES
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - 1,
   'Max had a great day! Training: 90 minutes. Play time: 60 minutes. Potty breaks: 6.',
   'Max is making excellent progress on his recall work. Today we introduced the e-collar on the lowest setting and he responded beautifully. His place command is getting stronger - we''re up to 10 minutes of duration now. He played well with Luna during group play and seems to be enjoying his time here. Looking forward to working on loose leash walking tomorrow!',
   5, 4, 5, 100,
   (CURRENT_DATE - 1 + TIME '18:00')::TIMESTAMPTZ,
   (CURRENT_DATE - 1 + TIME '18:45')::TIMESTAMPTZ
  ),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE - 1,
   'Luna had a great day! Training: 60 minutes. Play time: 45 minutes. Potty breaks: 5.',
   'Luna continues to impress us with her intelligence and eagerness to learn. She mastered the "spin" trick today and we started working on "weave through legs." Her off-leash recall is now nearly 100% reliable even with distractions. She''s such a joy to work with!',
   5, 5, 5, 100,
   (CURRENT_DATE - 1 + TIME '18:00')::TIMESTAMPTZ,
   (CURRENT_DATE - 1 + TIME '19:15')::TIMESTAMPTZ
  );
