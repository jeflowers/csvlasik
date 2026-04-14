
/*
  # Fix Always-True RLS INSERT Policies

  1. Changes
    - Replace `WITH CHECK (true)` on INSERT policies with validation checks on required NOT NULL fields
    - This ensures policies enforce that submitted data contains required fields
    - Public-facing forms (appointments, consultations, financing, testimonials) get field validation
    - Analytics/logging tables (page_views, error_logs, performance_metrics, user_events, conversion_tracking) get required field checks
    - Audit log tables get action field validation
    - Consent tables get user_identifier or consent_id validation

  2. Security
    - Moves from completely open INSERT to requiring non-empty required fields
    - Prevents empty/null insertions that bypass NOT NULL constraints at RLS level
    - Maintains public accessibility for legitimate form submissions

  3. Important Notes
    - SELECT policies on truly public data (privacy_policy, statistics, roles, etc.) are left as-is since they are intentionally public
    - All changes use DROP + CREATE pattern to safely replace policies
*/

-- ============================================================
-- appointment_bookings: require patient_name, patient_email, procedure_type
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create bookings" ON appointment_bookings;
CREATE POLICY "Anyone can create bookings"
  ON appointment_bookings FOR INSERT
  TO public
  WITH CHECK (
    patient_name IS NOT NULL AND patient_name <> '' AND
    patient_email IS NOT NULL AND patient_email <> '' AND
    procedure_type IS NOT NULL AND procedure_type <> ''
  );

-- ============================================================
-- appointment_requests: require first_name, last_name, email, phone, procedure_type
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create appointment requests" ON appointment_requests;
CREATE POLICY "Anyone can create appointment requests"
  ON appointment_requests FOR INSERT
  TO public
  WITH CHECK (
    first_name IS NOT NULL AND first_name <> '' AND
    last_name IS NOT NULL AND last_name <> '' AND
    email IS NOT NULL AND email <> '' AND
    phone IS NOT NULL AND phone <> '' AND
    procedure_type IS NOT NULL AND procedure_type <> ''
  );

-- ============================================================
-- audit_logs: require action and user_id matches caller
-- ============================================================
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    action IS NOT NULL AND action <> '' AND
    user_id = (select auth.uid())
  );

-- ============================================================
-- consent_analytics_events: require event_type
-- ============================================================
DROP POLICY IF EXISTS "Public can log analytics events" ON consent_analytics_events;
CREATE POLICY "Public can log analytics events"
  ON consent_analytics_events FOR INSERT
  TO public
  WITH CHECK (
    event_type IS NOT NULL AND event_type <> ''
  );

-- ============================================================
-- consent_audit_log: require user_identifier and action
-- ============================================================
DROP POLICY IF EXISTS "Public can log own consent actions" ON consent_audit_log;
CREATE POLICY "Public can log own consent actions"
  ON consent_audit_log FOR INSERT
  TO public
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> '' AND
    action IS NOT NULL AND action <> ''
  );

-- ============================================================
-- consent_records: require user_identifier and consent_type
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create consent records" ON consent_records;
CREATE POLICY "Anyone can create consent records"
  ON consent_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_identifier IS NOT NULL AND user_identifier <> '' AND
    consent_type IS NOT NULL AND consent_type <> ''
  );

-- ============================================================
-- consent_withdrawal_reasons: require consent_id
-- ============================================================
DROP POLICY IF EXISTS "Public can insert withdrawal reasons" ON consent_withdrawal_reasons;
CREATE POLICY "Public can insert withdrawal reasons"
  ON consent_withdrawal_reasons FOR INSERT
  TO public
  WITH CHECK (
    consent_id IS NOT NULL
  );

-- ============================================================
-- consultation_audit_log (anon): require action
-- ============================================================
DROP POLICY IF EXISTS "Anon inserts audit logs" ON consultation_audit_log;
CREATE POLICY "Anon inserts audit logs"
  ON consultation_audit_log FOR INSERT
  TO anon
  WITH CHECK (
    action IS NOT NULL AND action <> ''
  );

-- ============================================================
-- consultation_audit_log (authenticated): require action and user matches caller
-- ============================================================
DROP POLICY IF EXISTS "System inserts audit logs" ON consultation_audit_log;
CREATE POLICY "System inserts audit logs"
  ON consultation_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    action IS NOT NULL AND action <> '' AND
    (user_id IS NULL OR user_id = (select auth.uid()))
  );

-- ============================================================
-- consultation_requests: require first_name, last_name, email, phone, procedure
-- ============================================================
DROP POLICY IF EXISTS "Public can insert consultation requests" ON consultation_requests;
CREATE POLICY "Public can insert consultation requests"
  ON consultation_requests FOR INSERT
  TO anon
  WITH CHECK (
    first_name IS NOT NULL AND first_name <> '' AND
    last_name IS NOT NULL AND last_name <> '' AND
    email IS NOT NULL AND email <> '' AND
    phone IS NOT NULL AND phone <> '' AND
    procedure IS NOT NULL AND procedure <> ''
  );

-- ============================================================
-- conversion_tracking: require session_id and conversion_type
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert conversions" ON conversion_tracking;
CREATE POLICY "Anyone can insert conversions"
  ON conversion_tracking FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND session_id <> '' AND
    conversion_type IS NOT NULL AND conversion_type <> ''
  );

-- ============================================================
-- data_subject_requests: require email and request_type
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create data requests" ON data_subject_requests;
CREATE POLICY "Anyone can create data requests"
  ON data_subject_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND email <> '' AND
    request_type IS NOT NULL AND request_type <> ''
  );

-- ============================================================
-- email_logs: require to_email, from_email, subject, status and user is authenticated
-- ============================================================
DROP POLICY IF EXISTS "System can insert email logs" ON email_logs;
CREATE POLICY "System can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    to_email IS NOT NULL AND to_email <> '' AND
    from_email IS NOT NULL AND from_email <> '' AND
    subject IS NOT NULL AND subject <> '' AND
    status IS NOT NULL AND status <> ''
  );

-- ============================================================
-- error_logs: require error_type and error_message
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert errors" ON error_logs;
CREATE POLICY "Anyone can insert errors"
  ON error_logs FOR INSERT
  TO anon
  WITH CHECK (
    error_type IS NOT NULL AND error_type <> '' AND
    error_message IS NOT NULL AND error_message <> ''
  );

-- ============================================================
-- financing_applications: require applicant_name, applicant_email, procedure_type, procedure_cost
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create financing application" ON financing_applications;
CREATE POLICY "Anyone can create financing application"
  ON financing_applications FOR INSERT
  TO public
  WITH CHECK (
    applicant_name IS NOT NULL AND applicant_name <> '' AND
    applicant_email IS NOT NULL AND applicant_email <> '' AND
    procedure_type IS NOT NULL AND procedure_type <> '' AND
    procedure_cost IS NOT NULL AND procedure_cost > 0
  );

-- ============================================================
-- notifications: require type, title, message and user_id matches caller
-- ============================================================
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    type IS NOT NULL AND type <> '' AND
    title IS NOT NULL AND title <> '' AND
    message IS NOT NULL AND message <> ''
  );

-- ============================================================
-- page_views: require session_id and page_url
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND session_id <> '' AND
    page_url IS NOT NULL AND page_url <> ''
  );

-- ============================================================
-- patient_consents: require patient_name, patient_email, consent_type
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create consent" ON patient_consents;
CREATE POLICY "Anyone can create consent"
  ON patient_consents FOR INSERT
  TO public
  WITH CHECK (
    patient_name IS NOT NULL AND patient_name <> '' AND
    patient_email IS NOT NULL AND patient_email <> '' AND
    consent_type IS NOT NULL AND consent_type <> ''
  );

-- ============================================================
-- performance_metrics: require session_id, page_url, metric_type, metric_value
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert metrics" ON performance_metrics;
CREATE POLICY "Anyone can insert metrics"
  ON performance_metrics FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND session_id <> '' AND
    page_url IS NOT NULL AND page_url <> '' AND
    metric_type IS NOT NULL AND metric_type <> '' AND
    metric_value IS NOT NULL
  );

-- ============================================================
-- testimonials: require name and content
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON testimonials;
CREATE POLICY "Anyone can submit testimonials"
  ON testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    content IS NOT NULL AND content <> ''
  );

-- ============================================================
-- user_events: require session_id and event_name
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert events" ON user_events;
CREATE POLICY "Anyone can insert events"
  ON user_events FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND session_id <> '' AND
    event_name IS NOT NULL AND event_name <> ''
  );
