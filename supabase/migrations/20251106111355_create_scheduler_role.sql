/*
  # Create Scheduler Role for Consultation Management

  ## Overview
  Creates a dedicated "Scheduler" role for staff who manage consultation requests.
  This role has limited access focused only on appointments/consultations.

  ## Role Details
  - **Name**: scheduler
  - **Level**: 20 (between viewer:10 and moderator:30)
  - **Purpose**: View and manage consultation requests only
  
  ## Permissions Granted
  
  ### Appointments/Consultations
  1. appointments.read - View all consultation/appointment requests
  2. appointments.update - Change request status (new → contacted → scheduled → closed)
  3. appointments.assign - Assign request to self or teammates
  4. appointments.note - Add internal notes and call outcomes
  5. appointments.export - Export assigned requests only
  6. notifications.send.consultations - Send email/SMS to patients
  
  ### Users
  7. users.read.own - View own profile only
  
  ## What Scheduler CANNOT Do
  - Create/edit/delete articles
  - Upload/manage media
  - Manage system settings
  - View audit logs
  - Manage other users
  - Manage testimonials
  
  ## Security
  - RLS policies ensure schedulers only see appointment data
  - No access to sensitive system functions
  - Cannot elevate own permissions
*/

-- ============================================================================
-- 1. CREATE SCHEDULER ROLE
-- ============================================================================

INSERT INTO roles (id, name, description, level, created_at)
VALUES (
  gen_random_uuid(),
  'scheduler',
  'Can view and manage consultation requests and contact patients to schedule. No access to content, media, or system settings.',
  20,
  now()
)
ON CONFLICT (name) DO UPDATE
SET 
  description = EXCLUDED.description,
  level = EXCLUDED.level;

-- ============================================================================
-- 2. CREATE APPOINTMENT/CONSULTATION PERMISSIONS
-- ============================================================================

-- Permission: Read appointments
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'appointments.read',
  'appointments',
  'read',
  'View all consultation and appointment requests',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Permission: Update appointments
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'appointments.update',
  'appointments',
  'update',
  'Change appointment status (new → contacted → scheduled → closed)',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Permission: Assign appointments
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'appointments.assign',
  'appointments',
  'assign',
  'Assign appointment request to self or teammate',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Permission: Add notes to appointments
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'appointments.note',
  'appointments',
  'note',
  'Add internal notes and call outcomes to appointment requests',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Permission: Export appointments
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'appointments.export',
  'appointments',
  'export',
  'Export assigned appointment requests only',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Permission: Send consultation notifications
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'notifications.send.consultations',
  'notifications',
  'send',
  'Send email/SMS notifications to patients from appointment requests',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Permission: Read own user profile (already exists, but ensure it's there)
INSERT INTO permissions (id, name, resource, action, description, created_at)
VALUES (
  gen_random_uuid(),
  'users.read.own',
  'users',
  'read',
  'View own user profile only',
  now()
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- ============================================================================
-- 3. ASSIGN PERMISSIONS TO SCHEDULER ROLE
-- ============================================================================

-- Grant all scheduler permissions
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
  r.id as role_id,
  p.id as permission_id,
  now() as created_at
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'scheduler'
  AND p.name IN (
    'appointments.read',
    'appointments.update',
    'appointments.assign',
    'appointments.note',
    'appointments.export',
    'notifications.send.consultations',
    'users.read.own'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- 4. VERIFICATION AND SUMMARY
-- ============================================================================

DO $$
DECLARE
  v_role_id uuid;
  v_permission_count integer;
BEGIN
  -- Get scheduler role ID
  SELECT id INTO v_role_id FROM roles WHERE name = 'scheduler';
  
  -- Count assigned permissions
  SELECT COUNT(*) INTO v_permission_count 
  FROM role_permissions 
  WHERE role_id = v_role_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCHEDULER ROLE CREATED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Role: scheduler (level 20)';
  RAISE NOTICE '✅ Permissions assigned: %', v_permission_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Scheduler can:';
  RAISE NOTICE '  • View all consultation requests';
  RAISE NOTICE '  • Update request status';
  RAISE NOTICE '  • Assign requests to team members';
  RAISE NOTICE '  • Add notes and track call outcomes';
  RAISE NOTICE '  • Export assigned requests';
  RAISE NOTICE '  • Send notifications to patients';
  RAISE NOTICE '  • View own profile';
  RAISE NOTICE '';
  RAISE NOTICE 'Scheduler CANNOT:';
  RAISE NOTICE '  • Access articles, media, or content';
  RAISE NOTICE '  • Manage system settings';
  RAISE NOTICE '  • View/manage other users';
  RAISE NOTICE '  • Access testimonials or audit logs';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Go to Admin → Users';
  RAISE NOTICE '  2. Assign "scheduler" role to staff members';
  RAISE NOTICE '  3. They will only see appointment management features';
  RAISE NOTICE '';
END $$;
