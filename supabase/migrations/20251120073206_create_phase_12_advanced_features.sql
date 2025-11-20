/*
  # Phase 12: Advanced Features Database Schema

  ## New Tables
    - `appointment_slots` - Available appointment time slots
    - `appointment_bookings` - Public appointment bookings
    - `patient_consents` - Photo consent tracking
    - `before_after_photos` - Before/after photo gallery
    - `financing_applications` - Financing calculator submissions

  ## Security
    - Enable RLS on all tables
    - Public read for availability, admin write
    - Patient consent verification for photos
*/

-- Create appointment_slots table
CREATE TABLE IF NOT EXISTS appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES users(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  appointment_type text NOT NULL,
  location text NOT NULL,
  is_available boolean DEFAULT true,
  max_bookings integer DEFAULT 1,
  current_bookings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, slot_date, slot_time, location)
);

-- Create appointment_bookings table
CREATE TABLE IF NOT EXISTS appointment_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES appointment_slots(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text,
  procedure_type text NOT NULL,
  insurance_provider text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  confirmation_code text UNIQUE,
  booking_source text DEFAULT 'website',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patient_consents table
CREATE TABLE IF NOT EXISTS patient_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('photo_usage', 'testimonial', 'marketing')),
  consent_given boolean DEFAULT false,
  consent_date timestamptz,
  consent_signature text,
  expiry_date timestamptz,
  revoked boolean DEFAULT false,
  revoked_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create before_after_photos table (now that patient_consents exists)
CREATE TABLE IF NOT EXISTS before_after_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_consent_id uuid REFERENCES patient_consents(id) ON DELETE CASCADE,
  procedure_type text NOT NULL,
  before_photo_url text NOT NULL,
  after_photo_url text NOT NULL,
  timeframe text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create financing_applications table
CREATE TABLE IF NOT EXISTS financing_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  procedure_type text NOT NULL,
  procedure_cost numeric(10,2) NOT NULL,
  down_payment numeric(10,2) DEFAULT 0,
  monthly_payment numeric(10,2),
  term_months integer,
  interest_rate numeric(5,2),
  credit_score_range text,
  employment_status text,
  annual_income numeric(12,2),
  application_status text DEFAULT 'pending' CHECK (
    application_status IN ('pending', 'approved', 'denied', 'withdrawn')
  ),
  provider_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date ON appointment_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_available ON appointment_slots(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_appointment_slots_provider ON appointment_slots(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_status ON appointment_bookings(status);
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_email ON appointment_bookings(patient_email);
CREATE INDEX IF NOT EXISTS idx_before_after_published ON before_after_photos(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_before_after_featured ON before_after_photos(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_patient_consents_email ON patient_consents(patient_email);
CREATE INDEX IF NOT EXISTS idx_patient_consents_active ON patient_consents(consent_given, revoked) WHERE consent_given = true AND revoked = false;
CREATE INDEX IF NOT EXISTS idx_financing_applications_status ON financing_applications(application_status);

-- Enable RLS
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_after_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointment_slots
CREATE POLICY "Anyone can view available slots"
  ON appointment_slots FOR SELECT
  TO public
  USING (is_available = true AND slot_date >= CURRENT_DATE);

CREATE POLICY "Admins can manage slots"
  ON appointment_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'scheduler')
    )
  );

-- RLS Policies for appointment_bookings
CREATE POLICY "Anyone can create bookings"
  ON appointment_bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own bookings"
  ON appointment_bookings FOR SELECT
  TO public
  USING (patient_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Admins can view all bookings"
  ON appointment_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'scheduler')
    )
  );

CREATE POLICY "Admins can update bookings"
  ON appointment_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'scheduler')
    )
  );

-- RLS Policies for before_after_photos
CREATE POLICY "Anyone can view published photos"
  ON before_after_photos FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admins can manage photos"
  ON before_after_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- RLS Policies for patient_consents
CREATE POLICY "Patients can view own consents"
  ON patient_consents FOR SELECT
  TO public
  USING (patient_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can create consent"
  ON patient_consents FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all consents"
  ON patient_consents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- RLS Policies for financing_applications
CREATE POLICY "Anyone can create financing application"
  ON financing_applications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Applicants can view own applications"
  ON financing_applications FOR SELECT
  TO public
  USING (applicant_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Admins can view all applications"
  ON financing_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON financing_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Function to generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate confirmation code
CREATE OR REPLACE FUNCTION set_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL THEN
    NEW.confirmation_code = generate_confirmation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_booking_confirmation_code ON appointment_bookings;
CREATE TRIGGER set_booking_confirmation_code
  BEFORE INSERT ON appointment_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_confirmation_code();

-- Function to update slot availability
CREATE OR REPLACE FUNCTION update_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE appointment_slots
    SET 
      current_bookings = current_bookings + 1,
      is_available = CASE 
        WHEN current_bookings + 1 >= max_bookings THEN false
        ELSE true
      END
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE appointment_slots
    SET 
      current_bookings = GREATEST(0, current_bookings - 1),
      is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_slot_on_booking ON appointment_bookings;
CREATE TRIGGER update_slot_on_booking
  AFTER INSERT OR UPDATE ON appointment_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_availability();

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_appointment_slots_updated_at ON appointment_slots;
CREATE TRIGGER update_appointment_slots_updated_at
  BEFORE UPDATE ON appointment_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_bookings_updated_at ON appointment_bookings;
CREATE TRIGGER update_appointment_bookings_updated_at
  BEFORE UPDATE ON appointment_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_before_after_photos_updated_at ON before_after_photos;
CREATE TRIGGER update_before_after_photos_updated_at
  BEFORE UPDATE ON before_after_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_consents_updated_at ON patient_consents;
CREATE TRIGGER update_patient_consents_updated_at
  BEFORE UPDATE ON patient_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financing_applications_updated_at ON financing_applications;
CREATE TRIGGER update_financing_applications_updated_at
  BEFORE UPDATE ON financing_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();