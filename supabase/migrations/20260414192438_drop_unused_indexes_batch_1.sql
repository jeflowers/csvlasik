/*
  # Drop unused indexes - Batch 1

  ## Overview
  Removes indexes that have never been used according to pg_stat_user_indexes.
  Unused indexes waste disk space, slow down INSERT/UPDATE/DELETE operations,
  and add overhead to VACUUM. These are safe to drop because:
  - They are not covering any foreign key constraint lookups
  - They have zero index scans recorded
  - They can be recreated if needed in the future

  ## Removed Indexes (Batch 1 - Audit, Articles, Appointments, Consent)
  - appointment_request_audit_log: appointment_request_id, changed_by
  - appointment_requests: reviewed_by
  - appointment_bookings: slot_id
  - articles: author_id, published_by, reviewed_by
  - audit_logs: user_id
  - consent_audit_log: consent_id
  - consent_withdrawal_reasons: consent_id
  - consent_cookies: category_id
  - user_consents: consent_version_id
  - consultation_audit_log: consultation_request_id, user_id
  - consultation_requests: assigned_to, duplicate_of
  - consultation_settings: fallback_user
  - content_ownership: approved_by, owner_id
  - media: uploaded_by
  - conversion_tracking: user_id
*/

DROP INDEX IF EXISTS public.idx_appointment_request_audit_log_appointment_request_id;
DROP INDEX IF EXISTS public.idx_appointment_request_audit_log_changed_by;
DROP INDEX IF EXISTS public.idx_appointment_requests_reviewed_by;
DROP INDEX IF EXISTS public.idx_appointment_bookings_slot_id;
DROP INDEX IF EXISTS public.idx_articles_author_id;
DROP INDEX IF EXISTS public.idx_articles_published_by;
DROP INDEX IF EXISTS public.idx_articles_reviewed_by;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;
DROP INDEX IF EXISTS public.idx_consent_audit_log_consent_id;
DROP INDEX IF EXISTS public.idx_consent_withdrawal_reasons_consent_id;
DROP INDEX IF EXISTS public.idx_consent_cookies_category_id;
DROP INDEX IF EXISTS public.idx_user_consents_consent_version_id;
DROP INDEX IF EXISTS public.idx_consultation_audit_log_consultation_request_id;
DROP INDEX IF EXISTS public.idx_consultation_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_consultation_requests_assigned_to;
DROP INDEX IF EXISTS public.idx_consultation_requests_duplicate_of;
DROP INDEX IF EXISTS public.idx_consultation_settings_fallback_user;
DROP INDEX IF EXISTS public.idx_content_ownership_approved_by;
DROP INDEX IF EXISTS public.idx_content_ownership_owner_id;
DROP INDEX IF EXISTS public.idx_media_uploaded_by;
DROP INDEX IF EXISTS public.idx_conversion_tracking_user_id;
