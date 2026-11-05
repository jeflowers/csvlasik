/*
# Allow visitors who are not signed in to view their consent details

1. Changes
- Grants EXECUTE on `public.get_user_consent_details(text)` to the `anon` role.

2. Why
- Visitors without an account now get a `visitor_id` cookie (set only after
  they make a consent choice). The Consent Preferences page looks up their
  consent record by that ID using this function. Previously only signed-in
  users could call it, so anonymous visitors saw an error.

3. Security notes
1. The function is SECURITY INVOKER (not definer), so it runs with the
   caller's own permissions and existing row level security still applies.
2. No new table access is granted; anon could already read the same rows
   directly through existing policies.
*/

GRANT EXECUTE ON FUNCTION public.get_user_consent_details(text) TO anon;