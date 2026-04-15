/*
  # Add HSA/FSA columns to patient_insurance_info

  1. Modified Tables
    - `patient_insurance_info`
      - `has_hsa_fsa` (text) - Whether patient has HSA, FSA, both, or none
      - `hsa_fsa_provider` (text) - HSA/FSA provider name
      - `account_holder_name` (text) - Name of the account holder
      - `estimated_balance` (text) - Estimated account balance
      - `interested_in_payment_plan` (text) - Whether patient is interested in a payment plan
      - `additional_notes` (text) - Any additional notes from the patient

  2. Notes
    - These columns support the updated insurance/HSA/FSA form flow
    - All columns are nullable text to allow partial form submissions
    - Existing insurance columns (insurance_provider, policy_number, etc.) are preserved
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patient_insurance_info'
    AND column_name = 'has_hsa_fsa'
  ) THEN
    ALTER TABLE public.patient_insurance_info ADD COLUMN has_hsa_fsa text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patient_insurance_info'
    AND column_name = 'hsa_fsa_provider'
  ) THEN
    ALTER TABLE public.patient_insurance_info ADD COLUMN hsa_fsa_provider text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patient_insurance_info'
    AND column_name = 'account_holder_name'
  ) THEN
    ALTER TABLE public.patient_insurance_info ADD COLUMN account_holder_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patient_insurance_info'
    AND column_name = 'estimated_balance'
  ) THEN
    ALTER TABLE public.patient_insurance_info ADD COLUMN estimated_balance text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patient_insurance_info'
    AND column_name = 'interested_in_payment_plan'
  ) THEN
    ALTER TABLE public.patient_insurance_info ADD COLUMN interested_in_payment_plan text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patient_insurance_info'
    AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE public.patient_insurance_info ADD COLUMN additional_notes text;
  END IF;
END $$;
