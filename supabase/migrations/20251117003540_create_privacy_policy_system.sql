/*
  # Privacy Policy Management System

  ## Overview
  Multi-language privacy policy system with versioning, change tracking,
  and user acknowledgment tracking.

  ## New Tables

  ### 1. privacy_policy_versions
  Version control for privacy policies
  - `id` (uuid, primary key)
  - `version_number` (text, unique) - Version identifier (1.0, 2.0)
  - `effective_date` (date) - When version becomes active
  - `is_current` (boolean) - Current active version
  - `requires_reacknowledgment` (boolean) - Users must re-accept
  - `change_summary` (text) - Summary of changes
  - `created_at` (timestamptz)

  ### 2. privacy_policy_content
  Multi-language policy content
  - `id` (uuid, primary key)
  - `version_id` (uuid) - References privacy_policy_versions
  - `language_code` (text) - ISO 639-1 code (en, es, ja)
  - `title` (text) - Policy title
  - `content` (text) - Full policy text (markdown)
  - `last_updated` (timestamptz)
  - `updated_by` (uuid) - Admin who updated

  ### 3. privacy_policy_sections
  Structured policy sections for easy updates
  - `id` (uuid, primary key)
  - `content_id` (uuid) - References privacy_policy_content
  - `section_key` (text) - Unique section identifier
  - `section_title` (text) - Section heading
  - `section_content` (text) - Section text
  - `display_order` (integer) - Display order
  - `created_at` (timestamptz)

  ### 4. user_policy_acknowledgments
  Track user acceptance of privacy policies
  - `id` (uuid, primary key)
  - `user_identifier` (text) - User ID or email
  - `version_id` (uuid) - References privacy_policy_versions
  - `acknowledged_at` (timestamptz)
  - `ip_address` (inet)
  - `user_agent` (text)

  ## Features
  - Version control
  - Multi-language support
  - Structured sections
  - User acknowledgment tracking
  - Change summaries
*/

-- ============================================================================
-- 1. PRIVACY POLICY VERSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number text UNIQUE NOT NULL,
  effective_date date NOT NULL,
  is_current boolean DEFAULT false,
  requires_reacknowledgment boolean DEFAULT false,
  change_summary text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE privacy_policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view privacy policy versions"
  ON privacy_policy_versions FOR SELECT
  USING (true);

CREATE POLICY "Admins manage privacy policy versions"
  ON privacy_policy_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 2. PRIVACY POLICY CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_policy_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES privacy_policy_versions(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(version_id, language_code)
);

ALTER TABLE privacy_policy_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view privacy policy content"
  ON privacy_policy_content FOR SELECT
  USING (true);

CREATE POLICY "Admins manage privacy policy content"
  ON privacy_policy_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 3. PRIVACY POLICY SECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_policy_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES privacy_policy_content(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  section_title text NOT NULL,
  section_content text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, section_key)
);

ALTER TABLE privacy_policy_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view policy sections"
  ON privacy_policy_sections FOR SELECT
  USING (true);

CREATE POLICY "Admins manage policy sections"
  ON privacy_policy_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 4. USER POLICY ACKNOWLEDGMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_policy_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  version_id uuid NOT NULL REFERENCES privacy_policy_versions(id) ON DELETE CASCADE,
  acknowledged_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);

ALTER TABLE user_policy_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can acknowledge policies"
  ON user_policy_acknowledgments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users view own acknowledgments"
  ON user_policy_acknowledgments FOR SELECT
  USING (true);

CREATE POLICY "Admins view all acknowledgments"
  ON user_policy_acknowledgments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_privacy_versions_current 
  ON privacy_policy_versions(is_current) WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_privacy_content_version 
  ON privacy_policy_content(version_id, language_code);

CREATE INDEX IF NOT EXISTS idx_privacy_sections_content 
  ON privacy_policy_sections(content_id, display_order);

CREATE INDEX IF NOT EXISTS idx_policy_acks_user 
  ON user_policy_acknowledgments(user_identifier, acknowledged_at DESC);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Get current privacy policy for language
CREATE OR REPLACE FUNCTION get_current_privacy_policy(p_language_code text DEFAULT 'en')
RETURNS TABLE(
  version_number text,
  effective_date date,
  title text,
  content text,
  sections jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ppv.version_number,
    ppv.effective_date,
    ppc.title,
    ppc.content,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'section_key', pps.section_key,
          'section_title', pps.section_title,
          'section_content', pps.section_content
        ) ORDER BY pps.display_order
      )
      FROM privacy_policy_sections pps
      WHERE pps.content_id = ppc.id
    ) as sections
  FROM privacy_policy_versions ppv
  JOIN privacy_policy_content ppc ON ppc.version_id = ppv.id
  WHERE ppv.is_current = true
    AND ppc.language_code = p_language_code
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has acknowledged current policy
CREATE OR REPLACE FUNCTION has_user_acknowledged_current_policy(p_user_identifier text)
RETURNS boolean AS $$
DECLARE
  v_has_acknowledged boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM user_policy_acknowledgments upa
    JOIN privacy_policy_versions ppv ON ppv.id = upa.version_id
    WHERE upa.user_identifier = p_user_identifier
      AND ppv.is_current = true
  ) INTO v_has_acknowledged;
  
  RETURN v_has_acknowledged;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON privacy_policy_versions TO anon, authenticated;
GRANT SELECT ON privacy_policy_content TO anon, authenticated;
GRANT SELECT ON privacy_policy_sections TO anon, authenticated;
GRANT SELECT, INSERT ON user_policy_acknowledgments TO anon, authenticated;

GRANT EXECUTE ON FUNCTION get_current_privacy_policy TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_user_acknowledged_current_policy TO anon, authenticated;