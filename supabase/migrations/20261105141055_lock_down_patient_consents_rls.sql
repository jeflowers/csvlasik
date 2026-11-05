/*
# Lock down patient consent forms and patient consent records

## Plain-English summary
Only signed-in, authorized people can now read or create patient consent data.
Anonymous visitors lose all access to both tables.

## Modified tables
1. `patient_consents` (photo-release style consent records, created by staff)
   - Removed the public "Anyone can create consent" rule.
   - Create / change / delete: administrators only.
   - Read: administrators, or the signed-in patient whose email matches the record.
2. `patient_consent_forms` (HIPAA / treatment consent submitted in the patient portal)
   - Read: the owning patient, the patient who owns the linked registration, or administrators.
   - Create: a patient for themselves only, and only against their own registration; or administrators.
   - Change: the owning patient (signature/acknowledgment fields only) or administrators.
   - Delete: administrators only.
   - `user_id` now defaults to the signed-in user.

## Security changes
- REVOKE ALL from `anon` and `authenticated` on both tables, then grant back to `authenticated` only
  the commands the policies allow. UPDATE on `patient_consent_forms` is column-restricted so patients
  cannot reassign ownership, registration, or status.

## Notes
1. No data is deleted or altered.
2. Indexes added on columns used by the access rules.
*/

REVOKE ALL ON public.patient_consents FROM anon, authenticated;
REVOKE ALL ON public.patient_consent_forms FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_consents TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.patient_consent_forms TO authenticated;
GRANT UPDATE (hipaa_privacy_acknowledgment, consent_to_treatment, patient_signature, signature_date, ip_address, user_agent, updated_at)
  ON public.patient_consent_forms TO authenticated;

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consent_forms ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.patient_consent_forms ALTER COLUMN user_id SET DEFAULT auth.uid();

-- patient_consents
DROP POLICY IF EXISTS "Anyone can create consent" ON public.patient_consents;
DROP POLICY IF EXISTS "Patient consents view access" ON public.patient_consents;
DROP POLICY IF EXISTS "patient_consents_select" ON public.patient_consents;
DROP POLICY IF EXISTS "patient_consents_insert_admin" ON public.patient_consents;
DROP POLICY IF EXISTS "patient_consents_update_admin" ON public.patient_consents;
DROP POLICY IF EXISTS "patient_consents_delete_admin" ON public.patient_consents;

CREATE POLICY "patient_consents_select" ON public.patient_consents FOR SELECT
  TO authenticated
  USING (internal.is_current_user_admin() OR patient_email = (select auth.email()));

CREATE POLICY "patient_consents_insert_admin" ON public.patient_consents FOR INSERT
  TO authenticated
  WITH CHECK (internal.is_current_user_admin());

CREATE POLICY "patient_consents_update_admin" ON public.patient_consents FOR UPDATE
  TO authenticated
  USING (internal.is_current_user_admin())
  WITH CHECK (internal.is_current_user_admin());

CREATE POLICY "patient_consents_delete_admin" ON public.patient_consents FOR DELETE
  TO authenticated
  USING (internal.is_current_user_admin());

-- patient_consent_forms
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'patient_consent_forms' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.patient_consent_forms', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "consent_forms_select" ON public.patient_consent_forms FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR registration_id IN (SELECT r.id FROM public.patient_registrations r WHERE r.user_id = (select auth.uid()))
    OR internal.is_current_user_admin()
  );

CREATE POLICY "consent_forms_insert" ON public.patient_consent_forms FOR INSERT
  TO authenticated
  WITH CHECK (
    internal.is_current_user_admin()
    OR (
      user_id = (select auth.uid())
      AND (
        registration_id IS NULL
        OR registration_id IN (SELECT r.id FROM public.patient_registrations r WHERE r.user_id = (select auth.uid()))
      )
    )
  );

CREATE POLICY "consent_forms_update" ON public.patient_consent_forms FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()) OR internal.is_current_user_admin())
  WITH CHECK (user_id = (select auth.uid()) OR internal.is_current_user_admin());

CREATE POLICY "consent_forms_delete_admin" ON public.patient_consent_forms FOR DELETE
  TO authenticated
  USING (internal.is_current_user_admin());

CREATE INDEX IF NOT EXISTS idx_patient_consents_patient_email ON public.patient_consents (patient_email);
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_user_id ON public.patient_consent_forms (user_id);
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_registration_id ON public.patient_consent_forms (registration_id);
