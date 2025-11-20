/*
  # Fix Critical Security Issues - Indexes Only

  This migration addresses the index-related security issues:
  
  1. **Unindexed Foreign Keys** (10 issues) - Add missing indexes  
  2. **Drop Unused Indexes** (98 issues) - Remove to reduce storage overhead

  Functions will be fixed in a separate migration
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointment_bookings_slot_id
  ON public.appointment_bookings(slot_id);

CREATE INDEX IF NOT EXISTS idx_before_after_photos_patient_consent_id
  ON public.before_after_photos(patient_consent_id);

CREATE INDEX IF NOT EXISTS idx_conversion_tracking_user_id
  ON public.conversion_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_email_queue_id
  ON public.email_logs(email_queue_id);

CREATE INDEX IF NOT EXISTS idx_error_logs_resolved_by
  ON public.error_logs(resolved_by);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id
  ON public.error_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_approved_by
  ON public.risk_assessments(approved_by);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_assessed_by
  ON public.risk_assessments(assessed_by);

CREATE INDEX IF NOT EXISTS idx_risk_findings_risk_owner
  ON public.risk_findings(risk_owner);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id
  ON public.user_events(user_id);

-- =====================================================
-- PART 2: DROP UNUSED INDEXES
-- =====================================================

-- Risk Assessment indexes
DROP INDEX IF EXISTS idx_risk_assessments_status;
DROP INDEX IF EXISTS idx_risk_assessments_date;
DROP INDEX IF EXISTS idx_risk_findings_assessment;
DROP INDEX IF EXISTS idx_risk_findings_level;

-- Compliance indexes
DROP INDEX IF EXISTS idx_compliance_docs_type;
DROP INDEX IF EXISTS idx_compliance_docs_status;

-- Appointment indexes
DROP INDEX IF EXISTS idx_appointment_slots_date;
DROP INDEX IF EXISTS idx_appointment_slots_available;
DROP INDEX IF EXISTS idx_appointment_slots_provider;
DROP INDEX IF EXISTS idx_appointment_bookings_status;
DROP INDEX IF EXISTS idx_appointment_bookings_email;

-- Photo gallery indexes
DROP INDEX IF EXISTS idx_before_after_published;
DROP INDEX IF EXISTS idx_before_after_featured;

-- Patient consent indexes
DROP INDEX IF EXISTS idx_patient_consents_email;
DROP INDEX IF EXISTS idx_patient_consents_active;

-- Financing indexes
DROP INDEX IF EXISTS idx_financing_applications_status;

-- Analytics indexes
DROP INDEX IF EXISTS idx_page_views_session;
DROP INDEX IF EXISTS idx_page_views_user;
DROP INDEX IF EXISTS idx_page_views_page_url;
DROP INDEX IF EXISTS idx_page_views_created_at;
DROP INDEX IF EXISTS idx_page_views_url_date;
DROP INDEX IF EXISTS idx_user_events_session;
DROP INDEX IF EXISTS idx_user_events_name;
DROP INDEX IF EXISTS idx_user_events_category;
DROP INDEX IF EXISTS idx_user_events_created_at;
DROP INDEX IF EXISTS idx_user_events_name_date;
DROP INDEX IF EXISTS idx_conversion_tracking_type;
DROP INDEX IF EXISTS idx_conversion_tracking_session;
DROP INDEX IF EXISTS idx_conversion_tracking_created_at;

-- Error logging indexes
DROP INDEX IF EXISTS idx_error_logs_type;
DROP INDEX IF EXISTS idx_error_logs_severity;
DROP INDEX IF EXISTS idx_error_logs_resolved;
DROP INDEX IF EXISTS idx_error_logs_created_at;

-- Performance metrics indexes
DROP INDEX IF EXISTS idx_performance_metrics_type;
DROP INDEX IF EXISTS idx_performance_metrics_page;
DROP INDEX IF EXISTS idx_performance_metrics_created_at;

-- Email indexes
DROP INDEX IF EXISTS idx_email_logs_to_email;
DROP INDEX IF EXISTS idx_email_logs_status;
DROP INDEX IF EXISTS idx_email_logs_sent_at;
DROP INDEX IF EXISTS idx_email_templates_name;
DROP INDEX IF EXISTS idx_email_templates_active;

-- Notification indexes
DROP INDEX IF EXISTS idx_notification_preferences_user;

-- Content management indexes
DROP INDEX IF EXISTS idx_content_approver;
DROP INDEX IF EXISTS idx_consent_audit_consent_id;
DROP INDEX IF EXISTS idx_consent_cookies_category_id;
DROP INDEX IF EXISTS idx_consult_audit_user_id;
DROP INDEX IF EXISTS idx_consult_req_duplicate_of;
DROP INDEX IF EXISTS idx_consult_settings_fallback;

-- Retention indexes
DROP INDEX IF EXISTS idx_retention_exec_policy_id;

-- Encryption indexes
DROP INDEX IF EXISTS idx_enc_comm_from_user;
DROP INDEX IF EXISTS idx_enc_comm_to_user;
DROP INDEX IF EXISTS idx_enc_patient_user_id;
DROP INDEX IF EXISTS idx_enc_patient_updated_by;
DROP INDEX IF EXISTS idx_enc_payment_user_id;
DROP INDEX IF EXISTS idx_enc_audit_performed_by;
DROP INDEX IF EXISTS idx_enc_keys_created_by;

-- Review indexes
DROP INDEX IF EXISTS idx_review_action_assigned_to;
DROP INDEX IF EXISTS idx_review_action_review_id;
DROP INDEX IF EXISTS idx_review_finding_review_id;
DROP INDEX IF EXISTS idx_review_kpi_val_kpi_id;

-- User preference indexes
DROP INDEX IF EXISTS idx_user_cookie_pref_cookie_id;

-- Appointment request indexes
DROP INDEX IF EXISTS idx_appt_audit_request;
DROP INDEX IF EXISTS idx_appt_audit_user;
DROP INDEX IF EXISTS idx_appt_reviewed;

-- Article indexes
DROP INDEX IF EXISTS idx_articles_author;
DROP INDEX IF EXISTS idx_articles_publisher;
DROP INDEX IF EXISTS idx_articles_reviewer;

-- Audit indexes
DROP INDEX IF EXISTS idx_audit_user;
DROP INDEX IF EXISTS idx_consent_withdrawal;
DROP INDEX IF EXISTS idx_consultation_audit_request;
DROP INDEX IF EXISTS idx_consultation_assigned;
DROP INDEX IF EXISTS idx_content_owner;
DROP INDEX IF EXISTS idx_retention_exception_creator;
DROP INDEX IF EXISTS idx_retention_execution_executor;
DROP INDEX IF EXISTS idx_retention_policy_creator;
DROP INDEX IF EXISTS idx_dsr_processor;
DROP INDEX IF EXISTS idx_encryption_audit_key;
DROP INDEX IF EXISTS idx_review_conductor;
DROP INDEX IF EXISTS idx_media_uploader;
DROP INDEX IF EXISTS idx_policy_updater;
DROP INDEX IF EXISTS idx_action_creator;
DROP INDEX IF EXISTS idx_action_finding;
DROP INDEX IF EXISTS idx_review_doc_review;
DROP INDEX IF EXISTS idx_review_doc_uploader;
DROP INDEX IF EXISTS idx_finding_identifier;
DROP INDEX IF EXISTS idx_kpi_value_recorder;
DROP INDEX IF EXISTS idx_kpi_value_review;
DROP INDEX IF EXISTS idx_kpi_owner;
DROP INDEX IF EXISTS idx_rc_event_consultation;
DROP INDEX IF EXISTS idx_rc_message_consultation;
DROP INDEX IF EXISTS idx_role_permission;
DROP INDEX IF EXISTS idx_incident_resolver;
DROP INDEX IF EXISTS idx_incident_user;
DROP INDEX IF EXISTS idx_consent_version;
DROP INDEX IF EXISTS idx_acknowledgment_version;
DROP INDEX IF EXISTS idx_user_role_granter;

-- Translation indexes
DROP INDEX IF EXISTS idx_translation_cache_namespace;
DROP INDEX IF EXISTS idx_translation_cache_target_language;

-- Media file indexes
DROP INDEX IF EXISTS idx_media_files_is_public;
DROP INDEX IF EXISTS idx_media_files_file_path;
DROP INDEX IF EXISTS idx_media_files_search;
