/*
  # Add missing foreign key index on security_documentation

  ## Overview
  Adds a covering index for the foreign key `security_documentation_reviewed_by_fkey`
  on the `security_documentation` table. Without this index, joins and cascading
  operations on this foreign key result in sequential scans.

  ## Changes
  - Add index `idx_security_documentation_reviewed_by` on `security_documentation(reviewed_by)`
*/

CREATE INDEX IF NOT EXISTS idx_security_documentation_reviewed_by
  ON public.security_documentation (reviewed_by);
