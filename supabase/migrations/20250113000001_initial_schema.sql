-- K9 ProTrain Initial Schema Migration
-- Creates all core tables, enums, and indexes

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles within a facility
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'trainer', 'pet_parent');

-- Program types offered by facilities
CREATE TYPE program_type AS ENUM ('board_train', 'day_train', 'private_lesson', 'group_class');

-- Program status lifecycle
CREATE TYPE program_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');

-- Activity types for tracking dog activities
CREATE TYPE activity_type AS ENUM (
  'kennel',
  'potty',
  'training',
  'play',
  'group_play',
  'feeding',
  'rest',
  'walk',
  'grooming',
  'medical'
);

-- Badge tiers for gamification
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');

-- Skill proficiency levels
CREATE TYPE skill_proficiency AS ENUM ('learning', 'practicing', 'mastered');

-- Media types for uploads
CREATE TYPE media_type AS ENUM ('photo', 'video');

-- Subscription tiers for facilities
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- Dog gender
CREATE TYPE dog_gender AS ENUM ('male', 'female');

-- ============================================================================
-- TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- FACILITIES
-- Training facilities/organizations (multi-tenant root)
-- -----------------------------------------------------------------------------
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  settings JSONB DEFAULT '{
    "kennel_max_minutes": 240,
    "potty_interval_minutes": 120,
    "daily_report_time": "18:00",
    "enable_realtime_updates": true,
    "enable_photo_sharing": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- USERS
-- All users within the system (trainers, admins, pet parents)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE, -- References Supabase auth.users
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'trainer',
  avatar_url TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- FAMILIES
-- Pet parent families/households
-- -----------------------------------------------------------------------------
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  primary_contact_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  vet_name VARCHAR(255),
  vet_phone VARCHAR(50),
  vet_address VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- DOGS
-- Individual dogs belonging to families
-- -----------------------------------------------------------------------------
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100),
  date_of_birth DATE,
  weight DECIMAL(5, 2), -- in pounds
  gender dog_gender,
  color VARCHAR(100),
  photo_url TEXT,
  microchip_id VARCHAR(100),
  medical_notes TEXT,
  behavior_notes TEXT,
  feeding_instructions TEXT,
  medications TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- PROGRAMS
-- Training programs for dogs
-- -----------------------------------------------------------------------------
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  type program_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status program_status NOT NULL DEFAULT 'scheduled',
  assigned_trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  goals TEXT[], -- Array of training goals
  notes TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ACTIVITIES
-- Activity logs for dogs (the core of the training board)
-- -----------------------------------------------------------------------------
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculated when activity ends
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  buddy_dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL, -- For group play/buddy tracking
  location VARCHAR(100), -- Optional: where the activity took place
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- MEDIA
-- Photos and videos attached to activities or dogs
-- -----------------------------------------------------------------------------
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  type media_type NOT NULL DEFAULT 'photo',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_highlight BOOLEAN NOT NULL DEFAULT false, -- Featured in daily reports
  file_size INTEGER, -- in bytes
  metadata JSONB DEFAULT '{}'::jsonb, -- EXIF data, dimensions, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- DAILY_REPORTS
-- Auto-generated or manual daily reports for pet parents
-- -----------------------------------------------------------------------------
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  auto_summary TEXT, -- AI/system generated summary
  trainer_notes TEXT, -- Manual trainer input
  highlight_photos UUID[], -- Array of media IDs
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  appetite_rating INTEGER CHECK (appetite_rating >= 1 AND appetite_rating <= 5),
  potty_success_rate INTEGER CHECK (potty_success_rate >= 0 AND potty_success_rate <= 100),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  email_id VARCHAR(255), -- For tracking email delivery
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one report per dog per day
  UNIQUE(dog_id, date)
);

-- -----------------------------------------------------------------------------
-- BADGES
-- Earned badges for gamification
-- -----------------------------------------------------------------------------
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  badge_type VARCHAR(100) NOT NULL, -- e.g., 'recall_pro', 'zen_master', 'star_pupil'
  tier badge_tier, -- For tiered badges (skill levels)
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL, -- Which program earned it
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate badges (same type and tier for a dog)
  UNIQUE(dog_id, badge_type, tier)
);

-- -----------------------------------------------------------------------------
-- SKILLS
-- Skill tracking for dogs
-- -----------------------------------------------------------------------------
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  skill_name VARCHAR(100) NOT NULL,
  proficiency skill_proficiency NOT NULL DEFAULT 'learning',
  before_video_url TEXT,
  after_video_url TEXT,
  notes TEXT,
  last_practiced_at TIMESTAMPTZ,
  practice_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One skill per dog (can update proficiency)
  UNIQUE(dog_id, skill_name)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Facilities
CREATE INDEX idx_facilities_subscription ON facilities(subscription_tier);

-- Users
CREATE INDEX idx_users_facility ON users(facility_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Families
CREATE INDEX idx_families_facility ON families(facility_id);
CREATE INDEX idx_families_primary_contact ON families(primary_contact_id);

-- Dogs
CREATE INDEX idx_dogs_family ON dogs(family_id);
CREATE INDEX idx_dogs_is_active ON dogs(is_active);
CREATE INDEX idx_dogs_name ON dogs(name);

-- Programs
CREATE INDEX idx_programs_dog ON programs(dog_id);
CREATE INDEX idx_programs_facility ON programs(facility_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_trainer ON programs(assigned_trainer_id);
CREATE INDEX idx_programs_dates ON programs(start_date, end_date);
CREATE INDEX idx_programs_active ON programs(status) WHERE status = 'active';

-- Activities
CREATE INDEX idx_activities_program ON activities(program_id);
CREATE INDEX idx_activities_dog ON activities(dog_id);
CREATE INDEX idx_activities_trainer ON activities(trainer_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_started_at ON activities(started_at);
-- Date-based index removed (timezone-dependent cast not immutable)
CREATE INDEX idx_activities_active ON activities(dog_id, ended_at) WHERE ended_at IS NULL;

-- Media
CREATE INDEX idx_media_activity ON media(activity_id);
CREATE INDEX idx_media_dog ON media(dog_id);
CREATE INDEX idx_media_program ON media(program_id);
CREATE INDEX idx_media_highlights ON media(dog_id, is_highlight) WHERE is_highlight = true;
CREATE INDEX idx_media_created ON media(created_at);

-- Daily Reports
CREATE INDEX idx_daily_reports_program ON daily_reports(program_id);
CREATE INDEX idx_daily_reports_dog ON daily_reports(dog_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(date);
CREATE INDEX idx_daily_reports_unsent ON daily_reports(sent_at) WHERE sent_at IS NULL;

-- Badges
CREATE INDEX idx_badges_dog ON badges(dog_id);
CREATE INDEX idx_badges_type ON badges(badge_type);
CREATE INDEX idx_badges_earned ON badges(earned_at);

-- Skills
CREATE INDEX idx_skills_dog ON skills(dog_id);
CREATE INDEX idx_skills_proficiency ON skills(proficiency);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE facilities IS 'Training facilities/organizations - multi-tenant root entity';
COMMENT ON TABLE users IS 'All users in the system including trainers, admins, and pet parents';
COMMENT ON TABLE families IS 'Pet parent families/households that own dogs';
COMMENT ON TABLE dogs IS 'Individual dogs belonging to families';
COMMENT ON TABLE programs IS 'Training programs (board & train, day training, etc.)';
COMMENT ON TABLE activities IS 'Activity logs for dogs - core of the training board';
COMMENT ON TABLE media IS 'Photos and videos attached to activities or dogs';
COMMENT ON TABLE daily_reports IS 'Daily reports sent to pet parents';
COMMENT ON TABLE badges IS 'Gamification badges earned by dogs';
COMMENT ON TABLE skills IS 'Skills being learned/mastered by dogs';
