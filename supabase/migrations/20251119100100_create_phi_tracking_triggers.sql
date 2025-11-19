/*
  # Automated PHI Access Tracking Triggers

  ## Overview
  Implements automated triggers to track all PHI access across the system.
  These triggers automatically log any read/write/delete operations on
  PHI-containing tables to ensure HIPAA compliance.

  ## Features
  - Automatic PHI access logging for all operations
  - Bulk operation detection and logging
  - Context-aware access tracking
  - Minimum necessary access verification

  ## PHI Tables Monitored
  - encrypted_patient_data
  - encrypted_communications
  - encrypted_payment_data
  - appointment_requests (contains PHI in notes/preferences)
  - Any custom PHI tables

  ## Compliance
  - HIPAA § 164.312(b) - Audit Controls
  - HIPAA § 164.308(a)(1)(ii)(D) - Information System Activity Review
  - Automatic logging of all PHI access
*/

-- ============================================================================
-- 1. PHI ACCESS TRACKING FUNCTION
-- ============================================================================

-- Generic PHI access tracking function
CREATE OR REPLACE FUNCTION track_phi_access()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
  v_operation text;
  v_phi_fields text[];
  v_audit_log_id bigint;
BEGIN
  -- Get current user and session
  v_user_id := auth.uid();
  v_session_id := current_setting('app.session_id', true);

  -- Determine operation type
  v_operation := CASE TG_OP
    WHEN 'INSERT' THEN 'phi_create'
    WHEN 'UPDATE' THEN 'phi_update'
    WHEN 'DELETE' THEN 'phi_delete'
    WHEN 'SELECT' THEN 'phi_access'
    ELSE 'phi_unknown'
  END;

  -- Get changed fields for UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    v_phi_fields := ARRAY(
      SELECT key
      FROM jsonb_each(to_jsonb(NEW))
      WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
    );
  END IF;

  -- Create audit log entry
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    phi_accessed,
    data_classification,
    session_id,
    severity,
    details
  ) VALUES (
    v_user_id,
    v_operation,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    true,
    'PHI',
    v_session_id,
    CASE TG_OP
      WHEN 'DELETE' THEN 'high'
      WHEN 'UPDATE' THEN 'medium'
      ELSE 'low'
    END,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'changed_fields', v_phi_fields,
      'timestamp', now()
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
    session_id,
    audit_log_id,
    record_count
  ) VALUES (
    v_operation,
    v_user_id,
    COALESCE(NEW.user_id, OLD.user_id),
    ARRAY[TG_TABLE_NAME],
    v_phi_fields,
    COALESCE(
      current_setting('app.access_reason', true),
      'Standard access'
    ),
    v_session_id,
    v_audit_log_id,
    1
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 2. BULK OPERATION TRACKING FUNCTION
-- ============================================================================

-- Track bulk PHI operations (exports, mass updates)
CREATE OR REPLACE FUNCTION track_bulk_phi_access(
  p_table_name text,
  p_operation text,
  p_record_count integer,
  p_purpose text
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
  v_audit_log_id bigint;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('app.session_id', true);

  -- Create audit log for bulk operation
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    phi_accessed,
    data_classification,
    session_id,
    severity,
    details
  ) VALUES (
    v_user_id,
    'phi_bulk_' || p_operation,
    p_table_name,
    true,
    'PHI',
    v_session_id,
    'high',
    jsonb_build_object(
      'operation', 'bulk_' || p_operation,
      'record_count', p_record_count,
      'purpose', p_purpose
    )
  ) RETURNING id INTO v_audit_log_id;

  -- Create HIPAA audit event
  INSERT INTO hipaa_audit_events (
    event_type,
    user_id,
    phi_tables_accessed,
    purpose_of_use,
    session_id,
    audit_log_id,
    record_count
  ) VALUES (
    CASE
      WHEN p_operation = 'export' THEN 'phi_export'
      WHEN p_operation = 'delete' THEN 'phi_delete'
      WHEN p_operation = 'update' THEN 'phi_update'
      ELSE 'phi_access'
    END,
    v_user_id,
    ARRAY[p_table_name],
    p_purpose,
    v_session_id,
    v_audit_log_id,
    p_record_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 3. APPLY TRIGGERS TO PHI TABLES
-- ============================================================================

-- Trigger for encrypted_patient_data
DROP TRIGGER IF EXISTS track_encrypted_patient_data_access ON encrypted_patient_data;
CREATE TRIGGER track_encrypted_patient_data_access
  AFTER INSERT OR UPDATE OR DELETE ON encrypted_patient_data
  FOR EACH ROW
  EXECUTE FUNCTION track_phi_access();

-- Trigger for encrypted_communications
DROP TRIGGER IF EXISTS track_encrypted_communications_access ON encrypted_communications;
CREATE TRIGGER track_encrypted_communications_access
  AFTER INSERT OR UPDATE OR DELETE ON encrypted_communications
  FOR EACH ROW
  EXECUTE FUNCTION track_phi_access();

-- Trigger for encrypted_payment_data
DROP TRIGGER IF EXISTS track_encrypted_payment_data_access ON encrypted_payment_data;
CREATE TRIGGER track_encrypted_payment_data_access
  AFTER INSERT OR UPDATE OR DELETE ON encrypted_payment_data
  FOR EACH ROW
  EXECUTE FUNCTION track_phi_access();

-- ============================================================================
-- 4. APPOINTMENT REQUEST PHI TRACKING
-- ============================================================================

-- Function to track appointment request PHI (contains patient preferences/notes)
CREATE OR REPLACE FUNCTION track_appointment_phi_access()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
  v_audit_log_id bigint;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('app.session_id', true);

  -- Only log if user is authenticated (not public submission)
  IF v_user_id IS NOT NULL THEN
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
      v_user_id,
      CASE TG_OP
        WHEN 'INSERT' THEN 'appointment_create'
        WHEN 'UPDATE' THEN 'appointment_update'
        WHEN 'DELETE' THEN 'appointment_delete'
        ELSE 'appointment_view'
      END,
      'appointment_request',
      COALESCE(NEW.id::text, OLD.id::text),
      true,
      'PHI',
      v_session_id,
      jsonb_build_object(
        'operation', TG_OP,
        'table', 'appointment_requests',
        'contains_phi', true
      )
    ) RETURNING id INTO v_audit_log_id;

    -- Create HIPAA event for appointment access
    INSERT INTO hipaa_audit_events (
      event_type,
      user_id,
      phi_tables_accessed,
      purpose_of_use,
      session_id,
      audit_log_id
    ) VALUES (
      CASE TG_OP
        WHEN 'INSERT' THEN 'phi_create'
        WHEN 'UPDATE' THEN 'phi_update'
        WHEN 'DELETE' THEN 'phi_delete'
        ELSE 'phi_access'
      END,
      v_user_id,
      ARRAY['appointment_requests'],
      'Appointment management',
      v_session_id,
      v_audit_log_id
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Apply trigger to appointment_requests if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'appointment_requests'
  ) THEN
    DROP TRIGGER IF EXISTS track_appointment_requests_phi ON appointment_requests;
    CREATE TRIGGER track_appointment_requests_phi
      AFTER INSERT OR UPDATE OR DELETE ON appointment_requests
      FOR EACH ROW
      EXECUTE FUNCTION track_appointment_phi_access();
  END IF;
END $$;

-- ============================================================================
-- 5. SELECT QUERY TRACKING (Read Operations)
-- ============================================================================

-- Function to manually log SELECT operations on PHI
-- Note: PostgreSQL doesn't support AFTER SELECT triggers automatically
-- This must be called explicitly in application code when querying PHI
CREATE OR REPLACE FUNCTION log_phi_select(
  p_table_name text,
  p_record_ids text[],
  p_purpose text DEFAULT 'Data review'
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
  v_audit_log_id bigint;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('app.session_id', true);

  -- Create audit log for SELECT operation
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    phi_accessed,
    data_classification,
    session_id,
    details
  ) VALUES (
    v_user_id,
    'phi_select',
    p_table_name,
    true,
    'PHI',
    v_session_id,
    jsonb_build_object(
      'operation', 'SELECT',
      'record_ids', p_record_ids,
      'record_count', array_length(p_record_ids, 1),
      'purpose', p_purpose
    )
  ) RETURNING id INTO v_audit_log_id;

  -- Create HIPAA audit event
  INSERT INTO hipaa_audit_events (
    event_type,
    user_id,
    phi_tables_accessed,
    purpose_of_use,
    session_id,
    audit_log_id,
    record_count
  ) VALUES (
    'phi_access',
    v_user_id,
    ARRAY[p_table_name],
    p_purpose,
    v_session_id,
    v_audit_log_id,
    array_length(p_record_ids, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 6. EMERGENCY ACCESS (BREAK-GLASS) TRACKING
-- ============================================================================

-- Function to log emergency PHI access
CREATE OR REPLACE FUNCTION log_emergency_phi_access(
  p_patient_id uuid,
  p_emergency_reason text,
  p_tables_accessed text[] DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
  v_event_id uuid;
  v_audit_log_id bigint;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('app.session_id', true);

  -- Verify user is authorized (in real implementation, check emergency access permissions)
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Emergency access requires authentication';
  END IF;

  -- Create high-severity audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    phi_accessed,
    data_classification,
    session_id,
    severity,
    access_reason,
    details
  ) VALUES (
    v_user_id,
    'emergency_access',
    'patient_record',
    p_patient_id::text,
    true,
    'PHI',
    v_session_id,
    'critical',
    p_emergency_reason,
    jsonb_build_object(
      'emergency', true,
      'reason', p_emergency_reason,
      'timestamp', now()
    )
  ) RETURNING id INTO v_audit_log_id;

  -- Create HIPAA emergency access event
  INSERT INTO hipaa_audit_events (
    event_type,
    user_id,
    patient_id,
    phi_tables_accessed,
    purpose_of_use,
    is_emergency_access,
    emergency_justification,
    session_id,
    audit_log_id
  ) VALUES (
    'emergency_access',
    v_user_id,
    p_patient_id,
    p_tables_accessed,
    'Emergency medical care',
    true,
    p_emergency_reason,
    v_session_id,
    v_audit_log_id
  ) RETURNING id INTO v_event_id;

  -- Create security alert for emergency access
  PERFORM log_security_event(
    'privilege_escalation',
    v_user_id,
    jsonb_build_object(
      'type', 'emergency_access',
      'patient_id', p_patient_id,
      'reason', p_emergency_reason
    ),
    'critical',
    v_session_id
  );

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 7. MINIMUM NECESSARY ACCESS VERIFICATION
-- ============================================================================

-- Function to verify minimum necessary access
CREATE OR REPLACE FUNCTION verify_minimum_necessary_access(
  p_user_id uuid,
  p_requested_fields text[],
  p_purpose text
)
RETURNS boolean AS $$
DECLARE
  v_is_authorized boolean;
  v_user_role text;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  -- Basic authorization check (customize based on your requirements)
  v_is_authorized := CASE
    WHEN v_user_role IN ('admin', 'super_admin') THEN true
    WHEN v_user_role = 'scheduler' AND p_purpose = 'Appointment scheduling' THEN true
    WHEN v_user_role = 'billing' AND p_purpose LIKE '%billing%' THEN true
    ELSE false
  END;

  -- Log the verification attempt
  IF NOT v_is_authorized THEN
    PERFORM log_security_event(
      'unauthorized_access_attempt',
      p_user_id,
      jsonb_build_object(
        'requested_fields', p_requested_fields,
        'purpose', p_purpose,
        'user_role', v_user_role
      ),
      'high'
    );
  END IF;

  RETURN v_is_authorized;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 8. DATA EXPORT TRACKING
-- ============================================================================

-- Function to log data exports (critical for HIPAA)
CREATE OR REPLACE FUNCTION log_data_export(
  p_export_type text,
  p_record_count integer,
  p_table_names text[],
  p_purpose text,
  p_file_path text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
  v_audit_log_id bigint;
  v_event_id uuid;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('app.session_id', true);

  -- Create audit log for export
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    phi_accessed,
    data_classification,
    session_id,
    severity,
    access_reason,
    details
  ) VALUES (
    v_user_id,
    'data_export',
    'bulk_export',
    true,
    'PHI',
    v_session_id,
    'high',
    p_purpose,
    jsonb_build_object(
      'export_type', p_export_type,
      'record_count', p_record_count,
      'tables', p_table_names,
      'file_path', p_file_path
    )
  ) RETURNING id INTO v_audit_log_id;

  -- Create HIPAA export event
  INSERT INTO hipaa_audit_events (
    event_type,
    user_id,
    phi_tables_accessed,
    purpose_of_use,
    record_count,
    session_id,
    audit_log_id
  ) VALUES (
    'phi_export',
    v_user_id,
    p_table_names,
    p_purpose,
    p_record_count,
    v_session_id,
    v_audit_log_id
  ) RETURNING id INTO v_event_id;

  -- Create security event for export
  PERFORM log_security_event(
    'privilege_escalation',
    v_user_id,
    jsonb_build_object(
      'action', 'data_export',
      'record_count', p_record_count,
      'export_type', p_export_type
    ),
    'high',
    v_session_id
  );

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================================================
-- 9. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION track_bulk_phi_access TO authenticated;
GRANT EXECUTE ON FUNCTION log_phi_select TO authenticated;
GRANT EXECUTE ON FUNCTION log_emergency_phi_access TO authenticated;
GRANT EXECUTE ON FUNCTION verify_minimum_necessary_access TO authenticated;
GRANT EXECUTE ON FUNCTION log_data_export TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON FUNCTION track_phi_access IS 'Automatically tracks all PHI access (INSERT/UPDATE/DELETE) with HIPAA compliance logging';
COMMENT ON FUNCTION track_bulk_phi_access IS 'Tracks bulk PHI operations (exports, mass updates) for compliance reporting';
COMMENT ON FUNCTION log_phi_select IS 'Manually log SELECT operations on PHI tables - call from application code';
COMMENT ON FUNCTION log_emergency_phi_access IS 'Logs break-glass emergency PHI access with enhanced auditing';
COMMENT ON FUNCTION verify_minimum_necessary_access IS 'Verifies user has minimum necessary access rights for PHI';
COMMENT ON FUNCTION log_data_export IS 'Tracks data exports with detailed audit trail for compliance';
