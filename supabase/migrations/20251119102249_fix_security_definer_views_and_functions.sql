/*
  # Fix Security Definer Views and Function Search Paths

  Addresses security audit issues:
  - Security Definer Views (2 views)
  - Function Search Path Mutable (3 functions)
  
  Note: Password protection must be enabled manually in Supabase Dashboard
*/

-- ============================================================================
-- 1. FIX SECURITY DEFINER VIEWS
-- ============================================================================

DROP VIEW IF EXISTS media_files_with_uploader CASCADE;

CREATE VIEW media_files_with_uploader
WITH (security_invoker = true)
AS
SELECT
  mf.id,
  mf.filename,
  mf.original_name,
  mf.file_path,
  mf.file_size,
  mf.mime_type,
  mf.media_type,
  mf.category,
  mf.alt_text,
  mf.caption,
  mf.metadata,
  mf.is_public,
  mf.uploaded_by,
  mf.created_at,
  mf.updated_at,
  u.email as uploaded_by_email,
  u.name as uploaded_by_name
FROM media_files mf
LEFT JOIN users u ON mf.uploaded_by = u.id;

GRANT SELECT ON media_files_with_uploader TO authenticated, anon;

COMMENT ON VIEW media_files_with_uploader IS
  'Media files with uploader info. Uses security_invoker to respect RLS.';

DROP VIEW IF EXISTS decrypted_patient_data CASCADE;

CREATE VIEW decrypted_patient_data
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  decrypt_data(medical_history_encrypted, 'phi_key') as medical_history,
  decrypt_data(current_medications_encrypted, 'phi_key') as current_medications,
  decrypt_data(allergies_encrypted, 'phi_key') as allergies,
  decrypt_data(emergency_contact_encrypted, 'phi_key') as emergency_contact,
  decrypt_data(insurance_info_encrypted, 'phi_key') as insurance_info,
  last_updated,
  encryption_key_version,
  data_classification
FROM encrypted_patient_data;

GRANT SELECT ON decrypted_patient_data TO authenticated;

COMMENT ON VIEW decrypted_patient_data IS
  'Decrypted patient data. Access controlled by RLS on encrypted_patient_data.';

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATHS
-- ============================================================================

DROP FUNCTION IF EXISTS sync_user_legacy_role_to_rbac() CASCADE;

CREATE FUNCTION sync_user_legacy_role_to_rbac()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_role_id uuid;
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    SELECT id INTO v_role_id FROM public.roles WHERE name = NEW.role LIMIT 1;
    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (NEW.id, v_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
      IF TG_OP = 'UPDATE' THEN
        DELETE FROM public.user_roles WHERE user_id = NEW.id AND role_id != v_role_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_role_to_rbac ON users;
CREATE TRIGGER sync_user_role_to_rbac
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_legacy_role_to_rbac();

DROP FUNCTION IF EXISTS update_media_files_updated_at() CASCADE;

CREATE FUNCTION update_media_files_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON media_files;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

DROP FUNCTION IF EXISTS categorize_media_by_path() CASCADE;

CREATE FUNCTION categorize_media_by_path()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NEW.file_path ~* '\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$' THEN
    NEW.media_type = 'image';
  ELSIF NEW.file_path ~* '\.(mp4|mov|avi|wmv|flv|webm|mkv)$' THEN
    NEW.media_type = 'video';
  ELSIF NEW.file_path ~* '\.(pdf|doc|docx|txt|rtf)$' THEN
    NEW.media_type = 'document';
  ELSIF NEW.file_path ~* '\.(mp3|wav|ogg|m4a|flac)$' THEN
    NEW.media_type = 'audio';
  ELSIF NEW.file_path ~* '\.(zip|tar|gz|rar|7z)$' THEN
    NEW.media_type = 'archive';
  ELSE
    NEW.media_type = 'other';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categorize_file ON media_files;
CREATE TRIGGER categorize_file
  BEFORE INSERT OR UPDATE OF file_path ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION categorize_media_by_path();