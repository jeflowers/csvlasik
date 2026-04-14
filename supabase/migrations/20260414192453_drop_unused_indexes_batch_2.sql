/*
  # Drop unused indexes - Batch 2

  ## Overview
  Continues removing unused indexes. See batch 1 for rationale.

  ## Removed Indexes (Batch 2 - Data retention, Encryption, Reviews, Management)
  - data_retention_exceptions: created_by
  - data_retention_executions: executed_by, policy_id
  - data_retention_policies: created_by
  - data_subject_requests: processed_by
  - encrypted_communications: from_user, to_user
  - encrypted_patient_data: updated_by, user_id
  - encrypted_payment_data: user_id
  - encryption_audit_log: key_id, performed_by
  - encryption_keys: created_by
  - management_reviews: conducted_by
  - review_action_items: assigned_to, created_by, finding_id, review_id
  - review_documents: review_id, uploaded_by
  - review_findings: identified_by, review_id
  - review_kpi_values: kpi_id, recorded_by, review_id
  - review_kpis: owner
*/

DROP INDEX IF EXISTS public.idx_data_retention_exceptions_created_by;
DROP INDEX IF EXISTS public.idx_data_retention_executions_executed_by;
DROP INDEX IF EXISTS public.idx_data_retention_executions_policy_id;
DROP INDEX IF EXISTS public.idx_data_retention_policies_created_by;
DROP INDEX IF EXISTS public.idx_data_subject_requests_processed_by;
DROP INDEX IF EXISTS public.idx_encrypted_communications_from_user;
DROP INDEX IF EXISTS public.idx_encrypted_communications_to_user;
DROP INDEX IF EXISTS public.idx_encrypted_patient_data_updated_by;
DROP INDEX IF EXISTS public.idx_encrypted_patient_data_user_id;
DROP INDEX IF EXISTS public.idx_encrypted_payment_data_user_id;
DROP INDEX IF EXISTS public.idx_encryption_audit_log_key_id;
DROP INDEX IF EXISTS public.idx_encryption_audit_log_performed_by;
DROP INDEX IF EXISTS public.idx_encryption_keys_created_by;
DROP INDEX IF EXISTS public.idx_management_reviews_conducted_by;
DROP INDEX IF EXISTS public.idx_review_action_items_assigned_to;
DROP INDEX IF EXISTS public.idx_review_action_items_created_by;
DROP INDEX IF EXISTS public.idx_review_action_items_finding_id;
DROP INDEX IF EXISTS public.idx_review_action_items_review_id;
DROP INDEX IF EXISTS public.idx_review_documents_review_id;
DROP INDEX IF EXISTS public.idx_review_documents_uploaded_by;
DROP INDEX IF EXISTS public.idx_review_findings_identified_by;
DROP INDEX IF EXISTS public.idx_review_findings_review_id;
DROP INDEX IF EXISTS public.idx_review_kpi_values_kpi_id;
DROP INDEX IF EXISTS public.idx_review_kpi_values_recorded_by;
DROP INDEX IF EXISTS public.idx_review_kpi_values_review_id;
DROP INDEX IF EXISTS public.idx_review_kpis_owner;
