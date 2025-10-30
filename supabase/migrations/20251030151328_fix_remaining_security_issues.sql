/*
  # Fix Remaining Security and Performance Issues

  ## Summary
  Addresses remaining security and performance issues from database audit.

  ## Changes

  ### 1. Add Missing Foreign Key Indexes (9 indexes)
  - appointment_request_audit_log: appointment_request_id, changed_by
  - appointment_requests: reviewed_by
  - articles: published_by, reviewed_by
  - content_ownership: approved_by
  - data_subject_requests: processed_by
  - security_incidents: resolved_by
  - user_roles: granted_by

  ### 2. Fix RLS Policy Subquery Pattern
  Updates appointment_requests policy to use subqueries for all auth calls

  ### 3. Fix Function Search Path
  Updates all queue_email overloads with immutable search_path

  ## Manual Steps
  Enable "Leaked Password Protection" in Supabase Auth Dashboard
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointment_audit_log_request_id 
ON public.appointment_request_audit_log(appointment_request_id);

CREATE INDEX IF NOT EXISTS idx_appointment_audit_log_changed_by 
ON public.appointment_request_audit_log(changed_by)
WHERE changed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointment_requests_reviewed_by_v2 
ON public.appointment_requests(reviewed_by)
WHERE reviewed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_articles_published_by_v2 
ON public.articles(published_by)
WHERE published_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_articles_reviewed_by_v2 
ON public.articles(reviewed_by)
WHERE reviewed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_ownership_approved_by_v2 
ON public.content_ownership(approved_by)
WHERE approved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_processed_by_v2 
ON public.data_subject_requests(processed_by)
WHERE processed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_security_incidents_resolved_by_v2 
ON public.security_incidents(resolved_by)
WHERE resolved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by_v2 
ON public.user_roles(granted_by)
WHERE granted_by IS NOT NULL;

-- ============================================================================
-- 2. FIX RLS POLICY - USE SUBQUERY PATTERN
-- ============================================================================

DROP POLICY IF EXISTS "View appointment requests" ON public.appointment_requests;

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
  email = (SELECT (auth.jwt()->>'email'))
);

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.queue_email(text, text, text, text);
DROP FUNCTION IF EXISTS public.queue_email(text, text, text, text, integer);
DROP FUNCTION IF EXISTS public.queue_email(text, text, text, text, text, text, timestamp with time zone);

-- Recreate with immutable search_path

-- Overload 1: Basic 4-parameter version
CREATE FUNCTION public.queue_email(
  p_to_email text,
  p_subject text,
  p_body text,
  p_template text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_email_id uuid;
BEGIN
  INSERT INTO public.email_queue (
    recipient_email,
    subject,
    body_html,
    body_text,
    status,
    created_at
  ) VALUES (
    p_to_email,
    p_subject,
    p_body,
    p_body,
    'pending',
    now()
  )
  RETURNING id INTO v_email_id;
  
  RETURN v_email_id;
END;
$$;

-- Overload 2: 5-parameter version with priority
CREATE FUNCTION public.queue_email(
  p_recipient_email text,
  p_subject text,
  p_body_html text,
  p_body_text text,
  p_priority integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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

-- Overload 3: Full 7-parameter version with scheduling
CREATE FUNCTION public.queue_email(
  p_to_email text,
  p_subject text,
  p_html_body text,
  p_text_body text,
  p_from_email text,
  p_reply_to text,
  p_scheduled_for timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_email_id uuid;
BEGIN
  INSERT INTO public.email_queue (
    recipient_email,
    subject,
    body_html,
    body_text,
    status,
    created_at,
    scheduled_for
  ) VALUES (
    p_to_email,
    p_subject,
    p_html_body,
    p_text_body,
    'pending',
    now(),
    COALESCE(p_scheduled_for, now())
  )
  RETURNING id INTO v_email_id;
  
  RETURN v_email_id;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.queue_email(text, text, text, text) IS 
'Basic email queuing with template reference';

COMMENT ON FUNCTION public.queue_email(text, text, text, text, integer) IS 
'Email queuing with priority support';

COMMENT ON FUNCTION public.queue_email(text, text, text, text, text, text, timestamp with time zone) IS 
'Full-featured email queuing with scheduling';

-- ============================================================================
-- VERIFICATION AND NOTES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Security Fixes Applied ===';
  RAISE NOTICE '✓ Added 9 foreign key indexes for optimal performance';
  RAISE NOTICE '✓ Fixed RLS policy to use subquery pattern (prevents per-row re-evaluation)';
  RAISE NOTICE '✓ Updated 3 queue_email functions with immutable search_path';
  RAISE NOTICE '';
  RAISE NOTICE '=== Important Notes ===';
  RAISE NOTICE '• Newly created indexes show as "unused" until queries run against them';
  RAISE NOTICE '• This is normal PostgreSQL behavior - indexes will show usage over time';
  RAISE NOTICE '';
  RAISE NOTICE '=== Manual Action Required ===';
  RAISE NOTICE '→ Enable "Leaked Password Protection" in Supabase Dashboard:';
  RAISE NOTICE '  Authentication → Settings → Enable leaked password protection';
END $$;