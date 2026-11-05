/*
# Require a confirmed email before showing bookings matched by email

## Plain-English summary
Patients could previously see any booking whose patient_email matched the
email on their account. If someone registered an account using another
person's email (without proving they own it), they could see that person's
bookings. This migration only allows the email match when the account's
email address has been confirmed.

## Changes
1. New helper function `internal.current_user_email_confirmed()`
   - SECURITY DEFINER, fixed search_path.
   - Returns true when the signed-in user's `auth.users.email_confirmed_at` is set.
   - EXECUTE revoked from PUBLIC and anon; granted to authenticated.
2. Policy "Bookings view access" on `appointment_bookings` recreated:
   - Owner (user_id = auth.uid()) can still see their own bookings.
   - Email match is now case-insensitive AND requires a confirmed email.
   - Admins unchanged.

## Important notes
1. No data is changed or removed.
2. The project setting "Require users to confirm their email after signing up"
   must be ON for new accounts to start unconfirmed.
*/

CREATE SCHEMA IF NOT EXISTS internal;

CREATE OR REPLACE FUNCTION internal.current_user_email_confirmed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
  );
$$;

REVOKE EXECUTE ON FUNCTION internal.current_user_email_confirmed() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA internal TO authenticated;
GRANT EXECUTE ON FUNCTION internal.current_user_email_confirmed() TO authenticated;

DROP POLICY IF EXISTS "Bookings view access" ON public.appointment_bookings;
CREATE POLICY "Bookings view access"
ON public.appointment_bookings FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (
    lower(patient_email) = lower((SELECT auth.email()))
    AND (SELECT internal.current_user_email_confirmed())
  )
  OR internal.is_current_user_admin()
);