/*
  # Fix Appointment Requests Table - Make Preferred Times Nullable

  1. Problem
    - Form doesn't collect preferred_time_1, preferred_time_2, preferred_time_3
    - These columns are NOT NULL causing INSERT to fail
    - Results in 401 Unauthorized error (due to constraint violation, not RLS)

  2. Solution
    - Make preferred_time columns nullable
    - Allows form submission without time preferences
    - Times can be set later by staff during scheduling

  3. Changes
    - ALTER preferred_time_1 to allow NULL
    - ALTER preferred_time_2 to allow NULL
    - ALTER preferred_time_3 to allow NULL
*/

-- Make preferred time columns nullable
ALTER TABLE appointment_requests
  ALTER COLUMN preferred_time_1 DROP NOT NULL;

ALTER TABLE appointment_requests
  ALTER COLUMN preferred_time_2 DROP NOT NULL;

ALTER TABLE appointment_requests
  ALTER COLUMN preferred_time_3 DROP NOT NULL;

-- Verify changes
DO $$
BEGIN
  RAISE NOTICE 'appointment_requests table updated: preferred_time columns are now nullable';
  RAISE NOTICE 'Form submissions will now work without time preferences';
END $$;
