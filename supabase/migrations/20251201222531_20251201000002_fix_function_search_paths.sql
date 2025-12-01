/*
  # Fix Function Search Paths - Security Hardening

  This migration fixes all functions with role-mutable search paths by setting
  explicit search paths using ALTER FUNCTION to preserve dependencies.

  ## Changes
  1. Set explicit search_path for all 7 vulnerable functions
  2. Use 'public, pg_temp' pattern for security
  3. Maintain all RLS policy dependencies

  ## Functions Fixed
  - categorize_media_by_path (2 overloads)
  - is_current_user_admin  
  - update_updated_at_column (2 overloads)
  - get_analytics_summary
  - generate_confirmation_code
  - set_confirmation_code
  - update_slot_availability

  ## Security Impact
  - Prevents search_path manipulation attacks
  - Ensures functions always use correct schema
  - Maintains all RLS and security definer behavior
*/

-- Fix categorize_media_by_path function (no args)
ALTER FUNCTION categorize_media_by_path() 
  SET search_path = public, pg_temp;

-- Fix categorize_media_by_path function (with path arg)
ALTER FUNCTION categorize_media_by_path(path text) 
  SET search_path = public, pg_temp;

-- Fix is_current_user_admin function
ALTER FUNCTION is_current_user_admin() 
  SET search_path = public, pg_temp;

-- Fix update_updated_at_column function
ALTER FUNCTION update_updated_at_column() 
  SET search_path = public, pg_temp;

-- Fix get_analytics_summary function with correct signature
ALTER FUNCTION get_analytics_summary(p_start_date timestamp with time zone, p_end_date timestamp with time zone) 
  SET search_path = public, pg_temp;

-- Fix generate_confirmation_code function
ALTER FUNCTION generate_confirmation_code() 
  SET search_path = public, pg_temp;

-- Fix set_confirmation_code function
ALTER FUNCTION set_confirmation_code() 
  SET search_path = public, pg_temp;

-- Fix update_slot_availability function
ALTER FUNCTION update_slot_availability() 
  SET search_path = public, pg_temp;
