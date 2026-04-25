/*
  # Tighten testimonials INSERT policy to require authentication

  1. Security Changes
    - Replace the "Anyone can submit testimonials" INSERT policy with one that requires authenticated users
    - Ensures only logged-in patients/users can submit testimonials
    - Keeps the same data validation (non-empty name and content)
*/

DROP POLICY IF EXISTS "Anyone can submit testimonials" ON testimonials;

CREATE POLICY "Authenticated users can submit testimonials"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    content IS NOT NULL AND content <> ''
  );