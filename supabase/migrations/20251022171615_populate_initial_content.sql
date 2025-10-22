/*
  # Populate Initial Content from Site

  ## Overview
  This migration populates the database with the current content from the site,
  including testimonials and statistics that are currently hardcoded in the React components.

  ## Changes

  ### 1. Populate Statistics Table
    - `total_procedures` - Total LASIK procedures performed (30,000+)
    - `success_rate` - Procedure success rate (98%)
    - `patient_satisfaction` - Patient satisfaction rating (99.2%)
    - `average_rating` - Average patient rating (4.9/5)

  ### 2. Populate Testimonials Table
    - Three featured testimonials from current site
    - All marked as approved for immediate display
    - Includes patient details, procedure types, and vision results

  ## Benefits
    - Content now managed through CMS
    - Single source of truth
    - No code changes needed for content updates
    - Professional CMS operation
*/

-- ============================================================================
-- 1. POPULATE STATISTICS
-- ============================================================================

INSERT INTO statistics (name, value, display_order) VALUES
  ('total_procedures', '30000', 1),
  ('success_rate', '98', 2),
  ('patient_satisfaction', '99.2', 3),
  ('average_rating', '4.9', 4)
ON CONFLICT (name) DO UPDATE SET
  value = EXCLUDED.value,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- ============================================================================
-- 2. POPULATE TESTIMONIALS
-- ============================================================================

-- Insert testimonials only if table is empty to avoid duplicates
INSERT INTO testimonials (
  name, 
  content, 
  rating, 
  procedure_type, 
  approved,
  email,
  procedure_date
)
SELECT * FROM (VALUES
  (
    'Sarah Martinez',
    'I couldn''t see the whiteboard from just 3 feet away. Now I have better than perfect vision! Dr. Flowers didn''t just change my sight—he changed my entire career. I can finally connect with my students without struggling to see their faces.',
    5,
    'LASIK',
    true,
    'sarah.martinez@example.com',
    '2024-08-15'::date
  ),
  (
    'Captain Michael Torres',
    'My career required perfect vision without glasses. Dr. Flowers'' PRK gave me exactly that. The procedure was comfortable, recovery was smooth, and now I''m cleared for flight with better vision than I''ve had in 20 years.',
    5,
    'PRK',
    true,
    'michael.torres@example.com',
    '2024-07-22'::date
  ),
  (
    'Dr. Amanda Rodriguez',
    'With -15.00 prescription, LASIK wasn''t an option. ICL was revolutionary for me. As a surgeon myself, I needed the absolute best vision quality. The results exceeded my expectations - crisp, clear vision without any compromise.',
    5,
    'ICL',
    true,
    'amanda.rodriguez@example.com',
    '2024-09-10'::date
  )
) AS v(name, content, rating, procedure_type, approved, email, procedure_date)
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials LIMIT 1
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================