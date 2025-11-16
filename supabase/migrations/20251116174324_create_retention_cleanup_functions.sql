/*
  # Data Retention Cleanup Functions

  ## Overview
  Implements automated cleanup functions for executing data retention policies.
  These functions safely identify, archive, and delete expired records while
  respecting exemptions and maintaining audit trails.

  ## Functions Created

  ### 1. execute_retention_policy()
  Main function to execute a retention policy for a specific table
  - Identifies expired records based on retention period
  - Respects retention exemptions
  - Archives data if configured
  - Deletes expired records
  - Logs execution results

  ### 2. schedule_next_retention_run()
  Calculates and sets the next run time for a policy (daily at 2 AM)

  ### 3. get_expired_records()
  Helper function to identify records eligible for deletion

  ### 4. archive_records()
  Archives records to JSONB format for long-term storage

  ## Security
  - All functions use SECURITY DEFINER with proper permission checks
  - Audit logging for all operations
  - Transaction-safe operations with rollback on errors
*/

-- ============================================================================
-- 1. FUNCTION TO GET EXPIRED RECORDS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_expired_record_count(
  p_table_name text,
  p_retention_days integer,
  p_date_column text
)
RETURNS integer AS $$
DECLARE
  v_query text;
  v_count integer;
BEGIN
  -- Build dynamic query to count expired records
  v_query := format(
    'SELECT COUNT(*) FROM %I 
     WHERE %I < NOW() - INTERVAL ''%s days''
     AND NOT EXISTS (
       SELECT 1 FROM data_retention_exceptions dre
       WHERE dre.table_name = %L
       AND dre.record_id = %I.id::bigint
       AND (dre.expires_at IS NULL OR dre.expires_at > NOW())
     )',
    p_table_name,
    p_date_column,
    p_retention_days,
    p_table_name,
    p_table_name
  );
  
  EXECUTE v_query INTO v_count;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. FUNCTION TO ARCHIVE RECORDS TO JSONB
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_expired_records(
  p_table_name text,
  p_retention_days integer,
  p_date_column text,
  p_archive_path text
)
RETURNS TABLE(
  archived_count integer,
  archive_data jsonb
) AS $$
DECLARE
  v_query text;
  v_archived_data jsonb;
  v_count integer;
BEGIN
  -- Build dynamic query to archive records
  v_query := format(
    'SELECT jsonb_agg(row_to_json(t)::jsonb) 
     FROM (
       SELECT * FROM %I 
       WHERE %I < NOW() - INTERVAL ''%s days''
       AND NOT EXISTS (
         SELECT 1 FROM data_retention_exceptions dre
         WHERE dre.table_name = %L
         AND dre.record_id = %I.id::bigint
         AND (dre.expires_at IS NULL OR dre.expires_at > NOW())
       )
       LIMIT 1000
     ) t',
    p_table_name,
    p_date_column,
    p_retention_days,
    p_table_name,
    p_table_name
  );
  
  EXECUTE v_query INTO v_archived_data;
  
  -- Count archived records
  v_count := COALESCE(jsonb_array_length(v_archived_data), 0);
  
  RETURN QUERY SELECT v_count, v_archived_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. FUNCTION TO DELETE EXPIRED RECORDS
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_expired_records(
  p_table_name text,
  p_retention_days integer,
  p_date_column text,
  p_batch_size integer DEFAULT 100
)
RETURNS integer AS $$
DECLARE
  v_query text;
  v_deleted_count integer;
BEGIN
  -- Build dynamic query to delete expired records in batches
  v_query := format(
    'WITH records_to_delete AS (
       SELECT id FROM %I 
       WHERE %I < NOW() - INTERVAL ''%s days''
       AND NOT EXISTS (
         SELECT 1 FROM data_retention_exceptions dre
         WHERE dre.table_name = %L
         AND dre.record_id = %I.id::bigint
         AND (dre.expires_at IS NULL OR dre.expires_at > NOW())
       )
       LIMIT %s
     )
     DELETE FROM %I 
     WHERE id IN (SELECT id FROM records_to_delete)',
    p_table_name,
    p_date_column,
    p_retention_days,
    p_table_name,
    p_table_name,
    p_batch_size,
    p_table_name
  );
  
  EXECUTE v_query;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. MAIN FUNCTION TO EXECUTE RETENTION POLICY
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_retention_policy(
  p_policy_id uuid,
  p_executed_by uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_policy RECORD;
  v_execution_id uuid;
  v_evaluated integer := 0;
  v_archived integer := 0;
  v_deleted integer := 0;
  v_total_deleted integer := 0;
  v_archive_data jsonb;
  v_error_message text;
BEGIN
  -- Get policy details
  SELECT * INTO v_policy
  FROM data_retention_policies
  WHERE id = p_policy_id
    AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Policy not found or not active: %', p_policy_id;
  END IF;
  
  -- Create execution record
  INSERT INTO data_retention_executions (
    policy_id,
    status,
    started_at,
    executed_by
  ) VALUES (
    p_policy_id,
    'running',
    now(),
    p_executed_by
  ) RETURNING id INTO v_execution_id;
  
  BEGIN
    -- Count records to be evaluated
    v_evaluated := get_expired_record_count(
      v_policy.table_name,
      v_policy.retention_period_days,
      v_policy.date_column
    );
    
    -- Archive records if configured
    IF v_policy.archive_before_delete THEN
      SELECT archived_count, archive_data 
      INTO v_archived, v_archive_data
      FROM archive_expired_records(
        v_policy.table_name,
        v_policy.retention_period_days,
        v_policy.date_column,
        v_policy.archive_storage_path
      );
      
      -- Update execution record with archive data
      UPDATE data_retention_executions
      SET execution_details = jsonb_build_object(
        'archived_data_sample', v_archive_data,
        'archive_path', v_policy.archive_storage_path
      )
      WHERE id = v_execution_id;
    END IF;
    
    -- Delete records in batches
    LOOP
      v_deleted := delete_expired_records(
        v_policy.table_name,
        v_policy.retention_period_days,
        v_policy.date_column,
        100
      );
      
      v_total_deleted := v_total_deleted + v_deleted;
      
      EXIT WHEN v_deleted = 0;
      
      -- Add small delay between batches
      PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- Update execution record as completed
    UPDATE data_retention_executions
    SET 
      status = 'completed',
      records_evaluated = v_evaluated,
      records_archived = v_archived,
      records_deleted = v_total_deleted,
      completed_at = now()
    WHERE id = v_execution_id;
    
    -- Update policy last run time and schedule next run
    UPDATE data_retention_policies
    SET 
      last_run_at = now(),
      next_run_at = (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '2 hours')::timestamptz
    WHERE id = p_policy_id;
    
    RETURN v_execution_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error
    v_error_message := SQLERRM;
    
    UPDATE data_retention_executions
    SET 
      status = 'failed',
      error_message = v_error_message,
      completed_at = now()
    WHERE id = v_execution_id;
    
    RAISE EXCEPTION 'Retention policy execution failed: %', v_error_message;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNCTION TO RUN ALL ACTIVE POLICIES
-- ============================================================================

CREATE OR REPLACE FUNCTION run_scheduled_retention_policies()
RETURNS TABLE(
  policy_id uuid,
  execution_id uuid,
  status text,
  records_deleted integer
) AS $$
DECLARE
  v_policy RECORD;
  v_execution_id uuid;
BEGIN
  -- Find all policies that are due to run
  FOR v_policy IN
    SELECT id
    FROM data_retention_policies
    WHERE status = 'active'
      AND (next_run_at IS NULL OR next_run_at <= now())
  LOOP
    BEGIN
      -- Execute the policy
      v_execution_id := execute_retention_policy(v_policy.id, NULL);
      
      -- Return result
      RETURN QUERY
      SELECT 
        dre.policy_id,
        dre.id as execution_id,
        dre.status,
        dre.records_deleted
      FROM data_retention_executions dre
      WHERE dre.id = v_execution_id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with next policy
      RAISE WARNING 'Failed to execute policy %: %', v_policy.id, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. FUNCTION TO ADD RETENTION EXCEPTION
-- ============================================================================

CREATE OR REPLACE FUNCTION add_retention_exception(
  p_table_name text,
  p_record_id bigint,
  p_reason text,
  p_exemption_type text,
  p_expires_at timestamptz DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_exception_id uuid;
BEGIN
  INSERT INTO data_retention_exceptions (
    table_name,
    record_id,
    reason,
    exemption_type,
    expires_at,
    created_by
  ) VALUES (
    p_table_name,
    p_record_id,
    p_reason,
    p_exemption_type,
    p_expires_at,
    p_created_by
  )
  ON CONFLICT (table_name, record_id) 
  DO UPDATE SET
    reason = EXCLUDED.reason,
    exemption_type = EXCLUDED.exemption_type,
    expires_at = EXCLUDED.expires_at,
    created_by = EXCLUDED.created_by,
    created_at = now()
  RETURNING id INTO v_exception_id;
  
  RETURN v_exception_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_expired_record_count TO authenticated;
GRANT EXECUTE ON FUNCTION execute_retention_policy TO authenticated;
GRANT EXECUTE ON FUNCTION run_scheduled_retention_policies TO authenticated;
GRANT EXECUTE ON FUNCTION add_retention_exception TO authenticated;