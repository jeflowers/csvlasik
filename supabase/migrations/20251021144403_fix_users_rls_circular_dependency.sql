/*
  # Fix Users Table RLS Circular Dependency

  ## Problem
  The existing RLS policies on the users table create a circular dependency:
  - Policies check if user exists in users table with admin role
  - But the query trying to check this IS the query to fetch the user data
  - This causes login to hang as the SELECT query never completes

  ## Solution
  1. Drop existing "Users can view own profile" policy
  2. Create new policy that allows authenticated users to read their own profile
     using only auth.uid() (no subquery to users table)
  3. Keep admin policies as they are (admins already have their profile loaded)

  ## Security
  - Users can ONLY read their own user record (auth.uid() = id)
  - No data leakage between users
  - Admin policies remain restrictive and require admin role
*/

-- Drop the existing policy that might be contributing to circular dependency
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create a new policy that allows any authenticated user to read their own profile
-- This uses ONLY auth.uid() without any subqueries to the users table
CREATE POLICY "Authenticated users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Note: The "Admins can view all users" policy is kept as-is
-- It will work fine once the user's initial profile is loaded
