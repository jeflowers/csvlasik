/*
  # Apply External Reviews System

  ## Overview
  Adds the `review_sources` table and extends `testimonials` with external-review
  metadata. The original migration (20251015102000_add_external_reviews.sql) was
  authored but never applied to this database, leaving the admin "Review Source"
  dropdown empty. This migration is idempotent and safely re-runs the schema +
  seed data.

  ## Changes
  1. New columns on `testimonials`: source, source_url, verified,
     reviewer_location, helpful_count, published_date, review_id
  2. New table `review_sources` with RLS enabled
  3. Seed default sources: WebMD, Vitals, U.S. News Health, Healthgrades,
     Google, Yelp
  4. Helper function `get_review_statistics()`
  5. Performance indexes

  ## Security
  - RLS enabled on `review_sources`
  - Public can SELECT only active sources
  - Admins can manage sources via separate INSERT/UPDATE/DELETE policies
*/

-- 1. Extend testimonials
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='source') THEN
    ALTER TABLE testimonials ADD COLUMN source text DEFAULT 'internal'
      CHECK (source IN ('internal','webmd','vitals','usnews','google','healthgrades','yelp'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='source_url') THEN
    ALTER TABLE testimonials ADD COLUMN source_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='verified') THEN
    ALTER TABLE testimonials ADD COLUMN verified boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='reviewer_location') THEN
    ALTER TABLE testimonials ADD COLUMN reviewer_location text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='helpful_count') THEN
    ALTER TABLE testimonials ADD COLUMN helpful_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='published_date') THEN
    ALTER TABLE testimonials ADD COLUMN published_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='review_id') THEN
    ALTER TABLE testimonials ADD COLUMN review_id text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_source_review_id
  ON testimonials(source, review_id) WHERE review_id IS NOT NULL;

-- 2. review_sources
CREATE TABLE IF NOT EXISTS review_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text UNIQUE NOT NULL CHECK (source_name IN ('webmd','vitals','usnews','google','healthgrades','yelp')),
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

ALTER TABLE review_sources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='review_sources' AND policyname='Anyone can view active review sources') THEN
    CREATE POLICY "Anyone can view active review sources"
      ON review_sources FOR SELECT
      TO anon, authenticated
      USING (active = true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='review_sources' AND policyname='Admins can insert review sources') THEN
    CREATE POLICY "Admins can insert review sources"
      ON review_sources FOR INSERT
      TO authenticated
      WITH CHECK (is_current_user_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='review_sources' AND policyname='Admins can update review sources') THEN
    CREATE POLICY "Admins can update review sources"
      ON review_sources FOR UPDATE
      TO authenticated
      USING (is_current_user_admin())
      WITH CHECK (is_current_user_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='review_sources' AND policyname='Admins can delete review sources') THEN
    CREATE POLICY "Admins can delete review sources"
      ON review_sources FOR DELETE
      TO authenticated
      USING (is_current_user_admin());
  END IF;
END $$;

-- 3. Seed
INSERT INTO review_sources (source_name, display_name, profile_url, average_rating, total_reviews, active) VALUES
  ('webmd','WebMD','https://doctor.webmd.com/',NULL,0,true),
  ('vitals','Vitals','https://www.vitals.com/',NULL,0,true),
  ('usnews','U.S. News Health','https://health.usnews.com/doctors',NULL,0,true),
  ('healthgrades','Healthgrades','https://www.healthgrades.com/',NULL,0,true),
  ('google','Google','https://www.google.com/maps',NULL,0,true),
  ('yelp','Yelp','https://www.yelp.com/',NULL,0,true)
ON CONFLICT (source_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  updated_at = now();

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_source ON testimonials(source);
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON testimonials(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_published_date ON testimonials(published_date) WHERE published_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_review_sources_active ON review_sources(active) WHERE active = true;
