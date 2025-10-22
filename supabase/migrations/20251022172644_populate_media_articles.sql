/*
  # Populate Media Page Articles

  ## Overview
  Adds missing columns to articles table and populates with content from the Media page,
  including blog posts that are currently hardcoded in the React component.

  ## Changes

  ### 1. Enhance Articles Table
    - `featured_image` (text) - URL to article's featured image
    - `excerpt` (text) - Short summary/excerpt for article cards
    - `read_time` (integer) - Estimated reading time in minutes
    - `slug` (text) - URL-friendly slug for article
    - `featured` (boolean) - Whether article is featured

  ### 2. Populate Articles
    - Featured article about vision correction innovation
    - 4 blog posts covering telemedicine, recovery, ICL, and infrastructure
    - All marked as published for immediate display

  ## Benefits
    - Media page content now managed through CMS
    - Articles can be edited without code changes
    - Professional blog management system
*/

-- ============================================================================
-- 1. ADD COLUMNS TO ARTICLES TABLE
-- ============================================================================

DO $$
BEGIN
  -- Add featured_image column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'featured_image'
  ) THEN
    ALTER TABLE articles ADD COLUMN featured_image text;
  END IF;

  -- Add excerpt column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE articles ADD COLUMN excerpt text;
  END IF;

  -- Add read_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'read_time'
  ) THEN
    ALTER TABLE articles ADD COLUMN read_time integer DEFAULT 5;
  END IF;

  -- Add slug column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug text;
  END IF;

  -- Add featured column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'featured'
  ) THEN
    ALTER TABLE articles ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug) WHERE slug IS NOT NULL;

-- Create index for featured articles
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = true;

-- ============================================================================
-- 2. POPULATE ARTICLES
-- ============================================================================

-- Insert articles only if table is empty to avoid duplicates
INSERT INTO articles (
  title,
  content,
  excerpt,
  category,
  featured_image,
  read_time,
  slug,
  featured,
  status,
  published_at,
  tags
)
SELECT * FROM (VALUES
  (
    'The Future of Vision Correction: Innovation in Pacific Eye Care',
    'The landscape of vision correction is evolving rapidly, with groundbreaking technologies emerging every year. At ClearSight, we''re committed to bringing the most advanced procedures to the Pacific islands, ensuring our community has access to world-class eye care without needing to travel to the mainland. Our state-of-the-art facilities combine cutting-edge laser technology with personalized patient care, delivering results that consistently exceed expectations. We''ve invested heavily in the latest diagnostic equipment and surgical tools, allowing us to perform complex procedures with unprecedented precision. From traditional LASIK to advanced ICL implantation, our comprehensive approach addresses a wide range of vision challenges. Join us as we explore the innovations shaping the future of vision correction and how they''re transforming lives across the Pacific region.',
    'Discover how cutting-edge vision correction technologies are revolutionizing eye care in the Pacific islands and changing lives one procedure at a time.',
    'Innovation',
    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
    8,
    'future-of-vision-correction-pacific',
    true,
    'published',
    '2024-03-15 10:00:00'::timestamptz,
    ARRAY['innovation', 'technology', 'vision correction']
  ),
  (
    'Telemedicine and Remote Eye Care: Expanding Access Across the Pacific',
    'In the vast expanse of the Pacific, access to specialized healthcare has always been a challenge. Islands separated by hundreds of miles of ocean often struggle to provide their residents with timely access to eye care specialists. This is where telemedicine is making a revolutionary difference. Our telemedicine program connects patients on remote islands with our expert ophthalmologists through secure video consultations, allowing for preliminary assessments, follow-up care, and educational sessions without the need for expensive and time-consuming travel. We''ve developed protocols that enable us to conduct comprehensive eye examinations remotely using portable diagnostic equipment operated by trained local health workers. This technology is particularly valuable for post-operative care, allowing us to monitor healing progress and address concerns immediately. The results have been transformative—patients who previously might have delayed or skipped follow-up appointments can now receive continuous care. We''re also using telemedicine to train local healthcare providers, expanding the network of eye care professionals across the region.',
    'Learn how telemedicine is breaking down geographical barriers and bringing expert eye care to remote Pacific island communities.',
    'Technology',
    '/assets/images/blogs/jsb-co-VFkksKfrsvM-unsplash.jpg',
    6,
    'telemedicine-remote-eye-care-pacific',
    false,
    'published',
    '2024-03-10 10:00:00'::timestamptz,
    ARRAY['telemedicine', 'technology', 'access']
  ),
  (
    'What to Expect: Your LASIK Recovery Journey',
    'Understanding what happens after LASIK surgery can help ease anxiety and ensure the best possible outcome. The recovery process is remarkably quick for most patients—many report improved vision within hours of the procedure. However, knowing what to expect each step of the way is crucial for optimal healing. Immediately after surgery, you might experience some mild discomfort, including a gritty sensation or watering eyes. This is completely normal and typically subsides within a few hours. We provide protective eye shields to wear while sleeping for the first few nights to prevent accidental rubbing. The first 24 hours are critical: avoid screens when possible, use prescribed eye drops religiously, and rest your eyes. Most patients return to work within 48 hours, though we recommend taking it easy for the first week. Vision continues to stabilize over the following weeks and months. Follow-up appointments at one day, one week, one month, and three months post-surgery allow us to monitor your healing and make any necessary adjustments. We''re here to support you every step of the way.',
    'A comprehensive guide to LASIK recovery, from the first hours after surgery through complete healing and beyond.',
    'Patient Care',
    '/assets/images/misc/mainimage-lasik.jpg',
    5,
    'lasik-recovery-journey-guide',
    false,
    'published',
    '2024-03-05 10:00:00'::timestamptz,
    ARRAY['LASIK', 'recovery', 'patient care']
  ),
  (
    'ICL: The Revolutionary Alternative to LASIK for High Prescriptions',
    'For patients with severe myopia or thin corneas, traditional LASIK isn''t always an option. Enter Implantable Collamer Lenses (ICL)—a revolutionary procedure that offers exceptional vision correction for those who fall outside LASIK''s parameters. Unlike LASIK, which reshapes the cornea, ICL involves implanting a tiny lens between the iris and natural lens. This additive procedure preserves the cornea''s natural structure while correcting refractive errors ranging from -3.0 to -20.0 diopters. The Collamer material is biocompatible and contains collagen, making it extremely comfortable and invisible to the naked eye. The procedure takes about 15-30 minutes per eye and is performed on an outpatient basis. Recovery is quick, with most patients seeing dramatic improvement within days. One of ICL''s most appealing features is its reversibility—if necessary, the lens can be removed. The results are stunning: patients with severe prescriptions who previously relied on thick glasses often achieve better than 20/20 vision. Dr. Flowers has extensive experience with ICL and has helped hundreds of patients achieve the visual freedom they thought was impossible.',
    'Explore ICL technology and how it''s providing life-changing vision correction for patients with severe prescriptions.',
    'Procedures',
    '/assets/images/misc/iCare-DRSplus-with-screen.png',
    7,
    'icl-revolutionary-alternative-lasik',
    false,
    'published',
    '2024-02-28 10:00:00'::timestamptz,
    ARRAY['ICL', 'procedures', 'vision correction']
  ),
  (
    'Building Healthcare Infrastructure in Remote Pacific Communities',
    'Access to quality healthcare is a fundamental human right, yet many Pacific island communities lack basic medical infrastructure. At ClearSight, we believe in more than just performing procedures—we''re committed to building sustainable healthcare systems that serve entire communities. Our mission extends beyond our clinics to include training local healthcare workers, establishing satellite facilities, and creating telemedicine networks that connect remote islands to specialized care. We''ve partnered with local governments and international organizations to develop comprehensive eye care programs that include routine screenings, preventive education, and surgical interventions. In many communities, we''ve introduced the first-ever eye care services, identifying and treating conditions that have gone undiagnosed for years. Our mobile clinics travel to remote islands on regular schedules, ensuring that geography doesn''t determine health outcomes. We also focus on education, teaching communities about eye health, injury prevention, and the importance of regular check-ups. This holistic approach is transforming healthcare in the Pacific, one island at a time. By building local capacity and sustainable systems, we''re ensuring that quality eye care remains accessible for generations to come.',
    'Discover our mission to build sustainable eye care infrastructure and improve healthcare access across Pacific island communities.',
    'Mission',
    '/assets/images/ads/black_biri_illustrationImage.png',
    9,
    'building-healthcare-infrastructure-pacific',
    false,
    'published',
    '2024-02-20 10:00:00'::timestamptz,
    ARRAY['mission', 'infrastructure', 'community']
  )
) AS v(
  title, content, excerpt, category, featured_image, read_time, 
  slug, featured, status, published_at, tags
)
WHERE NOT EXISTS (
  SELECT 1 FROM articles WHERE status = 'published' LIMIT 1
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================