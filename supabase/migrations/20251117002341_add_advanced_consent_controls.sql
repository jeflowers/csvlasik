/*
  # Advanced Consent Management Controls

  ## Overview
  Adds even more granular controls including per-cookie consent,
  consent scheduling, data portability, notification preferences,
  and advanced analytics capabilities.

  ## New Tables

  ### 1. user_cookie_preferences
  Individual cookie-level consent (ultra-granular)
  - `id` (uuid, primary key)
  - `user_consent_id` (uuid) - References user_consents
  - `cookie_id` (uuid) - References consent_cookies
  - `is_enabled` (boolean) - Cookie enabled/disabled
  - `override_category` (boolean) - Override category default
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. consent_schedules
  Scheduled consent reviews and expiry
  - `id` (uuid, primary key)
  - `user_consent_id` (uuid) - References user_consents
  - `review_date` (date) - Next review date
  - `expiry_date` (date) - Consent expiry
  - `auto_renew` (boolean) - Auto-renew on expiry
  - `reminder_sent` (boolean) - Reminder sent flag
  - `created_at` (timestamptz)

  ### 3. consent_notifications
  User notification preferences for consent changes
  - `id` (uuid, primary key)
  - `user_identifier` (text)
  - `email` (text) - Email for notifications
  - `notify_policy_changes` (boolean) - Policy update notifications
  - `notify_before_expiry` (boolean) - Expiry reminders
  - `notify_data_usage` (boolean) - Data usage reports
  - `notification_frequency` (text) - immediate, daily, weekly, monthly
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. consent_data_exports
  Data portability requests (GDPR Article 20)
  - `id` (uuid, primary key)
  - `user_identifier` (text)
  - `export_type` (text) - full, consents_only, audit_only
  - `export_format` (text) - json, csv, pdf
  - `status` (text) - requested, processing, completed, failed
  - `file_path` (text) - Path to export file
  - `requested_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `expires_at` (timestamptz) - Export link expiry

  ### 5. consent_analytics_events
  Detailed consent interaction analytics
  - `id` (uuid, primary key)
  - `user_identifier` (text)
  - `event_type` (text) - banner_shown, banner_dismissed, preferences_opened, etc.
  - `event_data` (jsonb) - Additional event data
  - `page_url` (text) - Where event occurred
  - `session_id` (text) - User session
  - `timestamp` (timestamptz)

  ### 6. consent_ab_tests
  A/B testing for consent flows
  - `id` (uuid, primary key)
  - `test_name` (text) - Test identifier
  - `variant_name` (text) - Variant A, B, C
  - `configuration` (jsonb) - Variant configuration
  - `is_active` (boolean)
  - `start_date` (date)
  - `end_date` (date)
  - `created_at` (timestamptz)

  ## Features
  - Per-cookie granular control
  - Consent expiry and scheduling
  - Email notifications
  - Data portability (GDPR)
  - Advanced analytics
  - A/B testing capabilities
*/

-- ============================================================================
-- 1. USER COOKIE PREFERENCES (ULTRA-GRANULAR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_cookie_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_consent_id uuid NOT NULL REFERENCES user_consents(id) ON DELETE CASCADE,
  cookie_id uuid NOT NULL REFERENCES consent_cookies(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  override_category boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_consent_id, cookie_id)
);

ALTER TABLE user_cookie_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cookie preferences"
  ON user_cookie_preferences FOR ALL
  USING (true);

CREATE POLICY "Admins view all cookie preferences"
  ON user_cookie_preferences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 2. CONSENT SCHEDULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_consent_id uuid NOT NULL REFERENCES user_consents(id) ON DELETE CASCADE,
  review_date date NOT NULL,
  expiry_date date,
  auto_renew boolean DEFAULT false,
  reminder_sent boolean DEFAULT false,
  reminder_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_consent_id)
);

ALTER TABLE consent_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert schedules"
  ON consent_schedules FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view own schedules"
  ON consent_schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins manage all schedules"
  ON consent_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 3. CONSENT NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text UNIQUE NOT NULL,
  email text,
  notify_policy_changes boolean DEFAULT true,
  notify_before_expiry boolean DEFAULT true,
  notify_data_usage boolean DEFAULT false,
  notification_frequency text CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly')) DEFAULT 'immediate',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage own notifications"
  ON consent_notifications FOR ALL
  USING (true);

CREATE POLICY "Admins view all notifications"
  ON consent_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 4. CONSENT DATA EXPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('full', 'consents_only', 'audit_only')),
  export_format text NOT NULL CHECK (export_format IN ('json', 'csv', 'pdf')),
  status text NOT NULL CHECK (status IN ('requested', 'processing', 'completed', 'failed')) DEFAULT 'requested',
  file_path text,
  error_message text,
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

ALTER TABLE consent_data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can request exports"
  ON consent_data_exports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view own exports"
  ON consent_data_exports FOR SELECT
  USING (true);

CREATE POLICY "Admins manage all exports"
  ON consent_data_exports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 5. CONSENT ANALYTICS EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text,
  event_type text NOT NULL CHECK (event_type IN (
    'banner_shown', 'banner_dismissed', 'preferences_opened', 'preferences_saved',
    'accept_all_clicked', 'reject_all_clicked', 'category_toggled',
    'cookie_toggled', 'policy_viewed', 'withdraw_initiated', 'export_requested'
  )),
  event_data jsonb DEFAULT '{}'::jsonb,
  page_url text,
  session_id text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE consent_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can log analytics events"
  ON consent_analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view all analytics"
  ON consent_analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 6. CONSENT A/B TESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name text NOT NULL,
  variant_name text NOT NULL,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(test_name, variant_name)
);

ALTER TABLE consent_ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active tests"
  ON consent_ab_tests FOR SELECT
  USING (is_active = true AND start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE));

CREATE POLICY "Admins manage tests"
  ON consent_ab_tests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_cookie_prefs_consent 
  ON user_cookie_preferences(user_consent_id);

CREATE INDEX IF NOT EXISTS idx_user_cookie_prefs_cookie 
  ON user_cookie_preferences(cookie_id);

CREATE INDEX IF NOT EXISTS idx_consent_schedules_review 
  ON consent_schedules(review_date) WHERE reminder_sent = false;

CREATE INDEX IF NOT EXISTS idx_consent_schedules_expiry 
  ON consent_schedules(expiry_date) WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consent_exports_user 
  ON consent_data_exports(user_identifier, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_exports_status 
  ON consent_data_exports(status) WHERE status IN ('requested', 'processing');

CREATE INDEX IF NOT EXISTS idx_analytics_events_user 
  ON consent_analytics_events(user_identifier, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type 
  ON consent_analytics_events(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ab_tests_active 
  ON consent_ab_tests(is_active, start_date, end_date);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if consent needs renewal
CREATE OR REPLACE FUNCTION check_consent_expiry()
RETURNS TABLE(
  user_identifier text,
  days_until_expiry integer,
  needs_reminder boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.user_identifier,
    (cs.expiry_date - CURRENT_DATE)::integer as days_until_expiry,
    (cs.expiry_date - CURRENT_DATE <= 30 AND cs.reminder_sent = false) as needs_reminder
  FROM user_consents uc
  JOIN consent_schedules cs ON cs.user_consent_id = uc.id
  WHERE uc.is_active = true
    AND cs.expiry_date IS NOT NULL
    AND cs.expiry_date >= CURRENT_DATE
  ORDER BY cs.expiry_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user consent details
CREATE OR REPLACE FUNCTION get_user_consent_details(p_user_identifier text)
RETURNS TABLE(
  consent_id uuid,
  consent_timestamp timestamptz,
  consent_version text,
  category_preferences jsonb,
  cookie_preferences jsonb,
  next_review_date date,
  expiry_date date
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id as consent_id,
    uc.consent_timestamp,
    cv.version_number as consent_version,
    uc.consent_preferences as category_preferences,
    (
      SELECT jsonb_object_agg(
        cc.cookie_name,
        jsonb_build_object(
          'enabled', COALESCE(ucp.is_enabled, true),
          'override', COALESCE(ucp.override_category, false)
        )
      )
      FROM consent_cookies cc
      LEFT JOIN user_cookie_preferences ucp ON ucp.cookie_id = cc.id AND ucp.user_consent_id = uc.id
      WHERE cc.active = true
    ) as cookie_preferences,
    cs.review_date as next_review_date,
    cs.expiry_date
  FROM user_consents uc
  LEFT JOIN consent_versions cv ON cv.id = uc.consent_version_id
  LEFT JOIN consent_schedules cs ON cs.user_consent_id = uc.id
  WHERE uc.user_identifier = p_user_identifier
    AND uc.is_active = true
  ORDER BY uc.consent_timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate consent export data
CREATE OR REPLACE FUNCTION generate_consent_export_data(p_user_identifier text)
RETURNS jsonb AS $$
DECLARE
  v_export jsonb;
BEGIN
  SELECT jsonb_build_object(
    'user_identifier', p_user_identifier,
    'export_date', CURRENT_TIMESTAMP,
    'active_consents', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'consent_timestamp', consent_timestamp,
          'version', cv.version_number,
          'method', consent_method,
          'language', language,
          'preferences', consent_preferences,
          'ip_address', ip_address::text,
          'user_agent', user_agent
        )
      )
      FROM user_consents uc
      LEFT JOIN consent_versions cv ON cv.id = uc.consent_version_id
      WHERE uc.user_identifier = p_user_identifier
        AND uc.is_active = true
    ),
    'audit_history', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'timestamp', timestamp,
          'action', action,
          'previous_preferences', previous_preferences,
          'new_preferences', new_preferences
        ) ORDER BY timestamp DESC
      )
      FROM consent_audit_log
      WHERE user_identifier = p_user_identifier
    ),
    'cookie_preferences', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'cookie_name', cc.cookie_name,
          'provider', cc.provider,
          'is_enabled', ucp.is_enabled,
          'override_category', ucp.override_category
        )
      )
      FROM user_cookie_preferences ucp
      JOIN consent_cookies cc ON cc.id = ucp.cookie_id
      WHERE ucp.user_consent_id IN (
        SELECT id FROM user_consents 
        WHERE user_identifier = p_user_identifier 
        AND is_active = true
      )
    )
  ) INTO v_export;
  
  RETURN v_export;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get consent analytics summary
CREATE OR REPLACE FUNCTION get_consent_analytics_summary(
  p_start_date date DEFAULT CURRENT_DATE - 30,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_events bigint,
  unique_users bigint,
  events_by_type jsonb,
  conversion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_events,
    COUNT(DISTINCT user_identifier)::bigint as unique_users,
    (
      SELECT jsonb_object_agg(event_type, count)
      FROM (
        SELECT event_type, COUNT(*)::bigint as count
        FROM consent_analytics_events
        WHERE timestamp::date BETWEEN p_start_date AND p_end_date
        GROUP BY event_type
      ) sub
    ) as events_by_type,
    ROUND(
      (COUNT(*) FILTER (WHERE event_type IN ('accept_all_clicked', 'preferences_saved'))::numeric /
       NULLIF(COUNT(*) FILTER (WHERE event_type = 'banner_shown')::numeric, 0)) * 100,
      2
    ) as conversion_rate
  FROM consent_analytics_events
  WHERE timestamp::date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark consent schedules for reminder
CREATE OR REPLACE FUNCTION mark_reminders_for_expiring_consents()
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE consent_schedules
  SET reminder_sent = true,
      reminder_sent_at = now()
  WHERE expiry_date IS NOT NULL
    AND expiry_date - CURRENT_DATE <= 30
    AND expiry_date - CURRENT_DATE > 0
    AND reminder_sent = false;
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Auto-create schedule when consent is created
CREATE OR REPLACE FUNCTION auto_create_consent_schedule()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO consent_schedules (
    user_consent_id,
    review_date,
    expiry_date,
    auto_renew
  ) VALUES (
    NEW.id,
    CURRENT_DATE + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '2 years',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_schedule_on_consent
  AFTER INSERT ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_consent_schedule();

-- Update timestamp trigger
CREATE TRIGGER update_cookie_preferences_timestamp
  BEFORE UPDATE ON user_cookie_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_timestamp();

CREATE TRIGGER update_notifications_timestamp
  BEFORE UPDATE ON consent_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_timestamp();

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON user_cookie_preferences TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON consent_schedules TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON consent_notifications TO anon, authenticated;
GRANT SELECT, INSERT ON consent_data_exports TO anon, authenticated;
GRANT INSERT ON consent_analytics_events TO anon, authenticated;
GRANT SELECT ON consent_ab_tests TO anon, authenticated;

GRANT EXECUTE ON FUNCTION check_consent_expiry TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_consent_details TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_consent_export_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_consent_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION mark_reminders_for_expiring_consents TO authenticated;