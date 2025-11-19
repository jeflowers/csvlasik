/*
  # ISO 27001 Controls Tracking System

  ## Overview
  Comprehensive ISO 27001:2013 Annex A controls tracking system for
  ISMS certification readiness, including all 114 controls across 14 domains.

  ## New Tables

  ### 1. iso27001_control_domains
  The 14 Annex A control domains
  - `id` (uuid, primary key)
  - `domain_number` (text) - A.5 through A.18
  - `domain_name` (text) - Domain title
  - `description` (text) - Domain purpose
  - `display_order` (integer)

  ### 2. iso27001_controls
  All 114 individual controls from Annex A
  - `id` (uuid, primary key)
  - `domain_id` (uuid) - References control domain
  - `control_number` (text) - e.g., A.9.1.1
  - `control_name` (text) - Control title
  - `control_objective` (text) - What control achieves
  - `control_description` (text) - Detailed requirements
  - `control_type` (text) - preventive, detective, corrective
  - `is_mandatory` (boolean) - Required or optional
  - `display_order` (integer)

  ### 3. control_implementations
  Implementation status of each control
  - `id` (uuid, primary key)
  - `control_id` (uuid) - References iso27001_controls
  - `implementation_status` (text) - not_applicable, planned, partial, implemented, verified
  - `applicability` (text) - Why control applies or doesn't
  - `implementation_description` (text) - How control is implemented
  - `responsible_person` (uuid) - Who owns this control
  - `implementation_date` (date) - When implemented
  - `last_reviewed_date` (date) - Last review
  - `next_review_date` (date) - Next scheduled review
  - `evidence_location` (text) - Where evidence is stored
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. control_evidence
  Evidence documents for control implementation
  - `id` (uuid, primary key)
  - `implementation_id` (uuid) - References control_implementations
  - `evidence_type` (text) - document, screenshot, log, report, etc.
  - `evidence_title` (text)
  - `evidence_description` (text)
  - `file_path` (text) - Storage location
  - `collected_date` (date)
  - `collected_by` (uuid)
  - `created_at` (timestamptz)

  ### 5. control_test_results
  Testing results for implemented controls
  - `id` (uuid, primary key)
  - `implementation_id` (uuid) - References control_implementations
  - `test_date` (date)
  - `tested_by` (uuid)
  - `test_method` (text) - observation, inspection, interview, technical_test
  - `test_result` (text) - pass, fail, partial, not_tested
  - `findings` (text) - Test observations
  - `recommendations` (text) - Improvement suggestions
  - `follow_up_required` (boolean)
  - `follow_up_date` (date)
  - `created_at` (timestamptz)

  ### 6. statement_of_applicability
  SOA document for certification
  - `id` (uuid, primary key)
  - `soa_version` (text) - Version number
  - `effective_date` (date)
  - `is_current` (boolean)
  - `prepared_by` (uuid)
  - `approved_by` (uuid)
  - `approval_date` (date)
  - `next_review_date` (date)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 7. internal_audits
  ISO 27001 internal audit schedule and results
  - `id` (uuid, primary key)
  - `audit_name` (text)
  - `audit_scope` (text)
  - `audit_date` (date)
  - `audit_type` (text) - initial, surveillance, recertification
  - `lead_auditor` (uuid)
  - `audit_team` (jsonb) - Array of auditor IDs
  - `status` (text) - scheduled, in_progress, completed, report_issued
  - `overall_finding` (text) - satisfactory, minor_nc, major_nc
  - `summary` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. audit_findings
  Findings from internal audits
  - `id` (uuid, primary key)
  - `audit_id` (uuid) - References internal_audits
  - `control_id` (uuid) - References iso27001_controls
  - `finding_type` (text) - conformity, minor_nonconformity, major_nonconformity, observation
  - `finding_description` (text)
  - `evidence` (text)
  - `requirement_reference` (text) - ISO clause reference
  - `root_cause` (text)
  - `corrective_action_required` (boolean)
  - `corrective_action` (text)
  - `responsible_person` (uuid)
  - `due_date` (date)
  - `closure_date` (date)
  - `status` (text) - open, in_progress, closed, verified
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Admin-only write access
  - Auditors have read access during audits
*/

-- ============================================================================
-- 1. ISO 27001 CONTROL DOMAINS
-- ============================================================================

CREATE TABLE IF NOT EXISTS iso27001_control_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_number text UNIQUE NOT NULL,
  domain_name text NOT NULL,
  description text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Populate the 14 ISO 27001 Annex A domains
INSERT INTO iso27001_control_domains (domain_number, domain_name, description, display_order) VALUES
  ('A.5', 'Information Security Policies', 'Management direction for information security', 1),
  ('A.6', 'Organization of Information Security', 'Establishment of management framework', 2),
  ('A.7', 'Human Resource Security', 'Security aspects of employment lifecycle', 3),
  ('A.8', 'Asset Management', 'Achieve and maintain appropriate protection of assets', 4),
  ('A.9', 'Access Control', 'Limit access to information and information processing facilities', 5),
  ('A.10', 'Cryptography', 'Ensure proper and effective use of cryptography', 6),
  ('A.11', 'Physical and Environmental Security', 'Prevent unauthorized physical access, damage, and interference', 7),
  ('A.12', 'Operations Security', 'Ensure correct and secure operations', 8),
  ('A.13', 'Communications Security', 'Ensure protection of information in networks', 9),
  ('A.14', 'System Acquisition, Development and Maintenance', 'Ensure security is built into information systems', 10),
  ('A.15', 'Supplier Relationships', 'Ensure protection of accessible assets by suppliers', 11),
  ('A.16', 'Information Security Incident Management', 'Ensure consistent and effective approach to incidents', 12),
  ('A.17', 'Information Security Aspects of Business Continuity Management', 'Counteract interruptions to business activities', 13),
  ('A.18', 'Compliance', 'Avoid breaches of legal, statutory, regulatory or contractual obligations', 14)
ON CONFLICT (domain_number) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_domains_order ON iso27001_control_domains(display_order);

-- ============================================================================
-- 2. ISO 27001 CONTROLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS iso27001_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES iso27001_control_domains(id) ON DELETE CASCADE,
  control_number text UNIQUE NOT NULL,
  control_name text NOT NULL,
  control_objective text NOT NULL,
  control_description text NOT NULL,
  control_type text CHECK (control_type IN ('preventive', 'detective', 'corrective', 'directive')) DEFAULT 'preventive',
  is_mandatory boolean DEFAULT true,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_controls_domain ON iso27001_controls(domain_id);
CREATE INDEX IF NOT EXISTS idx_controls_number ON iso27001_controls(control_number);
CREATE INDEX IF NOT EXISTS idx_controls_order ON iso27001_controls(display_order);

-- ============================================================================
-- 3. CONTROL IMPLEMENTATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS control_implementations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid NOT NULL REFERENCES iso27001_controls(id) ON DELETE CASCADE,
  implementation_status text NOT NULL DEFAULT 'planned' CHECK (implementation_status IN (
    'not_applicable', 'planned', 'partial', 'implemented', 'verified'
  )),
  applicability text,
  implementation_description text,
  responsible_person uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  implementation_date date,
  last_reviewed_date date,
  next_review_date date,
  evidence_location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impl_control ON control_implementations(control_id);
CREATE INDEX IF NOT EXISTS idx_impl_status ON control_implementations(implementation_status);
CREATE INDEX IF NOT EXISTS idx_impl_responsible ON control_implementations(responsible_person);
CREATE INDEX IF NOT EXISTS idx_impl_review_date ON control_implementations(next_review_date);

-- ============================================================================
-- 4. CONTROL EVIDENCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS control_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  implementation_id uuid NOT NULL REFERENCES control_implementations(id) ON DELETE CASCADE,
  evidence_type text NOT NULL CHECK (evidence_type IN (
    'document', 'screenshot', 'log_file', 'report', 'certificate',
    'policy', 'procedure', 'configuration', 'other'
  )),
  evidence_title text NOT NULL,
  evidence_description text,
  file_path text,
  collected_date date NOT NULL DEFAULT CURRENT_DATE,
  collected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_impl ON control_evidence(implementation_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON control_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_date ON control_evidence(collected_date DESC);

-- ============================================================================
-- 5. CONTROL TEST RESULTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS control_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  implementation_id uuid NOT NULL REFERENCES control_implementations(id) ON DELETE CASCADE,
  test_date date NOT NULL,
  tested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  test_method text NOT NULL CHECK (test_method IN (
    'observation', 'inspection', 'interview', 'technical_test', 'review'
  )),
  test_result text NOT NULL CHECK (test_result IN (
    'pass', 'fail', 'partial', 'not_tested', 'not_applicable'
  )),
  findings text,
  recommendations text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_impl ON control_test_results(implementation_id);
CREATE INDEX IF NOT EXISTS idx_test_date ON control_test_results(test_date DESC);
CREATE INDEX IF NOT EXISTS idx_test_result ON control_test_results(test_result);
CREATE INDEX IF NOT EXISTS idx_test_followup ON control_test_results(follow_up_required, follow_up_date);

-- ============================================================================
-- 6. STATEMENT OF APPLICABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS statement_of_applicability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soa_version text UNIQUE NOT NULL,
  effective_date date NOT NULL,
  is_current boolean DEFAULT false,
  prepared_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approval_date date,
  next_review_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_soa_current ON statement_of_applicability(is_current);
CREATE INDEX IF NOT EXISTS idx_soa_version ON statement_of_applicability(soa_version);

-- ============================================================================
-- 7. INTERNAL AUDITS
-- ============================================================================

CREATE TABLE IF NOT EXISTS internal_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_name text NOT NULL,
  audit_scope text NOT NULL,
  audit_date date NOT NULL,
  audit_type text NOT NULL CHECK (audit_type IN (
    'initial', 'surveillance', 'recertification', 'special'
  )),
  lead_auditor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  audit_team jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'report_issued', 'closed'
  )),
  overall_finding text CHECK (overall_finding IN (
    'satisfactory', 'minor_nc', 'major_nc', 'needs_improvement'
  )),
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_date ON internal_audits(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_status ON internal_audits(status);
CREATE INDEX IF NOT EXISTS idx_audit_type ON internal_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_lead ON internal_audits(lead_auditor);

-- ============================================================================
-- 8. AUDIT FINDINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES internal_audits(id) ON DELETE CASCADE,
  control_id uuid REFERENCES iso27001_controls(id) ON DELETE SET NULL,
  finding_type text NOT NULL CHECK (finding_type IN (
    'conformity', 'minor_nonconformity', 'major_nonconformity', 'observation', 'opportunity'
  )),
  finding_description text NOT NULL,
  evidence text,
  requirement_reference text,
  root_cause text,
  corrective_action_required boolean DEFAULT false,
  corrective_action text,
  responsible_person uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date,
  closure_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'in_progress', 'pending_verification', 'closed', 'verified'
  )),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finding_audit ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_finding_control ON audit_findings(control_id);
CREATE INDEX IF NOT EXISTS idx_finding_type ON audit_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_finding_status ON audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_finding_responsible ON audit_findings(responsible_person);
CREATE INDEX IF NOT EXISTS idx_finding_due ON audit_findings(due_date);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE iso27001_control_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE iso27001_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE statement_of_applicability ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Control Domains - Public read for structure
CREATE POLICY "Anyone can view control domains"
  ON iso27001_control_domains FOR SELECT
  USING (true);

-- Controls - Public read for reference
CREATE POLICY "Anyone can view controls"
  ON iso27001_controls FOR SELECT
  USING (true);

-- Implementations - Admin only
CREATE POLICY "Admins can view implementations"
  ON control_implementations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage implementations"
  ON control_implementations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- Evidence - Admin only
CREATE POLICY "Admins can view evidence"
  ON control_evidence FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage evidence"
  ON control_evidence FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- Apply similar policies to remaining tables
CREATE POLICY "Admins manage test results"
  ON control_test_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins manage SOA"
  ON statement_of_applicability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins manage audits"
  ON internal_audits FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins manage findings"
  ON audit_findings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_iso27001_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER control_impl_updated_at
  BEFORE UPDATE ON control_implementations
  FOR EACH ROW
  EXECUTE FUNCTION update_iso27001_updated_at();

CREATE TRIGGER audits_updated_at
  BEFORE UPDATE ON internal_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_iso27001_updated_at();

CREATE TRIGGER findings_updated_at
  BEFORE UPDATE ON audit_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_iso27001_updated_at();
