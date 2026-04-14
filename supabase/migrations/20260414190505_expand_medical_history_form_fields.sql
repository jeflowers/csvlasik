/*
  # Expand Medical History Form Fields

  ## Overview
  Adds comprehensive eye/medical history fields to the patient_medical_histories table
  to match the full clinical intake form. The form now covers 11 detailed sections including
  vision correction, eye exam history, prescriptions, symptoms, injuries, surgeries,
  medical conditions, medications, allergies, and family history.

  ## Modified Tables
  - `patient_medical_histories`
    - `vision_correction` (jsonb) - glasses, contacts type info
    - `last_eye_exam_date` (text) - date/timeframe of last exam
    - `last_eye_exam_doctor` (text) - doctor name
    - `last_eye_exam_clinic` (text) - clinic name
    - `last_eye_exam_may_verify` (boolean) - permission to verify
    - `prescription_age` (text) - how old current prescription is
    - `prescription_changed_past_year` (text) - no/yes/not_sure
    - `current_symptoms` (jsonb) - array of symptom checkboxes
    - `eye_injuries` (text) - no or yes with details
    - `eye_injuries_details` (text) - details if yes
    - `eye_surgery_history` (text) - no or yes with details
    - `eye_surgery_details` (text) - type, eye, when
    - `medical_conditions` (jsonb) - array of condition checkboxes
    - `medical_conditions_other` (text) - other conditions
    - `has_allergies` (text) - yes/no for medication/food/drug allergies
    - `allergies_details` (text) - allergy type and reactions
    - `family_history_conditions` (jsonb) - array of family conditions

  ## Important Notes
  1. All new columns are nullable to maintain backward compatibility
  2. Existing data is preserved - no columns are dropped
  3. JSONB columns store arrays of selected checkbox values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'vision_correction'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN vision_correction jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'last_eye_exam_date'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN last_eye_exam_date text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'last_eye_exam_doctor'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN last_eye_exam_doctor text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'last_eye_exam_clinic'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN last_eye_exam_clinic text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'last_eye_exam_may_verify'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN last_eye_exam_may_verify boolean;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'prescription_age'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN prescription_age text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'prescription_changed_past_year'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN prescription_changed_past_year text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'current_symptoms'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN current_symptoms jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'eye_injuries'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN eye_injuries text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'eye_injuries_details'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN eye_injuries_details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'eye_surgery_history'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN eye_surgery_history text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'eye_surgery_details'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN eye_surgery_details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'medical_conditions'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN medical_conditions jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'medical_conditions_other'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN medical_conditions_other text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'has_allergies'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN has_allergies text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'allergies_details'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN allergies_details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_medical_histories' AND column_name = 'family_history_conditions'
  ) THEN
    ALTER TABLE public.patient_medical_histories ADD COLUMN family_history_conditions jsonb;
  END IF;
END $$;

COMMENT ON TABLE public.patient_medical_histories IS 
'Stores comprehensive patient eye/medical history including vision correction, exam history, prescriptions, symptoms, injuries, surgeries, medical conditions, medications, allergies, and family history. HIPAA compliant PHI.';
