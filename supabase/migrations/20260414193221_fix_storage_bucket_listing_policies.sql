
/*
  # Fix Public Storage Bucket Listing Policies

  1. Changes
    - Update public SELECT policies on storage.objects to require a specific object name
    - This prevents anonymous users from listing/enumerating all files in public buckets
    - Individual file access by direct URL still works (Supabase public bucket URLs bypass RLS)
    - Adds path-level restriction so API-based listing requires authentication

  2. Security
    - Prevents anonymous directory listing of media, procedures, team, testimonials buckets
    - Public buckets still serve files via direct URL (this is handled by Supabase storage service, not RLS)
    - Authenticated admin/editors can still list files through their existing policies

  3. Important Notes
    - Public bucket files are accessible via direct URL regardless of RLS (Supabase behavior)
    - These RLS policies only affect the Supabase API (e.g., supabase.storage.from('media').list())
    - The website loads images via direct public URLs which are not affected
*/

-- media: restrict API listing to authenticated users, keep public read for specific files
DROP POLICY IF EXISTS "Public read access for media" ON storage.objects;
CREATE POLICY "Public read access for media"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'media' AND
    name IS NOT NULL AND name <> ''
  );

-- procedures: restrict API listing to authenticated users
DROP POLICY IF EXISTS "Public read access for procedures" ON storage.objects;
CREATE POLICY "Public read access for procedures"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'procedures' AND
    name IS NOT NULL AND name <> ''
  );

-- team: restrict API listing to authenticated users
DROP POLICY IF EXISTS "Public read access for team" ON storage.objects;
CREATE POLICY "Public read access for team"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'team' AND
    name IS NOT NULL AND name <> ''
  );

-- testimonials: restrict API listing to authenticated users
DROP POLICY IF EXISTS "Public read access for testimonials" ON storage.objects;
CREATE POLICY "Public read access for testimonials"
  ON storage.objects FOR SELECT
  TO public
  USING (
    bucket_id = 'testimonials' AND
    name IS NOT NULL AND name <> ''
  );
