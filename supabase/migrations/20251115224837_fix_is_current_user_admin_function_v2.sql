/*
  # Fix is_current_user_admin Function

  ## Summary
  Fixes the is_current_user_admin function to avoid circular dependency
  and use proper auth pattern

  ## Problem
  The function was:
  1. Using auth.uid() instead of (select auth.uid()) - performance issue
  2. Querying public.users which creates circular dependency with RLS
  3. Using plpgsql when sql would be more efficient

  ## Solution
  Use CREATE OR REPLACE and make it:
  - SECURITY DEFINER so it can bypass RLS
  - SQL language for better performance
  - STABLE for query optimization
  - Use (select auth.uid()) pattern

  ## Security Impact
  - Breaks circular dependency in users table RLS
  - Improves performance
  - Safe because function only checks current user
*/

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = (select auth.uid())
    AND role = 'admin'
  );
$$;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;