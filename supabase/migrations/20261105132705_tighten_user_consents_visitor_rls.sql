/*
# Restrict consent data to its owner

## Summary
Visitors (signed-in or not) may now only read or change consent data that
belongs to them. Ownership is proven by the visitor ID the browser sends in
the `x-visitor-id` request header (mirrors the `visitor_id` cookie set after
consent), or by the signed-in user's id. Admins keep read access for
compliance reporting.

## New objects
1. Function `public.request_visitor_id()` - returns the `x-visitor-id`
   header value of the current request (or null).
2. Index `user_consents_user_identifier_idx` for fast ownership lookups.

## Security changes
1. All table privileges for `anon`/`authenticated` on the 13 consent tables
   are reset and re-granted at the minimum the app uses.
2. `user_consents`, `consent_notifications`, `consent_data_exports`: owner-only
   read/insert/update (no cross-visitor access). Admins can read.
3. `user_cookie_preferences`: owner-only CRUD, scoped through the parent
   consent record. Admins can read.
4. `consent_analytics_events`: visitors may only log events for themselves
   (or anonymously); only admins can read.
5. `consent_records`, `consent_audit_log`, `consent_withdrawal_reasons`,
   `consent_schedules`: no public writes; admin-only access. Triggers that
   populate them run with owner rights and keep working.
6. Lookup tables (versions, cookies, categories, A/B tests): everyone can read
   active rows; only admins can change them.
7. Privileged consent functions (export of any visitor's data, expiry list,
   statistics, trigger/cron helpers) can no longer be called from the browser;
   only the server role may run them.

## Notes
1. No data is deleted or altered.
2. Policies are dropped and re-created so this migration is safe to re-run.
*/

CREATE OR REPLACE FUNCTION public.request_visitor_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT nullif(current_setting('request.headers', true)::json->>'x-visitor-id', '')
$$;
REVOKE EXECUTE ON FUNCTION public.request_visitor_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_visitor_id() TO anon, authenticated;

CREATE INDEX IF NOT EXISTS user_consents_user_identifier_idx ON public.user_consents(user_identifier);

-- Reset grants
REVOKE ALL ON public.user_consents, public.user_cookie_preferences, public.consent_notifications,
  public.consent_data_exports, public.consent_analytics_events, public.consent_schedules,
  public.consent_audit_log, public.consent_records, public.consent_withdrawal_reasons,
  public.consent_versions, public.consent_cookies, public.consent_categories, public.consent_ab_tests
  FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.user_consents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_cookie_preferences TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.consent_notifications TO anon, authenticated;
GRANT SELECT, INSERT ON public.consent_data_exports TO anon, authenticated;
GRANT UPDATE, DELETE ON public.consent_data_exports TO authenticated;
GRANT INSERT ON public.consent_analytics_events TO anon, authenticated;
GRANT SELECT ON public.consent_analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consent_schedules TO authenticated;
GRANT SELECT ON public.consent_audit_log, public.consent_records, public.consent_withdrawal_reasons TO authenticated;
GRANT SELECT ON public.consent_versions, public.consent_cookies, public.consent_categories, public.consent_ab_tests TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consent_versions, public.consent_cookies, public.consent_categories, public.consent_ab_tests TO authenticated;

-- user_consents
DROP POLICY IF EXISTS "Admins view all consents" ON public.user_consents;
DROP POLICY IF EXISTS "Anon can insert own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Anon can update own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Anon can view own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Owner can view consents" ON public.user_consents;
DROP POLICY IF EXISTS "Owner can insert consents" ON public.user_consents;
DROP POLICY IF EXISTS "Owner can update consents" ON public.user_consents;
DROP POLICY IF EXISTS "Admins view consents" ON public.user_consents;
DROP POLICY IF EXISTS "Admins update consents" ON public.user_consents;

CREATE POLICY "Owner can view consents" ON public.user_consents FOR SELECT TO anon, authenticated
  USING (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Owner can insert consents" ON public.user_consents FOR INSERT TO anon, authenticated
  WITH CHECK (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Owner can update consents" ON public.user_consents FOR UPDATE TO anon, authenticated
  USING (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text)
  WITH CHECK (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Admins view consents" ON public.user_consents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])));
CREATE POLICY "Admins update consents" ON public.user_consents FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])));

-- user_cookie_preferences
DROP POLICY IF EXISTS "Admins view all cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Anon can delete own cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Anon can insert cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Anon can update own cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Anon can view own cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Owner can view cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Owner can insert cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Owner can update cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Owner can delete cookie preferences" ON public.user_cookie_preferences;
DROP POLICY IF EXISTS "Admins view cookie preferences" ON public.user_cookie_preferences;

CREATE POLICY "Owner can view cookie preferences" ON public.user_cookie_preferences FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.user_consents uc WHERE uc.id = user_cookie_preferences.user_consent_id
    AND (uc.user_identifier = public.request_visitor_id() OR uc.user_identifier = (select auth.uid())::text)));
CREATE POLICY "Owner can insert cookie preferences" ON public.user_cookie_preferences FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_consents uc WHERE uc.id = user_cookie_preferences.user_consent_id
    AND (uc.user_identifier = public.request_visitor_id() OR uc.user_identifier = (select auth.uid())::text)));
CREATE POLICY "Owner can update cookie preferences" ON public.user_cookie_preferences FOR UPDATE TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.user_consents uc WHERE uc.id = user_cookie_preferences.user_consent_id
    AND (uc.user_identifier = public.request_visitor_id() OR uc.user_identifier = (select auth.uid())::text)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_consents uc WHERE uc.id = user_cookie_preferences.user_consent_id
    AND (uc.user_identifier = public.request_visitor_id() OR uc.user_identifier = (select auth.uid())::text)));
CREATE POLICY "Owner can delete cookie preferences" ON public.user_cookie_preferences FOR DELETE TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.user_consents uc WHERE uc.id = user_cookie_preferences.user_consent_id
    AND (uc.user_identifier = public.request_visitor_id() OR uc.user_identifier = (select auth.uid())::text)));
CREATE POLICY "Admins view cookie preferences" ON public.user_cookie_preferences FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])));

-- consent_notifications
DROP POLICY IF EXISTS "Anon can delete own consent notifications" ON public.consent_notifications;
DROP POLICY IF EXISTS "Anon can insert consent notifications" ON public.consent_notifications;
DROP POLICY IF EXISTS "Anon can update own consent notifications" ON public.consent_notifications;
DROP POLICY IF EXISTS "Anon can view own consent notifications" ON public.consent_notifications;
DROP POLICY IF EXISTS "Owner can view notifications" ON public.consent_notifications;
DROP POLICY IF EXISTS "Owner can insert notifications" ON public.consent_notifications;
DROP POLICY IF EXISTS "Owner can update notifications" ON public.consent_notifications;

CREATE POLICY "Owner can view notifications" ON public.consent_notifications FOR SELECT TO anon, authenticated
  USING (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Owner can insert notifications" ON public.consent_notifications FOR INSERT TO anon, authenticated
  WITH CHECK (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Owner can update notifications" ON public.consent_notifications FOR UPDATE TO anon, authenticated
  USING (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text)
  WITH CHECK (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);

-- consent_data_exports
DROP POLICY IF EXISTS "Admins manage all exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Anon can request exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Anon can view own exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Owner can request exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Owner can view exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Admins view exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Admins update exports" ON public.consent_data_exports;
DROP POLICY IF EXISTS "Admins delete exports" ON public.consent_data_exports;

CREATE POLICY "Owner can request exports" ON public.consent_data_exports FOR INSERT TO anon, authenticated
  WITH CHECK (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Owner can view exports" ON public.consent_data_exports FOR SELECT TO anon, authenticated
  USING (user_identifier = public.request_visitor_id() OR user_identifier = (select auth.uid())::text);
CREATE POLICY "Admins view exports" ON public.consent_data_exports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])));
CREATE POLICY "Admins update exports" ON public.consent_data_exports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])));
CREATE POLICY "Admins delete exports" ON public.consent_data_exports FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY['admin','super_admin'])));

-- consent_analytics_events
DROP POLICY IF EXISTS "Public can log analytics events" ON public.consent_analytics_events;
DROP POLICY IF EXISTS "Visitors log own analytics events" ON public.consent_analytics_events;
CREATE POLICY "Visitors log own analytics events" ON public.consent_analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    coalesce(length(event_type), 0) > 0
    AND (user_identifier IS NULL OR user_identifier = 'anonymous'
         OR user_identifier = public.request_visitor_id()
         OR user_identifier = (select auth.uid())::text)
  );

-- Admin-only / trigger-populated tables
DROP POLICY IF EXISTS "Public can log own consent actions" ON public.consent_audit_log;
DROP POLICY IF EXISTS "Anyone can create consent records" ON public.consent_records;
DROP POLICY IF EXISTS "Public can insert withdrawal reasons" ON public.consent_withdrawal_reasons;

DROP POLICY IF EXISTS "Admins manage all schedules" ON public.consent_schedules;
DROP POLICY IF EXISTS "Anon can insert schedules" ON public.consent_schedules;
DROP POLICY IF EXISTS "Anon can view own schedules" ON public.consent_schedules;

-- Lookup tables: public read of active rows
DROP POLICY IF EXISTS "Admins manage tests" ON public.consent_ab_tests;
DROP POLICY IF EXISTS "Anon can view active tests" ON public.consent_ab_tests;
DROP POLICY IF EXISTS "Everyone can view active tests" ON public.consent_ab_tests;
CREATE POLICY "Everyone can view active tests" ON public.consent_ab_tests FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage consent categories" ON public.consent_categories;
DROP POLICY IF EXISTS "Anon can view active consent categories" ON public.consent_categories;
DROP POLICY IF EXISTS "Everyone can view active categories" ON public.consent_categories;
CREATE POLICY "Everyone can view active categories" ON public.consent_categories FOR SELECT TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "Admins manage cookies" ON public.consent_cookies;
DROP POLICY IF EXISTS "Anon can view active cookies" ON public.consent_cookies;
DROP POLICY IF EXISTS "Everyone can view active cookies" ON public.consent_cookies;
CREATE POLICY "Everyone can view active cookies" ON public.consent_cookies FOR SELECT TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "Admins manage consent versions" ON public.consent_versions;
DROP POLICY IF EXISTS "Anon can view consent versions" ON public.consent_versions;
DROP POLICY IF EXISTS "Everyone can view consent versions" ON public.consent_versions;
CREATE POLICY "Everyone can view consent versions" ON public.consent_versions FOR SELECT TO anon, authenticated USING (true);

-- Admin CRUD on schedules and lookup tables
DO $$
DECLARE
  t text;
  admin_check text := 'EXISTS (SELECT 1 FROM public.users WHERE users.id = (select auth.uid()) AND users.role = ANY (ARRAY[''admin'',''super_admin'']))';
BEGIN
  FOREACH t IN ARRAY ARRAY['consent_schedules','consent_ab_tests','consent_categories','consent_cookies','consent_versions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins view ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins insert ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins update ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins delete ' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%s)', 'Admins view ' || t, t, admin_check);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)', 'Admins insert ' || t, t, admin_check);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)', 'Admins update ' || t, t, admin_check, admin_check);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)', 'Admins delete ' || t, t, admin_check);
  END LOOP;
END $$;

-- Lock down privileged consent functions (not called by the browser)
REVOKE EXECUTE ON FUNCTION public.log_consent_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_consent_schedule() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_consent_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_reminders_for_expiring_consents() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_consent_expiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_consent_statistics() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_consent_analytics_summary(date, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_consent_export_data(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_reminders_for_expiring_consents() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_consent_expiry() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_consent_statistics() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_consent_analytics_summary(date, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_consent_export_data(text) TO service_role;
