/*
  # Fix is_current_user_admin to Include super_admin Role - URGENT

  ## Problem
  The is_current_user_admin() function only checks for role = 'admin'
  but doesn't check for role = 'super_admin'. This prevents super_admin
  users from performing admin operations like creating new users.

  ## Solution
  Update the function to check for BOTH 'admin' AND 'super_admin' roles.

  ## Impact
  - CRITICAL FIX: Allows super_admin users to create/manage users
  - Maintains existing admin user capabilities
  - No security regression - super_admin should have admin privileges
*/

-- Fix the function to check for both admin and super_admin roles
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

COMMENT ON FUNCTION is_current_user_admin() IS 
  'Returns true if current user has admin or super_admin role. Used by RLS policies.';
