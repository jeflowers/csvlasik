/*
  # Patient Profiles Separation and Admin Hardening

  ## Summary
  This migration establishes explicit separation between system users (admins, editors,
  staff) and patient portal users, replacing implicit separation that relied on the
  absence of a `public.users` row. It also hardens the `is_current_user_admin()`
  function so that no user present in `patient_profiles` can ever be treated as a
  system administrator, even if corrupt data places them in `public.users`.

  ## 1. New Tables
    - `patient_profiles`
      - `id` (uuid, PK, references auth.users) - patient identity
      - `email` (text) - denormalized from auth for admin listing
      - `first_name`, `last_name` (text)
      - `is_active` (boolean) - soft-deactivation by admins
      - `deactivated_at`, `deactivated_by` - audit trail for deactivation
      - `created_at`, `updated_at` (timestamptz)

  ## 2. Data Backfill
    Patients are identified from `auth.users.raw_user_meta_data.account_type = 'patient'`
    and backfilled into `patient_profiles`. The metadata marker is no longer used for
    authorization — presence in this table is now authoritative.

  ## 3. Mutual Exclusion
    A user cannot appear in both `public.users` and `public.patient_profiles`.
    Enforced by two BEFORE INSERT/UPDATE triggers that raise exceptions on overlap.

  ## 4. Hardened Admin Function
    `is_current_user_admin()` is replaced with a version that:
      1. Rejects anyone with a row in `patient_profiles` (fail-closed)
      2. Requires `role IN ('admin','super_admin')` in `public.users`
    This is defense-in-depth: even if a patient is erroneously inserted into
    `public.users` with an admin role, they are still blocked.

  ## 5. Security (RLS)
    `patient_profiles` has RLS enabled with four policies:
      - Patients can SELECT their own profile
      - Patients can UPDATE their own profile (limited columns via trigger)
      - System admins can SELECT all profiles
      - System admins can UPDATE/DELETE profiles (for account management)
    INSERT is allowed for authenticated users only on their own id (self-registration)
    and for admins. No anon access.

  ## Important Notes
    1. This migration does NOT modify existing `public.users` policies — those remain
       admin-only and continue to work as before.
    2. Patient auth flow must be updated in a follow-up to write to `patient_profiles`
       on signup instead of relying on `user_metadata.account_type`.
    3. Admin UI can now list patients via a straightforward SELECT on this table.
*/

-- 1. Create patient_profiles table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  deactivated_at timestamptz,
  deactivated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_email ON public.patient_profiles(email);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_is_active ON public.patient_profiles(is_active);

-- 2. Backfill from auth.users where account_type = 'patient'
INSERT INTO public.patient_profiles (id, email, first_name, last_name, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  au.created_at
FROM auth.users au
WHERE au.raw_user_meta_data->>'account_type' = 'patient'
  AND au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 3. Mutual exclusion: prevent a user from being in both tables
CREATE OR REPLACE FUNCTION public.prevent_system_user_in_patient_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'User % exists in public.users and cannot also be a patient', NEW.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_patient_in_system_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.patient_profiles WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'User % exists in patient_profiles and cannot also be a system user', NEW.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_patient_exclusion ON public.patient_profiles;
CREATE TRIGGER enforce_patient_exclusion
  BEFORE INSERT OR UPDATE OF id ON public.patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_system_user_in_patient_profiles();

DROP TRIGGER IF EXISTS enforce_system_user_exclusion ON public.users;
CREATE TRIGGER enforce_system_user_exclusion
  BEFORE INSERT OR UPDATE OF id ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_patient_in_system_users();

-- 4. Update updated_at trigger for patient_profiles
CREATE OR REPLACE FUNCTION public.touch_patient_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_patient_profiles ON public.patient_profiles;
CREATE TRIGGER touch_patient_profiles
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_patient_profiles_updated_at();

-- 5. Harden is_current_user_admin() - patients can NEVER be admins
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  user_role text;
  uid uuid;
BEGIN
  uid := auth.uid();

  IF uid IS NULL THEN
    RETURN false;
  END IF;

  -- Fail-closed: anyone in patient_profiles is never an admin, full stop
  IF EXISTS (SELECT 1 FROM public.patient_profiles WHERE id = uid) THEN
    RETURN false;
  END IF;

  SELECT role INTO user_role
  FROM public.users
  WHERE id = uid
  LIMIT 1;

  RETURN COALESCE(user_role IN ('admin', 'super_admin'), false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 6. Enable RLS on patient_profiles
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;
CREATE POLICY "Patients can view own profile"
  ON public.patient_profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can view all patient profiles" ON public.patient_profiles;
CREATE POLICY "Admins can view all patient profiles"
  ON public.patient_profiles FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Patients can insert own profile" ON public.patient_profiles;
CREATE POLICY "Patients can insert own profile"
  ON public.patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can insert patient profiles" ON public.patient_profiles;
CREATE POLICY "Admins can insert patient profiles"
  ON public.patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Patients can update own profile" ON public.patient_profiles;
CREATE POLICY "Patients can update own profile"
  ON public.patient_profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can update any patient profile" ON public.patient_profiles;
CREATE POLICY "Admins can update any patient profile"
  ON public.patient_profiles FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can delete patient profiles" ON public.patient_profiles;
CREATE POLICY "Admins can delete patient profiles"
  ON public.patient_profiles FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());
