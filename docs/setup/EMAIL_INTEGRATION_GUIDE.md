# Email Integration Guide
## ClearSight Vision Institute - Step-by-Step Setup

**Last Updated:** December 7, 2025
**Status:** Production Ready
**Estimated Time:** 2-4 hours

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Email Provider Setup](#phase-1-email-provider-setup)
4. [Phase 2: DNS Configuration](#phase-2-dns-configuration)
5. [Phase 3: Supabase Configuration](#phase-3-supabase-configuration)
6. [Phase 4: Testing](#phase-4-testing)
7. [Phase 5: Production Deployment](#phase-5-production-deployment)
8. [Phase 6: Monitoring](#phase-6-monitoring)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Overview

Your ClearSight Vision application already has a complete email infrastructure built-in:

### What's Already Implemented

✅ **Email Queue System** - Database table for queuing and tracking emails
✅ **Email Service Layer** - TypeScript service for sending emails
✅ **Email Templates** - Pre-built templates for appointment confirmations
✅ **Edge Function** - Serverless function for processing email queue
✅ **Admin Dashboard** - Email queue monitor UI component

### What You Need to Setup

🔧 Email provider account (Resend recommended)
🔧 Domain verification (DNS records)
🔧 Environment variables
🔧 Testing and verification

### Architecture

```
User Action → Queue Email → Database (email_queue table)
                                    ↓
                          Edge Function (scheduled)
                                    ↓
                          Email Provider (Resend)
                                    ↓
                          Patient's Inbox
```

---

## Prerequisites

Before you begin, ensure you have:

- [ ] Access to your DNS provider (GoDaddy, Cloudflare, etc.)
- [ ] Your domain name (e.g., clearsightvision.com)
- [ ] Supabase project access
- [ ] Admin access to this application
- [ ] Credit card for email provider (free tier available)

---

## Phase 1: Email Provider Setup

### Option A: Resend (Recommended)

Resend is already integrated into your application. It's recommended because:
- Simple API
- Excellent deliverability
- Free tier: 3,000 emails/month
- Great for transactional emails

#### Step 1.1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **Sign Up**
3. Complete the registration form
4. Verify your email address

#### Step 1.2: Get Your API Key

1. Log into Resend dashboard
2. Click **API Keys** in the left sidebar
3. Click **Create API Key**
4. Name it: `ClearSight Production`
5. Select permission: **Sending access**
6. Click **Add**
7. **IMPORTANT:** Copy the API key immediately (starts with `re_`)
   ```
   Example: re_abc123xyz789_your_key_here
   ```
8. Save this key securely - you'll need it later

#### Step 1.3: Choose Your Pricing Tier

**Free Tier** (Good for getting started)
- 3,000 emails/month
- 100 emails/day
- Basic support

**Paid Tier** ($20/month - Recommended for production)
- 50,000 emails/month
- No daily limits
- Priority support
- Advanced analytics

**Decision:** Start with Free tier, upgrade when needed

---

### Option B: Alternative Providers

If you prefer a different provider, here are alternatives:

#### SendGrid
- Free tier: 100 emails/day
- Pricing: $19.95/month for 50K emails
- More complex setup
- [Setup Guide](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started)

#### Postmark
- Free tier: 100 emails/month
- Pricing: $15/month for 10K emails
- Excellent deliverability
- [Setup Guide](https://postmarkapp.com/developer/api/overview)

#### Amazon SES
- Very cheap ($0.10 per 1,000 emails)
- More complex setup
- Requires AWS account
- [Setup Guide](https://docs.aws.amazon.com/ses/latest/dg/send-email-api.html)

**Note:** If using a different provider, you'll need to modify the Edge Function. Contact support for assistance.

---

## Phase 2: DNS Configuration

### Why DNS Configuration is Required

Email providers require you to verify domain ownership and configure authentication records to ensure:
- Emails don't go to spam
- Your domain isn't used for phishing
- High deliverability rates

### Step 2.1: Access Your DNS Provider

Common DNS providers:
- **GoDaddy**: domains.godaddy.com
- **Cloudflare**: dash.cloudflare.com
- **Namecheap**: namecheap.com/myaccount/login
- **Google Domains**: domains.google.com

### Step 2.2: Add Your Domain to Resend

1. Log into Resend dashboard
2. Click **Domains** in the left sidebar
3. Click **Add Domain**
4. Enter your domain: `clearsightvision.com`
5. Click **Add**

Resend will show you DNS records to add:

### Step 2.3: Add DNS Records

You'll need to add 3 types of records:

#### Record 1: SPF (Sender Policy Framework)
```
Type: TXT
Name: @ (or blank)
Value: v=spf1 include:resend.net ~all
TTL: 3600
```

#### Record 2: DKIM (DomainKeys Identified Mail)
```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend - looks like "k=rsa; p=MIGfMA0GCS..."]
TTL: 3600
```

#### Record 3: Custom Return-Path (Optional but recommended)
```
Type: CNAME
Name: resend
Value: resend.net
TTL: 3600
```

### Step 2.4: How to Add Records (Example: GoDaddy)

1. Log into GoDaddy
2. Go to **My Products**
3. Find your domain, click **DNS**
4. Click **Add** for each record
5. Select record type (TXT or CNAME)
6. Enter Name and Value exactly as shown
7. Click **Save**
8. Repeat for all 3 records

### Step 2.5: Verify Domain

1. Return to Resend dashboard
2. Click **Verify** next to your domain
3. Status should change to "Verified" (may take up to 48 hours)
4. If not verified after 1 hour, click **Check Again**

**Troubleshooting:** If verification fails after 48 hours, see [Troubleshooting](#troubleshooting) section.

---

## Phase 3: Supabase Configuration

### Step 3.1: Add Resend API Key to Supabase

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon in sidebar)
3. Click **Edge Functions**
4. Scroll to **Function Secrets**
5. Click **Add new secret**
6. Enter:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (from Phase 1)
7. Click **Save**

### Step 3.2: Deploy Email Processing Edge Function

The Edge Function is already created in your project. You need to deploy it:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy process-email-queue
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase dashboard
2. Click **Edge Functions** in the sidebar
3. Click **New function**
4. Name: `process-email-queue`
5. Copy the code from `/supabase/functions/process-email-queue/index.ts`
6. Paste into the editor
7. Click **Deploy**

### Step 3.3: Set Up Scheduled Execution

To automatically process the email queue every minute:

1. In Supabase dashboard, go to **Database**
2. Click **Extensions**
3. Enable **pg_cron** extension
4. Go to **SQL Editor**
5. Run this SQL:

```sql
-- Schedule email queue processing every minute
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key (from Settings > API)

### Step 3.4: Update Environment Variables

In your application's `.env` file, ensure these are set:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Phase 4: Testing

### Step 4.1: Test Email Queuing

1. Log into your admin panel: `https://yourdomain.com/admin`
2. Navigate to **Email Queue Monitor**
3. You should see the email queue interface

### Step 4.2: Send Test Email

Create a test script or use the application's contact form:

```typescript
// Test sending an email
import { emailService } from './services/emailService';
import { emailTemplates } from './utils/emailTemplates';

const testData = {
  name: 'John Doe',
  email: 'your-email@example.com', // Use YOUR email for testing
  phone: '(555) 123-4567',
  preferredDate: 'December 15, 2025',
  message: 'This is a test email',
  requestId: 'TEST-001'
};

const template = emailTemplates.appointmentConfirmation(testData);

await emailService.queueEmail({
  to: testData.email,
  subject: template.subject,
  htmlBody: template.html,
  textBody: template.text,
  from: 'noreply@clearsightvision.com'
});

console.log('Test email queued! Check your inbox in 1-2 minutes.');
```

### Step 4.3: Verify Email Delivery

1. Wait 1-2 minutes (for the cron job to process)
2. Check your email inbox
3. Check spam folder if not in inbox
4. Verify email formatting looks correct

### Step 4.4: Check Email Queue Status

In your admin panel:
1. Go to **Email Queue Monitor**
2. You should see:
   - Status: `sent`
   - Sent At: timestamp
   - Attempts: 1
3. If status is `failed`, check error_message column

### Step 4.5: Test Multiple Scenarios

Test these scenarios:

✅ **Valid email address** - should deliver successfully
✅ **Invalid email address** - should fail gracefully
✅ **Multiple emails** - should queue and process all
✅ **Scheduled emails** - should send at scheduled time

---

## Phase 5: Production Deployment

### Step 5.1: Pre-Deployment Checklist

Before going live, verify:

- [ ] DNS records verified (SPF, DKIM)
- [ ] Resend API key configured in Supabase
- [ ] Edge function deployed successfully
- [ ] Cron job scheduled and running
- [ ] Test emails delivered successfully
- [ ] Email templates reviewed and approved
- [ ] From address matches verified domain
- [ ] Reply-to address configured (if needed)

### Step 5.2: Configure From Address

Update email templates to use your verified domain:

```typescript
// In src/services/emailService.ts
from: 'noreply@clearsightvision.com'  // Must match verified domain
```

### Step 5.3: Set Up Email Notifications

Configure who receives internal notifications:

```typescript
// In your appointment request handler
const adminEmail = 'admin@clearsightvision.com';
const template = emailTemplates.appointmentNotification(data);

await emailService.queueEmail({
  to: adminEmail,
  subject: template.subject,
  htmlBody: template.html,
  textBody: template.text
});
```

### Step 5.4: Deploy to Production

```bash
# Build the application
npm run build

# Deploy to your hosting provider
# (Instructions vary by provider)
```

### Step 5.5: Monitor First Day

After deployment:
- Check email queue every hour
- Monitor deliverability rate (should be >99%)
- Watch for bounce or spam complaints
- Review patient feedback

---

## Phase 6: Monitoring

### Step 6.1: Email Queue Dashboard

Your admin panel includes an Email Queue Monitor. Access it at:
```
https://yourdomain.com/admin/email-queue
```

Metrics to monitor:
- **Pending:** Emails waiting to be sent
- **Processing:** Emails currently being sent
- **Sent:** Successfully delivered emails
- **Failed:** Emails that failed after max attempts

### Step 6.2: Resend Dashboard Analytics

Monitor these metrics in Resend dashboard:

1. **Delivery Rate** - Should be >99%
   - If lower, check DNS records

2. **Bounce Rate** - Should be <2%
   - Hard bounces: Invalid email addresses
   - Soft bounces: Temporary issues

3. **Spam Complaints** - Should be <0.1%
   - If higher, review email content
   - Ensure unsubscribe link works

### Step 6.3: Set Up Alerts

Configure alerts for:

**High Failure Rate**
```sql
-- Alert if >10 failed emails in last hour
SELECT COUNT(*) as failed_count
FROM email_queue
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '1 hour';
```

**Queue Backup**
```sql
-- Alert if >100 pending emails
SELECT COUNT(*) as pending_count
FROM email_queue
WHERE status = 'pending';
```

### Step 6.4: Weekly Review

Every week, review:
- Total emails sent
- Delivery rate trend
- Common failure reasons
- Patient engagement (opens/clicks if tracking enabled)

---

## Troubleshooting

### Problem: Emails Going to Spam

**Causes:**
- DNS records not properly configured
- Domain reputation issues
- Email content triggers spam filters

**Solutions:**
1. Verify all DNS records (SPF, DKIM, DMARC)
2. Use [mail-tester.com](https://www.mail-tester.com) to test
3. Ensure "from" address matches verified domain
4. Avoid spam trigger words in subject/content
5. Include plain text version of email
6. Add unsubscribe link

### Problem: DNS Verification Taking Too Long

**Solutions:**
1. Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
2. Wait up to 48 hours for full propagation
3. Clear DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns

   # Mac
   sudo dscacheutil -flushcache

   # Linux
   sudo systemd-resolve --flush-caches
   ```
4. Contact DNS provider support

### Problem: Emails Not Sending

**Check these in order:**

1. **Is API key correct?**
   ```bash
   # Test Resend API key
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"from": "noreply@clearsightvision.com", "to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
   ```

2. **Is cron job running?**
   ```sql
   -- Check cron job status
   SELECT * FROM cron.job WHERE jobname = 'process-email-queue';
   ```

3. **Check email queue for errors:**
   ```sql
   SELECT * FROM email_queue
   WHERE status = 'failed'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

4. **Check Edge Function logs:**
   - Go to Supabase Dashboard > Edge Functions
   - Click on `process-email-queue`
   - View logs for errors

### Problem: High Bounce Rate

**Solutions:**
1. Validate email addresses before queuing
2. Remove hard bounces from your list
3. Use email verification service
4. Check for typos in email addresses

### Problem: Rate Limiting

If you exceed Resend's limits:

1. **Free Tier:** 100 emails/day
   - Solution: Upgrade to paid tier

2. **Paid Tier:** Rate limits per second
   - Solution: Implement rate limiting in queue processor
   ```typescript
   // Add delay between emails
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

---

## FAQ

### How much does email cost?

**Resend Pricing:**
- Free: 3,000 emails/month
- Pro ($20/month): 50,000 emails/month
- Business ($85/month): 100,000 emails/month

**Typical Usage for Medical Practice:**
- Small practice (10-20 appointments/day): ~1,200 emails/month → Free tier
- Medium practice (30-50 appointments/day): ~3,600 emails/month → Pro tier
- Large practice (50+ appointments/day): →6,000+ emails/month → Pro tier

### Can I use my existing email server?

Yes, but not recommended because:
- Complex SMTP configuration
- Lower deliverability rates
- No analytics or tracking
- More maintenance required

If you must use SMTP, contact support for custom Edge Function.

### How do I add an unsubscribe link?

```html
<!-- Add to email template footer -->
<p style="font-size: 12px; color: #666;">
  <a href="https://yourdomain.com/unsubscribe?email={{email}}">Unsubscribe</a>
</p>
```

### Can I track email opens and clicks?

Yes! Resend provides tracking. To enable:

1. In Resend dashboard, go to **Settings**
2. Enable **Track opens** and **Track clicks**
3. View metrics in Resend dashboard

**Note:** Privacy regulations (GDPR, CCPA) may require disclosure.

### What if I need to send attachments?

The current system supports attachments. Modify the email queue:

```sql
-- Add attachment column
ALTER TABLE email_queue ADD COLUMN attachments jsonb;
```

```typescript
// Queue email with attachment
await emailService.queueEmail({
  to: 'patient@example.com',
  subject: 'Your Medical Records',
  htmlBody: '<p>Please find attached...</p>',
  // Note: Attachments require file upload and storage setup
});
```

### How do I handle bounces and complaints?

Set up Resend webhooks to receive bounce/complaint notifications:

1. Create a new Edge Function: `handle-email-webhooks`
2. Configure webhook URL in Resend dashboard
3. Process events and update your database

Contact support for detailed webhook implementation.

### Can I schedule emails for future delivery?

Yes! Use the `scheduledFor` parameter:

```typescript
// Schedule email for tomorrow at 9 AM
const tomorrow9AM = new Date();
tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
tomorrow9AM.setHours(9, 0, 0, 0);

await emailService.queueEmail({
  to: 'patient@example.com',
  subject: 'Appointment Reminder',
  htmlBody: template.html,
  scheduledFor: tomorrow9AM
});
```

### What about email templates?

Email templates are in `/src/utils/emailTemplates.ts`. To modify:

1. Edit the template file
2. Test changes in staging environment
3. Deploy to production

For non-technical staff to edit templates, consider implementing a template editor in the admin panel.

---

## Next Steps

After completing this guide:

1. ✅ **Test thoroughly** - Send test emails to various providers (Gmail, Outlook, Yahoo)
2. ✅ **Monitor closely** - Watch email queue for first week
3. ✅ **Gather feedback** - Ask patients about email delivery
4. ✅ **Optimize templates** - A/B test subject lines and content
5. ✅ **Plan scaling** - Estimate growth and plan upgrades

### Advanced Features to Consider

Once basic email is working well, consider:

- **Email Templates Database** - Store templates in database for easy editing
- **Analytics Dashboard** - Track open rates, click rates, engagement
- **A/B Testing** - Test different subject lines and content
- **Preference Center** - Let patients control email frequency
- **Automated Campaigns** - Birthday emails, follow-up reminders
- **Multi-language Support** - Already implemented in your app!

---

## Support

### Need Help?

**Documentation:**
- Resend Docs: [resend.com/docs](https://resend.com/docs)
- Supabase Edge Functions: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

**Community:**
- Resend Discord: [resend.com/discord](https://resend.com/discord)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)

**Professional Support:**
Contact your development team for custom implementation assistance.

---

## Checklist Summary

Use this checklist to track your progress:

### Phase 1: Provider Setup
- [ ] Created Resend account
- [ ] Obtained API key
- [ ] Saved API key securely

### Phase 2: DNS Configuration
- [ ] Added domain to Resend
- [ ] Added SPF record
- [ ] Added DKIM record
- [ ] Added CNAME record
- [ ] Verified domain in Resend

### Phase 3: Supabase Configuration
- [ ] Added RESEND_API_KEY to Supabase secrets
- [ ] Deployed Edge Function
- [ ] Set up cron job for queue processing
- [ ] Updated environment variables

### Phase 4: Testing
- [ ] Sent test email to yourself
- [ ] Verified email delivery
- [ ] Checked email formatting
- [ ] Tested multiple scenarios
- [ ] Reviewed email queue status

### Phase 5: Production Deployment
- [ ] Completed pre-deployment checklist
- [ ] Updated from address
- [ ] Configured admin notifications
- [ ] Deployed application
- [ ] Monitored first day

### Phase 6: Monitoring
- [ ] Set up email queue dashboard
- [ ] Configured Resend dashboard access
- [ ] Set up alerts for failures
- [ ] Scheduled weekly reviews

---

**Congratulations!** Your email system is now fully operational.

Remember to monitor deliverability and make adjustments as needed.
