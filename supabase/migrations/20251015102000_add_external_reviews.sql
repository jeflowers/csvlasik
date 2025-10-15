/*
  # External Reviews Integration

  ## Overview
  Adds support for importing and displaying verified reviews from external medical review platforms
  like WebMD, Vitals, and US News Health.

  ## Changes

  ### 1. Enhance testimonials table
    - `source` (text) - Review source (internal, webmd, vitals, usnews, google, healthgrades)
    - `source_url` (text) - URL to original review
    - `verified` (boolean) - Whether review is from verified platform
    - `reviewer_location` (text) - Reviewer's location
    - `helpful_count` (integer) - Number of helpful votes
    - `published_date` (date) - Original publication date
    - `review_id` (text) - External review ID for tracking

  ### 2. Create review_sources table
    - Tracks metadata about external review platforms
    - Stores aggregate ratings and counts
    - Monitors last sync date

  ## Benefits
    - Display verified reviews from trusted medical platforms
    - Maintain source attribution and links
    - Track review authenticity
    - Aggregate ratings across platforms
    - Professional credibility enhancement
*/

-- ============================================================================
-- 1. ADD COLUMNS TO TESTIMONIALS TABLE
-- ============================================================================

DO $$
BEGIN
  -- Add source column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'source'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN source text DEFAULT 'internal'
      CHECK (source IN ('internal', 'webmd', 'vitals', 'usnews', 'google', 'healthgrades', 'yelp'));
  END IF;

  -- Add source_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN source_url text;
  END IF;

  -- Add verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'verified'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN verified boolean DEFAULT false;
  END IF;

  -- Add reviewer_location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'reviewer_location'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN reviewer_location text;
  END IF;

  -- Add helpful_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'helpful_count'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN helpful_count integer DEFAULT 0;
  END IF;

  -- Add published_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'published_date'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN published_date date;
  END IF;

  -- Add review_id column for external tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'review_id'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN review_id text;
  END IF;
END $$;

-- Create unique index on source + review_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_source_review_id
  ON testimonials(source, review_id)
  WHERE review_id IS NOT NULL;

-- ============================================================================
-- 2. CREATE REVIEW_SOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text UNIQUE NOT NULL CHECK (source_name IN (
    'webmd', 'vitals', 'usnews', 'google', 'healthgrades', 'yelp'
  )),
  display_name text NOT NULL,
  profile_url text NOT NULL,
  logo_url text,
  average_rating numeric(3,2),
  total_reviews integer DEFAULT 0,
  last_synced_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. INSERT DEFAULT REVIEW SOURCES
-- ============================================================================

INSERT INTO review_sources (source_name, display_name, profile_url, average_rating, total_reviews) VALUES
  (
    'webmd',
    'WebMD',
    'https://doctor.webmd.com/doctor/charles-flowers-jr-6b3e2f9a-f963-4b9e-ae95-7c287f040764-overview',
    NULL,
    0
  ),
  (
    'vitals',
    'Vitals',
    'https://www.vitals.com/doctors/Dr_Charles_Flowers.html',
    NULL,
    0
  ),
  (
    'usnews',
    'U.S. News Health',
    'https://health.usnews.com/doctors/charles-flowers-475856',
    NULL,
    0
  )
ON CONFLICT (source_name) DO UPDATE SET
  profile_url = EXCLUDED.profile_url,
  updated_at = now();

-- ============================================================================
-- 4. ENABLE RLS FOR REVIEW_SOURCES
-- ============================================================================

ALTER TABLE review_sources ENABLE ROW LEVEL SECURITY;

-- Public can view active review sources
CREATE POLICY "Anyone can view active review sources"
  ON review_sources FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Admins can manage review sources
CREATE POLICY "Admins can manage review sources"
  ON review_sources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- 5. CREATE HELPER FUNCTION TO GET REVIEW STATISTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_review_statistics()
RETURNS TABLE (
  total_reviews bigint,
  average_rating numeric,
  reviews_by_source jsonb,
  verified_count bigint,
  internal_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_reviews,
    ROUND(AVG(rating)::numeric, 2) as average_rating,
    jsonb_object_agg(
      COALESCE(source, 'internal'),
      review_count
    ) as reviews_by_source,
    COUNT(*) FILTER (WHERE verified = true)::bigint as verified_count,
    COUNT(*) FILTER (WHERE source = 'internal')::bigint as internal_count
  FROM (
    SELECT
      source,
      rating,
      verified,
      COUNT(*) as review_count
    FROM testimonials
    WHERE approved = true
    GROUP BY source, rating, verified
  ) subquery;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_testimonials_source ON testimonials(source);
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON testimonials(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_published_date ON testimonials(published_date) WHERE published_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_review_sources_active ON review_sources(active) WHERE active = true;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
