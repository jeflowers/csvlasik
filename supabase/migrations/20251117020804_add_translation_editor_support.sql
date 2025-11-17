/*
  # Add Translation Editor Support

  ## Overview
  Enhance translation_cache table to support the translation editor:
  1. Add unique constraint for upsert operations
  2. Add indexes for performance
  3. Add namespace field if missing
  4. Enable RLS policies for admin access

  ## Changes
  - Unique constraint on (source_text, target_language, namespace)
  - Index on namespace for filtering
  - RLS policies for admin users
*/

-- Add namespace column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translation_cache' AND column_name = 'namespace'
  ) THEN
    ALTER TABLE translation_cache ADD COLUMN namespace text DEFAULT 'common';
  END IF;
END $$;

-- Add unique constraint for upsert operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'translation_cache_unique_key'
  ) THEN
    ALTER TABLE translation_cache
    ADD CONSTRAINT translation_cache_unique_key
    UNIQUE (source_text, target_language, namespace);
  END IF;
END $$;

-- Add index on namespace for filtering
CREATE INDEX IF NOT EXISTS idx_translation_cache_namespace
ON translation_cache(namespace);

-- Add index on target_language for filtering
CREATE INDEX IF NOT EXISTS idx_translation_cache_target_language
ON translation_cache(target_language);

-- Add RLS policies if not exists
DO $$
BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'translation_cache' AND rowsecurity = true
  ) THEN
    ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins manage translations" ON translation_cache;
DROP POLICY IF EXISTS "Public can read translations" ON translation_cache;

-- Allow admins to manage translations
CREATE POLICY "Admins manage translations"
ON translation_cache
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('super_admin', 'admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('super_admin', 'admin', 'editor')
  )
);

-- Allow public to read translations (for API usage)
CREATE POLICY "Public can read translations"
ON translation_cache
FOR SELECT
TO authenticated, anon
USING (true);

-- Add comment
COMMENT ON TABLE translation_cache IS
'Cache for translated content. Supports upsert operations via unique constraint on (source_text, target_language, namespace).';

-- Summary
COMMENT ON CONSTRAINT translation_cache_unique_key ON translation_cache IS
'Ensures one translation per source text, target language, and namespace combination. Enables upsert operations in the translation editor.';