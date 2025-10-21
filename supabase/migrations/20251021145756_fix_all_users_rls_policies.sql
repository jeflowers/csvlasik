/*
  # Fix All Users Table RLS Policies to Remove Circular Dependencies

  ## Problem
  ALL policies on the users table that check admin status create circular dependencies:
  - They query the users table to check if the current user is an admin
  - But the query itself is trying to access the users table
  - This causes infinite recursion and 500 Internal Server Errors

  ## Solution
  1. Keep the simple policy for users to read their own profile (no circular dependency)
  2. Remove ALL admin policies that have circular dependencies
  3. Create new admin policies that use a PostgreSQL function to check admin status
  4. The function will use SECURITY DEFINER to bypass RLS when checking admin status

  ## Security
  - Users can only read their own profile
  - Admins can perform all operations once verified
  - Function is carefully designed to only check admin status, nothing else
*/

-- Create a function to check if the current user is an admin
-- This function uses SECURITY DEFINER to bypass RLS when checking
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Drop all existing admin policies that cause circular dependencies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create new admin policies using the function
CREATE POLICY "Admins can view all users via function"
  ON users
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can insert users via function"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update users via function"
  ON users
  FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can delete users via function"
  ON users
  FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION public.is_current_user_admin() IS 
  'Checks if the current authenticated user has admin role. Uses SECURITY DEFINER to bypass RLS and prevent circular dependencies.';
