/*
  # Fix is_current_user_admin to Properly Bypass RLS - CRITICAL

  ## Problem Identified
  Circular dependency causing "User not allowed" error:
  
  1. INSERT policy on users → calls is_current_user_admin()
  2. is_current_user_admin() → queries users table  
  3. SELECT policy on users → calls is_current_user_admin() again
  4. Infinite recursion → fails
  
  ## Root Cause
  The SECURITY DEFINER function still triggers RLS policies when querying
  the users table, creating a circular dependency.

  ## Solution
  Change from SQL to PL/pgSQL and ensure the query bypasses RLS by using
  SECURITY DEFINER with explicit SET search_path. PL/pgSQL with SECURITY
  DEFINER will execute with the function owner's privileges, bypassing RLS.

  ## Security Impact
  - NO CHANGE: Still checks user's role from their record
  - SAFER: Eliminates circular dependency vulnerability  
  - FASTER: No infinite recursion
*/

-- Replace with PL/pgSQL version that properly bypasses RLS
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Query public.users - SECURITY DEFINER bypasses RLS
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Return true if user has admin or super_admin role
  RETURN COALESCE(user_role IN ('admin', 'super_admin'), false);
EXCEPTION
  WHEN OTHERS THEN
    -- On any error, safely return false
    RETURN false;
END;
$$;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

COMMENT ON FUNCTION is_current_user_admin() IS 
  'Returns true if current user has admin or super_admin role. Uses SECURITY DEFINER with PL/pgSQL to properly bypass RLS and avoid circular dependencies.';
