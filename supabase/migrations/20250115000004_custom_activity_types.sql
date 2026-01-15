-- =============================================
-- Custom Activity Types System
-- =============================================
-- Allows facilities to create custom activity types
-- and customize icons/colors for existing activities

-- Available icon library (Lucide icon names)
CREATE TABLE icon_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  tags TEXT[], -- searchable tags
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed icon library with common icons
INSERT INTO icon_library (name, category, tags) VALUES
  -- Animals
  ('Dog', 'animals', ARRAY['pet', 'animal', 'walk', 'canine']),
  ('Cat', 'animals', ARRAY['pet', 'animal', 'feline']),
  ('Paw', 'animals', ARRAY['pet', 'animal', 'track']),
  ('Bird', 'animals', ARRAY['pet', 'animal', 'flying']),
  ('Fish', 'animals', ARRAY['pet', 'animal', 'aquatic']),
  ('Bug', 'animals', ARRAY['insect', 'critter']),
  ('Rabbit', 'animals', ARRAY['pet', 'animal', 'bunny']),

  -- Activities
  ('Home', 'activities', ARRAY['kennel', 'house', 'shelter', 'rest']),
  ('Droplets', 'activities', ARRAY['water', 'potty', 'bathroom', 'hydrate']),
  ('GraduationCap', 'activities', ARRAY['training', 'learn', 'education', 'school']),
  ('Gamepad2', 'activities', ARRAY['play', 'game', 'fun', 'recreation']),
  ('UtensilsCrossed', 'activities', ARRAY['feeding', 'food', 'eat', 'meal']),
  ('Moon', 'activities', ARRAY['rest', 'sleep', 'night', 'nap']),
  ('Sparkles', 'activities', ARRAY['grooming', 'clean', 'shine', 'spa']),
  ('Stethoscope', 'activities', ARRAY['medical', 'health', 'vet', 'doctor']),
  ('Dumbbell', 'activities', ARRAY['exercise', 'workout', 'fitness', 'strength']),
  ('Timer', 'activities', ARRAY['time', 'clock', 'schedule']),
  ('Target', 'activities', ARRAY['goal', 'focus', 'aim', 'training']),
  ('Trophy', 'activities', ARRAY['achievement', 'win', 'success', 'reward']),
  ('Medal', 'activities', ARRAY['award', 'achievement', 'badge']),
  ('Star', 'activities', ARRAY['favorite', 'special', 'highlight']),
  ('Heart', 'activities', ARRAY['love', 'care', 'favorite', 'health']),
  ('Zap', 'activities', ARRAY['energy', 'fast', 'quick', 'electric']),
  ('Flame', 'activities', ARRAY['hot', 'fire', 'energy', 'intense']),
  ('Snowflake', 'activities', ARRAY['cold', 'winter', 'cool']),
  ('Sun', 'activities', ARRAY['day', 'outdoor', 'bright', 'morning']),
  ('CloudRain', 'activities', ARRAY['weather', 'rain', 'wet']),

  -- Movement
  ('FootprintsIcon', 'movement', ARRAY['walk', 'steps', 'track', 'hiking']),
  ('Bike', 'movement', ARRAY['cycle', 'exercise', 'outdoor']),
  ('Car', 'movement', ARRAY['drive', 'transport', 'travel']),
  ('Plane', 'movement', ARRAY['fly', 'travel', 'trip']),
  ('MapPin', 'movement', ARRAY['location', 'place', 'destination']),
  ('Navigation', 'movement', ARRAY['direction', 'route', 'guide']),
  ('Compass', 'movement', ARRAY['direction', 'explore', 'navigate']),

  -- Objects
  ('Bone', 'objects', ARRAY['treat', 'reward', 'toy', 'dog']),
  ('Cookie', 'objects', ARRAY['treat', 'snack', 'reward']),
  ('Apple', 'objects', ARRAY['food', 'healthy', 'snack', 'fruit']),
  ('Coffee', 'objects', ARRAY['drink', 'beverage', 'break']),
  ('Pill', 'objects', ARRAY['medicine', 'medical', 'health', 'medication']),
  ('Syringe', 'objects', ARRAY['injection', 'medical', 'vaccine', 'shot']),
  ('Bandage', 'objects', ARRAY['injury', 'medical', 'heal', 'wound']),
  ('Scissors', 'objects', ARRAY['cut', 'grooming', 'trim']),
  ('Brush', 'objects', ARRAY['grooming', 'clean', 'brush']),
  ('Spray', 'objects', ARRAY['clean', 'spray', 'mist']),
  ('Shirt', 'objects', ARRAY['clothing', 'dress', 'costume']),
  ('Gift', 'objects', ARRAY['present', 'reward', 'surprise']),
  ('Package', 'objects', ARRAY['box', 'delivery', 'item']),
  ('Key', 'objects', ARRAY['access', 'unlock', 'security']),
  ('Lock', 'objects', ARRAY['secure', 'safety', 'locked']),
  ('Bell', 'objects', ARRAY['alert', 'notification', 'ring']),
  ('Megaphone', 'objects', ARRAY['announce', 'loud', 'speak']),
  ('Music', 'objects', ARRAY['sound', 'audio', 'song']),
  ('Camera', 'objects', ARRAY['photo', 'picture', 'capture']),
  ('Video', 'objects', ARRAY['record', 'movie', 'film']),
  ('Book', 'objects', ARRAY['read', 'learn', 'study']),
  ('Clipboard', 'objects', ARRAY['notes', 'list', 'checklist']),
  ('FileText', 'objects', ARRAY['document', 'notes', 'report']),
  ('Calendar', 'objects', ARRAY['date', 'schedule', 'event']),

  -- People/Social
  ('Users', 'social', ARRAY['group', 'team', 'people', 'social']),
  ('UserPlus', 'social', ARRAY['add', 'new', 'invite', 'person']),
  ('HandHeart', 'social', ARRAY['care', 'love', 'volunteer', 'help']),
  ('Handshake', 'social', ARRAY['meet', 'greet', 'agreement']),
  ('MessageCircle', 'social', ARRAY['chat', 'talk', 'communication']),
  ('Phone', 'social', ARRAY['call', 'contact', 'communication']),

  -- Nature/Outdoor
  ('TreePine', 'nature', ARRAY['outdoor', 'forest', 'nature', 'hike']),
  ('Flower', 'nature', ARRAY['garden', 'nature', 'plant']),
  ('Leaf', 'nature', ARRAY['nature', 'plant', 'green', 'eco']),
  ('Mountain', 'nature', ARRAY['outdoor', 'hiking', 'adventure']),
  ('Waves', 'nature', ARRAY['water', 'ocean', 'swim', 'beach']),

  -- Status/Indicators
  ('CheckCircle', 'status', ARRAY['done', 'complete', 'success', 'yes']),
  ('XCircle', 'status', ARRAY['cancel', 'no', 'stop', 'error']),
  ('AlertCircle', 'status', ARRAY['warning', 'caution', 'alert']),
  ('Info', 'status', ARRAY['information', 'help', 'details']),
  ('HelpCircle', 'status', ARRAY['question', 'help', 'support']),
  ('Clock', 'status', ARRAY['time', 'schedule', 'wait']),
  ('Hourglass', 'status', ARRAY['wait', 'time', 'pending']),
  ('RefreshCw', 'status', ARRAY['refresh', 'repeat', 'sync']),
  ('TrendingUp', 'status', ARRAY['progress', 'improve', 'growth']),
  ('TrendingDown', 'status', ARRAY['decline', 'decrease', 'down']),
  ('ThumbsUp', 'status', ARRAY['good', 'approve', 'like', 'yes']),
  ('ThumbsDown', 'status', ARRAY['bad', 'disapprove', 'dislike', 'no']);

-- Custom activity types per facility
CREATE TABLE custom_activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Activity identification
  code VARCHAR(50) NOT NULL, -- unique code within facility (snake_case)
  label VARCHAR(100) NOT NULL, -- display name
  description TEXT,

  -- Icon configuration
  icon_name VARCHAR(50) NOT NULL DEFAULT 'Star', -- Lucide icon name
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1', -- hex color
  bg_color VARCHAR(20), -- optional background color
  glow_color VARCHAR(30), -- optional glow effect color

  -- Timer configuration
  max_minutes INTEGER DEFAULT 60,
  warning_minutes INTEGER DEFAULT 45,

  -- Categorization
  category VARCHAR(50) DEFAULT 'custom', -- for grouping in UI
  sort_order INTEGER DEFAULT 100,

  -- Feature flags
  is_active BOOLEAN DEFAULT TRUE,
  show_in_quick_log BOOLEAN DEFAULT TRUE,
  allow_notes BOOLEAN DEFAULT TRUE,
  allow_buddy BOOLEAN DEFAULT FALSE, -- allow pairing with another dog
  track_location BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(facility_id, code)
);

-- Activity type overrides (customize built-in activity types)
CREATE TABLE activity_type_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Which built-in type to override
  activity_type activity_type NOT NULL,

  -- Override values (null means use default)
  custom_label VARCHAR(100),
  custom_icon VARCHAR(50),
  custom_color VARCHAR(20),
  custom_bg_color VARCHAR(20),
  custom_glow_color VARCHAR(30),
  custom_max_minutes INTEGER,
  custom_warning_minutes INTEGER,

  -- Visibility
  is_hidden BOOLEAN DEFAULT FALSE, -- hide this activity type for facility
  show_in_quick_log BOOLEAN DEFAULT TRUE,
  sort_order INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(facility_id, activity_type)
);

-- Add custom_activity_type_id to activities table to support custom types
ALTER TABLE activities
  ADD COLUMN custom_activity_type_id UUID REFERENCES custom_activity_types(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_custom_activity_types_facility ON custom_activity_types(facility_id);
CREATE INDEX idx_custom_activity_types_active ON custom_activity_types(facility_id, is_active);
CREATE INDEX idx_activity_type_overrides_facility ON activity_type_overrides(facility_id);
CREATE INDEX idx_activities_custom_type ON activities(custom_activity_type_id);
CREATE INDEX idx_icon_library_category ON icon_library(category);
CREATE INDEX idx_icon_library_tags ON icon_library USING GIN(tags);

-- Function to get activity configuration for a facility
-- Returns built-in types (with overrides applied) + custom types
CREATE OR REPLACE FUNCTION get_facility_activity_types(p_facility_id UUID)
RETURNS TABLE (
  type_code TEXT,
  type_label TEXT,
  icon_name TEXT,
  color TEXT,
  bg_color TEXT,
  glow_color TEXT,
  max_minutes INTEGER,
  warning_minutes INTEGER,
  is_custom BOOLEAN,
  custom_type_id UUID,
  show_in_quick_log BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  -- Return built-in types with overrides
  RETURN QUERY
  SELECT
    t.type::TEXT as type_code,
    COALESCE(o.custom_label, t.label) as type_label,
    COALESCE(o.custom_icon, t.default_icon) as icon_name,
    COALESCE(o.custom_color, t.default_color) as color,
    COALESCE(o.custom_bg_color, t.default_bg_color) as bg_color,
    COALESCE(o.custom_glow_color, t.default_glow_color) as glow_color,
    COALESCE(o.custom_max_minutes, t.default_max_minutes) as max_minutes,
    COALESCE(o.custom_warning_minutes, t.default_warning_minutes) as warning_minutes,
    FALSE as is_custom,
    NULL::UUID as custom_type_id,
    COALESCE(o.show_in_quick_log, TRUE) as show_in_quick_log,
    COALESCE(o.sort_order, t.default_sort_order) as sort_order
  FROM (
    VALUES
      ('kennel', 'Kennel', 'Home', '#9ca3af', 'bg-gray-500/15', 'rgba(107,114,128,0.4)', 240, 180, 1),
      ('potty', 'Potty', 'Droplets', '#facc15', 'bg-yellow-500/15', 'rgba(234,179,8,0.4)', 30, 20, 2),
      ('training', 'Training', 'GraduationCap', '#60a5fa', 'bg-blue-500/15', 'rgba(59,130,246,0.4)', 45, 30, 3),
      ('play', 'Play', 'Gamepad2', '#4ade80', 'bg-green-500/15', 'rgba(34,197,94,0.4)', 60, 45, 4),
      ('group_play', 'Group Play', 'Gamepad2', '#4ade80', 'bg-green-500/15', 'rgba(34,197,94,0.4)', 60, 45, 5),
      ('feeding', 'Feeding', 'UtensilsCrossed', '#a78bfa', 'bg-purple-500/15', 'rgba(139,92,246,0.4)', 30, 20, 6),
      ('rest', 'Rest', 'Moon', '#38bdf8', 'bg-sky-500/15', 'rgba(56,189,248,0.4)', 120, 90, 7),
      ('walk', 'Walk', 'Dog', '#fb923c', 'bg-orange-500/15', 'rgba(249,115,22,0.4)', 45, 30, 8),
      ('grooming', 'Grooming', 'Sparkles', '#f472b6', 'bg-pink-500/15', 'rgba(236,72,153,0.4)', 60, 45, 9),
      ('medical', 'Medical', 'Stethoscope', '#f87171', 'bg-red-500/15', 'rgba(239,68,68,0.4)', 120, 60, 10)
  ) AS t(type, label, default_icon, default_color, default_bg_color, default_glow_color, default_max_minutes, default_warning_minutes, default_sort_order)
  LEFT JOIN activity_type_overrides o ON o.activity_type = t.type::activity_type AND o.facility_id = p_facility_id
  WHERE o.is_hidden IS NOT TRUE

  UNION ALL

  -- Return custom types
  SELECT
    c.code as type_code,
    c.label as type_label,
    c.icon_name,
    c.color,
    c.bg_color,
    c.glow_color,
    c.max_minutes,
    c.warning_minutes,
    TRUE as is_custom,
    c.id as custom_type_id,
    c.show_in_quick_log,
    c.sort_order
  FROM custom_activity_types c
  WHERE c.facility_id = p_facility_id AND c.is_active = TRUE

  ORDER BY sort_order, type_label;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE icon_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_type_overrides ENABLE ROW LEVEL SECURITY;

-- Icon library is readable by all authenticated users
CREATE POLICY "Icon library is viewable by authenticated users"
  ON icon_library FOR SELECT
  TO authenticated
  USING (true);

-- Custom activity types are managed per facility
CREATE POLICY "Custom activity types are viewable by facility members"
  ON custom_activity_types FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Custom activity types are manageable by facility trainers"
  ON custom_activity_types FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'manager', 'trainer')
    )
  );

-- Activity type overrides are managed per facility
CREATE POLICY "Activity type overrides are viewable by facility members"
  ON activity_type_overrides FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Activity type overrides are manageable by facility managers"
  ON activity_type_overrides FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_custom_activity_types_updated_at
  BEFORE UPDATE ON custom_activity_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_type_overrides_updated_at
  BEFORE UPDATE ON activity_type_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
