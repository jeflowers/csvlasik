/*
  # Create Supabase Storage Buckets

  ## Overview
  Creates and configures Supabase Storage buckets for managing media files across the ClearSight application.

  ## Buckets Created

  ### 1. media (Public)
  General media files for website content
  - Used for: article featured images, general website images, blog images
  - Access: Public read, Admin/Editor write
  - Path structure: `articles/`, `blog/`, `general/`

  ### 2. testimonials (Public)
  Patient testimonial images and videos
  - Used for: testimonial photos, before/after images, video testimonials
  - Access: Public read, Admin/Editor write
  - Path structure: `images/`, `videos/`

  ### 3. procedures (Public)
  Procedure-related educational media
  - Used for: procedure diagrams, educational images, process visualizations
  - Access: Public read, Admin/Editor write
  - Path structure: `lasik/`, `prk/`, `icl/`, `educational/`

  ### 4. team (Public)
  Team member photos and related images
  - Used for: doctor photos, staff images, team content
  - Access: Public read, Admin write
  - Path structure: `doctors/`, `staff/`

  ### 5. documents (Private)
  Private documents and compliance files
  - Used for: GDPR exports, compliance documents, private files
  - Access: Authenticated users only, based on ownership
  - Path structure: `gdpr/`, `compliance/`, `user-documents/`

  ## Security Policies

  ### Public Buckets (media, testimonials, procedures, team)
  - Anyone can view/download files
  - Only authenticated admin/editor users can upload
  - Only file owners or admins can delete

  ### Private Buckets (documents)
  - Only authenticated users can view their own files
  - Only authenticated users can upload to their own folder
  - Only file owners can delete their files
  - Admins can access all files

  ## File Size Limits
  - Images: 10 MB
  - Videos: 100 MB
  - Documents: 20 MB

  ## Important Notes
  1. All buckets use RLS for security
  2. Public buckets have CDN caching enabled
  3. File transformations available for images
  4. Automatic cleanup of orphaned files recommended
*/

-- Create public media bucket for general website content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create public testimonials bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonials',
  'testimonials',
  true,
  104857600,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create public procedures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'procedures',
  'procedures',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create public team bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team',
  'team',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create private documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  20971520,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES - PUBLIC BUCKETS
-- ============================================================================

-- Media Bucket Policies
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'editor')
  )
);

CREATE POLICY "Users can update own media or admins can update all"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

CREATE POLICY "Users can delete own media or admins can delete all"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

-- Testimonials Bucket Policies
CREATE POLICY "Public read access for testimonials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'testimonials');

CREATE POLICY "Authenticated users can upload testimonials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'testimonials' AND
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'editor')
  )
);

CREATE POLICY "Users can update own testimonials or admins can update all"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'testimonials' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

CREATE POLICY "Users can delete own testimonials or admins can delete all"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'testimonials' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

-- Procedures Bucket Policies
CREATE POLICY "Public read access for procedures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'procedures');

CREATE POLICY "Authenticated users can upload procedures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'procedures' AND
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'editor')
  )
);

CREATE POLICY "Users can update own procedures or admins can update all"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'procedures' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

CREATE POLICY "Users can delete own procedures or admins can delete all"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'procedures' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

-- Team Bucket Policies
CREATE POLICY "Public read access for team"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team');

CREATE POLICY "Admins can upload team photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

CREATE POLICY "Admins can update team photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

CREATE POLICY "Admins can delete team photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- ============================================================================
-- STORAGE POLICIES - PRIVATE BUCKETS
-- ============================================================================

-- Documents Bucket Policies (Private)
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    auth.uid() = owner OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  )
);

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() = owner
);

CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() = owner
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get public URL for a file
CREATE OR REPLACE FUNCTION get_public_url(bucket_name text, file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url text;
BEGIN
  SELECT decrypted_secret 
  INTO base_url
  FROM vault.decrypted_secrets 
  WHERE name = 'supabase_url';
  
  IF base_url IS NULL THEN
    base_url := current_setting('app.settings.api_url', true);
  END IF;
  
  RETURN base_url || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$;

-- Function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up media files not referenced in articles or media table
  DELETE FROM storage.objects
  WHERE bucket_id = 'media'
  AND name NOT IN (
    SELECT featured_image FROM articles WHERE featured_image IS NOT NULL
    UNION
    SELECT filepath FROM media WHERE filepath IS NOT NULL
  )
  AND created_at < now() - interval '30 days';
  
  -- Clean up testimonial files not referenced in testimonials table
  DELETE FROM storage.objects
  WHERE bucket_id = 'testimonials'
  AND name NOT IN (
    SELECT image_url FROM testimonials WHERE image_url IS NOT NULL
    UNION
    SELECT video_url FROM testimonials WHERE video_url IS NOT NULL
  )
  AND created_at < now() - interval '30 days';
END;
$$;