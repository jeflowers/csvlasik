/*
  # Fix Security and Performance Issues

  ## Summary
  Addresses security and performance issues from database audit:
  - Adds missing indexes on foreign keys for optimal query performance
  - Fixes RLS policies to use subquery pattern for better performance at scale
  - Removes unused indexes to reduce maintenance overhead
  - Consolidates multiple permissive policies
  - Fixes function search path security issue

  ## Changes

  ### 1. Missing Indexes on Foreign Keys
  Added indexes on:
  - articles.author_id
  - audit_logs.user_id
  - content_ownership.owner_id
  - media.uploaded_by
  - role_permissions.permission_id
  - security_incidents.user_id
  - user_roles.role_id

  ### 2. RLS Performance Optimization
  Updated policies to use subquery pattern (SELECT auth.uid()) instead of direct auth.uid() calls

  ### 3. Unused Index Removal
  Removed 9 unused indexes that added maintenance overhead without benefit

  ### 4. Policy Consolidation
  Merged overlapping permissive policies into single comprehensive policies

  ### 5. Function Security
  Fixed queue_email function search_path to be immutable

  ## Manual Steps Required
  Enable "Leaked Password Protection" in Supabase Auth Dashboard settings
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_author_id 
ON public.articles(author_id)
WHERE author_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON public.audit_logs(user_id)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_ownership_owner_id 
ON public.content_ownership(owner_id);

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by 
ON public.media(uploaded_by)
WHERE uploaded_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id 
ON public.role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id 
ON public.security_incidents(user_id)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id 
ON public.user_roles(role_id);

-- ============================================================================
-- 2. FIX RLS PERFORMANCE - USE SUBQUERY PATTERN
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own requests" ON public.appointment_requests;
DROP POLICY IF EXISTS "Staff can view all requests" ON public.appointment_requests;

CREATE POLICY "View appointment requests"
ON public.appointment_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name IN ('admin', 'editor')
  )
  OR
  email = (SELECT auth.jwt()->>'email')
);

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_appointment_audit_request_id;
DROP INDEX IF EXISTS public.idx_appointment_audit_changed_by;
DROP INDEX IF EXISTS public.idx_appointment_requests_reviewed_by;
DROP INDEX IF EXISTS public.idx_articles_published_by;
DROP INDEX IF EXISTS public.idx_articles_reviewed_by;
DROP INDEX IF EXISTS public.idx_content_ownership_approved_by;
DROP INDEX IF EXISTS public.idx_data_subject_requests_processed_by;
DROP INDEX IF EXISTS public.idx_security_incidents_resolved_by;
DROP INDEX IF EXISTS public.idx_user_roles_granted_by;

-- ============================================================================
-- 4. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- ============================================================================

-- Articles: status column exists
DROP POLICY IF EXISTS "Authenticated users can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;

CREATE POLICY "View articles"
ON public.articles
FOR SELECT
USING (
  (status = 'published' AND published_at <= now())
  OR
  (SELECT auth.uid()) IS NOT NULL
);

-- Content ownership
DROP POLICY IF EXISTS rbac_editors_view_all_content ON public.content_ownership;
DROP POLICY IF EXISTS rbac_users_view_own_content ON public.content_ownership;

CREATE POLICY "View content ownership"
ON public.content_ownership
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name IN ('admin', 'editor')
  )
  OR
  owner_id = (SELECT auth.uid())
);

-- Email queue
DROP POLICY IF EXISTS "Admins can view email queue" ON public.email_queue;
DROP POLICY IF EXISTS "System can manage email queue" ON public.email_queue;

CREATE POLICY "View email queue"
ON public.email_queue
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name = 'admin'
  )
);

-- Roles
DROP POLICY IF EXISTS rbac_admins_view_roles ON public.roles;
DROP POLICY IF EXISTS rbac_super_admins_manage_roles ON public.roles;

CREATE POLICY "View roles"
ON public.roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name IN ('admin', 'super_admin')
  )
);

-- Security incidents
DROP POLICY IF EXISTS rbac_admins_manage_incidents ON public.security_incidents;
DROP POLICY IF EXISTS rbac_system_log_incidents ON public.security_incidents;
DROP POLICY IF EXISTS rbac_admins_view_incidents ON public.security_incidents;

CREATE POLICY "View security incidents"
ON public.security_incidents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name = 'admin'
  )
);

CREATE POLICY "Insert security incidents"
ON public.security_incidents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name = 'admin'
  )
);

-- Testimonials: uses approved boolean column
DROP POLICY IF EXISTS "Authenticated users can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;

CREATE POLICY "View testimonials"
ON public.testimonials
FOR SELECT
USING (
  approved = true
  OR
  (SELECT auth.uid()) IS NOT NULL
);

-- User roles
DROP POLICY IF EXISTS rbac_admins_manage_user_roles ON public.user_roles;
DROP POLICY IF EXISTS rbac_admins_view_all_roles ON public.user_roles;
DROP POLICY IF EXISTS rbac_users_view_own_roles ON public.user_roles;

CREATE POLICY "View user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name = 'admin'
  )
  OR
  user_id = (SELECT auth.uid())
);

-- Users
DROP POLICY IF EXISTS "Admins can view all users via function" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.users;

CREATE POLICY "View users"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid())
    AND r.name = 'admin'
  )
  OR
  id = (SELECT auth.uid())
);

-- Videos: status column exists
DROP POLICY IF EXISTS "Authenticated users can view all videos" ON public.videos;
DROP POLICY IF EXISTS "Public can view published videos" ON public.videos;

CREATE POLICY "View videos"
ON public.videos
FOR SELECT
USING (
  status = 'published'
  OR
  (SELECT auth.uid()) IS NOT NULL
);

-- ============================================================================
-- 5. FIX FUNCTION SEARCH PATH
-- ============================================================================

CREATE OR REPLACE FUNCTION public.queue_email(
  p_recipient_email text,
  p_subject text,
  p_body_html text,
  p_body_text text DEFAULT NULL,
  p_priority int DEFAULT 5
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email_id uuid;
BEGIN
  INSERT INTO public.email_queue (
    recipient_email,
    subject,
    body_html,
    body_text,
    priority,
    status,
    created_at
  ) VALUES (
    p_recipient_email,
    p_subject,
    p_body_html,
    COALESCE(p_body_text, p_subject),
    p_priority,
    'pending',
    now()
  )
  RETURNING id INTO v_email_id;
  
  RETURN v_email_id;
END;
$$;