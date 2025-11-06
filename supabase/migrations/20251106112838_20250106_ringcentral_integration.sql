/*
  # RingCentral Integration Tables

  ## Overview
  Creates tables and functions for RingCentral OAuth integration and connection management.

  ## New Tables
  
  ### ringcentral_connections
  - Stores OAuth tokens and connection details for RingCentral
  - One connection per practice
  - Includes default settings for calls, SMS, and calendar
  - Tracks connection status and token expiration
  
  ## Security
  - RLS enabled - only admins can manage connections
  - Tokens should be encrypted at application level before storage
  - Automatic token refresh logic handled by application
  
  ## Features
  - OAuth2 token storage
  - Default call queue/team/number configuration
  - Connection status tracking
  - Token expiration monitoring
*/

-- ============================================================================
-- RINGCENTRAL CONNECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ringcentral_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid UNIQUE,
  rc_account_id text NOT NULL,
  rc_access_token text NOT NULL,
  rc_refresh_token text NOT NULL,
  rc_token_expires_at timestamptz NOT NULL,
  default_call_queue text,
  default_team text,
  default_number text,
  default_sms_from text,
  default_provider_location text,
  status text NOT NULL CHECK (status IN ('connected', 'disconnected', 'expired', 'error')) DEFAULT 'connected',
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ringcentral_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ringcentral connections"
  ON ringcentral_connections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Schedulers view ringcentral connections"
  ON ringcentral_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_ringcentral_connections_practice ON ringcentral_connections(practice_id);
CREATE INDEX IF NOT EXISTS idx_ringcentral_connections_status ON ringcentral_connections(status);
CREATE INDEX IF NOT EXISTS idx_ringcentral_connections_expires ON ringcentral_connections(rc_token_expires_at);

-- ============================================================================
-- RINGCENTRAL EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ringcentral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id uuid REFERENCES consultation_requests(id) ON DELETE CASCADE,
  rc_event_id text NOT NULL,
  rc_event_type text NOT NULL,
  rc_calendar_id text,
  event_start_time timestamptz,
  event_end_time timestamptz,
  event_details jsonb DEFAULT '{}'::jsonb,
  status text CHECK (status IN ('scheduled', 'cancelled', 'completed')) DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ringcentral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers manage ringcentral events"
  ON ringcentral_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_ringcentral_events_request ON ringcentral_events(consultation_request_id);
CREATE INDEX IF NOT EXISTS idx_ringcentral_events_rc_id ON ringcentral_events(rc_event_id);
CREATE INDEX IF NOT EXISTS idx_ringcentral_events_status ON ringcentral_events(status);

-- ============================================================================
-- RINGCENTRAL MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ringcentral_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id uuid REFERENCES consultation_requests(id) ON DELETE CASCADE,
  rc_message_id text NOT NULL,
  message_type text CHECK (message_type IN ('sms', 'mms')) DEFAULT 'sms',
  from_number text NOT NULL,
  to_number text NOT NULL,
  message_body text NOT NULL,
  status text CHECK (status IN ('queued', 'sent', 'delivered', 'failed')) DEFAULT 'queued',
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ringcentral_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and schedulers manage ringcentral messages"
  ON ringcentral_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin', 'scheduler')
    )
  );

CREATE INDEX IF NOT EXISTS idx_ringcentral_messages_request ON ringcentral_messages(consultation_request_id);
CREATE INDEX IF NOT EXISTS idx_ringcentral_messages_rc_id ON ringcentral_messages(rc_message_id);
CREATE INDEX IF NOT EXISTS idx_ringcentral_messages_status ON ringcentral_messages(status);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if RingCentral token is expired or about to expire
CREATE OR REPLACE FUNCTION is_ringcentral_token_expired(connection_id uuid)
RETURNS boolean AS $$
DECLARE
  v_expires_at timestamptz;
BEGIN
  SELECT rc_token_expires_at INTO v_expires_at
  FROM ringcentral_connections
  WHERE id = connection_id;
  
  IF v_expires_at IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN v_expires_at < (now() + interval '5 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark connection as expired
CREATE OR REPLACE FUNCTION mark_ringcentral_connection_expired(connection_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE ringcentral_connections
  SET status = 'expired',
      updated_at = now()
  WHERE id = connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get active RingCentral connection for practice
CREATE OR REPLACE FUNCTION get_active_ringcentral_connection(p_practice_id uuid)
RETURNS uuid AS $$
DECLARE
  v_connection_id uuid;
BEGIN
  SELECT id INTO v_connection_id
  FROM ringcentral_connections
  WHERE practice_id = p_practice_id
    AND status = 'connected'
    AND rc_token_expires_at > now()
  LIMIT 1;
  
  RETURN v_connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_ringcentral_connections_updated_at
  BEFORE UPDATE ON ringcentral_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ringcentral_events_updated_at
  BEFORE UPDATE ON ringcentral_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ringcentral_messages_updated_at
  BEFORE UPDATE ON ringcentral_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON ringcentral_connections TO authenticated;
GRANT ALL ON ringcentral_events TO authenticated;
GRANT ALL ON ringcentral_messages TO authenticated;
GRANT EXECUTE ON FUNCTION is_ringcentral_token_expired TO authenticated;
GRANT EXECUTE ON FUNCTION mark_ringcentral_connection_expired TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_ringcentral_connection TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RINGCENTRAL INTEGRATION CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ ringcentral_connections';
  RAISE NOTICE '  ✅ ringcentral_events';
  RAISE NOTICE '  ✅ ringcentral_messages';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  • OAuth2 token storage';
  RAISE NOTICE '  • Token expiration tracking';
  RAISE NOTICE '  • Event and message tracking';
  RAISE NOTICE '  • RLS policies for security';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Note:';
  RAISE NOTICE '  ⚠️  Encrypt tokens at application level';
  RAISE NOTICE '  ⚠️  Implement token refresh logic';
  RAISE NOTICE '';
END $$;
