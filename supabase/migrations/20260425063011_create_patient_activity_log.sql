/*
  # Create patient activity log table

  1. New Tables
    - `patient_activity_log`
      - `id` (bigint, primary key, auto-generated)
      - `user_id` (uuid, references auth.users, NOT NULL)
      - `activity_type` (text, NOT NULL) - e.g. 'login', 'logout', 'form_submit', 'form_update', 'testimonial_submit'
      - `activity_label` (text) - human-readable description of the activity
      - `metadata` (jsonb) - optional extra data (form names, IP, user agent, etc.)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `patient_activity_log` table
    - Patients can only view their own activity logs
    - Patients can insert their own activity logs
    - Admins can view all activity logs

  3. Indexes
    - Index on user_id + created_at for efficient timeline queries
*/

CREATE TABLE IF NOT EXISTS patient_activity_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_label text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_activity_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_patient_activity_log_user_time
  ON patient_activity_log (user_id, created_at DESC);

CREATE POLICY "Patients can view own activity"
  ON patient_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can log own activity"
  ON patient_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
  ON patient_activity_log
  FOR SELECT
  TO authenticated
  USING (is_current_user_admin());