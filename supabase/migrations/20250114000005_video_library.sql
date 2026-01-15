-- Video Library System Migration
-- Supports trainer video uploads, categorization, and sharing

-- Create enum types
CREATE TYPE video_visibility AS ENUM ('private', 'trainers', 'clients', 'public');
CREATE TYPE video_category AS ENUM ('obedience', 'behavior', 'agility', 'tricks', 'puppy', 'leash', 'recall', 'socialization', 'other');

-- Video Folders table (must be created before training_videos references it)
CREATE TABLE IF NOT EXISTS video_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES video_folders(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Training Videos table
CREATE TABLE IF NOT EXISTS training_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- Video details
  title TEXT NOT NULL,
  description TEXT,
  category video_category NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',

  -- Video file
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,

  -- Metadata
  visibility video_visibility NOT NULL DEFAULT 'trainers',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  -- Organization
  folder_id UUID REFERENCES video_folders(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Video Shares table (for sharing specific videos with families)
CREATE TABLE IF NOT EXISTS video_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES training_videos(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,

  -- Share details
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT,

  -- Tracking
  viewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Video Playlists table
CREATE TABLE IF NOT EXISTS video_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  visibility video_visibility NOT NULL DEFAULT 'trainers',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Playlist Videos (junction table)
CREATE TABLE IF NOT EXISTS playlist_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES video_playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES training_videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(playlist_id, video_id)
);

-- Create video_folders first (no circular dependency)
-- Already created above

-- Indexes for performance
CREATE INDEX idx_training_videos_facility ON training_videos(facility_id);
CREATE INDEX idx_training_videos_category ON training_videos(category);
CREATE INDEX idx_training_videos_visibility ON training_videos(visibility);
CREATE INDEX idx_training_videos_folder ON training_videos(folder_id);
CREATE INDEX idx_training_videos_uploaded_by ON training_videos(uploaded_by);

CREATE INDEX idx_video_folders_facility ON video_folders(facility_id);
CREATE INDEX idx_video_folders_parent ON video_folders(parent_id);

CREATE INDEX idx_video_shares_video ON video_shares(video_id);
CREATE INDEX idx_video_shares_family ON video_shares(family_id);
CREATE INDEX idx_video_shares_dog ON video_shares(dog_id);

CREATE INDEX idx_video_playlists_facility ON video_playlists(facility_id);
CREATE INDEX idx_playlist_videos_playlist ON playlist_videos(playlist_id);
CREATE INDEX idx_playlist_videos_video ON playlist_videos(video_id);

-- Triggers for updated_at
CREATE TRIGGER update_training_videos_updated_at
  BEFORE UPDATE ON training_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_folders_updated_at
  BEFORE UPDATE ON video_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_playlists_updated_at
  BEFORE UPDATE ON video_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Training Videos policies
ALTER TABLE training_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view videos in their facility"
  ON training_videos FOR SELECT
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can create videos in their facility"
  ON training_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can update videos in their facility"
  ON training_videos FOR UPDATE
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

CREATE POLICY "Trainers can delete videos in their facility"
  ON training_videos FOR DELETE
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Pet parents can view shared videos
CREATE POLICY "Pet parents can view shared videos"
  ON training_videos FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT video_id FROM video_shares
      WHERE family_id IN (
        SELECT f.id FROM families f JOIN users u ON f.primary_contact_id = u.id WHERE u.auth_id = auth.uid()
      )
    )
    OR visibility = 'clients'
    OR visibility = 'public'
  );

-- Video Folders policies
ALTER TABLE video_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage folders in their facility"
  ON video_folders FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Video Shares policies
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage shares in their facility"
  ON video_shares FOR ALL
  TO authenticated
  USING (
    video_id IN (
      SELECT id FROM training_videos
      WHERE facility_id IN (
        get_user_facility_id(auth.uid())
      )
    )
  );

CREATE POLICY "Pet parents can view their shares"
  ON video_shares FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT f.id FROM families f JOIN users u ON f.primary_contact_id = u.id WHERE u.auth_id = auth.uid()
    )
  );

-- Video Playlists policies
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage playlists in their facility"
  ON video_playlists FOR ALL
  TO authenticated
  USING (
    facility_id IN (
      get_user_facility_id(auth.uid())
    )
  );

-- Playlist Videos policies
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage playlist videos"
  ON playlist_videos FOR ALL
  TO authenticated
  USING (
    playlist_id IN (
      SELECT id FROM video_playlists
      WHERE facility_id IN (
        get_user_facility_id(auth.uid())
      )
    )
  );
