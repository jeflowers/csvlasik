-- ============================================================================
-- CREATE SUPERADMIN USER SCRIPT
-- ============================================================================
-- This script creates a superadmin user in Supabase
--
-- IMPORTANT:
-- 1. Change the email and password before running
-- 2. Run this in the Supabase SQL Editor
-- 3. Delete this file after creating the user for security
-- ============================================================================

-- Step 1: Create the auth user in Supabase Auth
-- Replace 'superadmin@clearsight.com' and 'YourSecurePassword123!' with your desired credentials
DO $$
DECLARE
  new_user_id uuid;
  user_email text := 'superadmin@clearsight.com';
  user_password text := 'ChangeThisPassword123!';
  user_full_name text := 'Super Administrator';
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;

  IF new_user_id IS NULL THEN
    -- Create user in auth.users (Supabase Auth)
    -- Note: This requires admin privileges or service role key
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', user_full_name, 'role', 'super_admin'),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO new_user_id;

    RAISE NOTICE 'Created auth user with ID: %', new_user_id;
  ELSE
    RAISE NOTICE 'User already exists with ID: %', new_user_id;
  END IF;

  -- Step 2: Ensure super_admin role exists
  INSERT INTO roles (name, description, level)
  VALUES ('super_admin', 'Super Administrator with full system access', 1000)
  ON CONFLICT (name) DO NOTHING;

  -- Step 3: Create or update user in users table
  INSERT INTO users (
    id,
    email,
    password,
    name,
    role,
    is_active,
    mfa_enabled,
    failed_login_attempts,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    user_email,
    'SUPABASE_MANAGED',
    user_full_name,
    'super_admin',
    true,
    false,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    updated_at = NOW();

  -- Step 4: Assign super_admin role in user_roles table
  INSERT INTO user_roles (
    user_id,
    role_id,
    granted_by,
    granted_at
  )
  SELECT
    new_user_id,
    r.id,
    new_user_id,
    NOW()
  FROM roles r
  WHERE r.name = 'super_admin'
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'Superadmin user created/updated successfully!';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'IMPORTANT: Change the password immediately after first login!';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the user was created correctly

-- Check auth user
SELECT
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  raw_user_meta_data->>'role' as meta_role
FROM auth.users
WHERE email = 'superadmin@clearsight.com';

-- Check users table
SELECT
  id,
  email,
  name,
  role,
  is_active,
  created_at,
  updated_at
FROM users
WHERE email = 'superadmin@clearsight.com';

-- Check role assignment
SELECT
  u.email,
  u.name,
  r.name as role_name,
  r.level as role_level,
  ur.granted_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@clearsight.com';

-- ============================================================================
-- ALTERNATIVE: Simple method if the above doesn't work
-- ============================================================================
-- If you encounter issues with the DO block above, use Supabase dashboard:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User"
-- 3. Enter email: superadmin@clearsight.com
-- 4. Enter password: (your secure password)
-- 5. Enable "Auto Confirm User"
-- 6. Then run this SQL to set role:

/*
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'superadmin@clearsight.com';

  IF admin_user_id IS NOT NULL THEN
    -- Ensure super_admin role exists
    INSERT INTO roles (name, description, level)
    VALUES ('super_admin', 'Super Administrator with full system access', 1000)
    ON CONFLICT (name) DO NOTHING;

    -- Insert/update in users table
    INSERT INTO users (
      id,
      email,
      password,
      name,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'superadmin@clearsight.com',
      'SUPABASE_MANAGED',
      'Super Administrator',
      'super_admin',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'super_admin',
      is_active = true,
      updated_at = NOW();

    -- Assign super_admin role
    INSERT INTO user_roles (user_id, role_id, granted_by, granted_at)
    SELECT admin_user_id, r.id, admin_user_id, NOW()
    FROM roles r
    WHERE r.name = 'super_admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE 'Superadmin role assigned successfully!';
  ELSE
    RAISE EXCEPTION 'User not found. Please create the user in Supabase Dashboard first.';
  END IF;
END $$;
*/
