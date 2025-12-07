# Email Integration Quick Start
## 30-Minute Setup Guide

**Time Required:** 30 minutes
**Difficulty:** Beginner

---

## Step 1: Create Resend Account (5 min)

1. Go to [resend.com](https://resend.com) → Sign Up
2. Click **API Keys** → **Create API Key**
3. Copy the key (starts with `re_`)

---

## Step 2: Add DNS Records (10 min)

Add these 3 records to your DNS provider:

### Record 1: SPF
```
Type: TXT
Name: @
Value: v=spf1 include:resend.net ~all
```

### Record 2: DKIM
```
Type: TXT
Name: resend._domainkey
Value: [Get from Resend dashboard]
```

### Record 3: Return Path
```
Type: CNAME
Name: resend
Value: resend.net
```

**Then:** Go to Resend → Verify Domain

---

## Step 3: Configure Supabase (5 min)

1. Go to Supabase Dashboard → **Settings** → **Edge Functions**
2. Add Secret:
   - Name: `RESEND_API_KEY`
   - Value: Your API key from Step 1

3. Run this SQL in **SQL Editor**:

```sql
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-email-queue',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY`.

---

## Step 4: Test (5 min)

```typescript
// Send test email
import { emailService } from './services/emailService';

await emailService.queueEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  htmlBody: '<p>If you receive this, email is working!</p>',
  from: 'noreply@yourdomain.com'
});
```

Check your inbox after 1-2 minutes.

---

## Step 5: Deploy Edge Function (5 min)

```bash
# Using Supabase CLI
supabase functions deploy process-email-queue

# OR manually in Supabase Dashboard:
# Edge Functions → New Function → Copy code from
# /supabase/functions/process-email-queue/index.ts
```

---

## Verify Everything Works

✅ DNS records verified in Resend
✅ Test email received
✅ No emails stuck in queue
✅ Edge function deployed

---

## Troubleshooting

**Email not received?**
- Check spam folder
- Wait up to 48 hours for DNS propagation
- Verify API key in Supabase secrets

**Emails stuck in queue?**
- Check cron job is running
- Verify Edge Function is deployed
- Check Edge Function logs for errors

---

## Need More Details?

See [EMAIL_INTEGRATION_GUIDE.md](./EMAIL_INTEGRATION_GUIDE.md) for comprehensive documentation.

---

## Quick Commands

```bash
# Test DNS records
dig TXT yourdomain.com
dig TXT resend._domainkey.yourdomain.com

# Check cron jobs
SELECT * FROM cron.job;

# Check email queue status
SELECT status, COUNT(*) FROM email_queue GROUP BY status;

# Check recent failed emails
SELECT * FROM email_queue WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
```

---

## Pricing

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for getting started

**Upgrade when:**
- Exceeding 100 emails/day
- Need priority support
- Want advanced analytics

Cost: $20/month for 50,000 emails

---

## Next Steps

1. Monitor email delivery for first week
2. Set up admin notifications
3. Customize email templates
4. Configure appointment reminders
5. Add unsubscribe links (if marketing emails)

---

**Done!** Your email system is ready to use.
