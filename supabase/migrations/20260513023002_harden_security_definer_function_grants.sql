-- Harden SECURITY DEFINER function permissions and fix mutable search_path.
-- Pins search_path on touch_patient_profiles_updated_at, revokes EXECUTE
-- from PUBLIC/anon/authenticated on flagged functions, then re-grants
-- only where the app legitimately needs RPC access.

ALTER FUNCTION public.touch_patient_profiles_updated_at()
  SET search_path = public, pg_temp;

DO $do$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.add_retention_exception(text, bigint, text, text, timestamptz, uuid)',
    'public.archive_expired_records(text, integer, text, text)',
    'public.assign_superadmin_role(text)',
    'public.audit_consultation_status_change()',
    'public.auto_assign_consultation_request(uuid)',
    'public.auto_create_consent_schedule()',
    'public.calculate_kpi_target_met(uuid, numeric)',
    'public.can_manage_user(uuid, uuid)',
    'public.categorize_media_by_path()',
    'public.check_consent_expiry()',
    'public.check_duplicate_submission(text, text, text)',
    'public.cleanup_old_notifications()',
    'public.cleanup_orphaned_storage_files()',
    'public.create_superadmin_user(text, text, text)',
    'public.create_user_with_role(text, text, text, text, boolean)',
    'public.decrypt_data(bytea, text)',
    'public.delete_expired_records(text, integer, text, integer)',
    'public.encrypt_data(text, text)',
    'public.execute_retention_policy(uuid, uuid)',
    'public.generate_consent_export_data(text)',
    'public.get_active_ringcentral_connection(uuid)',
    'public.get_analytics_summary(timestamptz, timestamptz)',
    'public.get_consent_analytics_summary(date, date)',
    'public.get_consent_statistics()',
    'public.get_current_consent_version()',
    'public.get_current_privacy_policy(text)',
    'public.get_encryption_statistics()',
    'public.get_expired_record_count(text, integer, text)',
    'public.get_keys_needing_rotation()',
    'public.get_kpi_trend(uuid, integer)',
    'public.get_next_round_robin_recipient()',
    'public.get_public_url(text, text)',
    'public.get_review_dashboard_summary()',
    'public.get_unread_notification_count(uuid)',
    'public.get_user_consent_details(text)',
    'public.get_user_effective_role(uuid)',
    'public.get_user_role_level(uuid)',
    'public.has_retention_exemption(text, bigint)',
    'public.has_user_acknowledged_current_policy(text)',
    'public.is_current_user_admin()',
    'public.is_ringcentral_token_expired(uuid)',
    'public.is_staff_user()',
    'public.log_admin_patient_change()',
    'public.log_appointment_request_changes()',
    'public.log_consent_change()',
    'public.mark_reminders_for_expiring_consents()',
    'public.mark_ringcentral_connection_expired(uuid)',
    'public.prevent_patient_in_system_users()',
    'public.prevent_system_user_in_patient_profiles()',
    'public.queue_email(text, text, text, text, text, text, timestamptz)',
    'public.rotate_encryption_key(text, integer)',
    'public.run_scheduled_retention_policies()',
    'public.sync_user_legacy_role_to_rbac()',
    'public.update_appointment_requests_updated_at()',
    'public.update_consent_timestamp()',
    'public.update_management_review_timestamp()',
    'public.update_media_files_updated_at()',
    'public.update_notification_preferences_updated_at()',
    'public.update_patient_forms_updated_at()',
    'public.update_retention_policy_timestamp()',
    'public.update_user_role(uuid, text)',
    'public.user_has_permission(uuid, text)',
    'public.user_has_role(uuid, text)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'Skipping missing function: %', fn;
    END;
  END LOOP;
END
$do$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin()                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_user()                               TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text)               TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, text)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_effective_role(uuid)                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_level(uuid)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(uuid)           TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_user_acknowledged_current_policy(text)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_consent_details(text)                TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_retention_exemption(text, bigint)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_url(text, text)                    TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_current_privacy_policy(text)              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_consent_version()                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_duplicate_submission(text, text, text)  TO anon, authenticated;
