/*
  # Restore is_current_user_admin to SECURITY DEFINER

  1. Problem
    - Migration 20260513024508 converted is_current_user_admin() to SECURITY INVOKER
    - The function queries public.users to check the caller's role
    - The users RLS SELECT policy calls is_current_user_admin() → infinite recursion
    - The EXCEPTION WHEN OTHERS handler swallows the error and returns false
    - Result: admins see zero staff users in the User Management screen

  2. Fix
    - Restore SECURITY DEFINER so the function bypasses RLS when reading users/patient_profiles
    - Keep restricted EXECUTE grant (authenticated only) for safety
    - Keep pinned search_path to prevent search-path attacks

  3. Notes
    - patient_profiles queries inside the function also need RLS bypass
    - The function was originally SECURITY DEFINER by design
*/

ALTER FUNCTION public.is_current_user_admin() SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
