/*
  # Fix Function Search Paths

  ## Summary
  Updates all functions to use immutable search_path for security

  ## Changes Made
  Sets search_path = 'pg_catalog, public' for all functions to prevent
  role-mutable search path security issues

  ## Security Impact
  Prevents potential SQL injection and privilege escalation attacks
  by ensuring functions always use a predictable schema search order
*/

-- Fix all function search paths with correct signatures
ALTER FUNCTION is_current_user_admin() SET search_path = pg_catalog, public;
ALTER FUNCTION update_updated_at_column() SET search_path = pg_catalog, public;
ALTER FUNCTION audit_consultation_status_change() SET search_path = pg_catalog, public;
ALTER FUNCTION trigger_auto_assign() SET search_path = pg_catalog, public;
ALTER FUNCTION check_duplicate_submission(text, text, text) SET search_path = pg_catalog, public;
ALTER FUNCTION get_next_round_robin_recipient() SET search_path = pg_catalog, public;
ALTER FUNCTION auto_assign_consultation_request(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION is_ringcentral_token_expired(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION mark_ringcentral_connection_expired(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION get_active_ringcentral_connection(uuid) SET search_path = pg_catalog, public;