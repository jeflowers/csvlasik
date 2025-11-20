/*
  # Fix RLS Auth Performance Issues - Corrected Column Names

  Wraps auth.uid() in SELECT to prevent re-evaluation per row.
  This significantly improves RLS policy performance at scale.
  
  Addresses 34 auth RLS initialization issues with correct column references.
*/

-- Translation Cache Policies
DROP POLICY IF EXISTS "Admins manage translations" ON public.translation_cache;
CREATE POLICY "Admins manage translations" ON public.translation_cache
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Notification Preferences Policies  
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Media Files Policies
DROP POLICY IF EXISTS "Admins can delete media" ON public.media_files;
CREATE POLICY "Admins can delete media" ON public.media_files
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert media" ON public.media_files;
CREATE POLICY "Admins can insert media" ON public.media_files
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update media" ON public.media_files;
CREATE POLICY "Admins can update media" ON public.media_files
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Risk Assessment Policies
DROP POLICY IF EXISTS "Admins can create risk assessments" ON public.risk_assessments;
CREATE POLICY "Admins can create risk assessments" ON public.risk_assessments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update risk assessments" ON public.risk_assessments;
CREATE POLICY "Admins can update risk assessments" ON public.risk_assessments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view risk assessments" ON public.risk_assessments;
CREATE POLICY "Admins can view risk assessments" ON public.risk_assessments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Risk Findings Policies
DROP POLICY IF EXISTS "Admins can manage risk findings" ON public.risk_findings;
CREATE POLICY "Admins can manage risk findings" ON public.risk_findings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view risk findings" ON public.risk_findings;
CREATE POLICY "Admins can view risk findings" ON public.risk_findings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Compliance Documents Policies
DROP POLICY IF EXISTS "Admins can manage compliance documents" ON public.compliance_documents;
CREATE POLICY "Admins can manage compliance documents" ON public.compliance_documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Page Views Policies
DROP POLICY IF EXISTS "Admins can view analytics" ON public.page_views;
CREATE POLICY "Admins can view analytics" ON public.page_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- User Events Policies
DROP POLICY IF EXISTS "Admins can view user events" ON public.user_events;
CREATE POLICY "Admins can view user events" ON public.user_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Conversion Tracking Policies
DROP POLICY IF EXISTS "Admins can view conversions" ON public.conversion_tracking;
CREATE POLICY "Admins can view conversions" ON public.conversion_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Error Logs Policies
DROP POLICY IF EXISTS "Admins can manage errors" ON public.error_logs;
CREATE POLICY "Admins can manage errors" ON public.error_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Performance Metrics Policies
DROP POLICY IF EXISTS "Admins can view performance" ON public.performance_metrics;
CREATE POLICY "Admins can view performance" ON public.performance_metrics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Email Templates Policies
DROP POLICY IF EXISTS "Admins can insert email templates" ON public.email_templates;
CREATE POLICY "Admins can insert email templates" ON public.email_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update email templates" ON public.email_templates;
CREATE POLICY "Admins can update email templates" ON public.email_templates
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all email templates" ON public.email_templates;
CREATE POLICY "Admins can view all email templates" ON public.email_templates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Email Logs Policies
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;
CREATE POLICY "Admins can view all email logs" ON public.email_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Appointment Slots Policies
DROP POLICY IF EXISTS "Admins can manage slots" ON public.appointment_slots;
CREATE POLICY "Admins can manage slots" ON public.appointment_slots
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

-- Appointment Bookings Policies (using patient_email column)
DROP POLICY IF EXISTS "Admins can update bookings" ON public.appointment_bookings;
CREATE POLICY "Admins can update bookings" ON public.appointment_bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.appointment_bookings;
CREATE POLICY "Admins can view all bookings" ON public.appointment_bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role IN ('admin', 'scheduler')
    )
  );

DROP POLICY IF EXISTS "Users can view own bookings" ON public.appointment_bookings;
CREATE POLICY "Users can view own bookings" ON public.appointment_bookings
  FOR SELECT TO authenticated
  USING (patient_email = (SELECT auth.email()));

-- Patient Consents Policies (using patient_email column)
DROP POLICY IF EXISTS "Admins can view all consents" ON public.patient_consents;
CREATE POLICY "Admins can view all consents" ON public.patient_consents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Patients can view own consents" ON public.patient_consents;
CREATE POLICY "Patients can view own consents" ON public.patient_consents
  FOR SELECT TO authenticated
  USING (patient_email = (SELECT auth.email()));

-- Before After Photos Policies
DROP POLICY IF EXISTS "Admins can manage photos" ON public.before_after_photos;
CREATE POLICY "Admins can manage photos" ON public.before_after_photos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- Financing Applications Policies (using applicant_email column)
DROP POLICY IF EXISTS "Admins can update applications" ON public.financing_applications;
CREATE POLICY "Admins can update applications" ON public.financing_applications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all applications" ON public.financing_applications;
CREATE POLICY "Admins can view all applications" ON public.financing_applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Applicants can view own applications" ON public.financing_applications;
CREATE POLICY "Applicants can view own applications" ON public.financing_applications
  FOR SELECT TO authenticated
  USING (applicant_email = (SELECT auth.email()));
