# Data Retention System

## Overview

The automated data retention system provides HIPAA, GDPR, and ISO 27001 compliant data lifecycle management with configurable policies, audit logging, and scheduled cleanup.

## Features

### 1. Retention Policies
- **Configurable Rules**: Set retention periods for different data types
- **Automated Cleanup**: Scheduled deletion of expired records
- **Archive Support**: Optional archiving before deletion
- **Status Management**: Active, paused, or archived policies

### 2. Execution Tracking
- **Audit Trail**: Complete history of all retention executions
- **Detailed Metrics**: Records evaluated, archived, and deleted
- **Error Logging**: Failed executions with detailed error messages
- **Performance Monitoring**: Execution times and batch processing

### 3. Retention Exceptions
- **Legal Holds**: Exempt records from automatic deletion
- **Case Management**: Mark active cases for retention
- **Expiring Exemptions**: Time-limited holds with automatic expiry
- **Reason Tracking**: Document why records are exempted

## Default Retention Policies

### HIPAA Compliance
1. **Audit Logs**: 6 years (2,190 days)
   - HIPAA requirement: 6-year minimum retention
   - Archives before deletion
   - Covers all PHI access events

2. **Consultation Audit Logs**: 6 years (2,190 days)
   - HIPAA requirement: 6-year minimum retention
   - Tracks all patient consultation activities
   - Archives before deletion

### GDPR Compliance
3. **Data Subject Requests**: 3 years (1,095 days)
   - Completed GDPR requests retention
   - Archives request details
   - Supports right to erasure compliance

4. **Consent Records**: 1 year after expiry (365 days)
   - Cookie and privacy consents
   - Archives consent history
   - Supports consent withdrawal tracking

### Operational Data
5. **Consultation Requests**: 2 years (730 days)
   - Completed appointment requests
   - Archives patient consultation data
   - Maintains compliance with record-keeping requirements

6. **Translation Cache**: 90 days
   - Temporary translation storage
   - No archiving (cache data)
   - Improves translation service performance

## Database Schema

### data_retention_policies
```sql
- id: uuid (primary key)
- table_name: text (target table)
- description: text (policy description)
- retention_period_days: integer (days to retain)
- date_column: text (column for age calculation)
- archive_before_delete: boolean (archive flag)
- archive_storage_path: text (storage location)
- status: text (active/paused/archived)
- last_run_at: timestamptz (last execution)
- next_run_at: timestamptz (next scheduled run)
- created_by: uuid (creator)
- created_at: timestamptz
- updated_at: timestamptz
```

### data_retention_executions
```sql
- id: uuid (primary key)
- policy_id: uuid (references policy)
- status: text (pending/running/completed/failed)
- records_evaluated: integer
- records_archived: integer
- records_deleted: integer
- error_message: text
- execution_details: jsonb
- started_at: timestamptz
- completed_at: timestamptz
- executed_by: uuid
```

### data_retention_exceptions
```sql
- id: uuid (primary key)
- table_name: text
- record_id: bigint
- reason: text
- exemption_type: text (legal_hold/active_case/under_review/regulatory_requirement)
- expires_at: timestamptz (nullable)
- created_by: uuid
- created_at: timestamptz
```

## Functions

### execute_retention_policy(policy_id, executed_by)
Executes a single retention policy:
1. Counts expired records
2. Archives records if configured
3. Deletes expired records in batches
4. Logs execution results
5. Schedules next run

**Returns**: execution_id (uuid)

### run_scheduled_retention_policies()
Executes all policies due to run:
1. Finds policies where next_run_at <= NOW()
2. Executes each policy
3. Returns summary of all executions

**Returns**: Array of execution results

### add_retention_exception(table_name, record_id, reason, exemption_type, expires_at, created_by)
Creates or updates a retention exception:
1. Validates exemption type
2. Creates exception record
3. Updates on conflict
4. Returns exception_id

**Returns**: exception_id (uuid)

## Admin UI

### Location
`/admin/data-retention`

### Features

#### Policies Tab
- View all retention policies
- Create new policies
- Execute policies manually
- Pause/activate policies
- View last and next run times
- See retention periods and settings

#### Execution History Tab
- View past executions
- Filter by status
- See metrics (evaluated, archived, deleted)
- Review error messages
- Track execution times

#### Exceptions Tab
- View active exceptions
- Create new exceptions
- Set expiration dates
- Remove exceptions
- Filter by exemption type

## Automated Execution

### Edge Function
**Name**: `run-retention-policies`

**Schedule**: Can be triggered via cron job or manually

**Authentication**: Requires JWT token

**Endpoint**:
```
POST https://[PROJECT-REF].supabase.co/functions/v1/run-retention-policies
```

**Response**:
```json
{
  "success": true,
  "policies_executed": 6,
  "total_records_deleted": 150,
  "executions": [
    {
      "policy_id": "uuid",
      "execution_id": "uuid",
      "status": "completed",
      "records_deleted": 25
    }
  ],
  "timestamp": "2025-11-16T12:00:00Z"
}
```

### Recommended Schedule
Set up a cron job to run daily at 2 AM:
```bash
0 2 * * * curl -X POST https://[PROJECT-REF].supabase.co/functions/v1/run-retention-policies \
  -H "Authorization: Bearer [ANON-KEY]"
```

## Usage Examples

### Create a New Policy
```typescript
const { data, error } = await supabase
  .from('data_retention_policies')
  .insert({
    table_name: 'session_logs',
    description: 'Session logs retention (30 days)',
    retention_period_days: 30,
    date_column: 'created_at',
    archive_before_delete: false,
    status: 'active'
  });
```

### Execute a Policy Manually
```typescript
const { data, error } = await supabase.rpc('execute_retention_policy', {
  p_policy_id: 'uuid-here',
  p_executed_by: user.id
});
```

### Add a Retention Exception
```typescript
const { data, error } = await supabase.rpc('add_retention_exception', {
  p_table_name: 'consultation_requests',
  p_record_id: 12345,
  p_reason: 'Active legal case',
  p_exemption_type: 'legal_hold',
  p_expires_at: null, // indefinite
  p_created_by: user.id
});
```

### Check if Record Has Exception
```typescript
const { data, error } = await supabase.rpc('has_retention_exemption', {
  p_table_name: 'consultation_requests',
  p_record_id: 12345
});
// Returns: boolean
```

## Compliance Requirements

### HIPAA
✅ **6-year retention**: Audit logs retained for minimum 6 years
✅ **Secure deletion**: Records are securely deleted after retention period
✅ **Audit trail**: All deletions logged with details
✅ **Access controls**: Only admins can manage retention policies

### GDPR
✅ **Right to erasure**: Data can be deleted on request
✅ **Data minimization**: Automatic deletion of unnecessary data
✅ **Purpose limitation**: Retention periods matched to purpose
✅ **Transparency**: Clear documentation of retention policies

### ISO 27001
✅ **Documented procedures**: Comprehensive retention documentation
✅ **Management review**: Execution history for audits
✅ **Risk management**: Exceptions for sensitive cases
✅ **Continuous improvement**: Metrics and monitoring

## Security Features

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Only admins can modify policies
   - Execution logs are immutable

2. **Audit Logging**
   - All policy executions logged
   - Detailed metrics captured
   - Error tracking for failures

3. **Exception Handling**
   - Legal holds prevent deletion
   - Temporary exemptions expire automatically
   - Reason required for all exceptions

4. **Batch Processing**
   - Records deleted in small batches (100 records)
   - Prevents database lock issues
   - Allows for graceful interruption

## Best Practices

### Setting Retention Periods
1. **Audit Logs**: Never less than 6 years (HIPAA requirement)
2. **User Data**: Consider GDPR minimization (1-2 years typical)
3. **Cache Data**: Short retention (30-90 days)
4. **Legal Records**: Consult legal counsel for requirements

### Archive Strategy
1. **Enable archiving** for compliance-sensitive data
2. **Disable archiving** for cache or temporary data
3. **Store archives** in secure, versioned storage
4. **Document archive format** and retention

### Exception Management
1. **Use legal_hold** for litigation-related records
2. **Use active_case** for ongoing patient care
3. **Set expiration dates** when possible
4. **Document reasons** clearly

### Monitoring
1. **Review execution history** weekly
2. **Check for failures** and investigate causes
3. **Monitor deletion metrics** for anomalies
4. **Update policies** as regulations change

## Troubleshooting

### Policy Not Running
- Check `status` is 'active'
- Verify `next_run_at` is in the past
- Review execution history for errors
- Check function permissions

### Records Not Being Deleted
- Verify retention period has passed
- Check for retention exceptions
- Review RLS policies on target table
- Confirm date_column exists and is timestamptz

### Execution Failures
- Review `error_message` in executions table
- Check database permissions
- Verify table and column names
- Ensure date_column is correct type

## Future Enhancements

1. **Archive to Storage Buckets**: Store archived data in Supabase Storage
2. **Email Notifications**: Alert admins of executions and failures
3. **Advanced Scheduling**: Per-policy custom schedules
4. **Bulk Exception Management**: CSV import for exceptions
5. **Compliance Reports**: Automated compliance reporting
6. **Policy Templates**: Pre-configured industry-specific policies

## Support

For issues or questions:
1. Review this documentation
2. Check execution history for errors
3. Consult database migration files
4. Contact system administrator
