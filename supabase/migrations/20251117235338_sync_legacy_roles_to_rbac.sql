/*
  # Sync Legacy User Roles to RBAC System

  1. Purpose
    - Migrate existing users from legacy `users.role` field to new RBAC `user_roles` table
    - Assign appropriate roles based on legacy role values
    - Ensure all existing users have proper role assignments

  2. Changes
    - Insert role assignments for all users with legacy roles
    - Map legacy roles to RBAC roles:
      - 'admin' → 'admin' role
      - 'super_admin' → 'super_admin' role
      - 'editor' → 'editor' role
      - 'author' → 'author' role
      - 'moderator' → 'moderator' role
      - 'scheduler' → 'scheduler' role
      - 'viewer' → 'viewer' role
      - NULL or other → 'viewer' role (default)

  3. Safety
    - Only creates assignments if they don't already exist
    - Uses system as granter (no specific user)
    - Sets no expiration date (permanent assignments)
*/

-- Sync users with legacy 'admin' role
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE u.role = 'admin'
  AND r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Sync users with legacy 'super_admin' role
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE u.role = 'super_admin'
  AND r.name = 'super_admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Sync users with legacy 'editor' role
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE u.role = 'editor'
  AND r.name = 'editor'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Sync users with legacy 'author' role
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE u.role = 'author'
  AND r.name = 'author'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Sync users with legacy 'moderator' role
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE u.role = 'moderator'
  AND r.name = 'moderator'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Sync users with legacy 'scheduler' role
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE u.role = 'scheduler'
  AND r.name = 'scheduler'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Sync users with no role or unknown role → assign 'viewer' as default
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT DISTINCT
  u.id,
  r.id,
  NOW()
FROM users u
CROSS JOIN roles r
WHERE (u.role IS NULL OR u.role NOT IN ('admin', 'super_admin', 'editor', 'author', 'moderator', 'scheduler', 'viewer'))
  AND r.name = 'viewer'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
  );

-- Create function to automatically sync new users
CREATE OR REPLACE FUNCTION sync_user_legacy_role_to_rbac()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is created or their role is updated, sync to user_roles
  IF NEW.role IS NOT NULL THEN
    -- Delete existing role assignments for this user
    DELETE FROM user_roles WHERE user_id = NEW.id;
    
    -- Insert new role assignment based on legacy role
    INSERT INTO user_roles (user_id, role_id, granted_at)
    SELECT
      NEW.id,
      r.id,
      NOW()
    FROM roles r
    WHERE r.name = NEW.role
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync legacy roles
DROP TRIGGER IF EXISTS sync_legacy_role_trigger ON users;
CREATE TRIGGER sync_legacy_role_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_legacy_role_to_rbac();

-- Verify the sync worked
DO $$
DECLARE
  user_count INTEGER;
  assignment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO assignment_count FROM user_roles;
  
  RAISE NOTICE 'Migration complete: % users now have % role assignments', user_count, assignment_count;
END $$;
