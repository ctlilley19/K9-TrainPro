-- Live Status Feed System
-- Real-time updates for pet parents about their dog's day

-- Status update types
CREATE TYPE status_update_type AS ENUM (
  'arrival',
  'departure',
  'activity_start',
  'activity_end',
  'meal',
  'potty',
  'rest',
  'play',
  'photo',
  'video',
  'note',
  'milestone',
  'health_check'
);

-- Mood/energy levels for status updates
CREATE TYPE dog_mood AS ENUM (
  'excited',
  'happy',
  'calm',
  'tired',
  'anxious',
  'playful'
);

-- Status feed items table
CREATE TABLE status_feed_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Content
  update_type status_update_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Optional media
  media_url TEXT,
  media_type TEXT, -- 'image' or 'video'
  thumbnail_url TEXT,

  -- Optional mood tracking
  mood dog_mood,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),

  -- Related activity (optional)
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,

  -- Visibility
  is_visible_to_parents BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_status_feed_dog ON status_feed_items(dog_id);
CREATE INDEX idx_status_feed_facility ON status_feed_items(facility_id);
CREATE INDEX idx_status_feed_created_at ON status_feed_items(created_at DESC);
CREATE INDEX idx_status_feed_type ON status_feed_items(update_type);
CREATE INDEX idx_status_feed_visible ON status_feed_items(is_visible_to_parents) WHERE is_visible_to_parents = true;

-- Pet parent reactions to feed items
CREATE TABLE feed_item_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_item_id UUID REFERENCES status_feed_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT NOT NULL, -- emoji like '❤️', '🎉', '👍'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feed_item_id, user_id, reaction)
);

CREATE INDEX idx_feed_reactions_item ON feed_item_reactions(feed_item_id);

-- Comments on feed items (for pet parent engagement)
CREATE TABLE feed_item_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_item_id UUID REFERENCES status_feed_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_comments_item ON feed_item_comments(feed_item_id);

-- Quick status presets for trainers
CREATE TABLE status_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  update_type status_update_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default presets
INSERT INTO status_presets (update_type, title, description, icon, sort_order) VALUES
('arrival', 'Arrived safely!', 'Your pup has arrived and is ready for a great day!', '🏠', 1),
('departure', 'Heading home!', 'Time to go home! Had an amazing day!', '🚗', 2),
('meal', 'Meal time!', 'Enjoying a delicious meal', '🍽️', 3),
('potty', 'Potty break', 'Successfully went potty outside', '✅', 4),
('rest', 'Nap time', 'Taking a well-deserved rest', '😴', 5),
('play', 'Play time!', 'Having a blast playing!', '🎾', 6),
('activity_start', 'Training session starting', 'Beginning a training session', '🎯', 7),
('activity_end', 'Training complete!', 'Finished training session successfully', '🏆', 8),
('health_check', 'Health check', 'Routine health check completed', '💊', 9);

-- Trigger for updated_at
CREATE TRIGGER update_status_feed_items_updated_at
  BEFORE UPDATE ON status_feed_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_item_comments_updated_at
  BEFORE UPDATE ON feed_item_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE status_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_item_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_presets ENABLE ROW LEVEL SECURITY;

-- Trainers can view and manage all feed items in their facility
CREATE POLICY "Trainers can view facility feed items"
  ON status_feed_items FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      SELECT facility_id FROM facility_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create feed items"
  ON status_feed_items FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM facility_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'trainer')
    )
  );

CREATE POLICY "Trainers can update their feed items"
  ON status_feed_items FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    facility_id IN (
      SELECT facility_id FROM facility_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Trainers can delete their feed items"
  ON status_feed_items FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    facility_id IN (
      SELECT facility_id FROM facility_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Pet parents can view visible feed items for their dogs
CREATE POLICY "Pet parents can view their dogs feed items"
  ON status_feed_items FOR SELECT
  TO authenticated
  USING (
    is_visible_to_parents = true AND
    dog_id IN (
      SELECT d.id FROM dogs d
      JOIN family_members fm ON fm.family_id = d.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

-- Reactions policies
CREATE POLICY "Users can view reactions"
  ON feed_item_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON feed_item_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
  ON feed_item_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments"
  ON feed_item_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add comments"
  ON feed_item_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can edit their comments"
  ON feed_item_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their comments"
  ON feed_item_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Status presets policies
CREATE POLICY "Anyone can view active presets"
  ON status_presets FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage presets"
  ON status_presets FOR ALL
  TO authenticated
  USING (
    facility_id IS NULL OR
    facility_id IN (
      SELECT facility_id FROM facility_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Function to auto-create feed items when activities start/end
CREATE OR REPLACE FUNCTION auto_create_activity_feed_item()
RETURNS TRIGGER AS $$
BEGIN
  -- When activity starts
  IF TG_OP = 'INSERT' AND NEW.status = 'in_progress' THEN
    INSERT INTO status_feed_items (
      facility_id, dog_id, created_by, update_type, title, description, activity_id
    )
    SELECT
      d.facility_id,
      NEW.dog_id,
      NEW.trainer_id,
      'activity_start',
      COALESCE(NEW.activity_type, 'Training') || ' session started',
      'Starting a ' || LOWER(COALESCE(NEW.activity_type, 'training')) || ' session',
      NEW.id
    FROM dogs d WHERE d.id = NEW.dog_id;
  END IF;

  -- When activity ends
  IF TG_OP = 'UPDATE' AND OLD.status = 'in_progress' AND NEW.status = 'completed' THEN
    INSERT INTO status_feed_items (
      facility_id, dog_id, created_by, update_type, title, description, activity_id
    )
    SELECT
      d.facility_id,
      NEW.dog_id,
      NEW.trainer_id,
      'activity_end',
      COALESCE(NEW.activity_type, 'Training') || ' session completed!',
      'Successfully completed ' || LOWER(COALESCE(NEW.activity_type, 'training')) || ' session',
      NEW.id
    FROM dogs d WHERE d.id = NEW.dog_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-creating feed items (optional - can be enabled if desired)
-- CREATE TRIGGER auto_activity_feed_trigger
--   AFTER INSERT OR UPDATE ON activities
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_create_activity_feed_item();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE status_feed_items;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_item_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_item_comments;
