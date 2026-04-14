/*
  # Tighten Patient Forms RLS for Patient Portal

  ## Overview
  Updates RLS policies on patient forms tables to require authentication.
  Previously, anonymous users could insert records. Now only authenticated
  patients can submit forms, and their user_id is enforced.

  ## Changes

  1. **patient_registrations**
     - Remove anonymous insert policy
     - Add authenticated-only insert policy requiring user_id = auth.uid()

  2. **patient_medical_histories**
     - Remove anonymous insert policy
     - Add authenticated-only insert policy requiring user_id = auth.uid()

  3. **patient_insurance_info**
     - Remove anonymous insert policy
     - Add authenticated-only insert policy requiring user_id = auth.uid()

  4. **patient_consent_forms**
     - Remove anonymous insert policy
     - Add authenticated-only insert policy requiring user_id = auth.uid()

  ## Security
  - All inserts now require authenticated user
  - user_id must match the authenticated user's ID
  - This ensures HIPAA-compliant data ownership
*/

-- =====================================================
-- patient_registrations: tighten insert policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can submit registration" ON public.patient_registrations;

CREATE POLICY "Authenticated patients can submit registration"
  ON public.patient_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- patient_medical_histories: tighten insert policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can submit medical history" ON public.patient_medical_histories;

CREATE POLICY "Authenticated patients can submit medical history"
  ON public.patient_medical_histories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- patient_insurance_info: tighten insert policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can submit insurance info" ON public.patient_insurance_info;

CREATE POLICY "Authenticated patients can submit insurance info"
  ON public.patient_insurance_info
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- patient_consent_forms: tighten insert policy
-- =====================================================

DROP POLICY IF EXISTS "Anyone can submit consent forms" ON public.patient_consent_forms;

CREATE POLICY "Authenticated patients can submit consent forms"
  ON public.patient_consent_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
