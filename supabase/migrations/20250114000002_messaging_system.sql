-- ============================================
-- MESSAGING SYSTEM
-- Pet Parent Communication Portal
-- ============================================

-- Message type enum
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'file', 'system');

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,

  -- Conversation metadata
  title VARCHAR(255),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_preview TEXT,

  -- Status tracking
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  -- Unread counts (updated via triggers)
  trainer_unread_count INTEGER DEFAULT 0,
  parent_unread_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one conversation per family-dog combination
  UNIQUE(facility_id, family_id, dog_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Sender info
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('trainer', 'parent', 'system')),

  -- Message content
  message_type message_type DEFAULT 'text',
  content TEXT NOT NULL,

  -- Media attachments (for image/video/file types)
  media_url TEXT,
  media_thumbnail_url TEXT,
  media_filename TEXT,
  media_size_bytes INTEGER,

  -- Read tracking
  read_by_trainer BOOLEAN DEFAULT false,
  read_by_parent BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Reply threading (optional)
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions (optional enhancement)
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL, -- emoji like '👍', '❤️', '🎉'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(message_id, user_id, reaction)
);

-- Quick reply templates for trainers
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50), -- 'greeting', 'update', 'reminder', 'celebration'

  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Conversation indexes
CREATE INDEX idx_conversations_facility ON conversations(facility_id);
CREATE INDEX idx_conversations_family ON conversations(family_id);
CREATE INDEX idx_conversations_dog ON conversations(dog_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_unread_trainer ON conversations(facility_id, trainer_unread_count) WHERE trainer_unread_count > 0;
CREATE INDEX idx_conversations_unread_parent ON conversations(family_id, parent_unread_count) WHERE parent_unread_count > 0;

-- Message indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread_trainer ON messages(conversation_id, read_by_trainer) WHERE read_by_trainer = false;
CREATE INDEX idx_messages_unread_parent ON messages(conversation_id, read_by_parent) WHERE read_by_parent = false;

-- Template indexes
CREATE INDEX idx_message_templates_facility ON message_templates(facility_id);
CREATE INDEX idx_message_templates_category ON message_templates(facility_id, category);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW(),
    -- Increment unread count for the recipient
    trainer_unread_count = CASE
      WHEN NEW.sender_type = 'parent' THEN trainer_unread_count + 1
      ELSE trainer_unread_count
    END,
    parent_unread_count = CASE
      WHEN NEW.sender_type = 'trainer' THEN parent_unread_count + 1
      ELSE parent_unread_count
    END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- Reset unread count when messages are marked as read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_by_trainer = true AND OLD.read_by_trainer = false THEN
    UPDATE conversations
    SET trainer_unread_count = GREATEST(0, trainer_unread_count - 1)
    WHERE id = NEW.conversation_id;
  END IF;

  IF NEW.read_by_parent = true AND OLD.read_by_parent = false THEN
    UPDATE conversations
    SET parent_unread_count = GREATEST(0, parent_unread_count - 1)
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_unread_count
AFTER UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION reset_unread_count();

-- Updated at triggers
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Trainers can view facility conversations"
  ON conversations FOR SELECT
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Pet parents can view their family conversations"
  ON conversations FOR SELECT
  USING (
    family_id IN (
      SELECT id FROM families WHERE primary_contact_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can update conversations"
  ON conversations FOR UPDATE
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        facility_id IN (get_user_facility_id(auth.uid()))
        OR family_id IN (SELECT id FROM families WHERE primary_contact_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        facility_id IN (get_user_facility_id(auth.uid()))
        OR family_id IN (SELECT id FROM families WHERE primary_contact_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Message reactions policies
CREATE POLICY "Users can view reactions in their conversations"
  ON message_reactions FOR SELECT
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE c.facility_id IN (get_user_facility_id(auth.uid()))
        OR c.family_id IN (SELECT id FROM families WHERE primary_contact_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Message templates policies
CREATE POLICY "Trainers can view facility templates"
  ON message_templates FOR SELECT
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can manage templates"
  ON message_templates FOR ALL
  USING (
    facility_id = get_user_facility_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('owner', 'admin', 'trainer')
    )
  );

-- ============================================
-- SEED DEFAULT MESSAGE TEMPLATES
-- ============================================

-- Note: These will be inserted per-facility during onboarding
-- Example templates for reference:
/*
INSERT INTO message_templates (facility_id, title, content, category) VALUES
  ('{facility_id}', 'Welcome Message', 'Welcome to our training family! We''re excited to work with you and {dog_name}. Feel free to reach out anytime with questions.', 'greeting'),
  ('{facility_id}', 'Session Reminder', 'Just a friendly reminder about your upcoming session tomorrow. Looking forward to seeing you!', 'reminder'),
  ('{facility_id}', 'Great Progress', '{dog_name} did amazing today! We worked on {skill} and made great progress. Keep up the practice at home!', 'update'),
  ('{facility_id}', 'Badge Celebration', 'Congratulations! {dog_name} just earned the {badge_name} badge! This is a big milestone. 🎉', 'celebration'),
  ('{facility_id}', 'Homework Assigned', 'I''ve assigned new homework for {dog_name}. Check your Practice Plans tab for details!', 'update');
*/
