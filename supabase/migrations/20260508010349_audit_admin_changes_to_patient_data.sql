/*
  # Audit Admin Changes to Patient Data

  ## Summary
  Adds database triggers that write a `patient_activity_log` entry whenever a
  system admin (not the patient themselves) creates or updates a patient's
  profile or portal form data. This produces a complete, tamper-resistant
  audit trail visible on the admin dashboard.

  ## 1. New Function
    - `log_admin_patient_change()` - trigger function that:
      - Determines the acting user via `auth.uid()`
      - Skips logging when the acting user IS the patient (self-service)
      - Inserts a row into `patient_activity_log` using the patient's user_id
        so the entry shows up on their timeline
      - Records the acting admin's id and the table that changed in metadata

  ## 2. Triggers
    Attached AFTER INSERT OR UPDATE on:
      - `patient_profiles`
      - `patient_registrations`
      - `patient_medical_histories`
      - `patient_insurance_info`
      - `patient_consent_forms`

  ## 3. Security
    - The function is SECURITY DEFINER so it can write to the log regardless
      of the actor's RLS scope. It only writes for the specific patient whose
      row is being changed.
    - No new policies needed: existing policies let admins SELECT all
      activity log rows, which is how the dashboard surfaces these entries.

  ## Important Notes
    1. Self-initiated patient changes continue to be logged via the existing
       client-side `logPatientActivity()` calls. The trigger deliberately
       skips self-changes to avoid double-logging.
    2. When `auth.uid()` is NULL (e.g., service-role operation from an edge
       function), the entry is still logged with `acted_by = null` and an
       `actor: 'system'` marker.
*/

CREATE OR REPLACE FUNCTION public.log_admin_patient_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  patient_id uuid;
  actor_id uuid;
  action_type text;
  label text;
BEGIN
  actor_id := auth.uid();

  IF TG_TABLE_NAME = 'patient_profiles' THEN
    patient_id := COALESCE(NEW.id, OLD.id);
  ELSE
    patient_id := COALESCE(NEW.user_id, OLD.user_id);
  END IF;

  IF patient_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF actor_id IS NOT NULL AND actor_id = patient_id THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    action_type := 'admin_updated_form';
    label := 'Admin created ' || TG_TABLE_NAME;
  ELSE
    action_type := 'admin_updated_form';
    label := 'Admin updated ' || TG_TABLE_NAME;
  END IF;

  IF TG_TABLE_NAME = 'patient_profiles' THEN
    IF TG_OP = 'UPDATE' AND NEW.is_active = false AND COALESCE(OLD.is_active, true) = true THEN
      action_type := 'admin_deactivated';
      label := 'Admin deactivated portal account';
    ELSIF TG_OP = 'UPDATE' AND NEW.is_active = true AND COALESCE(OLD.is_active, false) = false THEN
      action_type := 'admin_reactivated';
      label := 'Admin reactivated portal account';
    ELSIF TG_OP = 'UPDATE' THEN
      action_type := 'admin_updated_profile';
      label := 'Admin updated patient profile';
    END IF;
  END IF;

  INSERT INTO public.patient_activity_log (user_id, activity_type, activity_label, metadata)
  VALUES (
    patient_id,
    action_type,
    label,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'acted_by', actor_id,
      'actor', CASE WHEN actor_id IS NULL THEN 'system' ELSE 'admin' END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_admin_patient_profiles ON public.patient_profiles;
CREATE TRIGGER audit_admin_patient_profiles
  AFTER INSERT OR UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_patient_change();

DROP TRIGGER IF EXISTS audit_admin_patient_registrations ON public.patient_registrations;
CREATE TRIGGER audit_admin_patient_registrations
  AFTER INSERT OR UPDATE ON public.patient_registrations
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_patient_change();

DROP TRIGGER IF EXISTS audit_admin_patient_medical_histories ON public.patient_medical_histories;
CREATE TRIGGER audit_admin_patient_medical_histories
  AFTER INSERT OR UPDATE ON public.patient_medical_histories
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_patient_change();

DROP TRIGGER IF EXISTS audit_admin_patient_insurance_info ON public.patient_insurance_info;
CREATE TRIGGER audit_admin_patient_insurance_info
  AFTER INSERT OR UPDATE ON public.patient_insurance_info
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_patient_change();

DROP TRIGGER IF EXISTS audit_admin_patient_consent_forms ON public.patient_consent_forms;
CREATE TRIGGER audit_admin_patient_consent_forms
  AFTER INSERT OR UPDATE ON public.patient_consent_forms
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_patient_change();
