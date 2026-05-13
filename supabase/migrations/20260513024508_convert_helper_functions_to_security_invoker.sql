-- Convert remaining REST-callable helper functions from SECURITY DEFINER
-- to SECURITY INVOKER. These read either public-facing data (privacy
-- policy, consent version), the caller's own data (notifications,
-- consents, role, retention exemptions), or data already covered by
-- ownership-aware RLS (users, user_roles, roles, role_permissions,
-- consultation_requests dedup window). Running them as INVOKER silences
-- the advisor and makes underlying RLS the single source of truth.

ALTER FUNCTION public.check_duplicate_submission(text, text, text)        SECURITY INVOKER;
ALTER FUNCTION public.get_current_consent_version()                       SECURITY INVOKER;
ALTER FUNCTION public.get_current_privacy_policy(text)                    SECURITY INVOKER;
ALTER FUNCTION public.get_public_url(text, text)                          SECURITY INVOKER;
ALTER FUNCTION public.get_unread_notification_count(uuid)                 SECURITY INVOKER;
ALTER FUNCTION public.get_user_consent_details(text)                      SECURITY INVOKER;
ALTER FUNCTION public.get_user_effective_role(uuid)                       SECURITY INVOKER;
ALTER FUNCTION public.get_user_role_level(uuid)                           SECURITY INVOKER;
ALTER FUNCTION public.has_retention_exemption(text, bigint)               SECURITY INVOKER;
ALTER FUNCTION public.has_user_acknowledged_current_policy(text)          SECURITY INVOKER;
ALTER FUNCTION public.is_current_user_admin()                             SECURITY INVOKER;
ALTER FUNCTION public.is_staff_user()                                     SECURITY INVOKER;
ALTER FUNCTION public.user_has_permission(uuid, text)                     SECURITY INVOKER;
ALTER FUNCTION public.user_has_role(uuid, text)                           SECURITY INVOKER;

-- Pin search_path so identifier resolution doesn't depend on the
-- caller's session settings now that these run as INVOKER.
ALTER FUNCTION public.check_duplicate_submission(text, text, text)        SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_consent_version()                       SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_privacy_policy(text)                    SET search_path = public, pg_temp;
ALTER FUNCTION public.get_public_url(text, text)                          SET search_path = public, pg_temp;
ALTER FUNCTION public.get_unread_notification_count(uuid)                 SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_consent_details(text)                      SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_effective_role(uuid)                       SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_role_level(uuid)                           SET search_path = public, pg_temp;
ALTER FUNCTION public.has_retention_exemption(text, bigint)               SET search_path = public, pg_temp;
ALTER FUNCTION public.has_user_acknowledged_current_policy(text)          SET search_path = public, pg_temp;
ALTER FUNCTION public.is_current_user_admin()                             SET search_path = public, pg_temp;
ALTER FUNCTION public.is_staff_user()                                     SET search_path = public, pg_temp;
ALTER FUNCTION public.user_has_permission(uuid, text)                     SET search_path = public, pg_temp;
ALTER FUNCTION public.user_has_role(uuid, text)                           SET search_path = public, pg_temp;
