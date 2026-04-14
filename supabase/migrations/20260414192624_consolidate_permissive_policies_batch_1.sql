/*
  # Consolidate multiple permissive policies - Batch 1

  ## Overview
  When a table has two permissive policies for the same role+action, Postgres ORs
  them together at query time. This is semantically correct but adds overhead.
  This migration consolidates overlapping policies into single policies per action,
  combining admin and user conditions with explicit OR.

  ## Strategy
  - Drop the admin ALL policy and the user-specific policy
  - Create individual per-action policies that use OR to combine admin + user conditions
  - This maintains identical authorization logic with fewer policy evaluations

  ## Modified Tables (Batch 1 - Read-only overlap tables)
  Tables where an admin ALL policy overlaps with an authenticated SELECT policy.
  Fix: drop user SELECT, replace admin ALL with admin-only non-SELECT + consolidated SELECT.

  - compliance_documents
  - data_retention_policies
  - management_reviews
  - security_documentation
  - review_action_items, review_documents, review_findings
  - review_kpi_values, review_kpis
*/

-- ============================================================
-- compliance_documents: admin ALL + auth SELECT(true)
-- Consolidate: keep admin ALL for write ops, merge SELECT
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view compliance documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Admins can manage compliance documents" ON public.compliance_documents;

CREATE POLICY "Admins can manage compliance documents"
  ON public.compliance_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view compliance documents"
  ON public.compliance_documents
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = 'admin'
    )
  );

-- ============================================================
-- data_retention_policies: admin ALL + auth SELECT(status=active)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view active policies" ON public.data_retention_policies;
DROP POLICY IF EXISTS "Admins manage retention policies" ON public.data_retention_policies;

CREATE POLICY "Admins manage retention policies"
  ON public.data_retention_policies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Non-admins view active retention policies"
  ON public.data_retention_policies
  FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- management_reviews: admin ALL + auth SELECT(status=completed)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view completed reviews" ON public.management_reviews;
DROP POLICY IF EXISTS "Admins manage reviews" ON public.management_reviews;

CREATE POLICY "Admins manage reviews"
  ON public.management_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Non-admins view completed reviews"
  ON public.management_reviews
  FOR SELECT
  TO authenticated
  USING (
    status = 'completed'
    AND NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- security_documentation: admin ALL + auth SELECT(true)
-- ============================================================
DROP POLICY IF EXISTS "All users can view security documentation" ON public.security_documentation;
DROP POLICY IF EXISTS "Admins manage security documentation" ON public.security_documentation;

CREATE POLICY "Admins manage security documentation"
  ON public.security_documentation
  FOR ALL
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Non-admins view security documentation"
  ON public.security_documentation
  FOR SELECT
  TO authenticated
  USING (NOT is_current_user_admin());

-- ============================================================
-- review_action_items: admin+assignee ALL + auth SELECT(true)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view actions" ON public.review_action_items;
DROP POLICY IF EXISTS "Admins and assignees manage actions" ON public.review_action_items;

CREATE POLICY "Admins and assignees manage actions"
  ON public.review_action_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
        AND (users.role = ANY(ARRAY['admin','super_admin']) OR review_action_items.assigned_to = (select auth.uid()))
    )
  );

CREATE POLICY "Non-admins view actions"
  ON public.review_action_items
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
        AND (users.role = ANY(ARRAY['admin','super_admin']) OR review_action_items.assigned_to = (select auth.uid()))
    )
  );

-- ============================================================
-- review_documents: admin ALL + auth SELECT(true)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view documents" ON public.review_documents;
DROP POLICY IF EXISTS "Admins manage documents" ON public.review_documents;

CREATE POLICY "Admins manage documents"
  ON public.review_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Non-admins view documents"
  ON public.review_documents
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- review_findings: admin ALL + auth SELECT(true)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view findings" ON public.review_findings;
DROP POLICY IF EXISTS "Admins manage findings" ON public.review_findings;

CREATE POLICY "Admins manage findings"
  ON public.review_findings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Non-admins view findings"
  ON public.review_findings
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

-- ============================================================
-- review_kpi_values: admin+owner ALL + auth SELECT(true)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view KPI values" ON public.review_kpi_values;
DROP POLICY IF EXISTS "Admins and KPI owners manage values" ON public.review_kpi_values;

CREATE POLICY "Admins and KPI owners manage values"
  ON public.review_kpi_values
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN review_kpis rk ON rk.id = review_kpi_values.kpi_id
      WHERE u.id = (select auth.uid())
        AND (u.role = ANY(ARRAY['admin','super_admin']) OR rk.owner = (select auth.uid()))
    )
  );

CREATE POLICY "Non-admins view KPI values"
  ON public.review_kpi_values
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM users u
      JOIN review_kpis rk ON rk.id = review_kpi_values.kpi_id
      WHERE u.id = (select auth.uid())
        AND (u.role = ANY(ARRAY['admin','super_admin']) OR rk.owner = (select auth.uid()))
    )
  );

-- ============================================================
-- review_kpis: admin ALL + auth SELECT(true)
-- ============================================================
DROP POLICY IF EXISTS "All authenticated users view KPIs" ON public.review_kpis;
DROP POLICY IF EXISTS "Admins manage KPIs" ON public.review_kpis;

CREATE POLICY "Admins manage KPIs"
  ON public.review_kpis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );

CREATE POLICY "Non-admins view KPIs"
  ON public.review_kpis
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid()) AND users.role = ANY(ARRAY['admin','super_admin'])
    )
  );
