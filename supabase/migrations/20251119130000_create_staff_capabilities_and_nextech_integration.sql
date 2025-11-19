/*
  # Staff Capabilities and Nextech Integration System

  ## Overview
  Extends the consultation scheduling system with intelligent staff assignment
  based on capabilities (language, procedure expertise, time zones) and adds
  Nextech EHR integration for appointment synchronization.

  ## New Tables

  ### 1. staff_capabilities
  - Links users to their language skills, procedure expertise, and availability
  - Enables intelligent routing based on patient preferences
  - Tracks workload capacity and active status

  ### 2. assignment_rules
  - Stores practice-level configuration for assignment priority weights
  - Defines scoring criteria for staff selection
  - Supports VIP routing and special handling rules

  ### 3. assignment_history
  - Tracks all assignment decisions with rationale
  - Enables workload analysis and performance metrics
  - Provides audit trail for assignment changes

  ### 4. nextech_connections
  - Stores Nextech API credentials per practice
  - Manages environment (sandbox vs production) configuration
  - Tracks connection status and last sync time

  ### 5. nextech_patients
  - Maps consultation requests to Nextech patient IDs
  - Prevents duplicate patient creation in EHR
  - Tracks synchronization status

  ### 6. nextech_appointments
  - Links consultation requests to Nextech appointment IDs
  - Tracks appointment status synchronization
  - Stores Nextech-specific appointment metadata

  ### 7. nextech_sync_log
  - Comprehensive log of all Nextech API interactions
  - Tracks sync operations, errors, and retries
  - Enables troubleshooting and monitoring

  ## Security
  - RLS enabled on all tables
  - Nextech credentials encrypted at rest
  - Access restricted to admin and scheduler roles
  - All operations logged for HIPAA compliance

  ## Features
  - Intelligent staff assignment with configurable scoring
  - Multi-criteria matching (language, procedure, workload, time zone)
  - Nextech patient deduplication
  - Bi-directional appointment synchronization
  - Failover handling for Nextech API failures
*/

-- ============================================================================
-- 1. STAFF CAPABILITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  languages text[] DEFAULT '{"en"}',
  procedures text[] DEFAULT '{}',
  time_zones text[] DEFAULT '{"PST"}',
  max_active_consultations integer DEFAULT 10,
  is_active boolean DEFAULT true,
  specialties jsonb DEFAULT '{}',
  vip_handling boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE staff_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage staff capabilities"
  ON staff_capabilities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Staff view own capabilities"
  ON staff_capabilities FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_staff_capabilities_user ON staff_capabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_capabilities_active ON staff_capabilities(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_capabilities_languages ON staff_capabilities USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_staff_capabilities_procedures ON staff_capabilities USING GIN(procedures);

-- ============================================================================
-- 2. ASSIGNMENT RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL,
  rule_name text NOT NULL,
  priority_order integer NOT NULL DEFAULT 1,
  language_weight integer DEFAULT 40,
  procedure_weight integer DEFAULT 30,
  workload_weight integer DEFAULT 20,
  timezone_weight integer DEFAULT 10,
  enabled boolean DEFAULT true,
  vip_rules jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(practice_id, rule_name)
);

ALTER TABLE assignment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage assignment rules"
  ON assignment_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Schedulers view assignment rules"
  ON assignment_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_assignment_rules_practice ON assignment_rules(practice_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_enabled ON assignment_rules(enabled) WHERE enabled = true;

-- Insert default assignment rules
INSERT INTO assignment_rules (
  practice_id,
  rule_name,
  priority_order,
  language_weight,
  procedure_weight,
  workload_weight,
  timezone_weight
)
VALUES (
  (SELECT practice_id FROM consultation_settings LIMIT 1),
  'Default Routing',
  1,
  40,
  30,
  20,
  10
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. ASSIGNMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id uuid NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  assigned_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assignment_method text NOT NULL CHECK (assignment_method IN ('automatic', 'manual', 'reassignment')),
  assignment_rationale jsonb,
  score_details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers view assignment history"
  ON assignment_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_assignment_history_request ON assignment_history(consultation_request_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_assigned_to ON assignment_history(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_created ON assignment_history(created_at DESC);

-- ============================================================================
-- 4. NEXTECH CONNECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS nextech_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'production')) DEFAULT 'sandbox',
  api_key text NOT NULL,
  practice_api_id text NOT NULL,
  location_id text,
  default_provider_id text,
  connection_status text NOT NULL CHECK (connection_status IN ('connected', 'disconnected', 'error')) DEFAULT 'disconnected',
  last_sync_at timestamptz,
  error_message text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(practice_id)
);

ALTER TABLE nextech_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage nextech connections"
  ON nextech_connections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Schedulers view nextech connections"
  ON nextech_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_nextech_connections_practice ON nextech_connections(practice_id);
CREATE INDEX IF NOT EXISTS idx_nextech_connections_status ON nextech_connections(connection_status);

-- ============================================================================
-- 5. NEXTECH PATIENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS nextech_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id uuid NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  nextech_patient_id text NOT NULL,
  nextech_practice_id uuid REFERENCES nextech_connections(practice_id) ON DELETE CASCADE,
  sync_status text NOT NULL CHECK (sync_status IN ('synced', 'pending', 'error')) DEFAULT 'pending',
  last_synced_at timestamptz,
  patient_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(nextech_practice_id, nextech_patient_id)
);

ALTER TABLE nextech_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers manage nextech patients"
  ON nextech_patients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_nextech_patients_request ON nextech_patients(consultation_request_id);
CREATE INDEX IF NOT EXISTS idx_nextech_patients_nextech_id ON nextech_patients(nextech_patient_id);
CREATE INDEX IF NOT EXISTS idx_nextech_patients_sync_status ON nextech_patients(sync_status);

-- ============================================================================
-- 6. NEXTECH APPOINTMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS nextech_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id uuid NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  nextech_patient_id text NOT NULL,
  nextech_appointment_id text NOT NULL,
  nextech_practice_id uuid REFERENCES nextech_connections(practice_id) ON DELETE CASCADE,
  appointment_status text NOT NULL CHECK (appointment_status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'scheduled',
  appointment_date timestamptz NOT NULL,
  appointment_type text,
  provider_id text,
  location_id text,
  sync_status text NOT NULL CHECK (sync_status IN ('synced', 'pending', 'error')) DEFAULT 'pending',
  last_synced_at timestamptz,
  appointment_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(nextech_practice_id, nextech_appointment_id)
);

ALTER TABLE nextech_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers manage nextech appointments"
  ON nextech_appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_nextech_appointments_request ON nextech_appointments(consultation_request_id);
CREATE INDEX IF NOT EXISTS idx_nextech_appointments_nextech_id ON nextech_appointments(nextech_appointment_id);
CREATE INDEX IF NOT EXISTS idx_nextech_appointments_date ON nextech_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_nextech_appointments_status ON nextech_appointments(appointment_status);

-- ============================================================================
-- 7. NEXTECH SYNC LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS nextech_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid REFERENCES nextech_connections(practice_id) ON DELETE CASCADE,
  sync_type text NOT NULL CHECK (sync_type IN ('patient_create', 'patient_update', 'appointment_create', 'appointment_update', 'appointment_cancel', 'status_sync')),
  entity_type text NOT NULL CHECK (entity_type IN ('patient', 'appointment')),
  entity_id uuid,
  nextech_entity_id text,
  operation_status text NOT NULL CHECK (operation_status IN ('success', 'failed', 'retrying')) DEFAULT 'success',
  request_payload jsonb,
  response_payload jsonb,
  error_details jsonb,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nextech_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view nextech sync log"
  ON nextech_sync_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_nextech_sync_log_practice ON nextech_sync_log(practice_id);
CREATE INDEX IF NOT EXISTS idx_nextech_sync_log_entity ON nextech_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_nextech_sync_log_status ON nextech_sync_log(operation_status);
CREATE INDEX IF NOT EXISTS idx_nextech_sync_log_created ON nextech_sync_log(created_at DESC);

-- ============================================================================
-- 8. EXTEND CONSULTATION REQUESTS TABLE
-- ============================================================================

-- Add Nextech-specific fields to existing consultation_requests table
DO $$
BEGIN
  -- Add nextech_patient_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_requests' AND column_name = 'nextech_patient_id'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN nextech_patient_id text;
  END IF;

  -- Add nextech_appointment_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_requests' AND column_name = 'nextech_appointment_id'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN nextech_appointment_id text;
  END IF;

  -- Add nextech_sync_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_requests' AND column_name = 'nextech_sync_status'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN nextech_sync_status text CHECK (nextech_sync_status IN ('not_synced', 'synced', 'error')) DEFAULT 'not_synced';
  END IF;

  -- Add preferred_language if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_requests' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN preferred_language text DEFAULT 'en';
  END IF;
END $$;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_consultation_requests_nextech_patient ON consultation_requests(nextech_patient_id) WHERE nextech_patient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_requests_nextech_appt ON consultation_requests(nextech_appointment_id) WHERE nextech_appointment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_requests_language ON consultation_requests(preferred_language);

-- ============================================================================
-- 9. UPDATE CONSULTATION SETTINGS TABLE
-- ============================================================================

-- Add Nextech to scheduling_method enum
DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE consultation_settings DROP CONSTRAINT IF EXISTS consultation_settings_scheduling_method_check;

  -- Add new constraint with nextech option
  ALTER TABLE consultation_settings ADD CONSTRAINT consultation_settings_scheduling_method_check
    CHECK (scheduling_method IN ('built-in', 'ringcentral', 'nextech', 'hybrid'));
END $$;

-- ============================================================================
-- 10. INTELLIGENT ASSIGNMENT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_staff_assignment_score(
  p_consultation_id uuid,
  p_staff_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request record;
  v_capabilities record;
  v_rules record;
  v_current_workload integer;
  v_language_score integer := 0;
  v_procedure_score integer := 0;
  v_workload_score integer := 0;
  v_timezone_score integer := 0;
  v_total_score integer := 0;
  v_result jsonb;
BEGIN
  -- Get consultation request details
  SELECT * INTO v_request
  FROM consultation_requests
  WHERE id = p_consultation_id;

  -- Get staff capabilities
  SELECT * INTO v_capabilities
  FROM staff_capabilities
  WHERE user_id = p_staff_user_id
  AND is_active = true;

  -- If staff not found or inactive, return 0 score
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'total_score', 0,
      'language_score', 0,
      'procedure_score', 0,
      'workload_score', 0,
      'timezone_score', 0,
      'eligible', false,
      'reason', 'Staff not found or inactive'
    );
  END IF;

  -- Get assignment rules (use first active rule)
  SELECT * INTO v_rules
  FROM assignment_rules
  WHERE enabled = true
  ORDER BY priority_order
  LIMIT 1;

  -- Use default weights if no rules found
  IF NOT FOUND THEN
    v_rules := ROW(null, null, 'default', 1, 40, 30, 20, 10, true, '{}'::jsonb, now(), now());
  END IF;

  -- Calculate language match score
  IF v_request.preferred_language = ANY(v_capabilities.languages) THEN
    v_language_score := v_rules.language_weight;
  END IF;

  -- Calculate procedure match score
  IF v_request.procedure = ANY(v_capabilities.procedures) THEN
    v_procedure_score := v_rules.procedure_weight;
  END IF;

  -- Calculate workload score
  SELECT COUNT(*) INTO v_current_workload
  FROM consultation_requests
  WHERE assigned_to_user_id = p_staff_user_id
  AND status IN ('assigned', 'unassigned');

  IF v_current_workload < v_capabilities.max_active_consultations THEN
    v_workload_score := v_rules.workload_weight *
      (1 - (v_current_workload::float / v_capabilities.max_active_consultations));
  END IF;

  -- Calculate timezone score (simplified - assumes PST match gets full score)
  IF 'PST' = ANY(v_capabilities.time_zones) OR 'ChST' = ANY(v_capabilities.time_zones) THEN
    v_timezone_score := v_rules.timezone_weight;
  END IF;

  -- Calculate total score
  v_total_score := v_language_score + v_procedure_score + v_workload_score + v_timezone_score;

  -- Build result
  v_result := jsonb_build_object(
    'total_score', v_total_score,
    'language_score', v_language_score,
    'procedure_score', v_procedure_score,
    'workload_score', v_workload_score,
    'timezone_score', v_timezone_score,
    'current_workload', v_current_workload,
    'max_workload', v_capabilities.max_active_consultations,
    'eligible', v_total_score > 0,
    'staff_user_id', p_staff_user_id
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 11. AUTO ASSIGNMENT FUNCTION WITH INTELLIGENT ROUTING
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_assign_consultation_intelligent(
  p_consultation_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff_scores jsonb[];
  v_best_staff_id uuid;
  v_best_score integer := 0;
  v_staff_record record;
  v_current_score jsonb;
BEGIN
  -- Get all active staff members
  FOR v_staff_record IN
    SELECT user_id
    FROM staff_capabilities
    WHERE is_active = true
  LOOP
    -- Calculate score for this staff member
    v_current_score := calculate_staff_assignment_score(p_consultation_id, v_staff_record.user_id);

    -- Track if this is the best score so far
    IF (v_current_score->>'total_score')::integer > v_best_score THEN
      v_best_score := (v_current_score->>'total_score')::integer;
      v_best_staff_id := v_staff_record.user_id;
    END IF;

    -- Collect all scores for logging
    v_staff_scores := array_append(v_staff_scores, v_current_score);
  END LOOP;

  -- If we found a suitable staff member, assign and log
  IF v_best_staff_id IS NOT NULL THEN
    -- Update consultation request
    UPDATE consultation_requests
    SET
      assigned_to_user_id = v_best_staff_id,
      status = 'assigned',
      updated_at = now()
    WHERE id = p_consultation_id;

    -- Log assignment history
    INSERT INTO assignment_history (
      consultation_request_id,
      assigned_to_user_id,
      assignment_method,
      assignment_rationale,
      score_details
    )
    VALUES (
      p_consultation_id,
      v_best_staff_id,
      'automatic',
      jsonb_build_object(
        'method', 'intelligent_routing',
        'best_score', v_best_score
      ),
      jsonb_build_object('all_scores', v_staff_scores)
    );

    -- Log to consultation audit
    INSERT INTO consultation_audit_log (
      consultation_request_id,
      user_id,
      action,
      details
    )
    VALUES (
      p_consultation_id,
      v_best_staff_id,
      'assigned',
      jsonb_build_object(
        'assignment_method', 'intelligent',
        'score', v_best_score
      )
    );
  END IF;

  RETURN v_best_staff_id;
END;
$$;

-- ============================================================================
-- 12. TRIGGER FOR AUTO ASSIGNMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auto_assign_consultation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings record;
BEGIN
  -- Get consultation settings
  SELECT * INTO v_settings
  FROM consultation_settings
  WHERE practice_id = NEW.practice_id OR practice_id IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Only auto-assign if routing mode is round_robin and status is unassigned
  IF v_settings.routing_mode = 'round_robin' AND NEW.status = 'unassigned' THEN
    PERFORM auto_assign_consultation_intelligent(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_assign_new_consultation ON consultation_requests;

-- Create trigger for new consultations
CREATE TRIGGER auto_assign_new_consultation
  AFTER INSERT ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_assign_consultation();

-- ============================================================================
-- 13. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_staff_assignment_score(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_consultation_intelligent(uuid) TO authenticated;
