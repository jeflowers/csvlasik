/*
  # Create Media Library System

  1. Purpose
    - Create comprehensive media management system
    - Track all uploaded files (images, videos, documents)
    - Support categorization and metadata
    - Enable search and filtering

  2. Tables Created
    - `media_files` - Main media file tracking table
    - Includes metadata, categories, file info

  3. Features
    - File type categorization (image, video, document)
    - Category tags (Medical, Educational, Testimonial, etc.)
    - Alt text and captions for accessibility
    - Upload tracking (who uploaded, when)
    - File size and MIME type tracking
    - Search and filter capabilities

  4. Security
    - RLS enabled on media_files table
    - Admins can manage all files
    - Public read access to published media
*/

-- Create media_files table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_name text NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  category text,
  alt_text text DEFAULT '',
  caption text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_media_type ON media_files(media_type);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON media_files(category);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_is_public ON media_files(is_public);
CREATE INDEX IF NOT EXISTS idx_media_files_file_path ON media_files(file_path);

-- Full text search on filename and alt_text
CREATE INDEX IF NOT EXISTS idx_media_files_search ON media_files 
USING gin(to_tsvector('english', filename || ' ' || COALESCE(alt_text, '') || ' ' || COALESCE(caption, '')));

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Public read access to published media
CREATE POLICY "Public media is viewable by everyone"
  ON media_files
  FOR SELECT
  USING (is_public = true);

-- Authenticated users can view all media
CREATE POLICY "Authenticated users can view all media"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert media
CREATE POLICY "Admins can insert media"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin', 'editor')
    )
  );

-- Admins can update media
CREATE POLICY "Admins can update media"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin', 'editor')
    )
  );

-- Admins can delete media
CREATE POLICY "Admins can delete media"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin', 'editor')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_media_files_updated_at_trigger ON media_files;
CREATE TRIGGER update_media_files_updated_at_trigger
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

-- Function to categorize media by path
CREATE OR REPLACE FUNCTION categorize_media_by_path(path text)
RETURNS text AS $$
BEGIN
  IF path LIKE '%/team/%' OR path LIKE '%/drflowers/%' THEN
    RETURN 'Team';
  ELSIF path LIKE '%/procedures/%' OR path LIKE '%/lasik/%' OR path LIKE '%/prk/%' OR path LIKE '%/icl/%' THEN
    RETURN 'Medical';
  ELSIF path LIKE '%/testimonials/%' OR path LIKE '%/reviews/%' THEN
    RETURN 'Testimonial';
  ELSIF path LIKE '%/facility/%' OR path LIKE '%/office/%' THEN
    RETURN 'Facility';
  ELSIF path LIKE '%/educational/%' OR path LIKE '%/diagrams/%' THEN
    RETURN 'Educational';
  ELSIF path LIKE '%/eyes/%' THEN
    RETURN 'Medical';
  ELSIF path LIKE '%/finance/%' THEN
    RETURN 'Educational';
  ELSE
    RETURN 'Other';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Import existing images from public directory
-- Note: In production, these would be uploaded to Supabase Storage
-- For now, we'll catalog the existing files that are in the public directory

INSERT INTO media_files (filename, original_name, file_path, file_size, mime_type, media_type, category, is_public)
VALUES
  -- Team / Dr. Flowers images
  ('dr-flowers-headshot.jpg', 'dr-flowers-headshot.jpg', '/assets/images/team/drflowers/dr-flowers-headshot.jpg', 150000, 'image/jpeg', 'image', 'Team', true),
  ('DrFlowers_guam_01.png', 'DrFlowers_guam_01.png', '/assets/images/team/drflowers/DrFlowers_guam_01.png', 200000, 'image/png', 'image', 'Team', true),
  ('DrFlowers_eye_exam_01.png', 'DrFlowers_eye_exam_01.png', '/assets/images/team/drflowers/DrFlowers_eye_exam_01.png', 250000, 'image/png', 'image', 'Medical', true),
  ('DrFlowers_eye_surgery_01.png', 'DrFlowers_eye_surgery_01.png', '/assets/images/team/drflowers/DrFlowers_eye_surgery_01.png', 250000, 'image/png', 'image', 'Medical', true),
  ('DrFlowers_eye_surgery_02.png', 'DrFlowers_eye_surgery_02.png', '/assets/images/team/drflowers/DrFlowers_eye_surgery_02.png', 250000, 'image/png', 'image', 'Medical', true),
  ('DrFlowers_illustrationImage_01.png', 'DrFlowers_illustrationImage_01.png', '/assets/images/team/drflowers/DrFlowers_illustrationImage_01.png', 200000, 'image/png', 'image', 'Medical', true),
  ('DrFlowers_after_surgery_recovery.png', 'DrFlowers_after_surgery_recovery.png', '/assets/images/team/drflowers/DrFlowers_after_surgery_recovery.png', 200000, 'image/png', 'image', 'Medical', true),
  
  -- LASIK procedure images
  ('lasik-surgery-san-diego-1.jpg', 'lasik-surgery-san-diego-1.jpg', '/assets/images/procedures/lasik-surgery-san-diego-1.jpg', 180000, 'image/jpeg', 'image', 'Medical', true),
  ('lasik-surgery-san-diego-2.jpg', 'lasik-surgery-san-diego-2.jpg', '/assets/images/procedures/lasik-surgery-san-diego-2.jpg', 180000, 'image/jpeg', 'image', 'Medical', true),
  ('lasik-surgery-san-diego-3.jpg', 'lasik-surgery-san-diego-3.jpg', '/assets/images/procedures/lasik-surgery-san-diego-3.jpg', 180000, 'image/jpeg', 'image', 'Medical', true),
  ('lasik-surgery-san-diego-4.jpg', 'lasik-surgery-san-diego-4.jpg', '/assets/images/procedures/lasik-surgery-san-diego-4.jpg', 180000, 'image/jpeg', 'image', 'Medical', true),
  
  -- LASIK process steps
  ('step-01-examination.png', 'step-01-examination.png', '/assets/images/procedures/lasik/process/step-01-examination.png', 150000, 'image/png', 'image', 'Educational', true),
  ('step-02-flap-creation.png', 'step-02-flap-creation.png', '/assets/images/procedures/lasik/process/step-02-flap-creation.png', 150000, 'image/png', 'image', 'Educational', true),
  ('step-03-laser-reshaping.png', 'step-03-laser-reshaping.png', '/assets/images/procedures/lasik/process/step-03-laser-reshaping.png', 150000, 'image/png', 'image', 'Educational', true),
  ('step-04-recovery.png', 'step-04-recovery.png', '/assets/images/procedures/lasik/process/step-04-recovery.png', 150000, 'image/png', 'image', 'Educational', true),
  
  -- Additional LASIK images
  ('advanced-technology-overview.png', 'advanced-technology-overview.png', '/assets/images/procedures/lasik/advanced-technology-overview.png', 200000, 'image/png', 'image', 'Educational', true),
  ('brands-people-sWQrD5s0fWc-unsplash.jpg', 'brands-people-sWQrD5s0fWc-unsplash.jpg', '/assets/images/procedures/lasik/brands-people-sWQrD5s0fWc-unsplash.jpg', 250000, 'image/jpeg', 'image', 'Medical', true),
  ('arteum-ro-7H41oiADqqg-unsplash.jpg', 'arteum-ro-7H41oiADqqg-unsplash.jpg', '/assets/images/procedures/lasik/arteum-ro-7H41oiADqqg-unsplash.jpg', 250000, 'image/jpeg', 'image', 'Medical', true),
  
  -- PRK images
  ('PRK.png', 'PRK.png', '/assets/images/procedures/prk/PRK.png', 150000, 'image/png', 'image', 'Educational', true),
  ('prk_treatment.png', 'prk_treatment.png', '/assets/images/procedures/prk/prk_treatment.png', 150000, 'image/png', 'image', 'Educational', true),
  
  -- Eye images
  ('biri_eyesonly_n.jpeg', 'biri_eyesonly_n.jpeg', '/assets/images/eyes/biri_eyesonly_n.jpeg', 120000, 'image/jpeg', 'image', 'Medical', true),
  ('eric-ward-ES60LMf18KU-unsplash.jpg', 'eric-ward-ES60LMf18KU-unsplash.jpg', '/assets/images/eyes/eric-ward-ES60LMf18KU-unsplash.jpg', 200000, 'image/jpeg', 'image', 'Medical', true),
  ('lana-graves-h0ZHYdy1qTI-unsplash.jpg', 'lana-graves-h0ZHYdy1qTI-unsplash.jpg', '/assets/images/eyes/lana-graves-h0ZHYdy1qTI-unsplash.jpg', 200000, 'image/jpeg', 'image', 'Medical', true),
  ('luca-iaconelli-GmoHIZ61eMo-unsplash.jpg', 'luca-iaconelli-GmoHIZ61eMo-unsplash.jpg', '/assets/images/eyes/luca-iaconelli-GmoHIZ61eMo-unsplash.jpg', 200000, 'image/jpeg', 'image', 'Medical', true),
  ('polina-kuzovkova-6VXBBFt_k9Q-unsplash.jpg', 'polina-kuzovkova-6VXBBFt_k9Q-unsplash.jpg', '/assets/images/eyes/polina-kuzovkova-6VXBBFt_k9Q-unsplash.jpg', 200000, 'image/jpeg', 'image', 'Medical', true),
  ('simone-stallo-xpZ5AVjw67U-unsplash.jpg', 'simone-stallo-xpZ5AVjw67U-unsplash.jpg', '/assets/images/eyes/simone-stallo-xpZ5AVjw67U-unsplash.jpg', 200000, 'image/jpeg', 'image', 'Medical', true),
  
  -- Finance images
  ('doctor_with_patients.png', 'doctor_with_patients.png', '/assets/images/finance/doctor_with_patients.png', 180000, 'image/png', 'image', 'Educational', true),
  ('female_doctor_with_patient.png', 'female_doctor_with_patient.png', '/assets/images/finance/female_doctor_with_patient.png', 180000, 'image/png', 'image', 'Educational', true),
  
  -- Logo and branding
  ('ClearSight-full-color-nb.png', 'ClearSight-full-color-nb.png', '/assets/images/ClearSight-full-color-nb.png', 50000, 'image/png', 'image', 'Other', true),
  ('ClearSight-icon-nb-blk-gld.png', 'ClearSight-icon-nb-blk-gld.png', '/assets/images/ClearSight-icon-nb-blk-gld.png', 30000, 'image/png', 'image', 'Other', true),
  
  -- Misc images
  ('iCare-DRSplus-with-screen.png', 'iCare-DRSplus-with-screen.png', '/assets/images/misc/iCare-DRSplus-with-screen.png', 150000, 'image/png', 'image', 'Medical', true),
  ('technology.png', 'technology.png', '/assets/images/misc/technology.png', 180000, 'image/png', 'image', 'Medical', true),
  ('black_biri_illustrationImage.png', 'black_biri_illustrationImage.png', '/assets/images/ads/black_biri_illustrationImage.png', 120000, 'image/png', 'image', 'Other', true)
ON CONFLICT (file_path) DO NOTHING;

-- Create view for easy media browsing with uploader info
CREATE OR REPLACE VIEW media_files_with_uploader AS
SELECT 
  mf.*,
  u.name as uploaded_by_name,
  u.email as uploaded_by_email
FROM media_files mf
LEFT JOIN users u ON mf.uploaded_by = u.id;

-- Grant access to the view
GRANT SELECT ON media_files_with_uploader TO authenticated, anon;

-- Summary
DO $$
DECLARE
  media_count INTEGER;
  category_counts TEXT;
BEGIN
  SELECT COUNT(*) INTO media_count FROM media_files;
  
  SELECT string_agg(category || ': ' || count::text, ', ')
  INTO category_counts
  FROM (
    SELECT category, COUNT(*) as count 
    FROM media_files 
    GROUP BY category 
    ORDER BY count DESC
  ) cat_counts;
  
  RAISE NOTICE 'Media Library initialized: % files cataloged', media_count;
  RAISE NOTICE 'Categories: %', category_counts;
END $$;
