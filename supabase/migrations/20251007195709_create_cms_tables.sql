/*
  # ClearSight CMS Database Migration

  ## Overview
  Creates the complete database schema for the ClearSight CMS application, replacing the SQLite backend with Supabase.

  ## New Tables Created

  ### 1. users
  User accounts for CMS authentication and authorization
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email for login
  - `password` (text) - Hashed password
  - `name` (text) - User's full name
  - `role` (text) - User role: admin, editor, or viewer
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. articles
  Blog posts and articles for the website
  - `id` (bigint, primary key) - Unique article identifier
  - `title` (text) - Article title
  - `content` (text) - Article content (HTML/markdown)
  - `category` (text) - Article category
  - `tags` (text[]) - Array of tags
  - `meta_description` (text) - SEO meta description
  - `author_id` (uuid) - References users.id
  - `status` (text) - draft, published, or archived
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. testimonials
  Patient testimonials and reviews
  - `id` (bigint, primary key) - Unique testimonial identifier
  - `name` (text) - Patient name
  - `email` (text) - Patient email (optional)
  - `content` (text) - Testimonial content
  - `rating` (integer) - Rating 1-5
  - `procedure_type` (text) - Type of procedure (LASIK, PRK, ICL)
  - `procedure_date` (date) - Date of procedure
  - `approved` (boolean) - Approval status for public display
  - `created_at` (timestamptz) - Submission timestamp

  ### 4. media
  Media files and assets
  - `id` (bigint, primary key) - Unique media identifier
  - `filename` (text) - Original filename
  - `filepath` (text) - Supabase Storage path
  - `mimetype` (text) - MIME type
  - `size` (bigint) - File size in bytes
  - `title` (text) - Media title
  - `description` (text) - Media description
  - `uploaded_by` (uuid) - References users.id
  - `uploaded_at` (timestamptz) - Upload timestamp

  ### 5. audit_logs
  Audit trail for compliance and security
  - `id` (bigint, primary key) - Unique log identifier
  - `user_id` (uuid) - References users.id
  - `action` (text) - Action performed
  - `entity_type` (text) - Type of entity affected
  - `entity_id` (bigint) - ID of entity affected
  - `details` (jsonb) - Additional details
  - `ip_address` (text) - User IP address
  - `created_at` (timestamptz) - Action timestamp

  ### 6. translation_cache
  Translation cache for performance
  - `id` (bigint, primary key) - Unique cache entry identifier
  - `source_text` (text) - Original text
  - `target_language` (text) - Target language code
  - `translated_text` (text) - Translated text
  - `source_language` (text) - Source language code
  - `service_used` (text) - Translation service used
  - `created_at` (timestamptz) - Cache entry timestamp

  ### 7. statistics
  Website statistics and metrics
  - `id` (bigint, primary key) - Unique statistic identifier
  - `name` (text, unique) - Statistic name/key
  - `value` (text) - Statistic value
  - `display_order` (integer) - Display order
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. data_subject_requests
  GDPR data subject requests
  - `id` (bigint, primary key) - Unique request identifier
  - `email` (text) - Subject email
  - `request_type` (text) - export or delete
  - `status` (text) - pending, completed, or rejected
  - `reason` (text) - Request reason (for deletions)
  - `processed_by` (uuid) - References users.id
  - `processed_at` (timestamptz) - Processing timestamp
  - `created_at` (timestamptz) - Request timestamp

  ### 9. consent_records
  Cookie and privacy consent records
  - `id` (bigint, primary key) - Unique consent identifier
  - `user_identifier` (text) - User identifier (email or session ID)
  - `consent_type` (text) - Type of consent
  - `granted` (boolean) - Consent status
  - `ip_address` (text) - User IP address
  - `created_at` (timestamptz) - Consent timestamp

  ## Security
  - RLS enabled on all tables
  - Admin users can perform all operations
  - Editor users can create/update content
  - Viewer users can only read
  - Public access only for approved content (testimonials, published articles)

  ## Important Notes
  1. Foreign key constraints ensure data integrity
  2. Default admin user must be created separately via application
  3. Indexes added for frequently queried columns
  4. All timestamps use UTC timezone
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags text[],
  meta_description text,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  procedure_type text,
  procedure_date date,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  filename text NOT NULL,
  filepath text NOT NULL,
  mimetype text,
  size bigint,
  title text,
  description text,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id bigint,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create translation_cache table
CREATE TABLE IF NOT EXISTS translation_cache (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  source_text text NOT NULL,
  target_language text NOT NULL,
  translated_text text NOT NULL,
  source_language text,
  service_used text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_text, target_language, source_language)
);

-- Create statistics table
CREATE TABLE IF NOT EXISTS statistics (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  value text NOT NULL,
  display_order integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create data_subject_requests table
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('export', 'delete')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  reason text,
  processed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create consent_records table
CREATE TABLE IF NOT EXISTS consent_records (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_identifier text NOT NULL,
  consent_type text NOT NULL,
  granted boolean DEFAULT false,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup ON translation_cache(source_text, target_language);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for articles table
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor', 'viewer')
    )
  );

CREATE POLICY "Editors can create articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for testimonials table
CREATE POLICY "Public can view approved testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Authenticated users can view all testimonials"
  ON testimonials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor', 'viewer')
    )
  );

CREATE POLICY "Anyone can submit testimonials"
  ON testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Editors can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for media table
CREATE POLICY "Authenticated users can view media"
  ON media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Editors can upload media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can update media"
  ON media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete media"
  ON media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for audit_logs table
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for translation_cache table
CREATE POLICY "Anyone can view translation cache"
  ON translation_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can create translation cache entries"
  ON translation_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for statistics table
CREATE POLICY "Public can view statistics"
  ON statistics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Editors can update statistics"
  ON statistics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can create statistics"
  ON statistics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete statistics"
  ON statistics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for data_subject_requests table
CREATE POLICY "Admins can view data requests"
  ON data_subject_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create data requests"
  ON data_subject_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update data requests"
  ON data_subject_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for consent_records table
CREATE POLICY "Admins can view consent records"
  ON consent_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create consent records"
  ON consent_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at
  BEFORE UPDATE ON statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();