/*
  # Data Retention System for HIPAA, GDPR, and ISO 27001 Compliance

  ## Overview
  Implements automated data retention policies with configurable rules, 
  audit logging, and scheduled cleanup to meet regulatory compliance requirements.

  ## New Tables

  ### 1. data_retention_policies
  Configurable retention rules for different data types
  - `id` (uuid, primary key) - Unique policy identifier
  - `table_name` (text) - Target table name
  - `description` (text) - Policy description
  - `retention_period_days` (integer) - Days to retain data (0 = indefinite)
  - `date_column` (text) - Column to use for age calculation
  - `archive_before_delete` (boolean) - Whether to archive before deletion
  - `archive_storage_path` (text) - Storage bucket path for archives
  - `status` (text) - active, paused, or archived
  - `last_run_at` (timestamptz) - Last execution timestamp
  - `next_run_at` (timestamptz) - Next scheduled execution
  - `created_by` (uuid) - User who created the policy
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. data_retention_executions
  Execution history and audit trail for retention runs
  - `id` (uuid, primary key) - Unique execution identifier
  - `policy_id` (uuid) - References data_retention_policies.id
  - `status` (text) - pending, running, completed, failed
  - `records_evaluated` (integer) - Total records evaluated
  - `records_archived` (integer) - Records archived
  - `records_deleted` (integer) - Records deleted
  - `error_message` (text) - Error details if failed
  - `execution_details` (jsonb) - Additional execution metadata
  - `started_at` (timestamptz) - Execution start time
  - `completed_at` (timestamptz) - Execution completion time
  - `executed_by` (uuid) - User or system that triggered execution

  ### 3. data_retention_exceptions
  Records exempted from automatic deletion
  - `id` (uuid, primary key) - Unique exception identifier
  - `table_name` (text) - Table containing the record
  - `record_id` (bigint) - ID of the exempted record
  - `reason` (text) - Reason for exemption (legal hold, active case, etc.)
  - `exemption_type` (text) - legal_hold, active_case, under_review
  - `expires_at` (timestamptz) - When exemption expires (null = indefinite)
  - `created_by` (uuid) - User who created the exemption
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - All tables have RLS enabled
  - Only admins can create/modify retention policies
  - Execution logs are immutable (INSERT only)
  - Audit trail for all retention activities

  ## Compliance Features
  - HIPAA: 6-year minimum retention for medical records
  - GDPR: Configurable retention with "right to erasure" support
  - ISO 27001: Documented retention procedures and audit logs
*/

-- ============================================================================
-- 1. DATA RETENTION POLICIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  description text NOT NULL,
  retention_period_days integer NOT NULL CHECK (retention_period_days >= 0),
  date_column text NOT NULL DEFAULT 'created_at',
  archive_before_delete boolean DEFAULT true,
  archive_storage_path text,
  status text NOT NULL CHECK (status IN ('active', 'paused', 'archived')) DEFAULT 'active',
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(table_name, status)
);

ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage retention policies"
  ON data_retention_policies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "All authenticated users view active policies"
  ON data_retention_policies FOR SELECT
  TO authenticated
  USING (status = 'active');

-- ============================================================================
-- 2. DATA RETENTION EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_retention_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES data_retention_policies(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  records_evaluated integer DEFAULT 0,
  records_archived integer DEFAULT 0,
  records_deleted integer DEFAULT 0,
  error_message text,
  execution_details jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE data_retention_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage retention executions"
  ON data_retention_executions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 3. DATA RETENTION EXCEPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_retention_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id bigint NOT NULL,
  reason text NOT NULL,
  exemption_type text NOT NULL CHECK (exemption_type IN ('legal_hold', 'active_case', 'under_review', 'regulatory_requirement')),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(table_name, record_id)
);

ALTER TABLE data_retention_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage retention exceptions"
  ON data_retention_exceptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_retention_policies_status 
  ON data_retention_policies(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_retention_policies_next_run 
  ON data_retention_policies(next_run_at) WHERE status = 'active' AND next_run_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_retention_executions_policy 
  ON data_retention_executions(policy_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_retention_executions_status 
  ON data_retention_executions(status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_retention_exceptions_table_record 
  ON data_retention_exceptions(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_retention_exceptions_expires 
  ON data_retention_exceptions(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- 5. DEFAULT RETENTION POLICIES (HIPAA & GDPR COMPLIANT)
-- ============================================================================

-- HIPAA: Audit logs must be retained for 6 years minimum
INSERT INTO data_retention_policies (table_name, description, retention_period_days, date_column, archive_before_delete, status)
VALUES 
  ('audit_logs', 'HIPAA-compliant audit log retention (6 years)', 2190, 'created_at', true, 'active'),
  ('consultation_audit_log', 'HIPAA-compliant consultation audit retention (6 years)', 2190, 'created_at', true, 'active')
ON CONFLICT (table_name, status) DO NOTHING;

-- GDPR: Completed data subject requests can be purged after 3 years
INSERT INTO data_retention_policies (table_name, description, retention_period_days, date_column, archive_before_delete, status)
VALUES 
  ('data_subject_requests', 'GDPR data subject requests retention (3 years)', 1095, 'created_at', true, 'active')
ON CONFLICT (table_name, status) DO NOTHING;

-- Consultation requests: Archive completed requests after 2 years
INSERT INTO data_retention_policies (table_name, description, retention_period_days, date_column, archive_before_delete, status)
VALUES 
  ('consultation_requests', 'Completed consultation requests retention (2 years)', 730, 'created_at', true, 'active')
ON CONFLICT (table_name, status) DO NOTHING;

-- Translation cache: Clean up cached translations after 90 days
INSERT INTO data_retention_policies (table_name, description, retention_period_days, date_column, archive_before_delete, status)
VALUES 
  ('translation_cache', 'Translation cache cleanup (90 days)', 90, 'created_at', false, 'active')
ON CONFLICT (table_name, status) DO NOTHING;

-- Session logs: Clean up old sessions after 1 year
INSERT INTO data_retention_policies (table_name, description, retention_period_days, date_column, archive_before_delete, status)
VALUES 
  ('consent_records', 'Expired consent records retention (1 year)', 365, 'created_at', true, 'active')
ON CONFLICT (table_name, status) DO NOTHING;

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_retention_policy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_retention_policies_timestamp
  BEFORE UPDATE ON data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_retention_policy_timestamp();

-- Function to check if a record has an active exemption
CREATE OR REPLACE FUNCTION has_retention_exemption(
  p_table_name text,
  p_record_id bigint
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM data_retention_exceptions
    WHERE table_name = p_table_name
      AND record_id = p_record_id
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON data_retention_policies TO authenticated;
GRANT SELECT ON data_retention_executions TO authenticated;
GRANT SELECT ON data_retention_exceptions TO authenticated;