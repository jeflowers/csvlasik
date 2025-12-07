# Email Migration: Resend to Postmark
## Zero-Downtime Migration Guide

**Last Updated:** December 7, 2025
**Migration Time:** 2-3 hours
**Downtime:** 0 minutes

---

## Why Migrate to Postmark?

### Advantages of Postmark

✅ **Superior Deliverability** - 99%+ inbox placement rate
✅ **Better Analytics** - Detailed delivery tracking and insights
✅ **Robust API** - Industry-leading reliability
✅ **Excellent Support** - Fast, helpful customer service
✅ **Transparent Pricing** - $15/month for 10,000 emails
✅ **HIPAA Ready** - Business Account Associates available
✅ **Webhooks Built-in** - Real-time delivery notifications

### Cost Comparison

| Provider | Free Tier | Paid Tier | 10K Emails |
|----------|-----------|-----------|------------|
| Resend | 3,000/month | $20/month | $20 |
| Postmark | 100/month | $15/month | $15 |

**Savings:** $5/month + better deliverability

---

## Migration Strategy

### Zero-Downtime Approach

We'll use a **parallel running** strategy:

```
Day 1-2:  Setup Postmark (Resend still active)
Day 3-5:  Test Postmark (10% traffic)
Day 6-7:  Increase traffic (50% traffic)
Day 8:    Full cutover (100% traffic)
Day 9-10: Monitor and verify
Day 11:   Decommission Resend
```

This ensures:
- No email delivery interruption
- Ability to rollback instantly
- Data to compare providers
- Confidence before full cutover

---

## Pre-Migration Checklist

Before starting, ensure you have:

- [ ] Admin access to DNS provider
- [ ] Supabase project admin access
- [ ] Existing email system working correctly
- [ ] Test email addresses for verification
- [ ] Credit card for Postmark account
- [ ] Backup of current Edge Function code
- [ ] 2-3 hours for implementation

---

## Phase 1: Postmark Setup (30 minutes)

### Step 1.1: Create Postmark Account

1. Go to [postmarkapp.com](https://postmarkapp.com)
2. Click **Sign Up**
3. Complete registration form
4. Verify your email address
5. Choose **Transactional** email stream

### Step 1.2: Create Server

1. In Postmark dashboard, click **Servers**
2. Click **Create a Server**
3. Name: `ClearSight Production`
4. Environment: **Production**
5. Click **Create Server**

### Step 1.3: Get API Token

1. Click your server name
2. Go to **API Tokens** tab
3. Copy the **Server API token**
   ```
   Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
4. Save this token securely

### Step 1.4: Choose Pricing Plan

**Recommended for medical practice:**

- **Start:** $15/month for 10,000 emails
- **Growth:** $85/month for 100,000 emails

Start with the basic plan, upgrade as needed.

---

## Phase 2: DNS Configuration (30 minutes)

### Step 2.1: Add Domain to Postmark

1. In Postmark, go to **Sender Signatures** → **Domains**
2. Click **Add Domain**
3. Enter: `clearsightvision.com`
4. Click **Verify Domain**

### Step 2.2: Get DNS Records

Postmark will show you records to add. You'll need 3 records:

#### Record 1: DKIM
```
Type: TXT
Name: 20241207._domainkey
Value: [Long string provided by Postmark]
TTL: 3600
```

#### Record 2: Return-Path
```
Type: CNAME
Name: pm-bounces
Value: pm.mtasv.net
TTL: 3600
```

#### Record 3: SPF (Update existing or create)
```
Type: TXT
Name: @
Value: v=spf1 include:spf.mtasv.net ~all
TTL: 3600
```

**Note:** If you already have an SPF record for Resend, update it:
```
OLD: v=spf1 include:resend.net ~all
NEW: v=spf1 include:resend.net include:spf.mtasv.net ~all
```

### Step 2.3: Add Records to DNS

Follow your DNS provider's instructions to add these records.

**Example: Cloudflare**
1. Log into Cloudflare
2. Select your domain
3. Click **DNS** → **Records**
4. Click **Add record** for each
5. Enter Type, Name, and Value exactly as shown
6. Click **Save**

### Step 2.4: Verify Domain

1. Return to Postmark
2. Click **Verify** next to your domain
3. Wait for verification (usually 5-30 minutes)
4. Status should show "Verified"

**Troubleshooting:** If not verified after 1 hour, click **Check Again**

---

## Phase 3: Update Edge Function (20 minutes)

### Step 3.1: Backup Current Function

```bash
# Backup current Edge Function
cp supabase/functions/process-email-queue/index.ts \
   supabase/functions/process-email-queue/index.resend.backup.ts
```

### Step 3.2: Create New Postmark Edge Function

Replace the contents of `supabase/functions/process-email-queue/index.ts`:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailQueueItem {
  id: string;
  to_email: string;
  from_email: string | null;
  subject: string;
  html_body: string;
  text_body: string | null;
  reply_to: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
}

interface PostmarkEmailRequest {
  From: string;
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody?: string;
  ReplyTo?: string;
  MessageStream: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const postmarkApiKey = Deno.env.get('POSTMARK_API_KEY');

    if (!postmarkApiKey) {
      throw new Error('POSTMARK_API_KEY environment variable is not set');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pending emails
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', supabase.rpc('max_attempts'))
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No emails to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const email of emails as EmailQueueItem[]) {
      try {
        // Update status to processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing', attempts: email.attempts + 1 })
          .eq('id', email.id);

        // Prepare Postmark request
        const postmarkRequest: PostmarkEmailRequest = {
          From: email.from_email || 'noreply@clearsightvision.com',
          To: email.to_email,
          Subject: email.subject,
          HtmlBody: email.html_body,
          MessageStream: 'outbound',
        };

        // Add optional fields
        if (email.text_body) {
          postmarkRequest.TextBody = email.text_body;
        }
        if (email.reply_to) {
          postmarkRequest.ReplyTo = email.reply_to;
        }

        // Send via Postmark
        const response = await fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': postmarkApiKey,
          },
          body: JSON.stringify(postmarkRequest),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }

        const result = await response.json();

        // Update status to sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'sent', messageId: result.MessageID });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        const newAttempts = email.attempts + 1;
        const isFailed = newAttempts >= email.max_attempts;

        // Update with error
        await supabase
          .from('email_queue')
          .update({
            status: isFailed ? 'failed' : 'pending',
            error_message: errorMessage,
            attempts: newAttempts,
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'error', error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing email queue:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Step 3.3: Deploy Updated Function

```bash
# Deploy to Supabase
supabase functions deploy process-email-queue
```

---

## Phase 4: Configure Supabase (10 minutes)

### Step 4.1: Add Postmark API Key

1. Go to Supabase Dashboard → **Settings** → **Edge Functions**
2. Scroll to **Function Secrets**
3. Click **Add new secret**
4. Enter:
   - **Name:** `POSTMARK_API_KEY`
   - **Value:** Your Postmark server token
5. Click **Save**

**Important:** Keep the `RESEND_API_KEY` for now (rollback safety)

### Step 4.2: Verify Configuration

Test the configuration:

```bash
# Test Postmark API token
curl -X POST "https://api.postmarkapp.com/email" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: YOUR_POSTMARK_TOKEN" \
  -d '{
    "From": "noreply@clearsightvision.com",
    "To": "test@example.com",
    "Subject": "Test Email",
    "HtmlBody": "<p>Test</p>",
    "MessageStream": "outbound"
  }'
```

Expected response:
```json
{
  "To": "test@example.com",
  "SubmittedAt": "2025-12-07T...",
  "MessageID": "...",
  "ErrorCode": 0,
  "Message": "OK"
}
```

---

## Phase 5: Testing (30 minutes)

### Step 5.1: Send Test Email

Use your application or admin panel to queue a test email:

```typescript
import { emailService } from './services/emailService';

await emailService.queueEmail({
  to: 'your-email@example.com',
  subject: 'Postmark Test Email',
  htmlBody: '<p>This is a test email via Postmark</p>',
  textBody: 'This is a test email via Postmark',
  from: 'noreply@clearsightvision.com'
});
```

### Step 5.2: Verify Delivery

1. Wait 1-2 minutes
2. Check your email inbox
3. Verify email was received
4. Check email headers to confirm Postmark delivery

### Step 5.3: Check Postmark Dashboard

1. Go to Postmark Dashboard → **Activity**
2. You should see the sent email
3. Click on it to see detailed stats:
   - Delivery status
   - Open tracking (if enabled)
   - Delivery time
   - Recipient server response

### Step 5.4: Test Multiple Scenarios

Test these cases:

✅ Valid email address → Should deliver
✅ Invalid email address → Should bounce
✅ Multiple recipients → Should queue all
✅ Long subject line → Should truncate gracefully
✅ Special characters in subject → Should encode properly

### Step 5.5: Compare with Resend

For the next 2-3 days, monitor both providers:

| Metric | Resend | Postmark |
|--------|--------|----------|
| Delivery Rate | % | % |
| Avg Delivery Time | sec | sec |
| Bounce Rate | % | % |
| Spam Complaints | count | count |

---

## Phase 6: Gradual Rollout (3-5 days)

### Day 1-2: 10% Traffic to Postmark

Create a traffic splitting mechanism:

```typescript
// In emailService.ts
async queueEmail(options: QueueEmailOptions) {
  // Random 10% to test Postmark
  const usePostmark = Math.random() < 0.10;

  // Add metadata to track which provider
  const metadata = {
    provider: usePostmark ? 'postmark' : 'resend',
    timestamp: new Date().toISOString()
  };

  // Queue as normal - Edge Function will use Postmark
  return await supabase.from('email_queue').insert({...});
}
```

**Monitor:** Check both dashboards hourly

### Day 3-5: 50% Traffic

If no issues detected:

```typescript
const usePostmark = Math.random() < 0.50; // 50% traffic
```

**Monitor:** Check dashboards 2x daily

### Day 6: 100% Traffic

If metrics are better or equal:

```typescript
// Remove Resend completely - use Postmark for all emails
```

---

## Phase 7: Monitoring (Ongoing)

### Key Metrics to Track

**Postmark Dashboard:**
- Delivery Rate (should be >99%)
- Bounce Rate (should be <2%)
- Spam Complaints (should be <0.1%)
- Average Delivery Time

**Application Database:**
```sql
-- Daily email stats
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(AVG(EXTRACT(EPOCH FROM (sent_at - created_at)))) as avg_seconds
FROM email_queue
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Set Up Alerts

**In Postmark:**
1. Go to **Settings** → **Notifications**
2. Enable email notifications for:
   - Delivery issues
   - Bounce rate spikes
   - Spam complaints
3. Enter your admin email

**In Supabase:**
Create a monitoring function:

```sql
-- Alert if delivery rate drops below 95%
CREATE OR REPLACE FUNCTION check_email_health()
RETURNS void AS $$
DECLARE
  delivery_rate numeric;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE status = 'sent')::numeric /
    NULLIF(COUNT(*), 0) * 100
  INTO delivery_rate
  FROM email_queue
  WHERE created_at > NOW() - INTERVAL '1 hour';

  IF delivery_rate < 95 THEN
    RAISE WARNING 'Email delivery rate dropped to %', delivery_rate;
    -- Queue alert email to admin
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 8: Decommission Resend (After 1 week)

Once you're confident Postmark is working perfectly:

### Step 8.1: Remove Resend API Key

1. Go to Supabase Dashboard → **Settings** → **Edge Functions**
2. Find `RESEND_API_KEY`
3. Click **Delete**
4. Confirm deletion

### Step 8.2: Cancel Resend Account

1. Log into Resend dashboard
2. Go to **Settings** → **Billing**
3. Click **Cancel Subscription**
4. Confirm cancellation
5. Export any data you need for records

### Step 8.3: Remove Old Code

```bash
# Remove backup file (optional - keep for reference)
rm supabase/functions/process-email-queue/index.resend.backup.ts
```

### Step 8.4: Update Documentation

Update your internal docs to reflect Postmark as the email provider.

---

## Rollback Plan

### If Issues Occur

**Immediate Rollback (5 minutes):**

1. **Restore Resend Edge Function:**
   ```bash
   # Restore backup
   cp supabase/functions/process-email-queue/index.resend.backup.ts \
      supabase/functions/process-email-queue/index.ts

   # Deploy
   supabase functions deploy process-email-queue
   ```

2. **Verify Resend API Key:**
   - Ensure `RESEND_API_KEY` is still in Supabase secrets
   - Test with a sample email

3. **Monitor:**
   - Check email queue for stuck emails
   - Verify delivery resumes

**No Data Loss:** All emails remain in queue and will be processed by Resend.

---

## Common Issues & Solutions

### Issue: Emails Not Sending

**Symptoms:**
- Emails stuck in "pending" status
- Error: "POSTMARK_API_KEY not set"

**Solution:**
1. Verify API key in Supabase secrets
2. Check Edge Function logs for errors
3. Test API key with curl command

### Issue: Higher Bounce Rate

**Symptoms:**
- More bounces than with Resend
- Bounces for valid addresses

**Solution:**
1. Verify DNS records are correct
2. Check sender signature is verified
3. Review Postmark bounce logs
4. Contact Postmark support

### Issue: Emails Going to Spam

**Symptoms:**
- Emails landing in spam folder
- Lower delivery rate

**Solution:**
1. Verify DKIM signature is working
2. Check SPF record includes Postmark
3. Warm up your domain gradually
4. Use [mail-tester.com](https://www.mail-tester.com) to test

### Issue: Slow Delivery

**Symptoms:**
- Emails taking >5 minutes to deliver
- Queue backing up

**Solution:**
1. Check Postmark status page
2. Verify cron job is running
3. Increase batch size in Edge Function
4. Check rate limits

---

## Cost Comparison

### After Migration

**Before (Resend):**
- Free tier: 3,000 emails/month
- Paid: $20/month for 50,000 emails

**After (Postmark):**
- Free tier: 100 emails/month
- Paid: $15/month for 10,000 emails
- Better: $85/month for 100,000 emails

**Monthly Savings:** $5/month (for 10K emails)
**Annual Savings:** $60/year

**Additional Benefits:**
- Better deliverability
- More detailed analytics
- Superior support
- HIPAA-ready with BAA

---

## Enhanced Features with Postmark

### 1. Webhooks (Real-time Notifications)

Postmark sends webhooks for:
- Delivery confirmations
- Bounces
- Spam complaints
- Opens (if enabled)
- Clicks (if enabled)

**Setup:**
1. Create webhook Edge Function
2. Configure in Postmark dashboard
3. Process events in real-time

### 2. Templates

Postmark has built-in template support:

```typescript
// Use Postmark template instead of HTML
const response = await fetch('https://api.postmarkapp.com/email/withTemplate', {
  method: 'POST',
  headers: {
    'X-Postmark-Server-Token': postmarkApiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    From: 'noreply@clearsightvision.com',
    To: 'patient@example.com',
    TemplateId: 12345,
    TemplateModel: {
      name: 'John Doe',
      appointment_date: '2025-12-15'
    }
  })
});
```

### 3. Batch Sending

Send up to 500 emails in one API call:

```typescript
// Batch API endpoint
await fetch('https://api.postmarkapp.com/email/batch', {
  method: 'POST',
  headers: {
    'X-Postmark-Server-Token': postmarkApiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([
    { From: '...', To: 'patient1@example.com', ... },
    { From: '...', To: 'patient2@example.com', ... },
    // ... up to 500 emails
  ])
});
```

### 4. Analytics Dashboard

Postmark provides detailed analytics:
- Delivery rates over time
- Open rates (if tracking enabled)
- Click rates
- Geographic distribution
- Email client breakdown
- Engagement metrics

---

## Migration Checklist

Use this checklist to track your migration:

### Pre-Migration
- [ ] Reviewed migration guide completely
- [ ] Backed up current Edge Function
- [ ] Prepared test email addresses
- [ ] Obtained necessary access credentials
- [ ] Scheduled maintenance window (if needed)

### Phase 1: Setup
- [ ] Created Postmark account
- [ ] Created server in Postmark
- [ ] Obtained API token
- [ ] Selected pricing plan

### Phase 2: DNS
- [ ] Added domain to Postmark
- [ ] Added DKIM record
- [ ] Added Return-Path CNAME
- [ ] Updated SPF record
- [ ] Verified domain in Postmark

### Phase 3: Code
- [ ] Backed up current Edge Function
- [ ] Created new Postmark Edge Function
- [ ] Tested code locally (if possible)
- [ ] Deployed to Supabase

### Phase 4: Configuration
- [ ] Added POSTMARK_API_KEY to Supabase
- [ ] Kept RESEND_API_KEY for rollback
- [ ] Tested API token with curl

### Phase 5: Testing
- [ ] Sent test email
- [ ] Verified delivery
- [ ] Checked Postmark dashboard
- [ ] Tested multiple scenarios
- [ ] Verified email formatting

### Phase 6: Rollout
- [ ] Day 1-2: 10% traffic
- [ ] Day 3-5: 50% traffic
- [ ] Day 6+: 100% traffic
- [ ] Monitored metrics daily

### Phase 7: Monitoring
- [ ] Set up Postmark alerts
- [ ] Created monitoring queries
- [ ] Scheduled daily reviews
- [ ] Documented any issues

### Phase 8: Cleanup
- [ ] Removed RESEND_API_KEY
- [ ] Cancelled Resend subscription
- [ ] Removed backup files (optional)
- [ ] Updated documentation

---

## Support Resources

### Postmark Resources

**Documentation:**
- API Docs: [postmarkapp.com/developer](https://postmarkapp.com/developer)
- Getting Started: [postmarkapp.com/support](https://postmarkapp.com/support)

**Support:**
- Email: support@postmarkapp.com
- Response time: Usually < 4 hours
- Available: 24/7

**Community:**
- Status Page: [status.postmarkapp.com](https://status.postmarkapp.com)
- Blog: [postmarkapp.com/blog](https://postmarkapp.com/blog)

### Emergency Contacts

**Critical Issues:**
1. Check Postmark status page
2. Email support@postmarkapp.com
3. If needed, rollback to Resend immediately

**Development Support:**
Contact your development team for custom implementation help.

---

## Success Metrics

### Target Goals

After migration, you should see:

- ✅ **Delivery Rate:** >99% (vs Resend's ~97%)
- ✅ **Bounce Rate:** <2%
- ✅ **Spam Rate:** <0.1%
- ✅ **Avg Delivery:** <30 seconds
- ✅ **Cost:** $5/month savings
- ✅ **Support Response:** <4 hours

### How to Measure

**Week 1:**
- Compare delivery rates daily
- Track bounce rates
- Monitor spam complaints
- Measure delivery times

**Week 2:**
- Calculate cost savings
- Review support interactions
- Assess analytics quality
- Gather team feedback

**Month 1:**
- Full cost comparison
- ROI calculation
- Feature utilization review
- Plan future enhancements

---

## Next Steps

After successful migration:

1. **Enable Webhooks** - Get real-time delivery notifications
2. **Create Templates** - Use Postmark's template system
3. **Set Up Analytics** - Monitor engagement metrics
4. **Implement Batch Sending** - For newsletter campaigns
5. **Configure BAA** - For HIPAA compliance (if needed)

---

## Conclusion

Migrating from Resend to Postmark provides:

- ✅ Better deliverability
- ✅ Lower costs
- ✅ Superior analytics
- ✅ Enhanced features
- ✅ HIPAA-ready infrastructure

With this zero-downtime migration strategy, you can switch providers confidently while maintaining uninterrupted email service.

**Estimated Total Time:** 2-3 hours setup + 1 week gradual rollout

**Risk Level:** Low (with rollback plan)

**Recommended:** Yes, for production medical practices

---

**Questions?** Review the troubleshooting section or contact your development team.

**Ready to migrate?** Start with Phase 1 and follow the checklist!
