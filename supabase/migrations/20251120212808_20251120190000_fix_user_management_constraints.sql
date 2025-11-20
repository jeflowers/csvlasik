/*
  # Fix User Management Constraints and RBAC Integration

  This migration fixes issues preventing super_admin creation and role management:

  1. **Users Table Constraint** - Update CHECK constraint to allow all RBAC roles
  2. **Helper Functions** - Add functions for user creation with proper RBAC assignment
  3. **Password Reset** - Fix RLS policies to allow admins to reset passwords

  ## Problems Fixed:
  - ❌ users_role_check only allowed: admin, editor, viewer
  - ❌ super_admin role couldn't be assigned
  - ❌ Password reset failed with "User not allowed" error
  - ❌ Role assignment violated constraint
  
  ## Solutions:
  - ✅ Expand CHECK constraint to include all roles
  - ✅ Make role nullable (RBAC is source of truth)
  - ✅ Add user creation helper function
  - ✅ Fix RLS policies for password updates
*/

-- =====================================================
-- PART 1: FIX USERS TABLE CONSTRAINT
-- =====================================================

-- Drop the old restrictive constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint that includes all RBAC roles
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY[
  'super_admin'::text,
  'admin'::text, 
  'editor'::text,
  'author'::text,
  'moderator'::text,
  'scheduler'::text,
  'viewer'::text
]));

-- Make role nullable since RBAC is the source of truth
ALTER TABLE public.users 
ALTER COLUMN role DROP NOT NULL;

-- =====================================================
-- PART 2: ADD HELPER FUNCTION FOR USER CREATION
-- =====================================================

-- Function to create user with proper RBAC role assignment
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  p_email text,
  p_name text,
  p_password text,
  p_role_name text DEFAULT 'viewer',
  p_is_active boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
  v_auth_user_id uuid;
  v_result json;
BEGIN
  -- Validate role exists
  SELECT id INTO v_role_id
  FROM public.roles
  WHERE name = p_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Create auth user (this would normally be done via Supabase Auth API)
  -- For now, we'll create the user record directly
  v_user_id := gen_random_uuid();

  -- Insert into users table
  INSERT INTO public.users (
    id,
    email,
    name,
    password,
    role,
    is_active
  ) VALUES (
    v_user_id,
    p_email,
    p_name,
    crypt(p_password, gen_salt('bf')),
    p_role_name,
    p_is_active
  )
  RETURNING id INTO v_user_id;

  -- Assign RBAC role
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Build result
  SELECT json_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'name', p_name,
    'role', p_role_name,
    'success', true
  ) INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to update user role with proper RBAC sync
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id uuid,
  p_new_role_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id uuid;
  v_result json;
BEGIN
  -- Validate role exists
  SELECT id INTO v_role_id
  FROM public.roles
  WHERE name = p_new_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_new_role_name;
  END IF;

  -- Update legacy role column
  UPDATE public.users
  SET role = p_new_role_name,
      updated_at = now()
  WHERE id = p_user_id;

  -- Delete old role assignments
  DELETE FROM public.user_roles
  WHERE user_id = p_user_id;

  -- Assign new RBAC role
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, v_role_id);

  SELECT json_build_object(
    'user_id', p_user_id,
    'new_role', p_new_role_name,
    'success', true
  ) INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to get user's effective role (from RBAC)
CREATE OR REPLACE FUNCTION public.get_user_effective_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_name text;
BEGIN
  SELECT r.name INTO v_role_name
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  ORDER BY r.level DESC
  LIMIT 1;

  IF v_role_name IS NULL THEN
    -- Fallback to legacy role column
    SELECT role INTO v_role_name
    FROM public.users
    WHERE id = p_user_id;
  END IF;

  RETURN COALESCE(v_role_name, 'viewer');
END;
$$;

-- =====================================================
-- PART 3: FIX PASSWORD RESET RLS POLICIES
-- =====================================================

-- Allow admins to update other users' passwords
DROP POLICY IF EXISTS "Admins can update user passwords" ON public.users;
CREATE POLICY "Admins can update user passwords" ON public.users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = (SELECT auth.uid())
      AND admin_user.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = (SELECT auth.uid())
      AND admin_user.role IN ('admin', 'super_admin')
    )
  );

-- Allow users to update their own password
DROP POLICY IF EXISTS "Users can update own password" ON public.users;
CREATE POLICY "Users can update own password" ON public.users
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- PART 4: SYNC EXISTING USERS TO RBAC
-- =====================================================

-- Sync any users that don't have RBAC roles assigned
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  u.id,
  r.id
FROM public.users u
JOIN public.roles r ON r.name = u.role
LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role_id = r.id
WHERE ur.user_id IS NULL
  AND u.role IS NOT NULL
ON CONFLICT (user_id, role_id) DO NOTHING;

-- =====================================================
-- PART 5: ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_role 
  ON public.users(role) 
  WHERE role IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_is_active 
  ON public.users(is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
  ON public.user_roles(user_id, role_id);
