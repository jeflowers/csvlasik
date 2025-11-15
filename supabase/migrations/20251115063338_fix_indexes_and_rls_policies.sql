/*
  # Fix Security Issues - Part 1: Indexes and RLS Policies

  ## Summary
  Fixes missing indexes, removes unused indexes, and optimizes RLS policies

  ## Changes Made

  ### 1. Missing Foreign Key Indexes
  Added indexes for foreign keys without covering indexes

  ### 2. Unused Index Cleanup
  Removed all unused indexes identified by Supabase

  ### 3. RLS Performance Optimization
  Updated RLS policies to use (select auth.uid()) pattern for better performance

  ### 4. Multiple Permissive Policies
  Consolidated overlapping SELECT policies
*/

-- ============================================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_consultation_audit_log_user_id 
ON consultation_audit_log(user_id);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_duplicate_of_id 
ON consultation_requests(duplicate_of_id);

CREATE INDEX IF NOT EXISTS idx_consultation_settings_fallback_user_id 
ON consultation_settings(fallback_user_id);

-- ============================================================================
-- PART 2: DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_appointment_request_audit_log_appointment_request_id;
DROP INDEX IF EXISTS idx_appointment_request_audit_log_changed_by;
DROP INDEX IF EXISTS idx_appointment_requests_reviewed_by;
DROP INDEX IF EXISTS idx_articles_author_id;
DROP INDEX IF EXISTS idx_articles_published_by;
DROP INDEX IF EXISTS idx_articles_reviewed_by;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_content_ownership_approved_by;
DROP INDEX IF EXISTS idx_content_ownership_owner_id;
DROP INDEX IF EXISTS idx_data_subject_requests_processed_by;
DROP INDEX IF EXISTS idx_media_uploaded_by;
DROP INDEX IF EXISTS idx_role_permissions_permission_id;
DROP INDEX IF EXISTS idx_security_incidents_resolved_by;
DROP INDEX IF EXISTS idx_security_incidents_user_id;
DROP INDEX IF EXISTS idx_user_roles_granted_by;
DROP INDEX IF EXISTS idx_user_roles_role_id;
DROP INDEX IF EXISTS idx_user_roles_user_role;
DROP INDEX IF EXISTS idx_roles_name_lookup;
DROP INDEX IF EXISTS idx_appointment_requests_status_date;
DROP INDEX IF EXISTS idx_users_email_lower;
DROP INDEX IF EXISTS idx_audit_logs_entity_lookup;
DROP INDEX IF EXISTS idx_security_incidents_resolved_severity;
DROP INDEX IF EXISTS idx_media_mimetype_uploaded;
DROP INDEX IF EXISTS idx_articles_status_published;
DROP INDEX IF EXISTS idx_user_roles_expires;
DROP INDEX IF EXISTS idx_consultation_settings_practice;
DROP INDEX IF EXISTS idx_consultation_requests_status;
DROP INDEX IF EXISTS idx_consultation_requests_assigned_to;
DROP INDEX IF EXISTS idx_consultation_requests_created_at;
DROP INDEX IF EXISTS idx_consultation_requests_email_phone;
DROP INDEX IF EXISTS idx_audit_log_request_id;
DROP INDEX IF EXISTS idx_audit_log_created_at;
DROP INDEX IF EXISTS idx_audit_log_action;
DROP INDEX IF EXISTS idx_consultation_requests_practice;
DROP INDEX IF EXISTS idx_ringcentral_connections_practice;
DROP INDEX IF EXISTS idx_ringcentral_connections_status;
DROP INDEX IF EXISTS idx_ringcentral_connections_expires;
DROP INDEX IF EXISTS idx_ringcentral_events_request;
DROP INDEX IF EXISTS idx_ringcentral_events_rc_id;
DROP INDEX IF EXISTS idx_ringcentral_events_status;
DROP INDEX IF EXISTS idx_ringcentral_messages_request;
DROP INDEX IF EXISTS idx_ringcentral_messages_rc_id;
DROP INDEX IF EXISTS idx_ringcentral_messages_status;
DROP INDEX IF EXISTS idx_articles_visibility;
DROP INDEX IF EXISTS idx_articles_visibility_status;

-- ============================================================================
-- PART 3: FIX RLS POLICIES - CONSOLIDATE AND OPTIMIZE
-- ============================================================================

-- users table - consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

CREATE POLICY "View users" ON users
  FOR SELECT TO authenticated
  USING (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'admin'
    )
  );

-- appointment_requests table
DROP POLICY IF EXISTS "View appointment requests" ON appointment_requests;
CREATE POLICY "View appointment requests" ON appointment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

-- content_ownership table
DROP POLICY IF EXISTS "View content ownership" ON content_ownership;
CREATE POLICY "View content ownership" ON content_ownership
  FOR SELECT TO authenticated
  USING (
    owner_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- consultation_settings table - consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Admins manage consultation settings" ON consultation_settings;
DROP POLICY IF EXISTS "Schedulers view consultation settings" ON consultation_settings;

CREATE POLICY "View consultation settings" ON consultation_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

CREATE POLICY "Manage consultation settings" ON consultation_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- consultation_requests table
DROP POLICY IF EXISTS "Admins and schedulers read consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins and schedulers update consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins create consultation requests" ON consultation_requests;

CREATE POLICY "Read consultation requests" ON consultation_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

CREATE POLICY "Update consultation requests" ON consultation_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

CREATE POLICY "Create consultation requests" ON consultation_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- consultation_audit_log table
DROP POLICY IF EXISTS "Admins and schedulers read audit logs" ON consultation_audit_log;
CREATE POLICY "Read audit logs" ON consultation_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

-- ringcentral_connections table - consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Admins manage ringcentral connections" ON ringcentral_connections;
DROP POLICY IF EXISTS "Schedulers view ringcentral connections" ON ringcentral_connections;

CREATE POLICY "View ringcentral connections" ON ringcentral_connections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

CREATE POLICY "Manage ringcentral connections" ON ringcentral_connections
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- ringcentral_events table
DROP POLICY IF EXISTS "Admins and schedulers manage ringcentral events" ON ringcentral_events;
CREATE POLICY "Manage ringcentral events" ON ringcentral_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

-- ringcentral_messages table
DROP POLICY IF EXISTS "Admins and schedulers manage ringcentral messages" ON ringcentral_messages;
CREATE POLICY "Manage ringcentral messages" ON ringcentral_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

-- user_roles table - consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

CREATE POLICY "View user roles" ON user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );