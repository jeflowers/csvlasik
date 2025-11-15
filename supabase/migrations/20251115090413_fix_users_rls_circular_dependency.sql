/*
  # Fix Users Table RLS Circular Dependency

  ## Summary
  Fixes the circular dependency in the users table RLS policy that prevents
  users from logging in. The policy was checking admin role by querying the
  users table itself, creating a chicken-and-egg problem.

  ## Problem
  The "View users" policy was:
  ```sql
  id = (select auth.uid()) OR
  EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin')
  ```
  
  This doesn't work because to check if a user is admin, we need to query
  the users table, but we can't query the users table without this policy
  already passing.

  ## Solution
  Split into two separate policies:
  1. Users can ALWAYS view their own record (no subquery needed)
  2. Admins can view all users (uses the is_current_user_admin function)

  ## Security Impact
  - Users can view their own record immediately after auth
  - Admin check happens via separate policy that doesn't create circular dependency
  - Both policies are permissive, so either can grant access
*/

-- Drop the problematic consolidated policy
DROP POLICY IF EXISTS "View users" ON users;

-- Create two separate policies that avoid circular dependency

-- Policy 1: Users can always view their own record
-- This uses auth.uid() directly without any subquery to users table
CREATE POLICY "Users can view own record" ON users
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

-- Policy 2: Admins can view all users
-- This uses the is_current_user_admin() function which handles the logic
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT TO authenticated
  USING (is_current_user_admin());