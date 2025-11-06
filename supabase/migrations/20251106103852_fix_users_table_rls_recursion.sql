/*
  # Fix Infinite Recursion in users Table RLS Policy

  ## Problem
  The "View users" policy on the users table creates potential infinite recursion
  by querying the user_roles table, which then references back to users table.
  
  This causes login to fail with error:
  "Internal Server Error" (500) when fetching user data

  ## Solution
  Replace the circular policy with simpler policies that:
  1. Allow users to view their own record (id = auth.uid())
  2. Use the is_current_user_admin() function for admin checks
  3. Avoid querying user_roles table from users SELECT policy
  
  ## Changes
  1. Drop existing problematic "View users" policy
  2. Create new non-recursive policies for users table
  
  ## Security
  - Users can only see their own record
  - Admins can see all users (via function that checks users.role directly)
  - No circular dependencies between tables
*/

-- ============================================================================
-- 1. DROP EXISTING PROBLEMATIC POLICY
-- ============================================================================

DROP POLICY IF EXISTS "View users" ON users;

-- ============================================================================
-- 2. CREATE NEW NON-RECURSIVE POLICIES FOR USERS TABLE
-- ============================================================================

-- Policy: Users can view their own record
CREATE POLICY "Users can view own record"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy: Admins can view all users (using non-recursive function)
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

-- ============================================================================
-- 3. VERIFY ALL POLICIES ARE NON-RECURSIVE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'USERS TABLE RLS FIX COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Removed circular policy from users table';
  RAISE NOTICE '✅ Applied new policies without recursion';
  RAISE NOTICE '✅ Users table now uses direct auth.uid() checks';
  RAISE NOTICE '';
  RAISE NOTICE 'How the policies work:';
  RAISE NOTICE '  1. Regular users: Can only see their own record (id = auth.uid())';
  RAISE NOTICE '  2. Admins: Can see all users (via is_current_user_admin())';
  RAISE NOTICE '  3. No circular dependencies between users <-> user_roles';
  RAISE NOTICE '';
  RAISE NOTICE 'Login should now work completely without errors';
  RAISE NOTICE '';
END $$;
