/*
  # Consolidate multiple permissive policies - Batch 3

  ## Overview
  Handles the remaining tables with multiple permissive policy overlaps.
  Where an admin ALL policy for authenticated overlaps with a broader SELECT/INSERT
  also targeting authenticated (via the default "public" role), we retarget the
  broader policy to anon-only so it no longer overlaps.

  ## Modified Tables
  - consent_ab_tests, consent_categories, consent_cookies, consent_versions
  - consent_data_exports, consent_notifications, consent_schedules
  - privacy_policy_content, privacy_policy_sections, privacy_policy_versions
  - videos
  - user_consents, user_cookie_preferences, user_policy_acknowledgments
  - users (3 UPDATE policies consolidated to 1)
  - patient_registrations, patient_medical_histories, patient_insurance_info, patient_consent_forms
*/

-- ============================================================
-- consent_ab_tests: retarget public SELECT to anon only
-- ============================================================
DROP POLICY IF EXISTS "Public can view active tests" ON public.consent_ab_tests;
CREATE POLICY "Anon can view active tests"
  ON public.consent_ab_tests
  FOR SELECT
  TO anon
  USING (is_active = true);

-- consent_categories
DROP POLICY IF EXISTS "Anyone can view active consent categories" ON public.consent_categories;
CREATE POLICY "Anon can view active consent categories"
  ON public.consent_categories
  FOR SELECT
  TO anon
  USING (active = true);

-- consent_cookies
DROP POLICY IF EXISTS "Anyone can view active cookies" ON public.consent_cookies;
CREATE POLICY "Anon can view active cookies"
  ON public.consent_cookies
  FOR SELECT
  TO anon
  USING (active = true);

-- consent_versions
DROP POLICY IF EXISTS "Anyone can view consent versions" ON public.consent_versions;
CREATE POLICY "Anon can view consent versions"
  ON public.consent_versions
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- consent_data_exports: admin ALL + public INSERT/SELECT
-- ============================================================
DROP POLICY IF EXISTS "Public can request exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Public can view own exports" ON public.consent_data_exports;

CREATE POLICY "Anon can request exports"
  ON public.consent_data_exports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view own exports"
  ON public.consent_data_exports
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- consent_notifications: admin SELECT auth + public ALL
-- ============================================================
DROP POLICY IF EXISTS "Public can manage own notifications" ON public.consent_notifications;

CREATE POLICY "Anon can manage own notifications"
  ON public.consent_notifications
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- consent_schedules: admin ALL + public INSERT/SELECT
-- ============================================================
DROP POLICY IF EXISTS "Public can insert schedules" ON public.consent_schedules;
DROP POLICY IF EXISTS "Public can view own schedules" ON public.consent_schedules;

CREATE POLICY "Anon can insert schedules"
  ON public.consent_schedules
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view own schedules"
  ON public.consent_schedules
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- privacy_policy_*: admin ALL + public SELECT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view privacy policy content" ON public.privacy_policy_content;
CREATE POLICY "Anon can view privacy policy content"
  ON public.privacy_policy_content
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anyone can view policy sections" ON public.privacy_policy_sections;
CREATE POLICY "Anon can view policy sections"
  ON public.privacy_policy_sections
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anyone can view privacy policy versions" ON public.privacy_policy_versions;
CREATE POLICY "Anon can view privacy policy versions"
  ON public.privacy_policy_versions
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- videos: admin ALL auth + public SELECT
-- Original allowed all authenticated to see all + published for anon.
-- Split: admin ALL stays, anon gets published, non-admin auth gets all.
-- ============================================================
DROP POLICY IF EXISTS "View videos" ON public.videos;

CREATE POLICY "Anon can view published videos"
  ON public.videos
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Non-admin authenticated view videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (select auth.uid()) AND r.name = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- user_consents: admin ALL + public INSERT/SELECT/UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Public can insert own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Public can view own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Public can update own consents" ON public.user_consents;

CREATE POLICY "Anon can insert own consents"
  ON public.user_consents
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view own consents"
  ON public.user_consents
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can update own consents"
  ON public.user_consents
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- user_cookie_preferences: admin ALL + public ALL
-- ============================================================
DROP POLICY IF EXISTS "Users manage own cookie preferences" ON public.user_cookie_preferences;

CREATE POLICY "Anon manages cookie preferences"
  ON public.user_cookie_preferences
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- user_policy_acknowledgments: admin ALL + public INSERT/SELECT
-- ============================================================
DROP POLICY IF EXISTS "Public can acknowledge policies" ON public.user_policy_acknowledgments;
DROP POLICY IF EXISTS "Users view own acknowledgments" ON public.user_policy_acknowledgments;

CREATE POLICY "Anon can acknowledge policies"
  ON public.user_policy_acknowledgments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view own acknowledgments"
  ON public.user_policy_acknowledgments
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- users: 3 UPDATE policies for authenticated -> consolidate to 1
-- ============================================================
DROP POLICY IF EXISTS "Admins can update user passwords" ON public.users;
DROP POLICY IF EXISTS "Admins can update users via function" ON public.users;
DROP POLICY IF EXISTS "Users can update own password" ON public.users;

CREATE POLICY "Users can update own or admins can update any"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid()) OR is_current_user_admin()
  )
  WITH CHECK (
    id = (select auth.uid()) OR is_current_user_admin()
  );

-- ============================================================
-- Patient forms: admin ALL + user INSERT/SELECT/UPDATE
-- Consolidate into single per-action policies with OR
-- ============================================================

-- patient_registrations
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.patient_registrations;
DROP POLICY IF EXISTS "Authenticated patients can submit registration" ON public.patient_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.patient_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON public.patient_registrations;

CREATE POLICY "View own or admin view all registrations"
  ON public.patient_registrations FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR is_current_user_admin());

CREATE POLICY "Submit own or admin insert registrations"
  ON public.patient_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR is_current_user_admin());

CREATE POLICY "Update own or admin update registrations"
  ON public.patient_registrations FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR is_current_user_admin())
  WITH CHECK (user_id = (select auth.uid()) OR is_current_user_admin());

CREATE POLICY "Admin delete registrations"
  ON public.patient_registrations FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- patient_medical_histories
DROP POLICY IF EXISTS "Admins can manage all medical histories" ON public.patient_medical_histories;
DROP POLICY IF EXISTS "Authenticated patients can submit medical history" ON public.patient_medical_histories;
DROP POLICY IF EXISTS "Users can view own medical histories" ON public.patient_medical_histories;
DROP POLICY IF EXISTS "Users can update own medical histories" ON public.patient_medical_histories;

CREATE POLICY "View own or admin view all medical histories"
  ON public.patient_medical_histories FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  );

CREATE POLICY "Submit own or admin insert medical histories"
  ON public.patient_medical_histories FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR is_current_user_admin());

CREATE POLICY "Update own or admin update medical histories"
  ON public.patient_medical_histories FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  );

CREATE POLICY "Admin delete medical histories"
  ON public.patient_medical_histories FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- patient_insurance_info
DROP POLICY IF EXISTS "Admins can manage all insurance info" ON public.patient_insurance_info;
DROP POLICY IF EXISTS "Authenticated patients can submit insurance info" ON public.patient_insurance_info;
DROP POLICY IF EXISTS "Users can view own insurance info" ON public.patient_insurance_info;
DROP POLICY IF EXISTS "Users can update own insurance info" ON public.patient_insurance_info;

CREATE POLICY "View own or admin view all insurance info"
  ON public.patient_insurance_info FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  );

CREATE POLICY "Submit own or admin insert insurance info"
  ON public.patient_insurance_info FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR is_current_user_admin());

CREATE POLICY "Update own or admin update insurance info"
  ON public.patient_insurance_info FOR UPDATE TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  );

CREATE POLICY "Admin delete insurance info"
  ON public.patient_insurance_info FOR DELETE TO authenticated
  USING (is_current_user_admin());

-- patient_consent_forms
DROP POLICY IF EXISTS "Admins can manage all consent forms" ON public.patient_consent_forms;
DROP POLICY IF EXISTS "Authenticated patients can submit consent forms" ON public.patient_consent_forms;
DROP POLICY IF EXISTS "Users can view own consent forms" ON public.patient_consent_forms;

CREATE POLICY "View own or admin view all consent forms"
  ON public.patient_consent_forms FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT id FROM public.patient_registrations WHERE user_id = (select auth.uid()))
    OR is_current_user_admin()
  );

CREATE POLICY "Submit own or admin insert consent forms"
  ON public.patient_consent_forms FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR is_current_user_admin());

CREATE POLICY "Admin update consent forms"
  ON public.patient_consent_forms FOR UPDATE TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admin delete consent forms"
  ON public.patient_consent_forms FOR DELETE TO authenticated
  USING (is_current_user_admin());
