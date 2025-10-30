# Email Setup Guide

This guide covers the complete email configuration for ClearSight Vision, including both Supabase Auth emails and custom transactional emails.

## Overview

The email system uses two components:
1. **Supabase Auth Emails** - Password resets, email confirmations, magic links
2. **Custom Transactional Emails** - Appointment confirmations, notifications

## Part 1: Supabase Auth Email Setup

### Step 1: Get an Email Service Provider

Choose one of these free options:

#### Option A: Resend (Recommended)
- **Free Tier:** 3,000 emails/month, 100/day
- **Website:** https://resend.com
- **Best for:** Modern API, great deliverability

1. Sign up at https://resend.com
2. Verify your domain (or use their testing domain)
3. Create an API key from the dashboard
4. Copy the API key (starts with `re_`)

#### Option B: SendGrid
- **Free Tier:** 100 emails/day
- **Website:** https://sendgrid.com
- **Best for:** Established service, reliable

1. Sign up at https://sendgrid.com
2. Navigate to Settings → API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the API key (starts with `SG.`)

#### Option C: Mailgun
- **Free Tier:** 100 emails/day for 3 months
- **Website:** https://mailgun.com

#### Option D: Amazon SES
- **Free Tier:** 62,000 emails/month (if hosted on AWS)
- **More complex setup but highly scalable**

### Step 2: Configure Supabase Auth SMTP

1. Go to your Supabase project dashboard:
   ```
   https://supabase.com/dashboard/project/qdcykazqmowkmkhykepb
   ```

2. Navigate to **Authentication** → **Settings** → **SMTP Settings**

3. Enable custom SMTP and enter credentials:

   **For Resend:**
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP Username: resend
   SMTP Password: [Your Resend API Key]
   Sender Email: noreply@yourdomain.com
   Sender Name: ClearSight Vision
   ```

   **For SendGrid:**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Username: apikey
   SMTP Password: [Your SendGrid API Key]
   Sender Email: noreply@yourdomain.com
   Sender Name: ClearSight Vision
   ```

4. Click **Save**

### Step 3: Customize Email Templates

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**

2. Customize these templates:
   - **Confirm signup** - When users verify their email
   - **Invite user** - When admins invite new users
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset emails

3. Example customization for Reset Password:
   ```html
   <h2>Reset Your Password</h2>
   <p>Hi there,</p>
   <p>You requested to reset your password for ClearSight Vision.</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   <p>If you didn't request this, please ignore this email.</p>
   <p>Best regards,<br>ClearSight Vision Team</p>
   ```

### Step 4: Test Auth Emails

1. Go to your application
2. Navigate to the password reset page
3. Enter an email and request a password reset
4. Check that you receive the email

## Part 2: Custom Transactional Emails Setup

### Step 1: Configure Resend API Key in Supabase

Your Edge Function needs the Resend API key to send emails.

1. Go to Supabase Dashboard → **Edge Functions** → **Settings**

2. Add a new secret:
   ```
   Name: RESEND_API_KEY
   Value: [Your Resend API Key]
   ```

3. Click **Save**

### Step 2: Verify Edge Function Deployment

The `process-email-queue` Edge Function has already been deployed. Verify it:

1. Go to Supabase Dashboard → **Edge Functions**
2. You should see `process-email-queue` listed
3. Check the logs to ensure no errors

### Step 3: Configure Sender Domain (Optional but Recommended)

For production, you should verify your domain:

#### With Resend:
1. Go to Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `clearsightvision.com`)
4. Add the DNS records to your domain provider:
   - SPF Record
   - DKIM Record
   - DMARC Record (optional but recommended)
5. Wait for verification (usually 24-48 hours)

Once verified, update your sender email:
- Change from `noreply@resend.dev`
- To `noreply@clearsightvision.com`

### Step 4: Test Custom Emails

1. Go to your application
2. Fill out an appointment request form
3. Submit the form
4. Check that two emails are sent:
   - Confirmation to the patient
   - Notification to `appointments@clearsightvision.com`

## Email Queue System

The email system uses a queue to ensure reliable delivery:

### How It Works

1. **Queue Email** - When an appointment is created, emails are added to the `email_queue` table
2. **Process Queue** - Edge Function processes pending emails
3. **Retry Logic** - Failed emails are retried (max 3 attempts)
4. **Status Tracking** - Track sent, failed, and pending emails

### Monitoring Email Queue

Use the admin dashboard or query directly:

```typescript
import { emailService } from './services/emailService';

const status = await emailService.getQueueStatus();
console.log(status);

{
  pending: 5,
  processing: 0,
  sent: 42,
  failed: 2
}
```

### Manual Email Processing

To manually process the queue:

```typescript
import { emailService } from './services/emailService';

const result = await emailService.processQueue();
console.log(`Processed ${result.processed} emails`);
```

### Automatic Processing

Set up a cron job in Supabase to process the queue regularly:

1. Go to **Database** → **Extensions**
2. Enable `pg_cron` extension
3. Create a cron job:

```sql
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- Every minute
  $$
    SELECT net.http_post(
      url := 'https://qdcykazqmowkmkhykepb.supabase.co/functions/v1/process-email-queue',
      headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '", "Content-Type": "application/json"}'::jsonb
    );
  $$
);
```

## Email Templates

Pre-built templates are available in `src/utils/emailTemplates.ts`:

### Appointment Confirmation
Sent to patients when they submit an appointment request:
- Professional branded design
- Request details summary
- Next steps information
- Contact information

### Appointment Notification
Sent to staff when new appointment requests arrive:
- Urgent action required notice
- Patient contact information
- Direct link to admin panel

### Creating Custom Templates

```typescript
import { emailService } from './services/emailService';

await emailService.queueEmail({
  to: 'patient@example.com',
  subject: 'Your Custom Subject',
  htmlBody: '<h1>Your HTML content</h1>',
  textBody: 'Your plain text fallback',
  from: 'noreply@clearsightvision.com',
  replyTo: 'support@clearsightvision.com',
});
```

## Troubleshooting

### Emails Not Sending

1. **Check Supabase Edge Function logs:**
   - Dashboard → Edge Functions → process-email-queue → Logs

2. **Verify API key:**
   - Ensure `RESEND_API_KEY` is set correctly
   - Test the API key with a curl command:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "your-email@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

3. **Check email queue status:**
   ```sql
   SELECT status, count(*)
   FROM email_queue
   GROUP BY status;
   ```

4. **View failed emails:**
   ```sql
   SELECT *
   FROM email_queue
   WHERE status = 'failed'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

### Emails Going to Spam

1. **Verify your domain** (SPF, DKIM, DMARC records)
2. **Use a consistent sender address**
3. **Avoid spam trigger words** in subject lines
4. **Include unsubscribe links** (for marketing emails)
5. **Warm up your domain** (gradually increase sending volume)

### Rate Limits

Free tiers have limits:
- **Resend:** 100 emails/day, 3,000/month
- **SendGrid:** 100 emails/day

Monitor usage and upgrade if needed.

## Best Practices

1. **Always include text fallback** - Not all email clients support HTML
2. **Test on multiple clients** - Gmail, Outlook, Apple Mail, etc.
3. **Keep subject lines under 50 characters**
4. **Make CTAs clear and prominent**
5. **Include company contact information**
6. **Respect user preferences** - Unsubscribe links for marketing
7. **Monitor deliverability** - Track bounce rates and spam complaints
8. **Use transactional email services** - Don't send from personal Gmail/Outlook

## Production Checklist

- [ ] Email service provider account created and verified
- [ ] Domain verified with SPF/DKIM/DMARC records
- [ ] Supabase Auth SMTP configured
- [ ] `RESEND_API_KEY` secret added to Edge Functions
- [ ] Email templates customized with branding
- [ ] Test emails sent and received successfully
- [ ] Cron job set up for automatic queue processing
- [ ] Monitoring and alerting configured
- [ ] Bounce and complaint handling implemented
- [ ] Sender reputation warmed up

## Support

For email-related issues:
- **Resend Support:** https://resend.com/docs
- **SendGrid Support:** https://docs.sendgrid.com
- **Supabase Auth:** https://supabase.com/docs/guides/auth

## Environment Variables Reference

These are automatically configured in Supabase Edge Functions:
```
SUPABASE_URL - Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY - Service role key (has admin access)
RESEND_API_KEY - Your email service API key (must be added manually)
```

Frontend environment variables (in .env):
```
VITE_SUPABASE_URL - Your Supabase project URL
VITE_SUPABASE_ANON_KEY - Anonymous public key
```
