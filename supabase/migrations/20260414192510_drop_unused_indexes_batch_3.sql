/*
  # Drop unused indexes - Batch 3

  ## Overview
  Continues removing unused indexes. See batch 1 for rationale.

  ## Removed Indexes (Batch 3 - Privacy, Security, Patient forms, Misc)
  - privacy_policy_content: updated_by
  - user_policy_acknowledgments: version_id
  - ringcentral_events: consultation_request_id
  - ringcentral_messages: consultation_request_id
  - risk_findings: assessment_id, risk_owner
  - risk_assessments: approved_by, assessed_by
  - security_incidents: resolved_by, user_id
  - security_documentation: reviewed_by
  - page_views: user_id
  - role_permissions: permission_id
  - user_cookie_preferences: cookie_id
  - user_roles: granted_by
  - user_events: user_id
  - email_logs: email_queue_id
  - error_logs: resolved_by, user_id
  - before_after_photos: patient_consent_id
  - patient_registrations: user_id, email, status, created_at
  - patient_medical_histories: registration_id, user_id, created_at
  - patient_insurance_info: registration_id, user_id, created_at
  - patient_consent_forms: registration_id, user_id, created_at
*/

DROP INDEX IF EXISTS public.idx_privacy_policy_content_updated_by;
DROP INDEX IF EXISTS public.idx_user_policy_acknowledgments_version_id;
DROP INDEX IF EXISTS public.idx_ringcentral_events_consultation_request_id;
DROP INDEX IF EXISTS public.idx_ringcentral_messages_consultation_request_id;
DROP INDEX IF EXISTS public.idx_risk_findings_assessment_id;
DROP INDEX IF EXISTS public.idx_risk_findings_risk_owner;
DROP INDEX IF EXISTS public.idx_risk_assessments_approved_by;
DROP INDEX IF EXISTS public.idx_risk_assessments_assessed_by;
DROP INDEX IF EXISTS public.idx_security_incidents_resolved_by;
DROP INDEX IF EXISTS public.idx_security_incidents_user_id;
DROP INDEX IF EXISTS public.idx_security_documentation_reviewed_by;
DROP INDEX IF EXISTS public.idx_page_views_user_id;
DROP INDEX IF EXISTS public.idx_role_permissions_permission_id;
DROP INDEX IF EXISTS public.idx_user_cookie_preferences_cookie_id;
DROP INDEX IF EXISTS public.idx_user_roles_granted_by;
DROP INDEX IF EXISTS public.idx_user_events_user_id;
DROP INDEX IF EXISTS public.idx_email_logs_email_queue_id;
DROP INDEX IF EXISTS public.idx_error_logs_resolved_by;
DROP INDEX IF EXISTS public.idx_error_logs_user_id;
DROP INDEX IF EXISTS public.idx_before_after_photos_patient_consent_id;
DROP INDEX IF EXISTS public.idx_patient_registrations_user_id;
DROP INDEX IF EXISTS public.idx_patient_registrations_email;
DROP INDEX IF EXISTS public.idx_patient_registrations_status;
DROP INDEX IF EXISTS public.idx_patient_registrations_created_at;
DROP INDEX IF EXISTS public.idx_patient_medical_histories_registration_id;
DROP INDEX IF EXISTS public.idx_patient_medical_histories_user_id;
DROP INDEX IF EXISTS public.idx_patient_medical_histories_created_at;
DROP INDEX IF EXISTS public.idx_patient_insurance_info_registration_id;
DROP INDEX IF EXISTS public.idx_patient_insurance_info_user_id;
DROP INDEX IF EXISTS public.idx_patient_insurance_info_created_at;
DROP INDEX IF EXISTS public.idx_patient_consent_forms_registration_id;
DROP INDEX IF EXISTS public.idx_patient_consent_forms_user_id;
DROP INDEX IF EXISTS public.idx_patient_consent_forms_created_at;
