# Email Migration Quick Reference
## Resend → Postmark in 8 Steps

**Total Time:** 2-3 hours
**Downtime:** 0 minutes

---

## Step 1: Create Postmark Account (5 min)

1. Go to [postmarkapp.com](https://postmarkapp.com) → Sign Up
2. Create Server: "ClearSight Production"
3. Copy **Server API Token**

---

## Step 2: DNS Records (10 min)

Add to your DNS provider:

```
DKIM:
Type: TXT
Name: 20241207._domainkey
Value: [From Postmark]

Return-Path:
Type: CNAME
Name: pm-bounces
Value: pm.mtasv.net

SPF (update existing):
Type: TXT
Name: @
Value: v=spf1 include:resend.net include:spf.mtasv.net ~all
```

Verify in Postmark dashboard.

---

## Step 3: Update Edge Function (5 min)

```bash
# Backup current function
cp supabase/functions/process-email-queue/index.ts \
   supabase/functions/process-email-queue/index.resend.backup.ts

# Copy Postmark version
cp supabase/functions/process-email-queue/index.postmark.ts \
   supabase/functions/process-email-queue/index.ts

# Deploy
supabase functions deploy process-email-queue
```

---

## Step 4: Add API Key to Supabase (2 min)

1. Supabase Dashboard → **Settings** → **Edge Functions**
2. Add Secret: `POSTMARK_API_KEY` = [Your Token]
3. Keep `RESEND_API_KEY` for rollback

---

## Step 5: Test (5 min)

```typescript
await emailService.queueEmail({
  to: 'your-email@example.com',
  subject: 'Postmark Test',
  htmlBody: '<p>Testing Postmark</p>',
  from: 'noreply@clearsightvision.com'
});
```

Check inbox after 1-2 minutes.

---

## Step 6: Monitor (3-5 days)

- Day 1-2: Monitor closely
- Day 3-5: Review metrics
- Compare: Delivery rate, bounce rate, speed

**Success Metrics:**
- Delivery rate: >99%
- Bounce rate: <2%
- Avg delivery: <30 seconds

---

## Step 7: Verify Success (1 week)

```sql
-- Check delivery stats
SELECT
  status,
  COUNT(*) as count
FROM email_queue
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;
```

Expected: >99% sent, <1% failed

---

## Step 8: Cleanup (5 min)

1. Remove `RESEND_API_KEY` from Supabase
2. Cancel Resend subscription
3. Update team documentation

---

## Rollback (If Needed)

```bash
# Restore Resend function
cp supabase/functions/process-email-queue/index.resend.backup.ts \
   supabase/functions/process-email-queue/index.ts

# Deploy
supabase functions deploy process-email-queue
```

Emails will process normally within 1 minute.

---

## Quick Commands

```bash
# Test Postmark API
curl -X POST "https://api.postmarkapp.com/email" \
  -H "X-Postmark-Server-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "From": "noreply@clearsightvision.com",
    "To": "test@example.com",
    "Subject": "Test",
    "HtmlBody": "<p>Test</p>",
    "MessageStream": "outbound"
  }'

# Check email queue status
SELECT status, COUNT(*) FROM email_queue GROUP BY status;

# Check DNS propagation
dig TXT 20241207._domainkey.yourdomain.com
dig CNAME pm-bounces.yourdomain.com

# View Edge Function logs
# In Supabase Dashboard → Edge Functions → process-email-queue → Logs
```

---

## Cost Savings

**Before (Resend):**
- $20/month for 50K emails

**After (Postmark):**
- $15/month for 10K emails
- $85/month for 100K emails

**Savings:** $5-$60/month depending on volume

---

## Support

**Postmark Support:**
- Email: support@postmarkapp.com
- Response: <4 hours
- Status: [status.postmarkapp.com](https://status.postmarkapp.com)

**Emergency Rollback:**
- Run rollback commands above
- Emails will resume within 1 minute
- Zero data loss

---

## Checklist

- [ ] Created Postmark account
- [ ] Added DNS records (verified)
- [ ] Updated Edge Function
- [ ] Added POSTMARK_API_KEY
- [ ] Sent test email (received)
- [ ] Monitored for 1 week
- [ ] Verified success metrics
- [ ] Removed Resend

---

**Done!** See [EMAIL_MIGRATION_RESEND_TO_POSTMARK.md](./EMAIL_MIGRATION_RESEND_TO_POSTMARK.md) for detailed guide.
