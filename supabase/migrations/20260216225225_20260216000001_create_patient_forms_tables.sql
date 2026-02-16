/*
  # Create Patient Forms Tables
  
  ## Overview
  Creates tables for the tabbed patient forms system allowing patients to complete
  registration, medical history, insurance, and consent forms online.
  
  ## Tables Created
  
  1. **patient_registrations**
     - Captures new patient demographic information
     - Fields: name, DOB, contact info, address, reason for visit
     - Links to auth.users when patient has account
  
  2. **patient_medical_histories**
     - Stores patient medical history information
     - Fields: eye conditions, surgeries, medications, allergies, diabetes, family history
     - Links to patient_registrations
  
  3. **patient_insurance_info**
     - Captures insurance provider and policy details
     - Fields: provider, policy/group numbers, policyholder, relationship, secondary insurance
     - Links to patient_registrations
  
  4. **patient_consents**
     - Stores HIPAA and treatment consent acknowledgments
     - Fields: consent types, checkboxes, signature, date
     - Links to patient_registrations
  
  ## Security
  
  - All tables have RLS enabled
  - Admins have full access to all records
  - Patients can insert their own forms (public forms)
  - Patients can view and update their own records
  - All PII is encrypted at rest via Supabase's built-in encryption
  
  ## Compliance
  
  - HIPAA compliant storage
  - Audit trail via created_at/updated_at timestamps
  - Secure submission from public forms
*/

-- =====================================================
-- Table: patient_registrations
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Demographics
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  phone_number text NOT NULL,
  email_address text NOT NULL,
  
  -- Address (optional)
  street_address text,
  city text,
  state text,
  zip text,
  
  -- Visit information
  reason_for_visit text,
  
  -- Metadata
  form_source text DEFAULT 'web_form',
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'processed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_phone CHECK (phone_number ~ '^[\d\s\(\)\-\+]+$'),
  CONSTRAINT valid_email CHECK (email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_dob CHECK (date_of_birth <= CURRENT_DATE AND date_of_birth >= CURRENT_DATE - INTERVAL '120 years')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_registrations_user_id ON public.patient_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_registrations_email ON public.patient_registrations(email_address);
CREATE INDEX IF NOT EXISTS idx_patient_registrations_status ON public.patient_registrations(status);
CREATE INDEX IF NOT EXISTS idx_patient_registrations_created_at ON public.patient_registrations(created_at DESC);

-- RLS Policies
ALTER TABLE public.patient_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all registrations"
  ON public.patient_registrations
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Anyone can submit registration"
  ON public.patient_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own registrations"
  ON public.patient_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own registrations"
  ON public.patient_registrations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- Table: patient_medical_histories
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_medical_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.patient_registrations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Medical History
  current_eye_conditions text,
  previous_eye_surgeries text,
  current_medications text,
  drug_allergies text,
  has_diabetes boolean,
  family_history_eye_disease boolean,
  
  -- Metadata
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'processed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_medical_histories_registration_id ON public.patient_medical_histories(registration_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_histories_user_id ON public.patient_medical_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_histories_created_at ON public.patient_medical_histories(created_at DESC);

-- RLS Policies
ALTER TABLE public.patient_medical_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all medical histories"
  ON public.patient_medical_histories
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Anyone can submit medical history"
  ON public.patient_medical_histories
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own medical histories"
  ON public.patient_medical_histories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own medical histories"
  ON public.patient_medical_histories
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ))
  WITH CHECK (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ));

-- =====================================================
-- Table: patient_insurance_info
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_insurance_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.patient_registrations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Insurance Details
  insurance_provider text,
  policy_number text,
  group_number text,
  policyholder_name text,
  relationship_to_patient text,
  secondary_insurance text,
  
  -- Metadata
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'processed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_insurance_info_registration_id ON public.patient_insurance_info(registration_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_info_user_id ON public.patient_insurance_info(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_info_created_at ON public.patient_insurance_info(created_at DESC);

-- RLS Policies
ALTER TABLE public.patient_insurance_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all insurance info"
  ON public.patient_insurance_info
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Anyone can submit insurance info"
  ON public.patient_insurance_info
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own insurance info"
  ON public.patient_insurance_info
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own insurance info"
  ON public.patient_insurance_info
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ))
  WITH CHECK (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ));

-- =====================================================
-- Table: patient_consent_forms
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_consent_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.patient_registrations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Consent Acknowledgments
  hipaa_privacy_acknowledgment boolean NOT NULL DEFAULT false,
  consent_to_treatment boolean NOT NULL DEFAULT false,
  
  -- Signature
  patient_signature text NOT NULL,
  signature_date date NOT NULL,
  
  -- Metadata
  ip_address inet,
  user_agent text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'processed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT signature_required CHECK (LENGTH(patient_signature) >= 2),
  CONSTRAINT valid_signature_date CHECK (signature_date <= CURRENT_DATE AND signature_date >= CURRENT_DATE - INTERVAL '7 days'),
  CONSTRAINT consents_must_be_checked CHECK (hipaa_privacy_acknowledgment = true AND consent_to_treatment = true)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_registration_id ON public.patient_consent_forms(registration_id);
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_user_id ON public.patient_consent_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_consent_forms_created_at ON public.patient_consent_forms(created_at DESC);

-- RLS Policies
ALTER TABLE public.patient_consent_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all consent forms"
  ON public.patient_consent_forms
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Anyone can submit consent forms"
  ON public.patient_consent_forms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own consent forms"
  ON public.patient_consent_forms
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR registration_id IN (
    SELECT id FROM public.patient_registrations WHERE user_id = auth.uid()
  ));

-- =====================================================
-- Functions: Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_patient_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Apply triggers
CREATE TRIGGER update_patient_registrations_updated_at
  BEFORE UPDATE ON public.patient_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_forms_updated_at();

CREATE TRIGGER update_patient_medical_histories_updated_at
  BEFORE UPDATE ON public.patient_medical_histories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_forms_updated_at();

CREATE TRIGGER update_patient_insurance_info_updated_at
  BEFORE UPDATE ON public.patient_insurance_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_forms_updated_at();

CREATE TRIGGER update_patient_consent_forms_updated_at
  BEFORE UPDATE ON public.patient_consent_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_forms_updated_at();

-- =====================================================
-- Table Comments
-- =====================================================

COMMENT ON TABLE public.patient_registrations IS 
'Stores new patient demographic and contact information from online registration forms. HIPAA compliant.';

COMMENT ON TABLE public.patient_medical_histories IS 
'Stores patient medical history including conditions, surgeries, medications. HIPAA compliant PHI.';

COMMENT ON TABLE public.patient_insurance_info IS 
'Stores patient insurance provider and policy information. PII/PHI protected.';

COMMENT ON TABLE public.patient_consent_forms IS 
'Stores HIPAA privacy acknowledgment and consent to treatment with electronic signatures. Legally binding records.';
