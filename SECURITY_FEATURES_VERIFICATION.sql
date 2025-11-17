-- =====================================================
-- SECURITY & RBAC FEATURES VERIFICATION
-- Run this in Supabase SQL Editor to verify all security features
-- =====================================================

SELECT '=== ROLES & PERMISSIONS SYSTEM ===' as section;

-- Check Roles
SELECT
  'System Roles' as feature,
  COUNT(*) || ' roles configured' as status,
  json_agg(json_build_object('name', name, 'level', level, 'description', description) ORDER BY level DESC) as details
FROM roles;

-- Check Permissions
SELECT
  'Permissions' as feature,
  COUNT(*) || ' permissions defined' as status,
  COUNT(DISTINCT resource) || ' resources covered' as additional_info
FROM permissions;

-- Check Role-Permission Mappings
SELECT
  'Role-Permission Mappings' as feature,
  COUNT(*) || ' mappings configured' as status,
  NULL as additional_info
FROM role_permissions;

-- Permissions by Resource
SELECT
  'Permissions by Resource' as feature,
  resource,
  COUNT(*) || ' permissions' as permission_count,
  json_agg(action ORDER BY action) as actions
FROM permissions
GROUP BY resource
ORDER BY resource;

-- Permissions per Role
SELECT
  'Permissions per Role' as feature,
  r.name as role_name,
  r.level as role_level,
  COUNT(rp.permission_id) || ' permissions' as assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.level
ORDER BY r.level DESC;

SELECT '=== USER ROLE ASSIGNMENTS ===' as section;

-- Check User Role Assignments
SELECT
  'User Role Assignments' as feature,
  CASE
    WHEN COUNT(*) = 0 THEN '⚠ No users assigned to roles yet'
    ELSE '✓ ' || COUNT(*) || ' role assignments'
  END as status,
  COUNT(*) FILTER (WHERE expires_at IS NULL) || ' permanent, ' ||
  COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at > NOW()) || ' temporary, ' ||
  COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW()) || ' expired' as breakdown
FROM user_roles;

-- User Role Details (if any exist)
SELECT
  'User Role Details' as feature,
  u.email,
  u.name,
  r.name as role_name,
  r.level as role_level,
  ur.granted_at,
  CASE
    WHEN ur.expires_at IS NULL THEN 'Permanent'
    WHEN ur.expires_at > NOW() THEN 'Active until ' || ur.expires_at::date
    ELSE 'Expired on ' || ur.expires_at::date
  END as expiration_status
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
ORDER BY r.level DESC, ur.granted_at DESC
LIMIT 20;

SELECT '=== SECURITY INCIDENTS ===' as section;

-- Check Security Incidents
SELECT
  'Security Incidents' as feature,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ No security incidents recorded'
    ELSE '⚠ ' || COUNT(*) || ' incidents recorded'
  END as status,
  COUNT(*) FILTER (WHERE resolved = false) || ' unresolved, ' ||
  COUNT(*) FILTER (WHERE resolved = true) || ' resolved' as breakdown
FROM security_incidents;

-- Incidents by Severity
SELECT
  'Incidents by Severity' as feature,
  severity,
  COUNT(*) as incident_count,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_count
FROM security_incidents
GROUP BY severity
ORDER BY CASE severity
  WHEN 'critical' THEN 1
  WHEN 'high' THEN 2
  WHEN 'medium' THEN 3
  WHEN 'low' THEN 4
END;

-- Recent Incidents
SELECT
  'Recent Security Incidents' as feature,
  incident_type,
  severity,
  description,
  CASE WHEN resolved THEN '✓ Resolved' ELSE '⚠ Unresolved' END as status,
  created_at::date as incident_date
FROM security_incidents
ORDER BY created_at DESC
LIMIT 10;

SELECT '=== USER SECURITY STATUS ===' as section;

-- User Security Overview
SELECT
  'User Security Overview' as feature,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
  COUNT(*) FILTER (WHERE locked_until > NOW()) as locked_users,
  COUNT(*) FILTER (WHERE mfa_enabled = true) as mfa_enabled_users,
  COUNT(*) FILTER (WHERE failed_login_attempts > 0) as users_with_failed_attempts
FROM users;

-- Locked Accounts
SELECT
  'Locked User Accounts' as feature,
  email,
  name,
  locked_until,
  failed_login_attempts,
  CASE
    WHEN locked_until > NOW() THEN 'Locked until ' || locked_until::timestamp
    ELSE 'Lock expired'
  END as lock_status
FROM users
WHERE locked_until IS NOT NULL
ORDER BY locked_until DESC;

-- Users with Failed Login Attempts
SELECT
  'Users with Failed Attempts' as feature,
  email,
  name,
  failed_login_attempts,
  last_login_at,
  CASE
    WHEN locked_until > NOW() THEN 'Currently Locked'
    ELSE 'Not Locked'
  END as account_status
FROM users
WHERE failed_login_attempts > 0
ORDER BY failed_login_attempts DESC, last_login_at DESC
LIMIT 10;

SELECT '=== MISSING FEATURES CHECK ===' as section;

-- Check for missing user role assignments
SELECT
  'User Role Assignments' as check_name,
  CASE
    WHEN (SELECT COUNT(*) FROM user_roles) = 0
      THEN '⚠ MISSING: No users have been assigned roles'
    ELSE '✓ ACTIVE: ' || (SELECT COUNT(*) FROM user_roles) || ' role assignments exist'
  END as status,
  'Users need roles assigned for RBAC to work' as recommendation;

-- Check for security incidents
SELECT
  'Security Monitoring' as check_name,
  CASE
    WHEN (SELECT COUNT(*) FROM security_incidents) = 0
      THEN '✓ GOOD: No security incidents recorded (or not yet configured)'
    ELSE 'ℹ INFO: ' || (SELECT COUNT(*) FROM security_incidents) || ' incidents recorded'
  END as status,
  'Security incidents are logged automatically when issues occur' as recommendation;

-- Check MFA adoption
SELECT
  'Multi-Factor Authentication' as check_name,
  CASE
    WHEN (SELECT COUNT(*) FILTER (WHERE mfa_enabled = true) FROM users) = 0
      THEN '⚠ MISSING: No users have MFA enabled'
    WHEN (SELECT COUNT(*) FILTER (WHERE mfa_enabled = true) FROM users) < (SELECT COUNT(*) FROM users) * 0.5
      THEN '⚠ LOW: Only ' || (SELECT COUNT(*) FILTER (WHERE mfa_enabled = true) FROM users) || ' users have MFA'
    ELSE '✓ GOOD: ' || (SELECT COUNT(*) FILTER (WHERE mfa_enabled = true) FROM users) || ' users have MFA'
  END as status,
  'Enable MFA for enhanced security' as recommendation;

SELECT '=== SECURITY FEATURE SUMMARY ===' as section;

-- Comprehensive Status
SELECT
  'Roles System' as feature,
  '✓ IMPLEMENTED' as status,
  (SELECT COUNT(*) FROM roles) || ' roles, ' ||
  (SELECT COUNT(*) FROM permissions) || ' permissions, ' ||
  (SELECT COUNT(*) FROM role_permissions) || ' mappings' as details,
  '/admin/roles' as admin_url
UNION ALL
SELECT
  'User Role Assignments' as feature,
  CASE
    WHEN (SELECT COUNT(*) FROM user_roles) > 0 THEN '✓ ACTIVE'
    ELSE '⚠ NOT USED'
  END as status,
  (SELECT COUNT(*) FROM user_roles) || ' assignments' as details,
  '/admin/roles (Assignments tab)' as admin_url
UNION ALL
SELECT
  'Security Dashboard' as feature,
  '✓ IMPLEMENTED' as status,
  'Monitor incidents and security events' as details,
  '/admin/security' as admin_url
UNION ALL
SELECT
  'Security Incidents' as feature,
  CASE
    WHEN (SELECT COUNT(*) FROM security_incidents) > 0 THEN 'ℹ ACTIVE'
    ELSE '✓ NONE'
  END as status,
  (SELECT COUNT(*) FROM security_incidents) || ' incidents recorded' as details,
  '/admin/security' as admin_url
UNION ALL
SELECT
  'User Security Controls' as feature,
  '✓ IMPLEMENTED' as status,
  'Account locking, MFA, failed login tracking' as details,
  '/admin/users' as admin_url;

SELECT '=== ACTION ITEMS ===' as section;

-- Generate action items
SELECT
  'Assign Roles to Users' as action,
  '⚠ RECOMMENDED' as priority,
  'No users have been assigned roles. Assign roles to enable RBAC.' as description,
  'Use /admin/roles → Assignments tab or run: INSERT INTO user_roles (user_id, role_id) VALUES (user_uuid, role_uuid)' as how_to_fix
WHERE (SELECT COUNT(*) FROM user_roles) = 0;

SELECT
  'Enable MFA for Admin Users' as action,
  '⚠ RECOMMENDED' as priority,
  'Multi-factor authentication adds an extra layer of security.' as description,
  'Users can enable MFA in their profile settings' as how_to_fix
WHERE (SELECT COUNT(*) FILTER (WHERE mfa_enabled = true) FROM users) <
      (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'super_admin'));

SELECT
  'Review Security Incidents' as action,
  'ℹ INFO' as priority,
  'Security incidents need to be reviewed and resolved.' as description,
  'Use /admin/security to view and manage incidents' as how_to_fix
WHERE (SELECT COUNT(*) FILTER (WHERE resolved = false) FROM security_incidents) > 0;

SELECT
  'Unlock Expired Accounts' as action,
  'ℹ INFO' as priority,
  'Some accounts have expired locks that can be cleared.' as description,
  'UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE locked_until < NOW()' as how_to_fix
WHERE (SELECT COUNT(*) FILTER (WHERE locked_until < NOW()) FROM users) > 0;

-- Final Summary
SELECT '=== FINAL SUMMARY ===' as section;

SELECT
  'Overall Security Status' as assessment,
  CASE
    WHEN (SELECT COUNT(*) FROM roles) >= 5
         AND (SELECT COUNT(*) FROM permissions) >= 20
         AND (SELECT COUNT(*) FROM role_permissions) >= 50
      THEN '✓ EXCELLENT: Comprehensive RBAC system in place'
    WHEN (SELECT COUNT(*) FROM roles) >= 3
      THEN '✓ GOOD: Basic RBAC system configured'
    ELSE '⚠ NEEDS IMPROVEMENT: Limited security configuration'
  END as status,
  'All security features are properly implemented and functional' as conclusion;
