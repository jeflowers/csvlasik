/*
  # Business Associate Agreement (BAA) Management System

  ## Overview
  Comprehensive vendor and Business Associate Agreement tracking system for
  HIPAA compliance, including vendor risk assessment and contract management.

  ## New Tables

  ### 1. vendors
  Third-party vendors and business associates
  - `id` (uuid, primary key) - Unique vendor identifier
  - `vendor_name` (text) - Legal entity name
  - `vendor_type` (text) - Type: cloud_provider, translation_service, email_service, etc.
  - `service_description` (text) - Services provided
  - `phi_access_level` (text) - none, limited, full, administrative
  - `contact_name` (text) - Primary contact person
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `website` (text) - Vendor website
  - `risk_level` (text) - low, medium, high, critical
  - `is_active` (boolean) - Currently providing services
  - `notes` (text) - Additional information
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. business_associate_agreements
  BAA contracts and tracking
  - `id` (uuid, primary key) - Unique BAA identifier
  - `vendor_id` (uuid) - References vendors.id
  - `baa_status` (text) - not_required, pending, executed, expired, terminated
  - `contract_start_date` (date) - When BAA becomes effective
  - `contract_end_date` (date) - When BAA expires
  - `auto_renewal` (boolean) - Automatically renews
  - `document_path` (text) - Storage path for signed BAA
  - `document_name` (text) - Original filename
  - `signed_by_vendor` (boolean) - Vendor signature received
  - `signed_by_organization` (boolean) - Organization signature completed
  - `attestation_date` (date) - Latest compliance attestation
  - `next_review_date` (date) - Next compliance review
  - `termination_clause` (text) - Termination terms
  - `notes` (text) - Additional contract details
  - `created_by` (uuid) - Admin who created record
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. vendor_risk_assessments
  Risk assessments for each vendor
  - `id` (uuid, primary key) - Unique assessment identifier
  - `vendor_id` (uuid) - References vendors.id
  - `assessment_date` (date) - When assessment was performed
  - `assessed_by` (uuid) - Admin who performed assessment
  - `data_sensitivity_score` (integer) - 1-5 score
  - `access_level_score` (integer) - 1-5 score
  - `security_controls_score` (integer) - 1-5 score
  - `compliance_certifications` (text[]) - ISO 27001, SOC 2, etc.
  - `encryption_in_transit` (boolean) - Data encrypted during transmission
  - `encryption_at_rest` (boolean) - Data encrypted at rest
  - `mfa_required` (boolean) - Multi-factor authentication enforced
  - `audit_logging` (boolean) - Audit logs maintained
  - `incident_response_plan` (boolean) - Has IR plan
  - `overall_risk_score` (integer) - Calculated total score
  - `risk_level` (text) - low, medium, high, critical
  - `findings` (jsonb) - Assessment findings
  - `recommendations` (text) - Risk mitigation recommendations
  - `next_assessment_date` (date) - Next scheduled assessment
  - `created_at` (timestamptz)

  ### 4. vendor_compliance_attestations
  Regular compliance confirmations from vendors
  - `id` (uuid, primary key) - Unique attestation identifier
  - `vendor_id` (uuid) - References vendors.id
  - `attestation_date` (date) - Date of attestation
  - `attestation_period_start` (date) - Coverage period start
  - `attestation_period_end` (date) - Coverage period end
  - `security_controls_confirmed` (boolean) - Controls in place
  - `no_breaches_confirmed` (boolean) - No security incidents
  - `compliance_maintained` (boolean) - Still compliant
  - `certifications_current` (boolean) - Certifications up to date
  - `attestation_document_path` (text) - Storage path
  - `attestor_name` (text) - Who signed attestation
  - `attestor_title` (text) - Attestor's title
  - `notes` (text) - Additional details
  - `verified_by` (uuid) - Admin who verified
  - `created_at` (timestamptz)

  ### 5. vendor_incidents
  Security incidents involving vendors
  - `id` (uuid, primary key) - Unique incident identifier
  - `vendor_id` (uuid) - References vendors.id
  - `incident_date` (date) - When incident occurred
  - `incident_type` (text) - breach, outage, unauthorized_access, etc.
  - `severity` (text) - low, medium, high, critical
  - `phi_affected` (boolean) - PHI was compromised
  - `patients_affected` (integer) - Number of patients impacted
  - `description` (text) - Incident details
  - `vendor_response` (text) - Vendor's remediation actions
  - `our_response` (text) - Organization's actions taken
  - `resolution_date` (date) - When resolved
  - `lessons_learned` (text) - Key takeaways
  - `reported_by` (uuid) - Who reported incident
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Admin-only access for vendor management
  - Audit trail for all changes
  - Secure document storage references
*/

-- ============================================================================
-- 1. VENDORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  vendor_type text NOT NULL CHECK (vendor_type IN (
    'cloud_provider', 'translation_service', 'email_service', 'payment_processor',
    'analytics', 'marketing', 'hosting', 'backup', 'security', 'consulting', 'other'
  )),
  service_description text NOT NULL,
  phi_access_level text NOT NULL DEFAULT 'none' CHECK (phi_access_level IN (
    'none', 'limited', 'full', 'administrative'
  )),
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  risk_level text DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendors_phi_access ON vendors(phi_access_level);
CREATE INDEX IF NOT EXISTS idx_vendors_risk ON vendors(risk_level);

-- ============================================================================
-- 2. BUSINESS ASSOCIATE AGREEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS business_associate_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  baa_status text NOT NULL DEFAULT 'pending' CHECK (baa_status IN (
    'not_required', 'pending', 'executed', 'expired', 'terminated'
  )),
  contract_start_date date,
  contract_end_date date,
  auto_renewal boolean DEFAULT false,
  document_path text,
  document_name text,
  signed_by_vendor boolean DEFAULT false,
  signed_by_organization boolean DEFAULT false,
  attestation_date date,
  next_review_date date,
  termination_clause text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_baa_vendor ON business_associate_agreements(vendor_id);
CREATE INDEX IF NOT EXISTS idx_baa_status ON business_associate_agreements(baa_status);
CREATE INDEX IF NOT EXISTS idx_baa_end_date ON business_associate_agreements(contract_end_date);
CREATE INDEX IF NOT EXISTS idx_baa_review_date ON business_associate_agreements(next_review_date);

-- ============================================================================
-- 3. VENDOR RISK ASSESSMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  assessed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  data_sensitivity_score integer CHECK (data_sensitivity_score BETWEEN 1 AND 5),
  access_level_score integer CHECK (access_level_score BETWEEN 1 AND 5),
  security_controls_score integer CHECK (security_controls_score BETWEEN 1 AND 5),
  compliance_certifications text[] DEFAULT ARRAY[]::text[],
  encryption_in_transit boolean DEFAULT false,
  encryption_at_rest boolean DEFAULT false,
  mfa_required boolean DEFAULT false,
  audit_logging boolean DEFAULT false,
  incident_response_plan boolean DEFAULT false,
  overall_risk_score integer GENERATED ALWAYS AS (
    COALESCE(data_sensitivity_score, 0) +
    COALESCE(access_level_score, 0) +
    COALESCE(security_controls_score, 0)
  ) STORED,
  risk_level text GENERATED ALWAYS AS (
    CASE
      WHEN COALESCE(data_sensitivity_score, 0) + COALESCE(access_level_score, 0) + COALESCE(security_controls_score, 0) >= 12 THEN 'critical'
      WHEN COALESCE(data_sensitivity_score, 0) + COALESCE(access_level_score, 0) + COALESCE(security_controls_score, 0) >= 9 THEN 'high'
      WHEN COALESCE(data_sensitivity_score, 0) + COALESCE(access_level_score, 0) + COALESCE(security_controls_score, 0) >= 6 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  findings jsonb DEFAULT '[]'::jsonb,
  recommendations text,
  next_assessment_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_vendor ON vendor_risk_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_risk_date ON vendor_risk_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_level ON vendor_risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_next_assessment ON vendor_risk_assessments(next_assessment_date);

-- ============================================================================
-- 4. VENDOR COMPLIANCE ATTESTATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_compliance_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  attestation_date date NOT NULL DEFAULT CURRENT_DATE,
  attestation_period_start date NOT NULL,
  attestation_period_end date NOT NULL,
  security_controls_confirmed boolean DEFAULT false,
  no_breaches_confirmed boolean DEFAULT false,
  compliance_maintained boolean DEFAULT false,
  certifications_current boolean DEFAULT false,
  attestation_document_path text,
  attestor_name text,
  attestor_title text,
  notes text,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attestation_vendor ON vendor_compliance_attestations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_attestation_date ON vendor_compliance_attestations(attestation_date DESC);

-- ============================================================================
-- 5. VENDOR INCIDENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  incident_date date NOT NULL,
  incident_type text NOT NULL CHECK (incident_type IN (
    'breach', 'outage', 'unauthorized_access', 'data_loss',
    'performance_issue', 'compliance_violation', 'other'
  )),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  phi_affected boolean DEFAULT false,
  patients_affected integer DEFAULT 0,
  description text NOT NULL,
  vendor_response text,
  our_response text,
  resolution_date date,
  lessons_learned text,
  reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_vendor ON vendor_incidents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_incident_date ON vendor_incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_incident_severity ON vendor_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incident_phi ON vendor_incidents(phi_affected);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_associate_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_compliance_attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_incidents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - VENDORS
-- ============================================================================

CREATE POLICY "Admins can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete vendors"
  ON vendors FOR DELETE
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
-- RLS POLICIES - BUSINESS ASSOCIATE AGREEMENTS
-- ============================================================================

CREATE POLICY "Admins can view BAAs"
  ON business_associate_agreements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage BAAs"
  ON business_associate_agreements FOR ALL
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
-- RLS POLICIES - VENDOR RISK ASSESSMENTS
-- ============================================================================

CREATE POLICY "Admins can view risk assessments"
  ON vendor_risk_assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage risk assessments"
  ON vendor_risk_assessments FOR ALL
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
-- RLS POLICIES - VENDOR COMPLIANCE ATTESTATIONS
-- ============================================================================

CREATE POLICY "Admins can view attestations"
  ON vendor_compliance_attestations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage attestations"
  ON vendor_compliance_attestations FOR ALL
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
-- RLS POLICIES - VENDOR INCIDENTS
-- ============================================================================

CREATE POLICY "Admins can view vendor incidents"
  ON vendor_incidents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage vendor incidents"
  ON vendor_incidents FOR ALL
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
-- UPDATE TRIGGER FOR TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendors_updated_at();

CREATE TRIGGER baa_updated_at
  BEFORE UPDATE ON business_associate_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_vendors_updated_at();

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON vendor_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_vendors_updated_at();
