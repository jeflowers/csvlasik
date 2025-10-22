/*
  # Add Media and Video Support to CMS

  ## Overview
  Enhances the CMS to support images and videos across testimonials, articles, and a dedicated
  video library for the Media page. Enables full media management capabilities.

  ## Changes

  ### 1. Enhance Testimonials Table
    - `image_url` (text) - URL to patient photo or before/after image
    - `video_url` (text) - URL to video testimonial (YouTube, Vimeo, or uploaded)
    - `video_type` (text) - Type: 'youtube', 'vimeo', 'uploaded'
    - `video_thumbnail` (text) - Thumbnail image for video testimonials

  ### 2. Enhance Articles Table
    - `video_url` (text) - Embedded video URL for articles
    - `video_type` (text) - Type: 'youtube', 'vimeo', 'uploaded'
    - `gallery_images` (jsonb) - Array of images for article galleries

  ### 3. Create Videos Table
    - Dedicated table for Media page Video Library section
    - Support for educational videos and patient stories
    - Full CMS management of video content

  ## Benefits
    - Complete media management through CMS
    - Support for images and videos in testimonials
    - Video library for Media page
    - Professional media presentation
*/

-- ============================================================================
-- 1. ENHANCE TESTIMONIALS TABLE
-- ============================================================================

DO $$
BEGIN
  -- Add image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN image_url text;
    COMMENT ON COLUMN testimonials.image_url IS 'URL to patient photo or before/after image';
  END IF;

  -- Add video_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN video_url text;
    COMMENT ON COLUMN testimonials.video_url IS 'URL to video testimonial (YouTube ID, Vimeo ID, or full URL)';
  END IF;

  -- Add video_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'video_type'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN video_type text CHECK (video_type IN ('youtube', 'vimeo', 'uploaded'));
    COMMENT ON COLUMN testimonials.video_type IS 'Type of video: youtube, vimeo, or uploaded';
  END IF;

  -- Add video_thumbnail column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'video_thumbnail'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN video_thumbnail text;
    COMMENT ON COLUMN testimonials.video_thumbnail IS 'Thumbnail image URL for video testimonials';
  END IF;
END $$;

-- ============================================================================
-- 2. ENHANCE ARTICLES TABLE
-- ============================================================================

DO $$
BEGIN
  -- Add video_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE articles ADD COLUMN video_url text;
    COMMENT ON COLUMN articles.video_url IS 'Embedded video URL (YouTube ID, Vimeo ID, or full URL)';
  END IF;

  -- Add video_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'video_type'
  ) THEN
    ALTER TABLE articles ADD COLUMN video_type text CHECK (video_type IN ('youtube', 'vimeo', 'uploaded'));
    COMMENT ON COLUMN articles.video_type IS 'Type of video: youtube, vimeo, or uploaded';
  END IF;

  -- Add gallery_images column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE articles ADD COLUMN gallery_images jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN articles.gallery_images IS 'Array of image objects with url, caption, and alt text';
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE VIDEOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS videos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  video_type text NOT NULL CHECK (video_type IN ('youtube', 'vimeo', 'uploaded')),
  thumbnail_url text,
  category text,
  duration integer,
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  tags text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE videos IS 'Video library for Media page';
COMMENT ON COLUMN videos.video_url IS 'YouTube ID, Vimeo ID, or full URL to uploaded video';
COMMENT ON COLUMN videos.video_type IS 'Type: youtube, vimeo, or uploaded';
COMMENT ON COLUMN videos.duration IS 'Video duration in seconds';

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can view all videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
  DROP POLICY IF EXISTS "Authenticated users can delete videos" ON videos;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Public can view published videos
CREATE POLICY "Public can view published videos"
  ON videos FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Authenticated users can view all videos
CREATE POLICY "Authenticated users can view all videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert videos
CREATE POLICY "Authenticated users can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update videos
CREATE POLICY "Authenticated users can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete videos
CREATE POLICY "Authenticated users can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);

-- ============================================================================
-- 4. POPULATE SAMPLE VIDEOS
-- ============================================================================

INSERT INTO videos (
  title,
  description,
  video_url,
  video_type,
  category,
  featured,
  status,
  published_at
)
SELECT * FROM (VALUES
  (
    'Understanding Vision Correction',
    'Comprehensive guide to modern vision correction techniques and procedures',
    '7O_DN1nM36w',
    'youtube',
    'Educational',
    true,
    'published',
    now()
  ),
  (
    'Patient Success Stories',
    'Real patient experiences and life-changing results from vision correction surgery',
    'EqUQDcb6W90',
    'youtube',
    'Testimonials',
    true,
    'published',
    now()
  )
) AS v(title, description, video_url, video_type, category, featured, status, published_at)
WHERE NOT EXISTS (
  SELECT 1 FROM videos WHERE status = 'published' LIMIT 1
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================