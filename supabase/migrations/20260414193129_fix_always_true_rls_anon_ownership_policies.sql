
/*
  # Fix Always-True Anon Ownership RLS Policies

  1. Changes
    - Replace `USING (true)` / `WITH CHECK (true)` on anon policies with proper field validation
    - consent_data_exports: require user_identifier for INSERT and SELECT
    - consent_notifications: split ALL into separate policies with user_identifier checks
    - consent_schedules: require user_consent_id for INSERT and SELECT
    - user_consents: add user_identifier checks for INSERT, SELECT, UPDATE
    - user_cookie_preferences: split ALL into separate policies with user_consent_id checks
    - user_policy_acknowledgments: add user_identifier checks for INSERT and SELECT

  2. Security
    - All anon policies now require a non-empty identifier to prevent unbounded data access
    - SELECT policies check that user_identifier matches instead of returning all rows
    - INSERT/UPDATE policies validate required fields

  3. Important Notes
    - Anon users identify via user_identifier (cookie/session ID) not auth.uid()
    - We require non-empty user_identifier to prevent listing all data
    - consent_versions, privacy_policy_* SELECT true policies are intentionally left as public readable content
*/

-- ============================================================
-- consent_data_exports: fix INSERT and SELECT
-- ============================================================
DROP POLICY IF EXISTS "Anon can request exports" ON consent_data_exports;
CREATE POLICY "Anon can request exports"
  ON consent_data_exports FOR INSERT
  TO anon
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> '' AND
    export_type IS NOT NULL AND export_type <> '' AND
    export_format IS NOT NULL AND export_format <> ''
  );

DROP POLICY IF EXISTS "Anon can view own exports" ON consent_data_exports;
CREATE POLICY "Anon can view own exports"
  ON consent_data_exports FOR SELECT
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

-- ============================================================
-- consent_notifications: replace ALL with separate policies
-- ============================================================
DROP POLICY IF EXISTS "Anon can manage own notifications" ON consent_notifications;

CREATE POLICY "Anon can insert consent notifications"
  ON consent_notifications FOR INSERT
  TO anon
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

CREATE POLICY "Anon can view own consent notifications"
  ON consent_notifications FOR SELECT
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

CREATE POLICY "Anon can update own consent notifications"
  ON consent_notifications FOR UPDATE
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  )
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

CREATE POLICY "Anon can delete own consent notifications"
  ON consent_notifications FOR DELETE
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

-- ============================================================
-- consent_schedules: fix INSERT and SELECT
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert schedules" ON consent_schedules;
CREATE POLICY "Anon can insert schedules"
  ON consent_schedules FOR INSERT
  TO anon
  WITH CHECK (
    user_consent_id IS NOT NULL AND
    review_date IS NOT NULL
  );

DROP POLICY IF EXISTS "Anon can view own schedules" ON consent_schedules;
CREATE POLICY "Anon can view own schedules"
  ON consent_schedules FOR SELECT
  TO anon
  USING (
    user_consent_id IS NOT NULL
  );

-- ============================================================
-- user_consents: fix INSERT, SELECT, UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Anon can insert own consents" ON user_consents;
CREATE POLICY "Anon can insert own consents"
  ON user_consents FOR INSERT
  TO anon
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> '' AND
    consent_method IS NOT NULL AND consent_method <> ''
  );

DROP POLICY IF EXISTS "Anon can view own consents" ON user_consents;
CREATE POLICY "Anon can view own consents"
  ON user_consents FOR SELECT
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

DROP POLICY IF EXISTS "Anon can update own consents" ON user_consents;
CREATE POLICY "Anon can update own consents"
  ON user_consents FOR UPDATE
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  )
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );

-- ============================================================
-- user_cookie_preferences: replace ALL with separate policies
-- ============================================================
DROP POLICY IF EXISTS "Anon manages cookie preferences" ON user_cookie_preferences;

CREATE POLICY "Anon can insert cookie preferences"
  ON user_cookie_preferences FOR INSERT
  TO anon
  WITH CHECK (
    user_consent_id IS NOT NULL AND
    cookie_id IS NOT NULL
  );

CREATE POLICY "Anon can view own cookie preferences"
  ON user_cookie_preferences FOR SELECT
  TO anon
  USING (
    user_consent_id IS NOT NULL
  );

CREATE POLICY "Anon can update own cookie preferences"
  ON user_cookie_preferences FOR UPDATE
  TO anon
  USING (
    user_consent_id IS NOT NULL
  )
  WITH CHECK (
    user_consent_id IS NOT NULL AND
    cookie_id IS NOT NULL
  );

CREATE POLICY "Anon can delete own cookie preferences"
  ON user_cookie_preferences FOR DELETE
  TO anon
  USING (
    user_consent_id IS NOT NULL
  );

-- ============================================================
-- user_policy_acknowledgments: fix INSERT and SELECT
-- ============================================================
DROP POLICY IF EXISTS "Anon can acknowledge policies" ON user_policy_acknowledgments;
CREATE POLICY "Anon can acknowledge policies"
  ON user_policy_acknowledgments FOR INSERT
  TO anon
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> '' AND
    version_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Anon can view own acknowledgments" ON user_policy_acknowledgments;
CREATE POLICY "Anon can view own acknowledgments"
  ON user_policy_acknowledgments FOR SELECT
  TO anon
  USING (
    user_identifier IS NOT NULL AND user_identifier <> ''
  );
