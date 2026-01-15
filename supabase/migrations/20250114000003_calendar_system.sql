-- Board & Train Calendar System Migration
-- Supports scheduling for board & train stays, appointments, and training sessions

-- Create enum types
CREATE TYPE stay_status AS ENUM ('scheduled', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE appointment_type AS ENUM ('training', 'evaluation', 'pickup', 'dropoff', 'grooming', 'vet', 'other');
CREATE TYPE recurrence_pattern AS ENUM ('none', 'daily', 'weekly', 'biweekly', 'monthly');

-- Board & Train Stays table
-- Tracks dogs staying at the facility for training
CREATE TABLE IF NOT EXISTS board_train_stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,

  -- Stay dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  actual_check_in TIMESTAMPTZ,
  actual_check_out TIMESTAMPTZ,

  -- Status tracking
  status stay_status NOT NULL DEFAULT 'scheduled',

  -- Kennel/room assignment
  kennel_number TEXT,

  -- Notes
  special_instructions TEXT,
  dietary_notes TEXT,
  medical_notes TEXT,

  -- Pricing
  daily_rate DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2),
  deposit_paid BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT valid_stay_dates CHECK (check_out_date >= check_in_date)
);

-- Calendar Appointments table
-- General appointments for training sessions, pickups, evaluations, etc.
CREATE TABLE IF NOT EXISTS calendar_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  stay_id UUID REFERENCES board_train_stays(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Appointment details
  title TEXT NOT NULL,
  description TEXT,
  appointment_type appointment_type NOT NULL DEFAULT 'training',

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,

  -- Recurrence
  recurrence recurrence_pattern DEFAULT 'none',
  recurrence_end_date DATE,
  parent_appointment_id UUID REFERENCES calendar_appointments(id) ON DELETE CASCADE,

  -- Location
  location TEXT,

  -- Status
  is_confirmed BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,

  -- Notifications
  reminder_sent BOOLEAN DEFAULT false,
  notify_parent BOOLEAN DEFAULT true,

  -- Colors for calendar display
  color TEXT DEFAULT '#3B82F6',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT valid_appointment_times CHECK (end_time > start_time)
);

-- Calendar Blocks table
-- For blocking off time (holidays, facility closures, trainer unavailability)
CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Block details
  title TEXT NOT NULL,
  description TEXT,

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,

  -- Recurrence
  recurrence recurrence_pattern DEFAULT 'none',
  recurrence_end_date DATE,

  -- Type
  is_facility_closure BOOLEAN DEFAULT false,
  is_trainer_unavailable BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Training Schedule Templates table
-- For creating recurring training schedule patterns
CREATE TABLE IF NOT EXISTS training_schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Template details
  name TEXT NOT NULL,
  description TEXT,

  -- Default timing (day of week, time)
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,

  -- Default settings
  default_appointment_type appointment_type DEFAULT 'training',
  default_trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  default_location TEXT,
  default_color TEXT DEFAULT '#3B82F6',

  -- Active status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Stay Daily Logs table
-- Track daily activities for dogs during their stay
CREATE TABLE IF NOT EXISTS stay_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id UUID NOT NULL REFERENCES board_train_stays(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,

  -- Daily status
  mood TEXT,
  appetite TEXT,
  energy_level TEXT,

  -- Activities completed
  morning_potty BOOLEAN DEFAULT false,
  morning_potty_time TIMESTAMPTZ,
  afternoon_potty BOOLEAN DEFAULT false,
  afternoon_potty_time TIMESTAMPTZ,
  evening_potty BOOLEAN DEFAULT false,
  evening_potty_time TIMESTAMPTZ,

  -- Feeding
  breakfast_eaten BOOLEAN,
  lunch_eaten BOOLEAN,
  dinner_eaten BOOLEAN,

  -- Training sessions
  training_notes TEXT,

  -- General notes
  notes TEXT,

  -- Media
  photos JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logged_by UUID REFERENCES auth.users(id),

  -- Unique constraint for one log per day per stay
  UNIQUE(stay_id, log_date)
);

-- Indexes for performance
CREATE INDEX idx_board_train_stays_facility ON board_train_stays(facility_id);
CREATE INDEX idx_board_train_stays_dog ON board_train_stays(dog_id);
CREATE INDEX idx_board_train_stays_dates ON board_train_stays(check_in_date, check_out_date);
CREATE INDEX idx_board_train_stays_status ON board_train_stays(status);

CREATE INDEX idx_calendar_appointments_facility ON calendar_appointments(facility_id);
CREATE INDEX idx_calendar_appointments_dog ON calendar_appointments(dog_id);
CREATE INDEX idx_calendar_appointments_trainer ON calendar_appointments(trainer_id);
CREATE INDEX idx_calendar_appointments_dates ON calendar_appointments(start_time, end_time);
CREATE INDEX idx_calendar_appointments_stay ON calendar_appointments(stay_id);

CREATE INDEX idx_calendar_blocks_facility ON calendar_blocks(facility_id);
CREATE INDEX idx_calendar_blocks_trainer ON calendar_blocks(trainer_id);
CREATE INDEX idx_calendar_blocks_dates ON calendar_blocks(start_time, end_time);

CREATE INDEX idx_stay_daily_logs_stay ON stay_daily_logs(stay_id);
CREATE INDEX idx_stay_daily_logs_date ON stay_daily_logs(log_date);

-- Triggers for updated_at
CREATE TRIGGER update_board_train_stays_updated_at
  BEFORE UPDATE ON board_train_stays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_appointments_updated_at
  BEFORE UPDATE ON calendar_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_blocks_updated_at
  BEFORE UPDATE ON calendar_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_schedule_templates_updated_at
  BEFORE UPDATE ON training_schedule_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stay_daily_logs_updated_at
  BEFORE UPDATE ON stay_daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Board Train Stays policies
ALTER TABLE board_train_stays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view stays in their facility"
  ON board_train_stays FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can create stays in their facility"
  ON board_train_stays FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can update stays in their facility"
  ON board_train_stays FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can delete stays in their facility"
  ON board_train_stays FOR DELETE
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Pet parents can view their dog's stays
CREATE POLICY "Pet parents can view their dog's stays"
  ON board_train_stays FOR SELECT
  TO authenticated
  USING (
    dog_id IN (
      SELECT d.id FROM dogs d
      JOIN families f ON d.family_id = f.id
      JOIN users u ON f.primary_contact_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Calendar Appointments policies
ALTER TABLE calendar_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view appointments in their facility"
  ON calendar_appointments FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can create appointments in their facility"
  ON calendar_appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can update appointments in their facility"
  ON calendar_appointments FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can delete appointments in their facility"
  ON calendar_appointments FOR DELETE
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Pet parents can view their appointments
CREATE POLICY "Pet parents can view their appointments"
  ON calendar_appointments FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT f.id FROM families f JOIN users u ON f.primary_contact_id = u.id WHERE u.auth_id = auth.uid()
    )
    OR
    dog_id IN (
      SELECT d.id FROM dogs d
      JOIN families f ON d.family_id = f.id
      JOIN users u ON f.primary_contact_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Calendar Blocks policies
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view blocks in their facility"
  ON calendar_blocks FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can manage blocks in their facility"
  ON calendar_blocks FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Training Schedule Templates policies
ALTER TABLE training_schedule_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view templates in their facility"
  ON training_schedule_templates FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can manage templates in their facility"
  ON training_schedule_templates FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Stay Daily Logs policies
ALTER TABLE stay_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view logs for stays in their facility"
  ON stay_daily_logs FOR SELECT
  TO authenticated
  USING (
    stay_id IN (
      SELECT id FROM board_train_stays
      WHERE facility_id IN (
        get_user_facility_id(auth.uid())
      )
    )
  );

CREATE POLICY "Trainers can manage logs for stays in their facility"
  ON stay_daily_logs FOR ALL
  TO authenticated
  USING (
    stay_id IN (
      SELECT id FROM board_train_stays
      WHERE facility_id IN (
        get_user_facility_id(auth.uid())
      )
    )
  );

-- Pet parents can view logs for their dog's stays
CREATE POLICY "Pet parents can view their dog's stay logs"
  ON stay_daily_logs FOR SELECT
  TO authenticated
  USING (
    stay_id IN (
      SELECT bts.id FROM board_train_stays bts
      JOIN dogs d ON bts.dog_id = d.id
      JOIN families f ON d.family_id = f.id
      JOIN users u ON f.primary_contact_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );
