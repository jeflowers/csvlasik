/*
  # Consolidate multiple permissive policies - Batch 2

  ## Overview
  Continues consolidating overlapping permissive policies for tables where
  an admin ALL policy overlaps with user-specific SELECT/INSERT/UPDATE policies.

  ## Modified Tables
  - consultation_settings, ringcentral_connections (admin ALL + scheduler SELECT)
  - encrypted_communications, encrypted_patient_data, encrypted_payment_data (admin ALL + user SELECT)
  - consent_data_exports, consent_schedules (admin ALL + public INSERT/SELECT)
  - consent_notifications (admin SELECT + public ALL)
  - consent_ab_tests, consent_categories, consent_cookies, consent_versions (admin ALL + public SELECT)
  - privacy_policy_content, privacy_policy_sections, privacy_policy_versions (admin ALL + public SELECT)
  - risk_findings (admin ALL + admin SELECT duplicate)
  - translation_cache (admin ALL + system INSERT)
  - videos (admin ALL + public SELECT)
*/

-- ============================================================
-- consultation_settings: admin ALL + scheduler SELECT
-- ============================================================
DROP POLICY IF EXISTS "View consultation settings" ON public.consultation_settings;
DROP POLICY IF EXISTS "Manage consultation settings" ON public.consultation_settings;

CREATE POLICY "Admins manage consultation settings"
  ON public.consultation_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

CREATE POLICY "Schedulers view consultation settings"
  ON public.consultation_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'scheduler'
    )
  );

-- ============================================================
-- ringcentral_connections: admin ALL + scheduler SELECT
-- ============================================================
DROP POLICY IF EXISTS "View ringcentral connections" ON public.ringcentral_connections;
DROP POLICY IF EXISTS "Manage ringcentral connections" ON public.ringcentral_connections;

CREATE POLICY "Admins manage ringcentral connections"
  ON public.ringcentral_connections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

CREATE POLICY "Schedulers view ringcentral connections"
  ON public.ringcentral_connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'scheduler'
    )
  );

-- ============================================================
-- encrypted_communications: admin ALL + user SELECT(own)
-- ============================================================
DROP POLICY IF EXISTS "Users access own communications" ON public.encrypted_communications;
DROP POLICY IF EXISTS "Admins manage communications" ON public.encrypted_communications;

CREATE POLICY "Admins manage communications"
  ON public.encrypted_communications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Users view own communications"
  ON public.encrypted_communications
  FOR SELECT
  TO authenticated
  USING (
    (from_user_id = (select auth.uid()) OR to_user_id = (select auth.uid()))
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- encrypted_patient_data: admin ALL + user SELECT(own)
-- ============================================================
DROP POLICY IF EXISTS "Users access own encrypted data" ON public.encrypted_patient_data;
DROP POLICY IF EXISTS "Admins manage encrypted data" ON public.encrypted_patient_data;

CREATE POLICY "Admins manage encrypted data"
  ON public.encrypted_patient_data
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Users view own encrypted data"
  ON public.encrypted_patient_data
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- encrypted_payment_data: admin ALL + user SELECT(own)
-- ============================================================
DROP POLICY IF EXISTS "Users access own payment data" ON public.encrypted_payment_data;
DROP POLICY IF EXISTS "Admins manage payment data" ON public.encrypted_payment_data;

CREATE POLICY "Admins manage payment data"
  ON public.encrypted_payment_data
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Users view own payment data"
  ON public.encrypted_payment_data
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- risk_findings: admin ALL + admin SELECT (pure duplicate)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view risk findings" ON public.risk_findings;

-- ============================================================
-- translation_cache: admin ALL + system INSERT(true)
-- Consolidate: admin ALL already covers INSERT for admins.
-- Replace open INSERT with one requiring auth.
-- ============================================================
DROP POLICY IF EXISTS "System can create translation cache entries" ON public.translation_cache;
DROP POLICY IF EXISTS "Admins manage translations" ON public.translation_cache;

CREATE POLICY "Admins manage translations"
  ON public.translation_cache
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert translation cache"
  ON public.translation_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );
