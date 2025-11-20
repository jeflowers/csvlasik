-- =====================================================
-- SQL SCRIPTS FOR CREATING USERS FROM BACKEND
-- =====================================================
-- These scripts allow direct user creation from the database
-- Useful for: Initial setup, emergency access, automation
-- =====================================================

-- =====================================================
-- 1. CREATE SUPER ADMIN USER
-- =====================================================

-- Replace with your desired credentials
SELECT public.create_user_with_role(
  p_email := 'superadmin@csvlasik.com',
  p_name := 'Super Administrator',
  p_password := 'ChangeMe123!',
  p_role_name := 'super_admin',
  p_is_active := true
);

-- =====================================================
-- 2. CREATE ADMIN USER
-- =====================================================

SELECT public.create_user_with_role(
  p_email := 'admin@csvlasik.com',
  p_name := 'Admin User',
  p_password := 'SecurePass123!',
  p_role_name := 'admin',
  p_is_active := true
);

-- =====================================================
-- 3. CREATE EDITOR USER
-- =====================================================

SELECT public.create_user_with_role(
  p_email := 'editor@csvlasik.com',
  p_name := 'Content Editor',
  p_password := 'EditorPass123!',
  p_role_name := 'editor',
  p_is_active := true
);

-- =====================================================
-- 4. CREATE SCHEDULER USER
-- =====================================================

SELECT public.create_user_with_role(
  p_email := 'scheduler@csvlasik.com',
  p_name := 'Appointment Scheduler',
  p_password := 'SchedulerPass123!',
  p_role_name := 'scheduler',
  p_is_active := true
);

-- =====================================================
-- 5. CREATE VIEWER USER (READ-ONLY)
-- =====================================================

SELECT public.create_user_with_role(
  p_email := 'viewer@csvlasik.com',
  p_name := 'Read Only User',
  p_password := 'ViewerPass123!',
  p_role_name := 'viewer',
  p_is_active := true
);

-- =====================================================
-- UPGRADE EXISTING USER TO SUPER ADMIN
-- =====================================================

-- Find user by email and upgrade to super_admin
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM public.users
  WHERE email = 'admin@csvlasik.com'; -- Change this email

  IF v_user_id IS NOT NULL THEN
    -- Upgrade to super_admin
    PERFORM public.update_user_role(v_user_id, 'super_admin');
    RAISE NOTICE 'User upgraded to super_admin successfully';
  ELSE
    RAISE NOTICE 'User not found';
  END IF;
END $$;

-- =====================================================
-- UPDATE USER PASSWORD
-- =====================================================

-- Update password for a specific user
UPDATE public.users
SET password = crypt('NewPassword123!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@csvlasik.com'; -- Change this email

-- =====================================================
-- LIST ALL USERS WITH THEIR ROLES
-- =====================================================

SELECT
  u.id,
  u.email,
  u.name,
  u.role as legacy_role,
  r.name as rbac_role,
  r.level as role_level,
  u.is_active,
  u.created_at,
  u.last_login_at
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
ORDER BY r.level DESC NULLS LAST, u.email;

-- =====================================================
-- AVAILABLE ROLES AND THEIR PERMISSIONS
-- =====================================================

SELECT
  name,
  description,
  level,
  CASE
    WHEN level >= 100 THEN 'Full system access'
    WHEN level >= 80 THEN 'Admin access (except super admins)'
    WHEN level >= 60 THEN 'Content management'
    WHEN level >= 40 THEN 'Content creation'
    WHEN level >= 20 THEN 'Scheduling access'
    ELSE 'Read-only'
  END as access_level
FROM public.roles
ORDER BY level DESC;

-- =====================================================
-- CHECK USER PERMISSIONS
-- =====================================================

-- Check what role a user has
SELECT public.get_user_effective_role(
  (SELECT id FROM public.users WHERE email = 'admin@csvlasik.com')
);

-- =====================================================
-- DEACTIVATE USER (DON'T DELETE)
-- =====================================================

UPDATE public.users
SET is_active = false,
    updated_at = now()
WHERE email = 'user@csvlasik.com'; -- Change this email

-- =====================================================
-- REACTIVATE USER
-- =====================================================

UPDATE public.users
SET is_active = true,
    updated_at = now()
WHERE email = 'user@csvlasik.com'; -- Change this email

-- =====================================================
-- DELETE USER (PERMANENT - USE WITH CAUTION)
-- =====================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM public.users
  WHERE email = 'user@csvlasik.com'; -- Change this email

  IF v_user_id IS NOT NULL THEN
    -- Delete from RBAC
    DELETE FROM public.user_roles WHERE user_id = v_user_id;

    -- Delete user record
    DELETE FROM public.users WHERE id = v_user_id;

    RAISE NOTICE 'User deleted successfully';
  ELSE
    RAISE NOTICE 'User not found';
  END IF;
END $$;

-- =====================================================
-- BULK CREATE USERS FROM CSV
-- =====================================================

-- Example: Create multiple users at once
DO $$
DECLARE
  v_result json;
BEGIN
  -- User 1
  SELECT public.create_user_with_role(
    'user1@example.com',
    'User One',
    'Password123!',
    'viewer'
  ) INTO v_result;
  RAISE NOTICE 'User 1: %', v_result;

  -- User 2
  SELECT public.create_user_with_role(
    'user2@example.com',
    'User Two',
    'Password123!',
    'editor'
  ) INTO v_result;
  RAISE NOTICE 'User 2: %', v_result;

  -- Add more users as needed
END $$;

-- =====================================================
-- RESET FAILED LOGIN ATTEMPTS
-- =====================================================

UPDATE public.users
SET failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = now()
WHERE email = 'user@csvlasik.com'; -- Change this email

-- =====================================================
-- FIND USERS BY ROLE
-- =====================================================

-- Find all super admins
SELECT u.email, u.name, u.is_active, u.last_login_at
FROM public.users u
JOIN public.user_roles ur ON ur.user_id = u.id
JOIN public.roles r ON r.id = ur.role_id
WHERE r.name = 'super_admin'
ORDER BY u.email;

-- Find all admins (including super admins)
SELECT u.email, u.name, r.name as role, u.is_active
FROM public.users u
JOIN public.user_roles ur ON ur.user_id = u.id
JOIN public.roles r ON r.id = ur.role_id
WHERE r.level >= 80
ORDER BY r.level DESC, u.email;

-- =====================================================
-- AUDIT: CHECK FOR USERS WITHOUT RBAC ROLES
-- =====================================================

SELECT
  u.id,
  u.email,
  u.name,
  u.role as legacy_role,
  'MISSING RBAC ASSIGNMENT' as issue
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.user_id IS NULL
ORDER BY u.email;

-- =====================================================
-- FIX: ASSIGN RBAC ROLES TO USERS WITHOUT THEM
-- =====================================================

INSERT INTO public.user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM public.users u
JOIN public.roles r ON r.name = u.role
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.user_id IS NULL
  AND u.role IS NOT NULL
ON CONFLICT (user_id, role_id) DO NOTHING;
