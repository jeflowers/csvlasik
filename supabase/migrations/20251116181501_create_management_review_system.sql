/*
  # Management Review System for ISMS

  ## Overview
  Creates a comprehensive management review system for ISO 27001 compliance,
  including quarterly reviews, findings tracking, action items, and KPI monitoring.

  ## New Tables

  ### 1. management_reviews
  Quarterly management review meetings and agendas
  - `id` (uuid, primary key) - Unique review identifier
  - `review_date` (date) - Date of review meeting
  - `review_period_start` (date) - Start of review period
  - `review_period_end` (date) - End of review period
  - `review_type` (text) - quarterly, annual, ad_hoc
  - `status` (text) - scheduled, in_progress, completed, cancelled
  - `attendees` (jsonb) - List of attendees
  - `agenda_items` (jsonb) - Review agenda topics
  - `summary` (text) - Executive summary
  - `overall_assessment` (text) - satisfactory, needs_improvement, critical
  - `conducted_by` (uuid) - Review facilitator
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. review_findings
  Issues, observations, and opportunities identified during reviews
  - `id` (uuid, primary key) - Unique finding identifier
  - `review_id` (uuid) - References management_reviews.id
  - `finding_type` (text) - issue, observation, opportunity, strength
  - `category` (text) - security_incident, policy_compliance, risk_management, etc.
  - `severity` (text) - critical, high, medium, low
  - `title` (text) - Finding title
  - `description` (text) - Detailed description
  - `evidence` (jsonb) - Supporting evidence/data
  - `impact` (text) - Business impact
  - `recommendations` (text) - Proposed actions
  - `identified_by` (uuid) - Person who identified
  - `created_at` (timestamptz)

  ### 3. review_action_items
  Action items and corrective actions from reviews
  - `id` (uuid, primary key) - Unique action identifier
  - `review_id` (uuid) - References management_reviews.id
  - `finding_id` (uuid) - References review_findings.id (optional)
  - `title` (text) - Action title
  - `description` (text) - Detailed description
  - `priority` (text) - critical, high, medium, low
  - `status` (text) - not_started, in_progress, completed, blocked, cancelled
  - `assigned_to` (uuid) - References auth.users.id
  - `due_date` (date) - Target completion date
  - `completed_date` (date) - Actual completion date
  - `budget_required` (numeric) - Estimated cost
  - `resources_needed` (text) - Required resources
  - `progress_notes` (jsonb) - Status updates
  - `created_by` (uuid)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. review_kpis
  Key Performance Indicators tracked for management reviews
  - `id` (uuid, primary key) - Unique KPI identifier
  - `kpi_name` (text) - KPI name/identifier
  - `kpi_category` (text) - security, compliance, operational, financial
  - `description` (text) - KPI description
  - `target_value` (numeric) - Target value
  - `target_operator` (text) - >, <, =, >=, <=
  - `measurement_unit` (text) - %, count, days, etc.
  - `frequency` (text) - daily, weekly, monthly, quarterly
  - `data_source` (text) - Where data comes from
  - `owner` (uuid) - KPI owner
  - `active` (boolean) - Whether KPI is currently tracked
  - `created_at` (timestamptz)

  ### 5. review_kpi_values
  Historical KPI measurements
  - `id` (uuid, primary key) - Unique measurement identifier
  - `kpi_id` (uuid) - References review_kpis.id
  - `review_id` (uuid) - References management_reviews.id (optional)
  - `measurement_date` (date) - Date of measurement
  - `actual_value` (numeric) - Measured value
  - `meets_target` (boolean) - Whether target was met
  - `variance` (numeric) - Difference from target
  - `notes` (text) - Context/explanation
  - `recorded_by` (uuid) - Who recorded the value
  - `created_at` (timestamptz)

  ### 6. review_documents
  Documents associated with reviews
  - `id` (uuid, primary key) - Unique document identifier
  - `review_id` (uuid) - References management_reviews.id
  - `document_type` (text) - agenda, minutes, report, presentation, supporting
  - `title` (text) - Document title
  - `file_path` (text) - Storage path
  - `file_size` (bigint) - File size in bytes
  - `mime_type` (text) - File MIME type
  - `uploaded_by` (uuid)
  - `uploaded_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Only admins can create/modify reviews
  - All users can view completed reviews
  - Audit trail for all changes

  ## Features
  - Quarterly review scheduling
  - Finding and action tracking
  - KPI monitoring with trend analysis
  - Document management
  - Compliance reporting
*/

-- ============================================================================
-- 1. MANAGEMENT REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS management_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_date date NOT NULL,
  review_period_start date NOT NULL,
  review_period_end date NOT NULL,
  review_type text NOT NULL CHECK (review_type IN ('quarterly', 'annual', 'ad_hoc')) DEFAULT 'quarterly',
  status text NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  attendees jsonb DEFAULT '[]'::jsonb,
  agenda_items jsonb DEFAULT '[]'::jsonb,
  summary text,
  overall_assessment text CHECK (overall_assessment IN ('satisfactory', 'needs_improvement', 'critical')),
  conducted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE management_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage reviews"
  ON management_reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "All authenticated users view completed reviews"
  ON management_reviews FOR SELECT
  TO authenticated
  USING (status = 'completed');

-- ============================================================================
-- 2. REVIEW FINDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES management_reviews(id) ON DELETE CASCADE,
  finding_type text NOT NULL CHECK (finding_type IN ('issue', 'observation', 'opportunity', 'strength')) DEFAULT 'observation',
  category text NOT NULL CHECK (category IN (
    'security_incident', 'policy_compliance', 'risk_management', 
    'access_control', 'data_protection', 'physical_security',
    'training_awareness', 'third_party', 'business_continuity',
    'audit_finding', 'performance', 'other'
  )),
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  title text NOT NULL,
  description text NOT NULL,
  evidence jsonb DEFAULT '{}'::jsonb,
  impact text,
  recommendations text,
  identified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage findings"
  ON review_findings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "All authenticated users view findings"
  ON review_findings FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 3. REVIEW ACTION ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES management_reviews(id) ON DELETE CASCADE,
  finding_id uuid REFERENCES review_findings(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'cancelled')) DEFAULT 'not_started',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date date NOT NULL,
  completed_date date,
  budget_required numeric(10,2) DEFAULT 0,
  resources_needed text,
  progress_notes jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE review_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and assignees manage actions"
  ON review_action_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role IN ('admin', 'super_admin') OR auth.uid() = review_action_items.assigned_to)
    )
  );

CREATE POLICY "All authenticated users view actions"
  ON review_action_items FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 4. REVIEW KPIs TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name text NOT NULL UNIQUE,
  kpi_category text NOT NULL CHECK (kpi_category IN ('security', 'compliance', 'operational', 'financial')),
  description text NOT NULL,
  target_value numeric NOT NULL,
  target_operator text NOT NULL CHECK (target_operator IN ('>', '<', '=', '>=', '<=')) DEFAULT '>=',
  measurement_unit text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  data_source text,
  owner uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage KPIs"
  ON review_kpis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "All authenticated users view KPIs"
  ON review_kpis FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 5. REVIEW KPI VALUES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_kpi_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id uuid NOT NULL REFERENCES review_kpis(id) ON DELETE CASCADE,
  review_id uuid REFERENCES management_reviews(id) ON DELETE SET NULL,
  measurement_date date NOT NULL,
  actual_value numeric NOT NULL,
  meets_target boolean NOT NULL,
  variance numeric,
  notes text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_kpi_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and KPI owners manage values"
  ON review_kpi_values FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM review_kpis 
      WHERE review_kpis.id = review_kpi_values.kpi_id 
      AND review_kpis.owner = auth.uid()
    )
  );

CREATE POLICY "All authenticated users view KPI values"
  ON review_kpi_values FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 6. REVIEW DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES management_reviews(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('agenda', 'minutes', 'report', 'presentation', 'supporting')),
  title text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE review_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage documents"
  ON review_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "All authenticated users view documents"
  ON review_documents FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_management_reviews_date 
  ON management_reviews(review_date DESC);

CREATE INDEX IF NOT EXISTS idx_management_reviews_status 
  ON management_reviews(status);

CREATE INDEX IF NOT EXISTS idx_management_reviews_type 
  ON management_reviews(review_type);

CREATE INDEX IF NOT EXISTS idx_review_findings_review 
  ON review_findings(review_id);

CREATE INDEX IF NOT EXISTS idx_review_findings_severity 
  ON review_findings(severity);

CREATE INDEX IF NOT EXISTS idx_review_action_items_review 
  ON review_action_items(review_id);

CREATE INDEX IF NOT EXISTS idx_review_action_items_assigned 
  ON review_action_items(assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_review_action_items_due_date 
  ON review_action_items(due_date) WHERE status NOT IN ('completed', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_review_kpi_values_kpi 
  ON review_kpi_values(kpi_id, measurement_date DESC);

CREATE INDEX IF NOT EXISTS idx_review_kpi_values_date 
  ON review_kpi_values(measurement_date DESC);

-- ============================================================================
-- 8. DEFAULT KPIs (ISO 27001 & SECURITY METRICS)
-- ============================================================================

INSERT INTO review_kpis (kpi_name, kpi_category, description, target_value, target_operator, measurement_unit, frequency, data_source)
VALUES
  ('security_incidents', 'security', 'Number of security incidents per quarter', 5, '<', 'count', 'quarterly', 'Incident tracking system'),
  ('patching_compliance', 'security', 'Percentage of systems patched within 30 days', 95, '>=', '%', 'monthly', 'Patch management system'),
  ('training_completion', 'compliance', 'Percentage of staff completing annual security training', 100, '>=', '%', 'quarterly', 'Training platform'),
  ('access_review_completion', 'security', 'Percentage of quarterly access reviews completed on time', 100, '>=', '%', 'quarterly', 'Access review logs'),
  ('backup_success_rate', 'operational', 'Percentage of successful backups', 99, '>=', '%', 'monthly', 'Backup monitoring'),
  ('vulnerability_remediation_time', 'security', 'Average days to remediate critical vulnerabilities', 30, '<=', 'days', 'monthly', 'Vulnerability scanner'),
  ('failed_login_attempts', 'security', 'Failed login attempts per day', 100, '<', 'count', 'daily', 'Authentication logs'),
  ('mean_time_to_detect', 'security', 'Average hours to detect security incidents', 24, '<=', 'hours', 'quarterly', 'Incident logs'),
  ('mean_time_to_respond', 'security', 'Average hours to respond to security incidents', 4, '<=', 'hours', 'quarterly', 'Incident logs'),
  ('policy_review_compliance', 'compliance', 'Percentage of policies reviewed on schedule', 100, '>=', '%', 'quarterly', 'Document management'),
  ('risk_assessment_currency', 'compliance', 'Percentage of risk assessments updated annually', 100, '>=', '%', 'annual', 'Risk register'),
  ('audit_findings_closure', 'compliance', 'Percentage of audit findings closed within SLA', 95, '>=', '%', 'quarterly', 'Audit tracking'),
  ('data_retention_compliance', 'compliance', 'Percentage of retention policies executed successfully', 100, '>=', '%', 'monthly', 'Data retention system'),
  ('phishing_simulation_click_rate', 'security', 'Percentage of users clicking phishing simulations', 5, '<', '%', 'monthly', 'Phishing platform')
ON CONFLICT (kpi_name) DO NOTHING;

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_management_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_management_reviews_timestamp
  BEFORE UPDATE ON management_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_management_review_timestamp();

CREATE TRIGGER update_review_action_items_timestamp
  BEFORE UPDATE ON review_action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_management_review_timestamp();

-- Function to calculate if KPI target is met
CREATE OR REPLACE FUNCTION calculate_kpi_target_met(
  p_kpi_id uuid,
  p_actual_value numeric
)
RETURNS boolean AS $$
DECLARE
  v_target_value numeric;
  v_target_operator text;
  v_meets_target boolean;
BEGIN
  SELECT target_value, target_operator
  INTO v_target_value, v_target_operator
  FROM review_kpis
  WHERE id = p_kpi_id;

  CASE v_target_operator
    WHEN '>' THEN v_meets_target := p_actual_value > v_target_value;
    WHEN '<' THEN v_meets_target := p_actual_value < v_target_value;
    WHEN '=' THEN v_meets_target := p_actual_value = v_target_value;
    WHEN '>=' THEN v_meets_target := p_actual_value >= v_target_value;
    WHEN '<=' THEN v_meets_target := p_actual_value <= v_target_value;
    ELSE v_meets_target := false;
  END CASE;

  RETURN v_meets_target;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get KPI trend (improving, declining, stable)
CREATE OR REPLACE FUNCTION get_kpi_trend(
  p_kpi_id uuid,
  p_periods integer DEFAULT 4
)
RETURNS TABLE(
  trend text,
  current_value numeric,
  previous_value numeric,
  change_percent numeric
) AS $$
DECLARE
  v_current numeric;
  v_previous numeric;
  v_change numeric;
  v_trend text;
BEGIN
  -- Get most recent value
  SELECT actual_value INTO v_current
  FROM review_kpi_values
  WHERE kpi_id = p_kpi_id
  ORDER BY measurement_date DESC
  LIMIT 1;

  -- Get previous period value
  SELECT actual_value INTO v_previous
  FROM review_kpi_values
  WHERE kpi_id = p_kpi_id
  ORDER BY measurement_date DESC
  OFFSET 1
  LIMIT 1;

  IF v_current IS NULL OR v_previous IS NULL THEN
    v_trend := 'insufficient_data';
    v_change := 0;
  ELSIF v_current = v_previous THEN
    v_trend := 'stable';
    v_change := 0;
  ELSIF v_current > v_previous THEN
    v_trend := 'increasing';
    v_change := ((v_current - v_previous) / NULLIF(v_previous, 0)) * 100;
  ELSE
    v_trend := 'decreasing';
    v_change := ((v_current - v_previous) / NULLIF(v_previous, 0)) * 100;
  END IF;

  RETURN QUERY SELECT v_trend, v_current, v_previous, v_change;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get review dashboard summary
CREATE OR REPLACE FUNCTION get_review_dashboard_summary()
RETURNS TABLE(
  total_reviews integer,
  reviews_this_quarter integer,
  open_actions integer,
  overdue_actions integer,
  critical_findings integer,
  kpis_below_target integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::integer FROM management_reviews) as total_reviews,
    (SELECT COUNT(*)::integer FROM management_reviews 
     WHERE review_date >= date_trunc('quarter', CURRENT_DATE)) as reviews_this_quarter,
    (SELECT COUNT(*)::integer FROM review_action_items 
     WHERE status NOT IN ('completed', 'cancelled')) as open_actions,
    (SELECT COUNT(*)::integer FROM review_action_items 
     WHERE status NOT IN ('completed', 'cancelled') 
     AND due_date < CURRENT_DATE) as overdue_actions,
    (SELECT COUNT(*)::integer FROM review_findings 
     WHERE severity = 'critical') as critical_findings,
    (SELECT COUNT(*)::integer FROM review_kpi_values rkv
     WHERE rkv.meets_target = false
     AND rkv.measurement_date >= CURRENT_DATE - INTERVAL '90 days') as kpis_below_target;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON management_reviews TO authenticated;
GRANT SELECT ON review_findings TO authenticated;
GRANT SELECT ON review_action_items TO authenticated;
GRANT SELECT ON review_kpis TO authenticated;
GRANT SELECT ON review_kpi_values TO authenticated;
GRANT SELECT ON review_documents TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_kpi_target_met TO authenticated;
GRANT EXECUTE ON FUNCTION get_kpi_trend TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_dashboard_summary TO authenticated;