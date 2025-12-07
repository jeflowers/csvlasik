# Email System Architecture
## Technical Overview & Data Flow

**Last Updated:** December 7, 2025

---

## System Overview

The ClearSight Vision email system is a robust, queued email delivery system designed for high reliability and scalability.

### Key Components

1. **Email Service Layer** (Frontend/Backend)
2. **Email Queue** (PostgreSQL Database)
3. **Queue Processor** (Supabase Edge Function)
4. **Email Provider** (Resend API)
5. **Monitoring Dashboard** (Admin Panel)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                         │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 1. User submits form
             │    (Contact, Appointment Request, etc.)
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND APPLICATION                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  emailService.queueEmail({                           │  │
│  │    to: 'patient@example.com',                        │  │
│  │    subject: 'Appointment Confirmation',              │  │
│  │    htmlBody: '<p>...</p>',                           │  │
│  │    textBody: 'Plain text version'                    │  │
│  │  })                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 2. Insert into email_queue table
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  email_queue TABLE                    │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ id: uuid                                         │ │  │
│  │ │ to_email: 'patient@example.com'                  │ │  │
│  │ │ subject: 'Appointment Confirmation'               │ │  │
│  │ │ html_body: '<p>...</p>'                          │ │  │
│  │ │ status: 'pending' ← Initial Status               │ │  │
│  │ │ attempts: 0                                      │ │  │
│  │ │ scheduled_for: now()                             │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 3. Cron job triggers every minute
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      CRON SCHEDULER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  pg_cron executes every 60 seconds:                  │  │
│  │  - Calls process-email-queue Edge Function           │  │
│  │  - Passes authentication token                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 4. Edge Function fetches pending emails
             ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                          │
│        (process-email-queue)                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. SELECT pending emails                             │  │
│  │    WHERE status = 'pending'                          │  │
│  │    AND scheduled_for <= NOW()                        │  │
│  │    LIMIT 10                                          │  │
│  │                                                      │  │
│  │ 2. For each email:                                   │  │
│  │    - Update status to 'processing'                   │  │
│  │    - Increment attempts                              │  │
│  │    - Call Resend API                                 │  │
│  │                                                      │  │
│  │ 3. Handle response:                                  │  │
│  │    Success → status = 'sent'                         │  │
│  │    Failure → status = 'pending' (retry)              │  │
│  │    Max attempts → status = 'failed'                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 5. HTTP POST to Resend API
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      RESEND API                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST https://api.resend.com/emails                   │  │
│  │ Headers:                                             │  │
│  │   Authorization: Bearer re_xyz...                    │  │
│  │ Body:                                                │  │
│  │   {                                                  │  │
│  │     from: 'noreply@clearsightvision.com',           │  │
│  │     to: 'patient@example.com',                      │  │
│  │     subject: '...',                                  │  │
│  │     html: '...'                                      │  │
│  │   }                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 6. Resend processes and delivers
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   EMAIL INFRASTRUCTURE                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SPF Check  ✓                                         │  │
│  │ DKIM Check ✓                                         │  │
│  │ DMARC Check ✓                                        │  │
│  │ Spam Filters ✓                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 7. Email delivered
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    PATIENT'S INBOX                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📧 Appointment Confirmation                         │  │
│  │  From: ClearSight Vision                             │  │
│  │  To: patient@example.com                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
             │
             │ 8. Optional: Delivery events
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  WEBHOOK CALLBACKS                           │
│  (Future Enhancement)                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Resend → Webhook → Update email_queue:               │  │
│  │ - delivered                                          │  │
│  │ - opened                                             │  │
│  │ - clicked                                            │  │
│  │ - bounced                                            │  │
│  │ - complained                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### email_queue Table

```sql
CREATE TABLE email_queue (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email Details
  to_email text NOT NULL,
  from_email text DEFAULT 'noreply@clearsightvision.com',
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  reply_to text,

  -- Status & Tracking
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,

  -- Scheduling
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at DESC);
```

---

## Status Lifecycle

```
┌─────────┐
│ pending │ ← Initial state when email is queued
└────┬────┘
     │
     │ Cron job picks up email
     ▼
┌────────────┐
│ processing │ ← Edge Function is sending email
└─────┬──────┘
      │
      ├─── Success ──→ ┌──────┐
      │                 │ sent │ ← Email delivered successfully
      │                 └──────┘
      │
      └─── Failure ──→ ┌─────────┐
                       │ pending │ ← Retry (if attempts < max_attempts)
                       └────┬────┘
                            │
                            │ Max attempts reached
                            ▼
                       ┌────────┐
                       │ failed │ ← Permanent failure
                       └────────┘
```

---

## Retry Logic

The system automatically retries failed emails:

```typescript
// Retry configuration
max_attempts: 3        // Maximum retry attempts
retry_delay: 60        // Seconds between retries (via cron)

// Retry scenarios
1st attempt fails → status: 'pending', attempts: 1
2nd attempt fails → status: 'pending', attempts: 2
3rd attempt fails → status: 'failed', attempts: 3
```

### Common Failure Scenarios

| Scenario | Status | Action |
|----------|--------|--------|
| Invalid email | failed | No retry - invalid recipient |
| Rate limited | pending | Retry - temporary issue |
| API error | pending | Retry - temporary issue |
| DNS issues | pending | Retry - temporary issue |
| Spam complaint | failed | No retry - permanent failure |

---

## Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. FRONTEND → SUPABASE                                  │
│     ✓ Row Level Security (RLS)                           │
│     ✓ User must be authenticated                         │
│     ✓ API key in Authorization header                    │
│                                                           │
│  2. CRON JOB → EDGE FUNCTION                             │
│     ✓ Service role key (internal only)                   │
│     ✓ Not exposed to frontend                            │
│                                                           │
│  3. EDGE FUNCTION → RESEND                               │
│     ✓ Resend API key stored as secret                    │
│     ✓ Encrypted at rest                                  │
│     ✓ Only accessible to Edge Function                   │
│                                                           │
│  4. RESEND → EMAIL SERVERS                               │
│     ✓ SPF authentication                                 │
│     ✓ DKIM signatures                                    │
│     ✓ TLS encryption in transit                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  # Public key (safe to expose)

# Supabase Secrets (never exposed)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Internal use only
RESEND_API_KEY=re_abc123...          # Never exposed to frontend
```

---

## Performance Characteristics

### Throughput

```
┌────────────────────────────────────────────────────────┐
│ Queue Processing Rate                                  │
├────────────────────────────────────────────────────────┤
│ Frequency:        Every 60 seconds                     │
│ Batch Size:       10 emails per execution              │
│ Max Throughput:   600 emails/hour                      │
│ Typical Latency:  1-2 minutes from queue to delivery   │
└────────────────────────────────────────────────────────┘
```

### Scaling Options

**Current Setup (Small - Medium Practice)**
- Cron: Every 60 seconds
- Batch: 10 emails
- Capacity: ~600 emails/hour

**High Volume Setup (Large Practice)**
```sql
-- Process every 30 seconds
SELECT cron.schedule('process-email-queue', '*/30 * * * * *', $$..$$);

-- Increase batch size in Edge Function
.limit(50)  -- Process 50 emails per execution

-- Result: 6,000 emails/hour
```

### Monitoring Queries

```sql
-- Current queue status
SELECT
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM email_queue
GROUP BY status;

-- Delivery rate (last 24 hours)
SELECT
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'sent')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as success_rate
FROM email_queue
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Average processing time
SELECT
  AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) as avg_seconds
FROM email_queue
WHERE status = 'sent'
  AND created_at > NOW() - INTERVAL '24 hours';

-- Top failure reasons
SELECT
  error_message,
  COUNT(*) as count
FROM email_queue
WHERE status = 'failed'
GROUP BY error_message
ORDER BY count DESC
LIMIT 10;
```

---

## Error Handling

### Edge Function Error Handling

```typescript
// Graceful error handling in Edge Function
try {
  // Send email via Resend
  const response = await fetch('https://api.resend.com/emails', {...});

  if (!response.ok) {
    // Log detailed error for debugging
    const errorData = await response.json();
    console.error('Resend API Error:', errorData);

    // Update queue with error (will retry)
    await supabase
      .from('email_queue')
      .update({
        status: 'pending',  // Retry on next cron run
        error_message: JSON.stringify(errorData),
        attempts: email.attempts + 1
      });
  }
} catch (error) {
  // Network or unexpected errors
  console.error('Unexpected error:', error);

  // Update queue (will retry if under max_attempts)
  await supabase
    .from('email_queue')
    .update({
      status: email.attempts + 1 >= email.max_attempts ? 'failed' : 'pending',
      error_message: error.message,
      attempts: email.attempts + 1
    });
}
```

---

## Monitoring Dashboard

The Admin Panel includes an Email Queue Monitor:

```
┌────────────────────────────────────────────────────────┐
│              EMAIL QUEUE MONITOR                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Status Overview:                                      │
│  ├─ Pending:     5 emails                             │
│  ├─ Processing:  2 emails                             │
│  ├─ Sent:        1,234 emails (today)                 │
│  └─ Failed:      3 emails                             │
│                                                         │
│  Recent Activity:                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 12:05 PM  ✓ Sent to patient@example.com        │  │
│  │ 12:04 PM  ✓ Sent to john@example.com           │  │
│  │ 12:03 PM  ✗ Failed: Invalid email address      │  │
│  │ 12:02 PM  ✓ Sent to jane@example.com           │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Performance:                                          │
│  ├─ Success Rate: 99.2%                               │
│  ├─ Avg Delivery: 47 seconds                          │
│  └─ Emails/Hour: 87                                   │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Appointment Requests

```typescript
// src/components/booking/AppointmentRequestForm.tsx
const handleSubmit = async (formData) => {
  // 1. Save appointment request to database
  const { data: appointment } = await supabase
    .from('appointment_requests')
    .insert({...})
    .select()
    .single();

  // 2. Queue confirmation email to patient
  await emailService.queueEmail({
    to: formData.email,
    ...emailTemplates.appointmentConfirmation(formData)
  });

  // 3. Queue notification email to staff
  await emailService.queueEmail({
    to: 'admin@clearsightvision.com',
    ...emailTemplates.appointmentNotification(formData)
  });
};
```

### 2. Contact Form

```typescript
// src/pages/Contact.tsx
const handleContactForm = async (formData) => {
  await emailService.queueEmail({
    to: 'info@clearsightvision.com',
    subject: `Contact Form: ${formData.subject}`,
    htmlBody: generateContactEmailHTML(formData)
  });
};
```

### 3. Admin Notifications

```typescript
// Internal system notifications
await emailService.queueEmail({
  to: 'admin@clearsightvision.com',
  subject: 'System Alert: High Queue Volume',
  htmlBody: '<p>Email queue has 100+ pending emails...</p>'
});
```

---

## Future Enhancements

### Phase 2: Webhook Integration

```
Resend Webhooks → Edge Function → Update email_queue
                                 → Track opens/clicks
                                 → Handle bounces
                                 → Process complaints
```

### Phase 3: Template Management

```
Admin UI → Templates Table → Dynamic email generation
                           → A/B testing
                           → Personalization
```

### Phase 4: Analytics Dashboard

```
email_queue + delivery_events → Analytics Engine
                              → Charts & Graphs
                              → Export Reports
                              → Insights
```

---

## Cost Analysis

### Current Setup Cost

```
Component               Cost/Month    Notes
─────────────────────  ───────────   ──────────────────────
Resend (Free Tier)     $0            3,000 emails/month
Supabase (Included)    $0            Part of existing plan
Edge Functions         $0            Included in Supabase
Total                  $0            Until you exceed free tier
```

### Scaling Costs

```
Email Volume           Resend Cost    Total Monthly
─────────────────────  ───────────   ──────────────
0 - 3,000              $0            $0
3,001 - 50,000         $20           $20
50,001 - 100,000       $85           $85
100,000+               Custom        Contact sales
```

---

## Best Practices

1. **Always use queuing** - Never send emails synchronously
2. **Include text version** - Better deliverability
3. **Monitor bounce rate** - Keep below 2%
4. **Verify domain** - Configure SPF, DKIM, DMARC
5. **Rate limiting** - Don't exceed provider limits
6. **Error logging** - Track all failures
7. **Regular cleanup** - Archive old sent emails
8. **Testing** - Test in staging before production
9. **Backup plan** - Have fallback email provider
10. **Compliance** - Include unsubscribe for marketing emails

---

## Compliance & Legal

### CAN-SPAM Act Requirements

- ✅ Include physical address
- ✅ Include unsubscribe link
- ✅ Honor unsubscribe within 10 days
- ✅ Use accurate from/subject lines

### GDPR Requirements

- ✅ Obtain consent before sending
- ✅ Provide data access/deletion
- ✅ Document processing activities
- ✅ Secure data storage

### HIPAA Requirements (Medical Practices)

- ✅ Encrypt PHI in transit (TLS)
- ✅ Encrypt PHI at rest (database encryption)
- ✅ Sign BAA with email provider
- ✅ Audit trail of email access
- ✅ Regular security assessments

**Note:** This system is designed with HIPAA compliance in mind but requires proper configuration and operational procedures.

---

## Summary

The ClearSight Vision email system provides:

- ✅ **Reliability** - Queued delivery with automatic retries
- ✅ **Scalability** - Handles high volume with minimal configuration
- ✅ **Monitoring** - Real-time visibility into email delivery
- ✅ **Security** - Multiple layers of authentication and encryption
- ✅ **Cost-Effective** - Free tier covers most small practices
- ✅ **Easy Integration** - Simple API for developers
- ✅ **Production-Ready** - Battle-tested architecture

For implementation details, see [EMAIL_INTEGRATION_GUIDE.md](./EMAIL_INTEGRATION_GUIDE.md).
