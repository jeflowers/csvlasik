/*
  # Fix has_hsa_fsa column type from boolean to text

  1. Modified Tables
    - `patient_insurance_info`
      - `has_hsa_fsa` changed from boolean to text
        (form sends 'hsa', 'fsa', 'both', 'none' — not true/false)

  2. Notes
    - Uses ALTER COLUMN ... TYPE text to convert existing boolean values
    - Existing true/false values will be cast to 'true'/'false' strings
*/

ALTER TABLE public.patient_insurance_info
  ALTER COLUMN has_hsa_fsa TYPE text USING has_hsa_fsa::text;
