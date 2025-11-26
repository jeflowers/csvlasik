/*
  # Create Superadmin Helper Function
  
  This migration creates a helper function to easily create superadmin users
  in Supabase. This function can be called directly from the SQL editor.
  
  ## What it does:
  1. Creates a helper function `create_superadmin_user`
  2. Function creates user in auth.users (if using service role key)
  3. Adds user to users table with super_admin role
  4. Assigns super_admin role in user_roles table
  
  ## Usage:
  ```sql
  SELECT create_superadmin_user(
    'admin@clearsight.com',
    'SecurePassword123!',
    'Admin User'
  );
  ```
  
  ## Note:
  If auth.users creation fails due to permissions, you can create the user
  manually in Supabase Dashboard first, then call this function with the
  email to assign roles.
*/

-- ============================================================================
-- Helper Function to Create Superadmin User
-- ============================================================================

CREATE OR REPLACE FUNCTION create_superadmin_user(
  p_email text,
  p_password text DEFAULT NULL,
  p_name text DEFAULT 'Super Administrator'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
  v_result jsonb;
BEGIN
  -- Check if user exists in auth.users by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    -- User doesn't exist in auth
    -- Note: This requires service_role permissions
    -- If this fails, create user manually in Dashboard first
    BEGIN
      -- Try to create user in auth.users
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        p_email,
        CASE 
          WHEN p_password IS NOT NULL THEN crypt(p_password, gen_salt('bf'))
          ELSE crypt('TempPassword123!', gen_salt('bf'))
        END,
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('name', p_name, 'role', 'super_admin'),
        NOW(),
        NOW(),
        '',
        ''
      ) RETURNING id INTO v_user_id;
      
      RAISE NOTICE 'Created new auth user with ID: %', v_user_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create auth user. Please create user in Supabase Dashboard first. Error: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'User already exists in auth with ID: %', v_user_id;
  END IF;
  
  -- Get super_admin role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = 'super_admin';
  
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'super_admin role not found in roles table';
  END IF;
  
  -- Insert/Update in users table
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
    v_user_id,
    p_email,
    'SUPABASE_MANAGED',
    p_name,
    'super_admin',
    true,
    false,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    name = p_name,
    is_active = true,
    updated_at = NOW();
  
  -- Assign super_admin role in user_roles
  INSERT INTO user_roles (
    user_id,
    role_id,
    granted_by,
    granted_at
  ) VALUES (
    v_user_id,
    v_role_id,
    v_user_id,
    NOW()
  )
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Return success result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'name', p_name,
    'role', 'super_admin',
    'message', 'Superadmin user created/updated successfully'
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to create superadmin user'
  );
END;
$$;

-- ============================================================================
-- Alternative Function for Existing Users
-- ============================================================================

CREATE OR REPLACE FUNCTION assign_superadmin_role(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
  v_result jsonb;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found in auth.users',
      'message', 'Please create the user in Supabase Dashboard first'
    );
  END IF;
  
  -- Get super_admin role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = 'super_admin';
  
  IF v_role_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'super_admin role not found',
      'message', 'Role system not properly initialized'
    );
  END IF;
  
  -- Update users table
  INSERT INTO users (
    id,
    email,
    password,
    name,
    role,
    is_active,
    created_at,
    updated_at
  )
  SELECT
    v_user_id,
    p_email,
    'SUPABASE_MANAGED',
    COALESCE(raw_user_meta_data->>'name', 'Super Administrator'),
    'super_admin',
    true,
    NOW(),
    NOW()
  FROM auth.users
  WHERE id = v_user_id
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    updated_at = NOW();
  
  -- Assign role
  INSERT INTO user_roles (user_id, role_id, granted_by, granted_at)
  VALUES (v_user_id, v_role_id, v_user_id, NOW())
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'role', 'super_admin',
    'message', 'Superadmin role assigned successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ============================================================================
-- Grant Execute Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION create_superadmin_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_superadmin_role(text) TO authenticated;

-- ============================================================================
-- Example Usage Instructions
-- ============================================================================

COMMENT ON FUNCTION create_superadmin_user IS 
'Creates a superadmin user. Usage: SELECT create_superadmin_user(''email@example.com'', ''password'', ''Full Name'');';

COMMENT ON FUNCTION assign_superadmin_role IS 
'Assigns superadmin role to existing user. Usage: SELECT assign_superadmin_role(''email@example.com'');';
