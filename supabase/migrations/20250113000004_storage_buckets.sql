-- K9 ProTrain Storage Buckets
-- Configure Supabase Storage for media uploads

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Photos and videos bucket (public for easy sharing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Facility logos and branding (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- User avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Documents (private - for contracts, reports, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Media bucket policies
CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Trainers can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND is_trainer_or_above(auth.uid())
  );

CREATE POLICY "Trainers can update their media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND (owner = auth.uid() OR is_admin_or_owner(auth.uid()))
  );

CREATE POLICY "Owners can delete any media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND (owner = auth.uid() OR is_admin_or_owner(auth.uid()))
  );

-- Logos bucket policies
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Admins can manage logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND is_admin_or_owner(auth.uid())
  );

CREATE POLICY "Admins can update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND is_admin_or_owner(auth.uid())
  );

CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos'
    AND is_admin_or_owner(auth.uid())
  );

-- Avatars bucket policies
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

CREATE POLICY "Users can delete their avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

-- Documents bucket policies (private)
CREATE POLICY "Facility members can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can manage documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND is_admin_or_owner(auth.uid())
  );

CREATE POLICY "Admins can update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND is_admin_or_owner(auth.uid())
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND is_admin_or_owner(auth.uid())
  );
