/*
# Lock down appointment bookings to signed-in users

## Summary
Visitors who are not signed in can no longer view or create appointment bookings.
Each booking is now linked to the account that created it, and patients only see their own bookings.

## Modified tables
1. `appointment_bookings`
   - New column `user_id` (uuid, not null, defaults to the signed-in user, references auth.users).
     The table had no rows, so adding a NOT NULL column is safe.
   - Indexes on `user_id` and `patient_email`.

## Security changes
1. `appointment_bookings`
   - All privileges revoked from `anon`.
   - `authenticated` keeps only SELECT, INSERT, UPDATE.
   - Removed "Anyone can create bookings".
   - New INSERT policy: signed-in users may only create bookings for themselves, with status 'pending',
     required fields filled in, and only for a slot that is currently open.
   - SELECT policy now: own bookings (by user_id or account email) or admins.
   - Admin/scheduler UPDATE policy unchanged.
2. `update_slot_availability()` now runs as SECURITY DEFINER so slot counts update correctly
   for patients (who cannot write to slots directly). EXECUTE revoked from PUBLIC/anon.
3. New `queue_booking_confirmation_email()` trigger (SECURITY DEFINER) queues the confirmation
   email server-side, replacing the browser insert that RLS was silently blocking.
4. `anon` loses write privileges on `appointment_slots` and `email_queue` (no policy allowed them anyway).

## Notes
1. No data is deleted.
2. Safe to re-run.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointment_bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.appointment_bookings
      ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointment_bookings_user_id ON public.appointment_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_patient_email ON public.appointment_bookings(patient_email);

ALTER TABLE public.appointment_bookings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.appointment_bookings FROM anon;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.appointment_bookings FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.appointment_bookings TO authenticated;

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.appointment_bookings;
DROP POLICY IF EXISTS "Signed-in users can create own bookings" ON public.appointment_bookings;
CREATE POLICY "Signed-in users can create own bookings"
ON public.appointment_bookings FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (select auth.uid())
  AND status = 'pending'
  AND coalesce(patient_name, '') <> ''
  AND coalesce(patient_email, '') <> ''
  AND coalesce(procedure_type, '') <> ''
  AND slot_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.appointment_slots s
    WHERE s.id = slot_id AND s.is_available AND s.slot_date >= CURRENT_DATE
  )
);

DROP POLICY IF EXISTS "Bookings view access" ON public.appointment_bookings;
CREATE POLICY "Bookings view access"
ON public.appointment_bookings FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR patient_email = (select auth.email())
  OR internal.is_current_user_admin()
);

CREATE OR REPLACE FUNCTION public.update_slot_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE appointment_slots
    SET current_bookings = current_bookings + 1,
        is_available = CASE WHEN current_bookings + 1 >= max_bookings THEN false ELSE true END
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE appointment_slots
    SET current_bookings = GREATEST(0, current_bookings - 1),
        is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.update_slot_availability() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.queue_booking_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO email_queue (to_email, subject, html_body, text_body)
  VALUES (
    NEW.patient_email,
    'Appointment request received - ' || coalesce(NEW.confirmation_code, ''),
    '<p>Thank you for requesting an appointment.</p><p>Your confirmation code is <strong>'
      || coalesce(NEW.confirmation_code, '') || '</strong>.</p><p>We will contact you shortly to confirm your visit.</p>',
    'Thank you for requesting an appointment. Your confirmation code is '
      || coalesce(NEW.confirmation_code, '') || '. We will contact you shortly to confirm your visit.'
  );
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.queue_booking_confirmation_email() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS queue_booking_confirmation_email ON public.appointment_bookings;
CREATE TRIGGER queue_booking_confirmation_email
AFTER INSERT ON public.appointment_bookings
FOR EACH ROW EXECUTE FUNCTION public.queue_booking_confirmation_email();

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.appointment_slots FROM anon;
REVOKE ALL ON public.email_queue FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.email_queue FROM authenticated;
