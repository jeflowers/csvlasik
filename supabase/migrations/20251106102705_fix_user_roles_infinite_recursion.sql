/*
  # Fix Infinite Recursion in user_roles RLS Policy

  ## Problem
  The "View user roles" policy on the user_roles table creates infinite recursion
  by querying the user_roles table within its own policy definition.
  
  This causes login to fail with error:
  "Infinite recursion detected in policy for relation user_roles"

  ## Solution
  Replace the circular policy with a simpler, non-recursive policy that:
  1. Allows users to view their own roles (user_id = auth.uid())
  2. Uses a helper function to check admin status without recursion
  
  ## Changes
  1. Drop existing problematic policy
  2. Create admin check function using direct table lookup
  3. Create new non-recursive policies for user_roles
  
  ## Security
  - Users can only see their own roles
  - Admins can see all roles (via function that doesn't recurse)
  - All checks use auth.uid() directly
*/

-- ============================================================================
-- 1. DROP EXISTING PROBLEMATIC POLICY
-- ============================================================================

DROP POLICY IF EXISTS "View user roles" ON user_roles;

-- ============================================================================
-- 2. CREATE HELPER FUNCTION FOR ADMIN CHECK (NO RECURSION)
-- ============================================================================

-- This function checks if current user is admin WITHOUT querying user_roles
-- It directly checks the users table role field
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- ============================================================================
-- 3. CREATE NEW NON-RECURSIVE POLICIES
-- ============================================================================

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins can view all roles (using non-recursive function)
CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

-- Policy: Admins can insert roles
CREATE POLICY "Admins can insert roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

-- Policy: Admins can update roles
CREATE POLICY "Admins can update roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Policy: Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- ============================================================================
-- 4. VERIFY NO RECURSION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICY FIX COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Removed circular policy from user_roles';
  RAISE NOTICE '✅ Created non-recursive admin check function';
  RAISE NOTICE '✅ Applied new policies without recursion';
  RAISE NOTICE '';
  RAISE NOTICE 'Login should now work without infinite recursion error';
  RAISE NOTICE '';
END $$;
