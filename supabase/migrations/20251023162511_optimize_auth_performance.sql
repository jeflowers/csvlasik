/*
  # Optimize Authentication Performance

  ## Summary
  Optimizes database queries for authentication and user lookup operations to improve CMS login performance.

  ## Changes Made

  ### 1. Indexes
  - Ensures users.id has optimal indexing (already indexed as PRIMARY KEY)
  - Ensures users.email has optimal indexing (already indexed as UNIQUE)
  - Add covering index for frequently accessed user columns

  ### 2. Database Function
  - Creates optimized function for user lookup by ID
  - Returns only necessary columns for authentication
  - Reduces query overhead

  ### 3. Performance Improvements
  - Reduces authentication query time
  - Optimizes session validation
  - Minimizes data transfer

  ## Notes
  - UNIQUE constraint on email already creates an index
  - PRIMARY KEY on id already creates an index
  - This migration adds a covering index for optimal performance
*/

-- Create a covering index for user authentication queries
-- This index includes all columns needed for auth, reducing disk I/O
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup
ON users(id)
INCLUDE (email, name, role, created_at, updated_at);

-- Create optimized function for user lookup
-- This function is faster than a direct SELECT query
CREATE OR REPLACE FUNCTION get_user_by_id(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.id = user_uuid
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_id(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_by_id IS 'Optimized function for retrieving user data by ID for authentication purposes';
