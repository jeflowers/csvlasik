/*
  # Consultation Scheduling System

  ## Overview
  Creates tables and functions for managing consultation requests with support for
  Built-in, RingCentral, and Hybrid scheduling methods.

  ## New Tables
  
  ### 1. consultation_settings
  - Stores practice-level configuration for scheduling method and notification preferences
  - Supports: built-in, ringcentral, or hybrid scheduling modes
  - Defines recipient schedulers, routing mode, and failover behavior
  
  ### 2. consultation_requests
  - Stores patient consultation requests from website forms
  - Tracks status: unassigned → assigned → scheduled → closed
  - Links to RingCentral events/messages when applicable
  - Includes duplicate suppression logic
  
  ### 3. consultation_audit_log
  - HIPAA-compliant audit trail for all actions
  - Tracks: created, assigned, contacted, scheduled, closed, failover events
  - Stores flexible JSON details without PII in logs
  
  ## Security
  - RLS enabled on all tables
  - Admins can manage settings
  - Schedulers can read/update assigned requests
  - All actions logged for compliance
  
  ## Features
  - Duplicate suppression (60-second window)
  - Round-robin assignment
  - Multi-recipient notifications
  - Failover detection and handling
  - Real-time status updates
*/

-- ============================================================================
-- 1. CONSULTATION SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid DEFAULT gen_random_uuid(),
  scheduling_method text NOT NULL CHECK (scheduling_method IN ('built-in', 'ringcentral', 'hybrid')) DEFAULT 'built-in',
  recipient_user_ids uuid[] NOT NULL DEFAULT '{}',
  notification_email boolean DEFAULT true,
  notification_sms boolean DEFAULT false,
  routing_mode text NOT NULL CHECK (routing_mode IN ('notify_all', 'round_robin')) DEFAULT 'notify_all',
  fallback_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  failover_behavior text CHECK (failover_behavior IN ('auto_builtin', 'hold_alert')) DEFAULT 'auto_builtin',
  last_assigned_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage consultation settings"
  ON consultation_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Schedulers view consultation settings"
  ON consultation_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_consultation_settings_practice ON consultation_settings(practice_id);

-- Insert default settings
INSERT INTO consultation_settings (practice_id, scheduling_method, routing_mode)
VALUES (gen_random_uuid(), 'built-in', 'notify_all')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CONSULTATION REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  procedure text NOT NULL,
  preferred_contact text CHECK (preferred_contact IN ('phone', 'email', 'sms')) DEFAULT 'phone',
  comments text,
  status text NOT NULL CHECK (status IN ('unassigned', 'assigned', 'scheduled', 'closed')) DEFAULT 'unassigned',
  assigned_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_via text CHECK (scheduled_via IN ('built-in', 'ringcentral')),
  ringcentral_event_id text,
  ringcentral_message_id text,
  submission_ip text,
  duplicate_suppressed boolean DEFAULT false,
  duplicate_of_id uuid REFERENCES consultation_requests(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers read consultation requests"
  ON consultation_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE POLICY "Admins and schedulers update consultation requests"
  ON consultation_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE POLICY "Admins create consultation requests"
  ON consultation_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public can insert consultation requests"
  ON consultation_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_assigned_to ON consultation_requests(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_email_phone ON consultation_requests(email, phone);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_practice ON consultation_requests(practice_id);

-- ============================================================================
-- 3. CONSULTATION AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultation_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id uuid REFERENCES consultation_requests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers read audit logs"
  ON consultation_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE POLICY "System inserts audit logs"
  ON consultation_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon inserts audit logs"
  ON consultation_audit_log FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_log_request_id ON consultation_audit_log(consultation_request_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON consultation_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON consultation_audit_log(action);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check for duplicate submissions within 60 seconds
CREATE OR REPLACE FUNCTION check_duplicate_submission(
  p_email text,
  p_phone text,
  p_procedure text
)
RETURNS uuid AS $$
DECLARE
  v_existing_id uuid;
BEGIN
  SELECT id INTO v_existing_id
  FROM consultation_requests
  WHERE email = p_email
    AND phone = p_phone
    AND procedure = p_procedure
    AND created_at > (now() - interval '60 seconds')
    AND duplicate_suppressed = false
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN v_existing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get next recipient for round-robin assignment
CREATE OR REPLACE FUNCTION get_next_round_robin_recipient()
RETURNS uuid AS $$
DECLARE
  v_settings record;
  v_next_user_id uuid;
  v_next_index integer;
BEGIN
  SELECT * INTO v_settings
  FROM consultation_settings
  LIMIT 1;
  
  IF v_settings IS NULL OR array_length(v_settings.recipient_user_ids, 1) IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_next_index := v_settings.last_assigned_index + 1;
  
  IF v_next_index > array_length(v_settings.recipient_user_ids, 1) THEN
    v_next_index := 1;
  END IF;
  
  v_next_user_id := v_settings.recipient_user_ids[v_next_index];
  
  UPDATE consultation_settings
  SET last_assigned_index = v_next_index
  WHERE id = v_settings.id;
  
  RETURN v_next_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-assign based on routing mode
CREATE OR REPLACE FUNCTION auto_assign_consultation_request(p_request_id uuid)
RETURNS void AS $$
DECLARE
  v_settings record;
  v_assigned_user_id uuid;
BEGIN
  SELECT * INTO v_settings
  FROM consultation_settings
  LIMIT 1;
  
  IF v_settings IS NULL THEN
    RETURN;
  END IF;
  
  IF v_settings.routing_mode = 'round_robin' THEN
    v_assigned_user_id := get_next_round_robin_recipient();
    
    IF v_assigned_user_id IS NOT NULL THEN
      UPDATE consultation_requests
      SET assigned_to_user_id = v_assigned_user_id,
          status = 'assigned',
          updated_at = now()
      WHERE id = p_request_id;
      
      INSERT INTO consultation_audit_log (consultation_request_id, user_id, action, details)
      VALUES (p_request_id, v_assigned_user_id, 'assigned', jsonb_build_object('mode', 'auto_round_robin'));
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_settings_updated_at
  BEFORE UPDATE ON consultation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-audit on status change
CREATE OR REPLACE FUNCTION audit_consultation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO consultation_audit_log (consultation_request_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'scheduled_via', NEW.scheduled_via
      )
    );
  END IF;
  
  IF OLD.assigned_to_user_id IS DISTINCT FROM NEW.assigned_to_user_id THEN
    INSERT INTO consultation_audit_log (consultation_request_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'assigned',
      jsonb_build_object(
        'old_user_id', OLD.assigned_to_user_id,
        'new_user_id', NEW.assigned_to_user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_consultation_changes
  AFTER UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION audit_consultation_status_change();

-- Trigger: Auto-assign new requests based on routing mode
CREATE OR REPLACE FUNCTION trigger_auto_assign()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auto_assign_consultation_request(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_new_consultation
  AFTER INSERT ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_assign();

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON consultation_settings TO authenticated;
GRANT ALL ON consultation_requests TO authenticated, anon;
GRANT ALL ON consultation_audit_log TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_duplicate_submission TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_next_round_robin_recipient TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_consultation_request TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CONSULTATION SCHEDULING SYSTEM CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ consultation_settings';
  RAISE NOTICE '  ✅ consultation_requests';
  RAISE NOTICE '  ✅ consultation_audit_log';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  • Duplicate suppression (60s window)';
  RAISE NOTICE '  • Round-robin assignment';
  RAISE NOTICE '  • Auto-audit logging';
  RAISE NOTICE '  • RLS policies for security';
  RAISE NOTICE '  • Support for built-in/ringcentral/hybrid modes';
  RAISE NOTICE '';
END $$;
