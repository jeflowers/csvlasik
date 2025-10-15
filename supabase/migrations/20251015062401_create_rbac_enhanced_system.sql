/*
  # Enhanced Role-Based Access Control (RBAC) System

  ## Overview
  This migration creates a comprehensive RBAC system with granular permissions,
  role hierarchies, and proper security policies. It works alongside existing
  simple role-based policies as a transition path.

  ## 1. New Tables

  ### `roles` - System roles definition
    - `id` (uuid, primary key)
    - `name` (text, unique) - super_admin, admin, editor, author, moderator, viewer
    - `description` (text)
    - `level` (integer) - Hierarchy level for role comparison
    - `created_at` (timestamptz)

  ### `permissions` - System permissions catalog
    - `id` (uuid, primary key)
    - `name` (text, unique) - Permission identifier (e.g., 'articles.create')
    - `resource` (text) - Resource type (articles, users, media, etc.)
    - `action` (text) - Action type (create, read, update, delete, publish)
    - `description` (text)

  ### `role_permissions` - Maps permissions to roles
    - `role_id` (uuid, FK to roles)
    - `permission_id` (uuid, FK to permissions)
    - Composite primary key

  ### `user_roles` - Maps roles to users
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to users)
    - `role_id` (uuid, FK to roles)
    - `granted_by` (uuid, FK to users)
    - `granted_at` (timestamptz)
    - `expires_at` (timestamptz, nullable) - For temporary assignments

  ### `content_ownership` - Tracks content creators and approvers
    - `id` (uuid, primary key)
    - `content_type` (text) - article, testimonial, media
    - `content_id` (bigint)
    - `owner_id` (uuid, FK to users)
    - `approved_by` (uuid, FK to users, nullable)
    - `approved_at` (timestamptz, nullable)

  ### `security_incidents` - Security event logging
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to users, nullable)
    - `incident_type` (text) - failed_login, unauthorized_access, etc.
    - `severity` (text) - low, medium, high, critical
    - `description` (text)
    - `ip_address` (text)
    - `user_agent` (text)
    - `resolved` (boolean)
    - `resolved_by` (uuid, FK to users, nullable)
    - `resolved_at` (timestamptz, nullable)
    - `created_at` (timestamptz)

  ## 2. Enhanced Existing Tables

  ### Users table enhancements
    - `is_active` (boolean) - Account status
    - `last_login_at` (timestamptz) - Last successful login
    - `failed_login_attempts` (integer) - Failed login counter
    - `locked_until` (timestamptz, nullable) - Account lockout
    - `mfa_enabled` (boolean) - MFA status
    - `mfa_secret` (text) - MFA secret (encrypted)

  ### Articles table enhancements
    - `published_by` (uuid, FK to users) - Who published
    - `published_at` (timestamptz) - When published
    - `reviewed_by` (uuid, FK to users) - Who reviewed
    - `reviewed_at` (timestamptz) - When reviewed

  ## 3. Helper Functions
    - `user_has_permission(user_id, permission_name)` - Permission check
    - `user_has_role(user_id, role_name)` - Role check
    - `get_user_role_level(user_id)` - Get highest role level
    - `can_manage_user(manager_id, target_user_id)` - Management check

  ## 4. Security
    - All new tables have RLS enabled
    - Existing policies remain functional
    - New permission-based policies added alongside
    - Comprehensive audit logging
*/

-- ============================================================================
-- 1. CREATE ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  level integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. CREATE PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. CREATE ROLE_PERMISSIONS JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- 4. CREATE USER_ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, role_id)
);

-- ============================================================================
-- 5. CREATE CONTENT_OWNERSHIP TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('article', 'testimonial', 'media')),
  content_id bigint NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- ============================================================================
-- 6. CREATE SECURITY_INCIDENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  incident_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  ip_address text,
  user_agent text,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. ENHANCE USERS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
    ALTER TABLE users ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
    ALTER TABLE users ADD COLUMN last_login_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'failed_login_attempts') THEN
    ALTER TABLE users ADD COLUMN failed_login_attempts integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'locked_until') THEN
    ALTER TABLE users ADD COLUMN locked_until timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mfa_enabled') THEN
    ALTER TABLE users ADD COLUMN mfa_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mfa_secret') THEN
    ALTER TABLE users ADD COLUMN mfa_secret text;
  END IF;
END $$;

-- ============================================================================
-- 8. ENHANCE ARTICLES TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'published_by') THEN
    ALTER TABLE articles ADD COLUMN published_by uuid REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'published_at') THEN
    ALTER TABLE articles ADD COLUMN published_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'reviewed_by') THEN
    ALTER TABLE articles ADD COLUMN reviewed_by uuid REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'reviewed_at') THEN
    ALTER TABLE articles ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- ============================================================================
-- 9. INSERT DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (name, description, level) VALUES
  ('super_admin', 'Full system access, can manage all users and settings', 100),
  ('admin', 'Manage content, users, and system settings (except super admins)', 80),
  ('editor', 'Create, edit, and publish content', 60),
  ('author', 'Create and edit own content', 40),
  ('moderator', 'Review and approve user submissions', 30),
  ('viewer', 'Read-only access', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 10. INSERT DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, resource, action, description) VALUES
  ('articles.create', 'articles', 'create', 'Create new articles'),
  ('articles.read.all', 'articles', 'read', 'Read all articles'),
  ('articles.read.own', 'articles', 'read', 'Read own articles'),
  ('articles.update.all', 'articles', 'update', 'Update any article'),
  ('articles.update.own', 'articles', 'update', 'Update own articles'),
  ('articles.delete.all', 'articles', 'delete', 'Delete any article'),
  ('articles.delete.own', 'articles', 'delete', 'Delete own articles'),
  ('articles.publish', 'articles', 'publish', 'Publish articles'),
  ('testimonials.create', 'testimonials', 'create', 'Create testimonials'),
  ('testimonials.read', 'testimonials', 'read', 'Read testimonials'),
  ('testimonials.update', 'testimonials', 'update', 'Update testimonials'),
  ('testimonials.delete', 'testimonials', 'delete', 'Delete testimonials'),
  ('testimonials.approve', 'testimonials', 'approve', 'Approve testimonials'),
  ('media.upload', 'media', 'create', 'Upload media files'),
  ('media.read.all', 'media', 'read', 'View all media'),
  ('media.read.own', 'media', 'read', 'View own media'),
  ('media.delete.all', 'media', 'delete', 'Delete any media'),
  ('media.delete.own', 'media', 'delete', 'Delete own media'),
  ('users.create', 'users', 'create', 'Create new users'),
  ('users.read.all', 'users', 'read', 'View all users'),
  ('users.update.all', 'users', 'update', 'Update any user'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('users.manage.roles', 'users', 'manage', 'Assign and remove roles'),
  ('system.settings', 'system', 'manage', 'Manage system settings'),
  ('system.security', 'system', 'manage', 'Manage security settings'),
  ('system.audit', 'system', 'read', 'View audit logs'),
  ('system.statistics', 'system', 'manage', 'Manage statistics')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 11. ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: Most permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.name NOT IN ('system.security')
ON CONFLICT DO NOTHING;

-- Editor: Content management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'editor'
  AND p.name IN (
    'articles.create', 'articles.read.all', 'articles.update.all', 'articles.publish',
    'media.upload', 'media.read.all', 'media.delete.own',
    'testimonials.read', 'testimonials.approve'
  )
ON CONFLICT DO NOTHING;

-- Author: Own content
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'author'
  AND p.name IN (
    'articles.create', 'articles.read.own', 'articles.update.own', 'articles.delete.own',
    'media.upload', 'media.read.own', 'media.delete.own'
  )
ON CONFLICT DO NOTHING;

-- Moderator: Review and approve
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'moderator'
  AND p.name IN (
    'testimonials.read', 'testimonials.approve', 'testimonials.update', 'testimonials.delete'
  )
ON CONFLICT DO NOTHING;

-- Viewer: Read only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'viewer'
  AND p.name IN ('articles.read.all', 'testimonials.read', 'media.read.all')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. CREATE HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_permission(p_user_id uuid, p_permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.name = p_permission_name
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_role(p_user_id uuid, p_role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND r.name = p_role_name
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role_level(p_user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(
    (SELECT MAX(r.level)
     FROM user_roles ur
     JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = p_user_id
       AND (ur.expires_at IS NULL OR ur.expires_at > now())),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_manage_user(p_manager_id uuid, p_target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN get_user_role_level(p_manager_id) > get_user_role_level(p_target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 14. CREATE RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Roles table policies
CREATE POLICY "rbac_admins_view_roles"
  ON roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "rbac_super_admins_manage_roles"
  ON roles FOR ALL
  TO authenticated
  USING (user_has_role(auth.uid(), 'super_admin'))
  WITH CHECK (user_has_role(auth.uid(), 'super_admin'));

-- Permissions table policies
CREATE POLICY "rbac_admins_view_permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  );

-- Role permissions table policies
CREATE POLICY "rbac_admins_view_role_permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  );

-- User roles table policies
CREATE POLICY "rbac_users_view_own_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "rbac_admins_view_all_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "rbac_admins_manage_user_roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
      )
      OR user_has_role(auth.uid(), 'admin')
      OR user_has_role(auth.uid(), 'super_admin')
    )
    AND can_manage_user(auth.uid(), user_id)
  )
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
      )
      OR user_has_role(auth.uid(), 'admin')
      OR user_has_role(auth.uid(), 'super_admin')
    )
    AND can_manage_user(auth.uid(), user_id)
  );

-- Content ownership policies
CREATE POLICY "rbac_users_view_own_content"
  ON content_ownership FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "rbac_editors_view_all_content"
  ON content_ownership FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
    OR user_has_permission(auth.uid(), 'articles.read.all')
  );

CREATE POLICY "rbac_create_content_ownership"
  ON content_ownership FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Security incidents policies
CREATE POLICY "rbac_admins_view_incidents"
  ON security_incidents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "rbac_system_log_incidents"
  ON security_incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "rbac_admins_manage_incidents"
  ON security_incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')
    )
    OR user_has_role(auth.uid(), 'admin')
    OR user_has_role(auth.uid(), 'super_admin')
  );

-- ============================================================================
-- 15. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_content_ownership_owner_id ON content_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_content_ownership_content ON content_ownership(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id ON security_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_resolved ON security_incidents(resolved);
CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at ON security_incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================