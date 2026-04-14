/*
  # Fix RLS auth performance and queue_email search path

  ## Overview
  Fixes two categories of security/performance issues:
  1. RLS policies on patient forms tables that call auth.uid() without subselect wrapping,
     causing the function to be re-evaluated for every row instead of once per query.
  2. The queue_email function has a mutable search_path, which is a security concern
     for SECURITY DEFINER functions.

  ## Modified Tables
  - `patient_registrations` - 3 policies recreated with (select auth.uid())
  - `patient_medical_histories` - 3 policies recreated with (select auth.uid())
  - `patient_insurance_info` - 3 policies recreated with (select auth.uid())
  - `patient_consent_forms` - 2 policies recreated with (select auth.uid())

  ## Modified Functions
  - `queue_email` - search_path set to 'public' for security

  ## Security Notes
  1. All policy logic remains identical - only auth.uid() calls are wrapped in (select ...)
  2. This is a Supabase-recommended optimization pattern
  3. The queue_email function retains SECURITY DEFINER but now has an immutable search_path
*/

-- ============================================================
-- patient_registrations: 3 policies
-- ============================================================

DROP POLICY IF EXISTS "Authenticated patients can submit registration" ON public.patient_registrations;
CREATE POLICY "Authenticated patients can submit registration"
  ON public.patient_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own registrations" ON public.patient_registrations;
CREATE POLICY "Users can update own registrations"
  ON public.patient_registrations
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own registrations" ON public.patient_registrations;
CREATE POLICY "Users can view own registrations"
  ON public.patient_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- patient_medical_histories: 3 policies
-- ============================================================

DROP POLICY IF EXISTS "Authenticated patients can submit medical history" ON public.patient_medical_histories;
CREATE POLICY "Authenticated patients can submit medical history"
  ON public.patient_medical_histories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own medical histories" ON public.patient_medical_histories;
CREATE POLICY "Users can update own medical histories"
  ON public.patient_medical_histories
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own medical histories" ON public.patient_medical_histories;
CREATE POLICY "Users can view own medical histories"
  ON public.patient_medical_histories
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- patient_insurance_info: 3 policies
-- ============================================================

DROP POLICY IF EXISTS "Authenticated patients can submit insurance info" ON public.patient_insurance_info;
CREATE POLICY "Authenticated patients can submit insurance info"
  ON public.patient_insurance_info
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own insurance info" ON public.patient_insurance_info;
CREATE POLICY "Users can update own insurance info"
  ON public.patient_insurance_info
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own insurance info" ON public.patient_insurance_info;
CREATE POLICY "Users can view own insurance info"
  ON public.patient_insurance_info
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- patient_consent_forms: 2 policies
-- ============================================================

DROP POLICY IF EXISTS "Authenticated patients can submit consent forms" ON public.patient_consent_forms;
CREATE POLICY "Authenticated patients can submit consent forms"
  ON public.patient_consent_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own consent forms" ON public.patient_consent_forms;
CREATE POLICY "Users can view own consent forms"
  ON public.patient_consent_forms
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (
      SELECT id FROM public.patient_registrations
      WHERE patient_registrations.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- Fix queue_email mutable search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.queue_email(
  p_to_email text,
  p_subject text,
  p_html_body text,
  p_text_body text DEFAULT NULL::text,
  p_from_email text DEFAULT NULL::text,
  p_reply_to text DEFAULT NULL::text,
  p_scheduled_for timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_email_id uuid;
BEGIN
  INSERT INTO public.email_queue (
    to_email,
    from_email,
    subject,
    html_body,
    text_body,
    reply_to,
    status,
    scheduled_for,
    created_at
  ) VALUES (
    p_to_email,
    p_from_email,
    p_subject,
    p_html_body,
    COALESCE(p_text_body, p_subject),
    p_reply_to,
    'pending',
    COALESCE(p_scheduled_for, now()),
    now()
  )
  RETURNING id INTO v_email_id;

  RETURN v_email_id;
END;
$function$;
