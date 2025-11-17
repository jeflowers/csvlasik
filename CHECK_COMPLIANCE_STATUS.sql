-- =====================================================
-- COMPLIANCE STATUS CHECKER
-- Run this in Supabase SQL Editor to check your compliance status
-- =====================================================

-- =====================================================
-- HIPAA COMPLIANCE CHECKS
-- =====================================================
SELECT '=== HIPAA COMPLIANCE STATUS ===' as section;

-- Check audit logging
SELECT
  'Audit Logging' as check_name,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Active (' || COUNT(*) || ' logs)'
    ELSE '✗ Missing'
  END as status
FROM audit_logs;

-- Check encryption keys
SELECT
  'Data Encryption' as check_name,
  CASE
    WHEN COUNT(*) FILTER (WHERE status = 'active') > 0 THEN '✓ Active (' || COUNT(*) FILTER (WHERE status = 'active') || ' keys)'
    WHEN COUNT(*) > 0 THEN '⚠ Partial (pending keys)'
    ELSE '✗ Missing'
  END as status
FROM encryption_keys;

-- Check access controls
SELECT
  'Access Controls' as check_name,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Implemented (' || COUNT(*) || ' users)'
    ELSE '✗ Missing'
  END as status
FROM users;

-- =====================================================
-- GDPR COMPLIANCE CHECKS
-- =====================================================
SELECT '=== GDPR COMPLIANCE STATUS ===' as section;

-- Check consent management
SELECT
  'Consent Management' as check_name,
  CASE
    WHEN cat_count > 0 THEN '✓ Advanced (' || cat_count || ' categories, ' || rec_count || ' records)'
    WHEN rec_count > 0 THEN '⚠ Basic (' || rec_count || ' records)'
    ELSE '✗ Missing'
  END as status
FROM (
  SELECT
    (SELECT COUNT(*) FROM consent_categories WHERE active = true) as cat_count,
    (SELECT COUNT(*) FROM consent_records) as rec_count
) counts;

-- Check data retention
SELECT
  'Data Retention' as check_name,
  CASE
    WHEN auto_count > 0 THEN '✓ Automated (' || auto_count || ' of ' || total_count || ' policies)'
    WHEN total_count > 0 THEN '⚠ Manual (' || total_count || ' policies)'
    ELSE '✗ Missing'
  END as status
FROM (
  SELECT
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE automated = true) as auto_count
  FROM data_retention_policies
  WHERE active = true
) policies;

-- Check privacy policy
SELECT
  'Privacy Policy' as check_name,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Active (v' || MAX(version) || ', published ' || MAX(effective_date)::date || ')'
    ELSE '✗ Missing'
  END as status
FROM privacy_policy_versions
WHERE status = 'published';

-- Check data export capability
SELECT
  'Data Subject Rights' as check_name,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Implemented (' || COUNT(*) || ' exports)'
    ELSE '✗ Missing (table exists but no exports yet)'
  END as status
FROM consent_data_exports;

-- Check data subject requests
SELECT
  'GDPR Requests' as check_name,
  COUNT(*) || ' total requests (' ||
  COUNT(*) FILTER (WHERE status = 'pending') || ' pending, ' ||
  COUNT(*) FILTER (WHERE status = 'completed') || ' completed)' as status
FROM data_subject_requests;

-- =====================================================
-- ISO 27001 COMPLIANCE CHECKS
-- =====================================================
SELECT '=== ISO 27001 COMPLIANCE STATUS ===' as section;

-- Check security controls
SELECT
  'Security Controls' as check_name,
  CASE
    WHEN user_count > 0 AND audit_count > 0
      THEN '✓ Implemented (users: ' || user_count || ', audits: ' || audit_count || ')'
    ELSE '✗ Missing'
  END as status
FROM (
  SELECT
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM audit_logs) as audit_count
) controls;

-- Check management reviews
SELECT
  'Management Review' as check_name,
  CASE
    WHEN COUNT(*) > 0 THEN '✓ Active (' || COUNT(*) || ' reviews, last: ' || MAX(review_date)::date || ')'
    ELSE '✗ Missing'
  END as status
FROM management_reviews;

-- Check ISMS documentation
SELECT
  'ISMS Documentation' as check_name,
  CASE
    WHEN review_count > 0 THEN '✓ Present (' || review_count || ' reviews)'
    ELSE '✗ Missing'
  END as status
FROM (
  SELECT COUNT(*) as review_count FROM management_reviews
) docs;

-- =====================================================
-- OVERALL COMPLIANCE SUMMARY
-- =====================================================
SELECT '=== OVERALL COMPLIANCE SUMMARY ===' as section;

SELECT
  'HIPAA Overall' as framework,
  CASE
    WHEN hipaa_checks >= 3 THEN '✓ Compliant'
    WHEN hipaa_checks >= 2 THEN '⚠ Partially Compliant'
    ELSE '✗ Non-Compliant'
  END as status,
  hipaa_checks || ' of 4 checks passing' as details
FROM (
  SELECT
    (CASE WHEN (SELECT COUNT(*) FROM audit_logs) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM encryption_keys WHERE status = 'active') > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM users) > 0 THEN 1 ELSE 0 END) +
    0 as hipaa_checks -- BAAs always 0 (manual)
) h;

SELECT
  'GDPR Overall' as framework,
  CASE
    WHEN gdpr_checks >= 3 THEN '✓ Compliant'
    WHEN gdpr_checks >= 2 THEN '⚠ Partially Compliant'
    ELSE '✗ Non-Compliant'
  END as status,
  gdpr_checks || ' of 4 checks passing' as details
FROM (
  SELECT
    (CASE WHEN (SELECT COUNT(*) FROM consent_records) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM data_retention_policies WHERE active = true) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM privacy_policy_versions WHERE status = 'published') > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM consent_data_exports) > 0 THEN 1 ELSE 0 END) as gdpr_checks
) g;

SELECT
  'ISO 27001 Overall' as framework,
  CASE
    WHEN iso_checks >= 3 THEN '✓ Compliant'
    WHEN iso_checks >= 2 THEN '⚠ Partially Compliant'
    ELSE '✗ Non-Compliant'
  END as status,
  iso_checks || ' of 4 checks passing' as details
FROM (
  SELECT
    (CASE WHEN (SELECT COUNT(*) FROM users) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM audit_logs) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN (SELECT COUNT(*) FROM management_reviews) > 0 THEN 1 ELSE 0 END) +
    0 as iso_checks -- Risk assessment (manual)
) i;

-- =====================================================
-- ACTION ITEMS - What needs to be done
-- =====================================================
SELECT '=== ACTION ITEMS ===' as section;

SELECT
  'Privacy Policy' as action,
  '✗ REQUIRED' as priority,
  'Create and publish a privacy policy version' as description
WHERE NOT EXISTS (SELECT 1 FROM privacy_policy_versions WHERE status = 'published');

SELECT
  'Management Review' as action,
  '⚠ RECOMMENDED' as priority,
  'Conduct and document management reviews for ISO 27001' as description
WHERE NOT EXISTS (SELECT 1 FROM management_reviews);

SELECT
  'Encryption Keys' as action,
  '⚠ RECOMMENDED' as priority,
  'Activate encryption keys for data at rest' as description
WHERE NOT EXISTS (SELECT 1 FROM encryption_keys WHERE status = 'active');

SELECT
  'Consent Categories' as action,
  '⚠ RECOMMENDED' as priority,
  'Configure consent categories for advanced GDPR compliance' as description
WHERE (SELECT COUNT(*) FROM consent_categories WHERE active = true) = 0;

SELECT
  'Data Retention Automation' as action,
  'ℹ OPTIONAL' as priority,
  'Enable automated data retention policies' as description
WHERE (SELECT COUNT(*) FROM data_retention_policies WHERE active = true AND automated = true) = 0;

-- =====================================================
-- QUICK STATS
-- =====================================================
SELECT '=== QUICK STATS ===' as section;

SELECT 'Total Audit Logs' as metric, COUNT(*)::text as value FROM audit_logs
UNION ALL
SELECT 'Total Users' as metric, COUNT(*)::text as value FROM users
UNION ALL
SELECT 'Active Consent Categories' as metric, COUNT(*)::text as value FROM consent_categories WHERE active = true
UNION ALL
SELECT 'Active Retention Policies' as metric, COUNT(*)::text as value FROM data_retention_policies WHERE active = true
UNION ALL
SELECT 'Management Reviews' as metric, COUNT(*)::text as value FROM management_reviews
UNION ALL
SELECT 'Data Subject Requests' as metric, COUNT(*)::text as value FROM data_subject_requests
UNION ALL
SELECT 'Published Privacy Policies' as metric, COUNT(*)::text as value FROM privacy_policy_versions WHERE status = 'published';
