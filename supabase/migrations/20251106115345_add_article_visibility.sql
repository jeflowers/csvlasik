/*
  # Add Article Visibility Column

  ## Overview
  Adds a visibility column to articles table to distinguish between:
  - internal: Internal articles (not public-facing)
  - external: Public-facing articles

  ## Changes
  1. Add visibility column with default 'external'
  2. Add check constraint to ensure valid values
  3. Add index for filtering by visibility
  4. Update existing articles to 'external' by default

  ## Security
  - RLS policies remain unchanged
  - All existing articles default to 'external' (public-facing)
*/

-- Add visibility column
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS visibility text 
DEFAULT 'external' 
CHECK (visibility IN ('internal', 'external'));

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_articles_visibility 
ON articles(visibility);

-- Add index for combined visibility + status filtering
CREATE INDEX IF NOT EXISTS idx_articles_visibility_status 
ON articles(visibility, status);

-- Update existing articles to be external by default
UPDATE articles 
SET visibility = 'external' 
WHERE visibility IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN articles.visibility IS 'Article visibility: internal (staff only) or external (public-facing)';

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ARTICLE VISIBILITY COLUMN ADDED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Column added: visibility';
  RAISE NOTICE 'Values: internal, external';
  RAISE NOTICE 'Default: external (public-facing)';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created:';
  RAISE NOTICE '  • idx_articles_visibility';
  RAISE NOTICE '  • idx_articles_visibility_status';
  RAISE NOTICE '';
END $$;
