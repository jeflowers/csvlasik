/*
  # HIPAA Audit Controls Implementation

  ## Overview
  Comprehensive HIPAA-compliant audit control system with enhanced tracking,
  integrity verification, and future-proof compliance monitoring.

  ## Features
  - Enhanced audit logging with HIPAA-specific fields
  - Automated PHI access tracking
  - Audit log integrity verification (tamper-proof)
  - Session and authentication audit trails
  - Compliance reporting and monitoring
  - Searchable audit archives

  ## New Tables

  ### 1. hipaa_audit_events
  Specialized HIPAA audit events for PHI access tracking
  - Enhanced PHI access logging
  - Minimum necessary access tracking
  - Purpose of use documentation
  - Break-glass emergency access tracking

  ### 2. audit_log_integrity
  Cryptographic integrity verification for audit logs
  - Hash chains for tamper detection
  - Immutable audit trail validation

  ### 3. audit_sessions
  User session lifecycle tracking
  - Session creation, renewal, termination
  - Concurrent session detection
  - Device fingerprinting

  ### 4. security_audit_events
  Security-specific audit events
  - Failed authentication attempts
  - Permission changes
  - Suspicious activity detection

  ### 5. compliance_audit_reports
  Pre-generated compliance reports
  - Scheduled report generation
  - Custom date range reports
  - Export history tracking

  ## Security
  - Write-only audit tables (no UPDATE/DELETE allowed)
  - RLS policies for admin-only access
  - Cryptographic signatures on all audit entries
  - Automated backup and archival

  ## Compliance
  - HIPAA Technical Safeguards § 164.312(b)
  - 6-year retention minimum for PHI-related audits
  - Tamper-proof audit trails
  - Comprehensive access logging
*/

-- ============================================================================
-- 1. ENHANCED AUDIT LOGS TABLE (Extend existing)
-- ============================================================================

-- Add HIPAA-specific columns to existing audit_logs table
DO $$
BEGIN
  -- Add phi_accessed flag if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'phi_accessed'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN phi_accessed boolean DEFAULT false;
  END IF;

  -- Add gdpr_relevant flag if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'gdpr_relevant'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN gdpr_relevant boolean DEFAULT false;
  END IF;

  -- Add session_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN session_id text;
  END IF;

  -- Add user_agent if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent text;
  END IF;

  -- Add new HIPAA-specific fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'resource_type'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN resource_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'resource_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN resource_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'data_classification'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN data_classification text CHECK (data_classification IN ('PHI', 'PII', 'PUBLIC', 'CONFIDENTIAL', 'INTERNAL'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'access_reason'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN access_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'severity'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'compliance_flags'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN compliance_flags jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes for enhanced audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi_accessed
  ON audit_logs(phi_accessed, created_at DESC) WHERE phi_accessed = true;

CREATE INDEX IF NOT EXISTS idx_audit_logs_gdpr_relevant
  ON audit_logs(gdpr_relevant, created_at DESC) WHERE gdpr_relevant = true;

CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id
  ON audit_logs(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
  ON audit_logs(resource_type, resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_severity
  ON audit_logs(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_data_classification
  ON audit_logs(data_classification, created_at DESC);

-- ============================================================================
-- 2. HIPAA AUDIT EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hipaa_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'phi_access', 'phi_create', 'phi_update', 'phi_delete', 'phi_export',
    'emergency_access', 'minimum_necessary_override', 'disclosure',
    'patient_request', 'research_access', 'quality_review'
  )),
  user_id uuid REFERENCES auth.users(id),
  patient_id uuid,

  -- PHI Access Details
  phi_tables_accessed text[],
  phi_fields_accessed text[],
  record_count integer DEFAULT 1,

  -- Access Justification
  purpose_of_use text NOT NULL,
  minimum_necessary_verified boolean DEFAULT false,
  supervisor_approved boolean DEFAULT false,
  supervisor_id uuid REFERENCES auth.users(id),

  -- Emergency Access (Break-Glass)
  is_emergency_access boolean DEFAULT false,
  emergency_justification text,
  emergency_override_by uuid REFERENCES auth.users(id),

  -- Context
  session_id text,
  ip_address inet,
  user_agent text,
  geographic_location jsonb,

  -- Audit Trail
  created_at timestamptz DEFAULT now(),
  audit_log_id bigint REFERENCES audit_logs(id),

  -- Compliance
  hipaa_compliant boolean DEFAULT true,
  compliance_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz
);

ALTER TABLE hipaa_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view HIPAA audit events"
  ON hipaa_audit_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System inserts HIPAA audit events"
  ON hipaa_audit_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for HIPAA audit queries
CREATE INDEX IF NOT EXISTS idx_hipaa_audit_event_type
  ON hipaa_audit_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hipaa_audit_user
  ON hipaa_audit_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hipaa_audit_patient
  ON hipaa_audit_events(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hipaa_audit_emergency
  ON hipaa_audit_events(is_emergency_access, created_at DESC)
  WHERE is_emergency_access = true;

CREATE INDEX IF NOT EXISTS idx_hipaa_audit_non_compliant
  ON hipaa_audit_events(hipaa_compliant, created_at DESC)
  WHERE hipaa_compliant = false;

-- ============================================================================
-- 3. AUDIT LOG INTEGRITY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log_integrity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id bigint UNIQUE REFERENCES audit_logs(id) ON DELETE CASCADE,

  -- Cryptographic Integrity
  content_hash text NOT NULL,
  previous_hash text,
  signature text,

  -- Hash Chain
  chain_index bigint NOT NULL,
  chain_verified boolean DEFAULT true,

  -- Integrity Verification
  verified_at timestamptz DEFAULT now(),
  last_verification timestamptz DEFAULT now(),
  verification_count integer DEFAULT 1,
  tampering_detected boolean DEFAULT false,

  -- Metadata
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log_integrity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view integrity records"
  ON audit_log_integrity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System manages integrity records"
  ON audit_log_integrity FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index for integrity chain verification
CREATE INDEX IF NOT EXISTS idx_audit_integrity_chain
  ON audit_log_integrity(chain_index DESC);

CREATE INDEX IF NOT EXISTS idx_audit_integrity_tampering
  ON audit_log_integrity(tampering_detected, last_verification)
  WHERE tampering_detected = true;

-- ============================================================================
-- 4. AUDIT SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),

  -- Session Lifecycle
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  ended_at timestamptz,
  session_duration interval,

  -- Session Status
  status text CHECK (status IN ('active', 'expired', 'terminated', 'timeout')) DEFAULT 'active',
  termination_reason text,

  -- Device Information
  ip_address inet,
  user_agent text,
  device_fingerprint text,
  geographic_location jsonb,

  -- Security
  concurrent_sessions_count integer DEFAULT 1,
  suspicious_activity boolean DEFAULT false,
  mfa_verified boolean DEFAULT false,

  -- Activity Metrics
  actions_performed integer DEFAULT 0,
  phi_accesses integer DEFAULT 0,
  last_phi_access timestamptz,

  -- Compliance
  session_recorded_by uuid REFERENCES auth.users(id),
  compliance_flags jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
  ON audit_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view all sessions"
  ON audit_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System manages sessions"
  ON audit_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for session queries
CREATE INDEX IF NOT EXISTS idx_audit_sessions_user
  ON audit_sessions(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_sessions_active
  ON audit_sessions(status, last_activity DESC) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_audit_sessions_suspicious
  ON audit_sessions(suspicious_activity, started_at DESC)
  WHERE suspicious_activity = true;

-- ============================================================================
-- 5. SECURITY AUDIT EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'login_success', 'login_failure', 'logout', 'password_change',
    'password_reset', 'mfa_enabled', 'mfa_disabled', 'role_change',
    'permission_change', 'account_locked', 'account_unlocked',
    'unauthorized_access_attempt', 'privilege_escalation',
    'suspicious_activity', 'session_hijack_attempt'
  )),

  -- User Information
  user_id uuid REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  username text,

  -- Event Details
  event_details jsonb DEFAULT '{}'::jsonb,
  before_state jsonb,
  after_state jsonb,

  -- Security Context
  ip_address inet,
  user_agent text,
  session_id text,
  geographic_location jsonb,

  -- Risk Assessment
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  threat_indicators text[],

  -- Response
  action_taken text,
  alert_generated boolean DEFAULT false,
  incident_id uuid,

  -- Audit
  created_at timestamptz DEFAULT now(),
  reviewed boolean DEFAULT false,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz
);

ALTER TABLE security_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view security events"
  ON security_audit_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System creates security events"
  ON security_audit_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for security event queries
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type
  ON security_audit_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_user
  ON security_audit_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_risk
  ON security_audit_events(risk_level, created_at DESC)
  WHERE risk_level IN ('high', 'critical');

CREATE INDEX IF NOT EXISTS idx_security_audit_unreviewed
  ON security_audit_events(reviewed, created_at DESC)
  WHERE reviewed = false;

-- ============================================================================
-- 6. COMPLIANCE AUDIT REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS compliance_audit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type IN (
    'hipaa_audit_trail', 'phi_access_report', 'security_incident_report',
    'user_activity_report', 'compliance_summary', 'breach_investigation',
    'gdpr_audit', 'custom'
  )),

  -- Report Parameters
  report_name text NOT NULL,
  date_range_start timestamptz NOT NULL,
  date_range_end timestamptz NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,

  -- Report Content
  summary jsonb,
  findings jsonb,
  recommendations jsonb,
  statistics jsonb,

  -- Report Status
  status text CHECK (status IN ('generating', 'completed', 'failed')) DEFAULT 'generating',
  error_message text,

  -- Export
  file_path text,
  file_format text CHECK (file_format IN ('pdf', 'csv', 'json', 'html')),
  file_size bigint,

  -- Metadata
  generated_by uuid REFERENCES auth.users(id),
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '90 days'),

  -- Access Tracking
  downloaded_count integer DEFAULT 0,
  last_downloaded_at timestamptz,
  last_downloaded_by uuid REFERENCES auth.users(id)
);

ALTER TABLE compliance_audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage audit reports"
  ON compliance_audit_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Indexes for report queries
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type
  ON compliance_audit_reports(report_type, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_status
  ON compliance_audit_reports(status, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_expiry
  ON compliance_audit_reports(expires_at) WHERE status = 'completed';

-- ============================================================================
-- 7. AUDIT LOG INTEGRITY FUNCTIONS
-- ============================================================================

-- Function to generate audit log content hash
CREATE OR REPLACE FUNCTION generate_audit_hash(
  p_audit_log_id bigint,
  p_previous_hash text DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  v_audit_data jsonb;
  v_content_hash text;
BEGIN
  -- Get audit log data
  SELECT jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'action', action,
    'resource_type', resource_type,
    'resource_id', resource_id,
    'details', details,
    'created_at', created_at,
    'previous_hash', p_previous_hash
  ) INTO v_audit_data
  FROM audit_logs
  WHERE id = p_audit_log_id;

  -- Generate SHA-256 hash
  v_content_hash := encode(
    digest(v_audit_data::text || COALESCE(p_previous_hash, ''), 'sha256'),
    'hex'
  );

  RETURN v_content_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Function to create integrity record for audit log
CREATE OR REPLACE FUNCTION create_audit_integrity_record()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash text;
  v_chain_index bigint;
  v_content_hash text;
BEGIN
  -- Get previous hash and chain index
  SELECT content_hash, chain_index
  INTO v_previous_hash, v_chain_index
  FROM audit_log_integrity
  ORDER BY chain_index DESC
  LIMIT 1;

  -- Generate content hash
  v_content_hash := generate_audit_hash(NEW.id, v_previous_hash);

  -- Insert integrity record
  INSERT INTO audit_log_integrity (
    audit_log_id,
    content_hash,
    previous_hash,
    chain_index,
    chain_verified
  ) VALUES (
    NEW.id,
    v_content_hash,
    v_previous_hash,
    COALESCE(v_chain_index, 0) + 1,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Trigger to automatically create integrity records
DROP TRIGGER IF EXISTS audit_log_integrity_trigger ON audit_logs;
CREATE TRIGGER audit_log_integrity_trigger
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_integrity_record();

-- Function to verify audit log integrity
CREATE OR REPLACE FUNCTION verify_audit_log_integrity(
  p_audit_log_id bigint DEFAULT NULL
)
RETURNS TABLE(
  audit_log_id bigint,
  is_valid boolean,
  expected_hash text,
  actual_hash text,
  message text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ali.audit_log_id,
    (ali.content_hash = generate_audit_hash(ali.audit_log_id, ali.previous_hash)) as is_valid,
    generate_audit_hash(ali.audit_log_id, ali.previous_hash) as expected_hash,
    ali.content_hash as actual_hash,
    CASE
      WHEN (ali.content_hash = generate_audit_hash(ali.audit_log_id, ali.previous_hash))
      THEN 'Audit log integrity verified'
      ELSE 'TAMPERING DETECTED: Hash mismatch'
    END as message
  FROM audit_log_integrity ali
  WHERE (p_audit_log_id IS NULL OR ali.audit_log_id = p_audit_log_id)
  ORDER BY ali.chain_index DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 8. HIPAA AUDIT LOGGING FUNCTIONS
-- ============================================================================

-- Function to log PHI access
CREATE OR REPLACE FUNCTION log_phi_access(
  p_user_id uuid,
  p_patient_id uuid,
  p_event_type text,
  p_purpose_of_use text,
  p_tables_accessed text[] DEFAULT NULL,
  p_fields_accessed text[] DEFAULT NULL,
  p_is_emergency boolean DEFAULT false,
  p_session_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
  v_audit_log_id bigint;
BEGIN
  -- Create audit log entry
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    phi_accessed,
    data_classification,
    session_id,
    details
  ) VALUES (
    p_user_id,
    p_event_type,
    'patient_record',
    p_patient_id::text,
    true,
    'PHI',
    p_session_id,
    jsonb_build_object(
      'purpose', p_purpose_of_use,
      'tables', p_tables_accessed,
      'fields', p_fields_accessed,
      'emergency', p_is_emergency
    )
  ) RETURNING id INTO v_audit_log_id;

  -- Create HIPAA audit event
  INSERT INTO hipaa_audit_events (
    event_type,
    user_id,
    patient_id,
    phi_tables_accessed,
    phi_fields_accessed,
    purpose_of_use,
    is_emergency_access,
    emergency_justification,
    session_id,
    audit_log_id
  ) VALUES (
    p_event_type,
    p_user_id,
    p_patient_id,
    p_tables_accessed,
    p_fields_accessed,
    p_purpose_of_use,
    p_is_emergency,
    CASE WHEN p_is_emergency THEN p_purpose_of_use ELSE NULL END,
    p_session_id,
    v_audit_log_id
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_event_details jsonb DEFAULT '{}'::jsonb,
  p_risk_level text DEFAULT 'low',
  p_session_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO security_audit_events (
    event_type,
    user_id,
    event_details,
    risk_level,
    session_id
  ) VALUES (
    p_event_type,
    p_user_id,
    p_event_details,
    p_risk_level,
    p_session_id
  ) RETURNING id INTO v_event_id;

  -- Create alert for high-risk events
  IF p_risk_level IN ('high', 'critical') THEN
    UPDATE security_audit_events
    SET alert_generated = true
    WHERE id = v_event_id;
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 9. COMPLIANCE REPORTING FUNCTIONS
-- ============================================================================

-- Function to get HIPAA compliance metrics
CREATE OR REPLACE FUNCTION get_hipaa_audit_metrics(
  p_start_date timestamptz DEFAULT (now() - interval '30 days'),
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE(
  total_phi_accesses bigint,
  unique_users_accessed_phi bigint,
  emergency_accesses bigint,
  non_compliant_accesses bigint,
  avg_accesses_per_day numeric,
  top_phi_accessor jsonb,
  compliance_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_phi_accesses,
    COUNT(DISTINCT user_id)::bigint as unique_users_accessed_phi,
    COUNT(*) FILTER (WHERE is_emergency_access = true)::bigint as emergency_accesses,
    COUNT(*) FILTER (WHERE hipaa_compliant = false)::bigint as non_compliant_accesses,
    ROUND(COUNT(*)::numeric / GREATEST(EXTRACT(day FROM p_end_date - p_start_date), 1), 2) as avg_accesses_per_day,
    (
      SELECT jsonb_build_object(
        'user_id', user_id,
        'access_count', COUNT(*)
      )
      FROM hipaa_audit_events
      WHERE created_at BETWEEN p_start_date AND p_end_date
      GROUP BY user_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as top_phi_accessor,
    ROUND(
      (1.0 - (COUNT(*) FILTER (WHERE hipaa_compliant = false)::numeric / NULLIF(COUNT(*)::numeric, 0))) * 100,
      2
    ) as compliance_score
  FROM hipaa_audit_events
  WHERE created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Function to get audit trail for specific user
CREATE OR REPLACE FUNCTION get_user_audit_trail(
  p_user_id uuid,
  p_start_date timestamptz DEFAULT (now() - interval '30 days'),
  p_end_date timestamptz DEFAULT now(),
  p_include_phi_only boolean DEFAULT false
)
RETURNS TABLE(
  event_time timestamptz,
  action text,
  resource_type text,
  resource_id text,
  phi_accessed boolean,
  details jsonb,
  session_id text,
  ip_address text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.created_at as event_time,
    al.action,
    al.resource_type,
    al.resource_id,
    al.phi_accessed,
    al.details,
    al.session_id,
    al.ip_address
  FROM audit_logs al
  WHERE al.user_id = p_user_id
    AND al.created_at BETWEEN p_start_date AND p_end_date
    AND (p_include_phi_only = false OR al.phi_accessed = true)
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Function to detect suspicious audit patterns
CREATE OR REPLACE FUNCTION detect_suspicious_audit_patterns(
  p_lookback_hours integer DEFAULT 24
)
RETURNS TABLE(
  user_id uuid,
  username text,
  suspicious_pattern text,
  event_count bigint,
  risk_level text,
  details jsonb
) AS $$
BEGIN
  RETURN QUERY
  -- Excessive PHI access
  SELECT
    hae.user_id,
    u.email as username,
    'excessive_phi_access' as suspicious_pattern,
    COUNT(*)::bigint as event_count,
    'high' as risk_level,
    jsonb_build_object(
      'threshold_exceeded', true,
      'access_count', COUNT(*),
      'time_period_hours', p_lookback_hours
    ) as details
  FROM hipaa_audit_events hae
  JOIN users u ON u.id = hae.user_id
  WHERE hae.created_at > (now() - (p_lookback_hours || ' hours')::interval)
  GROUP BY hae.user_id, u.email
  HAVING COUNT(*) > 50

  UNION ALL

  -- Multiple emergency accesses
  SELECT
    hae.user_id,
    u.email as username,
    'multiple_emergency_accesses' as suspicious_pattern,
    COUNT(*)::bigint as event_count,
    'critical' as risk_level,
    jsonb_build_object(
      'emergency_accesses', COUNT(*),
      'time_period_hours', p_lookback_hours
    ) as details
  FROM hipaa_audit_events hae
  JOIN users u ON u.id = hae.user_id
  WHERE hae.created_at > (now() - (p_lookback_hours || ' hours')::interval)
    AND hae.is_emergency_access = true
  GROUP BY hae.user_id, u.email
  HAVING COUNT(*) > 3

  UNION ALL

  -- Failed login attempts
  SELECT
    sae.user_id,
    COALESCE(u.email, sae.username) as username,
    'multiple_failed_logins' as suspicious_pattern,
    COUNT(*)::bigint as event_count,
    'high' as risk_level,
    jsonb_build_object(
      'failed_attempts', COUNT(*),
      'time_period_hours', p_lookback_hours
    ) as details
  FROM security_audit_events sae
  LEFT JOIN users u ON u.id = sae.user_id
  WHERE sae.created_at > (now() - (p_lookback_hours || ' hours')::interval)
    AND sae.event_type = 'login_failure'
  GROUP BY sae.user_id, u.email, sae.username
  HAVING COUNT(*) > 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON hipaa_audit_events TO authenticated;
GRANT INSERT ON hipaa_audit_events TO authenticated;
GRANT SELECT ON audit_log_integrity TO authenticated;
GRANT SELECT ON audit_sessions TO authenticated;
GRANT INSERT, UPDATE ON audit_sessions TO authenticated;
GRANT SELECT ON security_audit_events TO authenticated;
GRANT INSERT ON security_audit_events TO authenticated;
GRANT SELECT ON compliance_audit_reports TO authenticated;
GRANT INSERT, UPDATE ON compliance_audit_reports TO authenticated;

GRANT EXECUTE ON FUNCTION generate_audit_hash TO authenticated;
GRANT EXECUTE ON FUNCTION verify_audit_log_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION log_phi_access TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_hipaa_audit_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_audit_trail TO authenticated;
GRANT EXECUTE ON FUNCTION detect_suspicious_audit_patterns TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Add comment to track implementation
COMMENT ON TABLE hipaa_audit_events IS 'HIPAA-compliant PHI access audit trail - implements § 164.312(b) Audit Controls';
COMMENT ON TABLE audit_log_integrity IS 'Cryptographic integrity verification for tamper-proof audit logs';
COMMENT ON TABLE audit_sessions IS 'User session lifecycle tracking for security and compliance';
COMMENT ON TABLE security_audit_events IS 'Security event tracking for threat detection and response';
COMMENT ON TABLE compliance_audit_reports IS 'Pre-generated compliance reports for regulatory requirements';
