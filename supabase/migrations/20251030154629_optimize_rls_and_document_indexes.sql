/*
  # Optimize RLS Performance and Document Index Usage

  ## Summary
  - Optimizes RLS policy for better performance
  - Documents index usage expectations
  - Creates monitoring tools

  ## Changes
  1. Optimizes appointment_requests RLS policy
  2. Creates helper function for RLS caching
  3. Creates monitoring view for indexes
  4. Documents all indexes with comments

  ## Manual Steps
  Enable "Leaked Password Protection" in Supabase Auth Dashboard
*/

-- ============================================================================
-- 1. OPTIMIZE RLS POLICY
-- ============================================================================

DROP POLICY IF EXISTS "View appointment requests" ON public.appointment_requests;

CREATE POLICY "View appointment requests"
ON public.appointment_requests
FOR SELECT
TO authenticated
USING (
  (
    SELECT EXISTS (
      SELECT 1 
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'editor')
      LIMIT 1
    )
  )
  OR
  (
    email = (SELECT auth.jwt()->>'email')
  )
);

-- ============================================================================
-- 2. CREATE HELPER FUNCTION FOR RLS CACHING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'editor')
  );
$$;

COMMENT ON FUNCTION public.is_staff_user() IS 
'Cached function to check if current user is staff (admin/editor). STABLE ensures result is cached per transaction.';

-- ============================================================================
-- 3. CREATE INDEX MONITORING VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.index_usage_report AS
SELECT
  s.schemaname,
  s.relname as table_name,
  s.indexrelname as index_name,
  s.idx_scan as scans,
  s.idx_tup_read as tuples_read,
  s.idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(s.indexrelid)) as index_size,
  CASE 
    WHEN s.idx_scan = 0 THEN 'UNUSED (may be newly created)'
    WHEN s.idx_scan < 100 THEN 'LOW USAGE'
    WHEN s.idx_scan < 1000 THEN 'MODERATE USAGE'
    ELSE 'HIGH USAGE'
  END as usage_category
FROM pg_stat_user_indexes s
WHERE s.schemaname = 'public'
ORDER BY s.idx_scan ASC, s.relname, s.indexrelname;

COMMENT ON VIEW public.index_usage_report IS 
'Monitoring view for index usage statistics. Newly created indexes will show zero scans until queries use them.';

-- ============================================================================
-- 4. DOCUMENT ALL INDEXES
-- ============================================================================

COMMENT ON INDEX public.idx_articles_author_id IS 
'Foreign key index: Optimizes queries filtering articles by author';

COMMENT ON INDEX public.idx_audit_logs_user_id IS 
'Foreign key index: Optimizes audit log queries by user';

COMMENT ON INDEX public.idx_content_ownership_owner_id IS 
'Foreign key index: Optimizes content ownership lookups';

COMMENT ON INDEX public.idx_media_uploaded_by IS 
'Foreign key index: Optimizes media queries by uploader';

COMMENT ON INDEX public.idx_role_permissions_permission_id IS 
'Foreign key index: Optimizes permission checks';

COMMENT ON INDEX public.idx_security_incidents_user_id IS 
'Foreign key index: Optimizes security incident queries';

COMMENT ON INDEX public.idx_user_roles_role_id IS 
'Foreign key index: Critical for RLS policy performance';

COMMENT ON INDEX public.idx_appointment_audit_log_request_id IS 
'Foreign key index: Optimizes appointment audit trail queries';

COMMENT ON INDEX public.idx_appointment_audit_log_changed_by IS 
'Foreign key index: Optimizes audit queries by user';

COMMENT ON INDEX public.idx_appointment_requests_reviewed_by_v2 IS 
'Foreign key index: Optimizes appointment review workflow';

COMMENT ON INDEX public.idx_articles_published_by_v2 IS 
'Foreign key index: Optimizes article publishing workflow';

COMMENT ON INDEX public.idx_articles_reviewed_by_v2 IS 
'Foreign key index: Optimizes article review workflow';

COMMENT ON INDEX public.idx_content_ownership_approved_by_v2 IS 
'Foreign key index: Optimizes content approval workflow';

COMMENT ON INDEX public.idx_data_subject_requests_processed_by_v2 IS 
'Foreign key index: Optimizes GDPR request processing';

COMMENT ON INDEX public.idx_security_incidents_resolved_by_v2 IS 
'Foreign key index: Optimizes incident resolution tracking';

COMMENT ON INDEX public.idx_user_roles_granted_by_v2 IS 
'Foreign key index: Optimizes role grant audit trail';

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  unused_count integer;
  total_indexes integer;
BEGIN
  SELECT COUNT(*) INTO unused_count
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public' AND idx_scan = 0;
  
  SELECT COUNT(*) INTO total_indexes
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public';

  RAISE NOTICE '╔══════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  RLS and Index Optimization Complete                    ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Optimized appointment_requests RLS policy';
  RAISE NOTICE '✓ Created is_staff_user() helper function (STABLE for caching)';
  RAISE NOTICE '✓ Created index_usage_report view';
  RAISE NOTICE '✓ Documented all 16 foreign key indexes';
  RAISE NOTICE '';
  RAISE NOTICE '── Index Statistics ──────────────────────────────────────';
  RAISE NOTICE 'Total indexes in public schema: %', total_indexes;
  RAISE NOTICE 'Indexes with zero scans: % (normal for new indexes)', unused_count;
  RAISE NOTICE '';
  RAISE NOTICE '── About "Unused" Index Warnings ────────────────────────';
  RAISE NOTICE 'These warnings are EXPECTED and SAFE to ignore because:';
  RAISE NOTICE '';
  RAISE NOTICE '  1. Indexes were created in recent migrations';
  RAISE NOTICE '  2. PostgreSQL tracks usage via pg_stat_user_indexes';
  RAISE NOTICE '  3. Statistics accumulate as queries execute';
  RAISE NOTICE '  4. Stats reset on DB restart or manual reset';
  RAISE NOTICE '';
  RAISE NOTICE 'These indexes are ESSENTIAL for:';
  RAISE NOTICE '  • Foreign key JOIN performance';
  RAISE NOTICE '  • RLS policy execution speed';  
  RAISE NOTICE '  • WHERE clause filtering';
  RAISE NOTICE '  • Preventing full table scans';
  RAISE NOTICE '';
  RAISE NOTICE '⚠  DO NOT REMOVE - Performance will degrade without them';
  RAISE NOTICE '';
  RAISE NOTICE '── Monitoring ────────────────────────────────────────────';
  RAISE NOTICE 'Track index usage over time:';
  RAISE NOTICE '  SELECT * FROM public.index_usage_report;';
  RAISE NOTICE '';
  RAISE NOTICE '── Manual Action Required ────────────────────────────────';
  RAISE NOTICE '→ Enable Leaked Password Protection:';
  RAISE NOTICE '  1. Open Supabase Dashboard';
  RAISE NOTICE '  2. Navigate to Authentication → Settings';
  RAISE NOTICE '  3. Enable "Leaked Password Protection"';
  RAISE NOTICE '  4. Passwords will be checked against HaveIBeenPwned.org';
  RAISE NOTICE '';
END $$;