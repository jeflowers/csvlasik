# Google Workspace SMTP Configuration Guide

## Overview
This guide explains how to configure your ClearSight app to send emails through Google Workspace SMTP.

## 1. Set Up App Password in Google Workspace

Since Google Workspace uses 2-Step Verification, you need an App Password:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the setup

2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "ClearSight LASIK App"
   - Copy the 16-character password (you won't see it again!)

## 2. Configure Supabase Edge Function Secrets

Go to your Supabase Dashboard → Project Settings → Edge Functions and add:

```
GMAIL_SMTP_USER=noreply@csvlasik.com
GMAIL_SMTP_PASSWORD=your-16-char-app-password-here
```

## 3. Deploy the Edge Function

Run this command:
```bash
# Deploy the Gmail SMTP edge function
supabase functions deploy process-email-queue-gmail
```

Or use the Supabase MCP tool to deploy it.

## 4. Test the Configuration

Send a test email from your admin panel:
1. Go to Admin Dashboard → Email Queue Monitor
2. Click "Process Queue" to send pending emails
3. Check the status - should show "sent"

## Email Addresses Configuration

Your app will use these Google Workspace addresses:

- **noreply@csvlasik.com** - Default sender for automated emails
- **appointments@csvlasik.com** - Appointment notifications
- **info@csvlasik.com** - General inquiries, contact form responses
- **csvladmin@csvlasik.com** - Admin notifications

## How It Works

1. App queues emails in the `email_queue` table
2. Edge function `process-email-queue-gmail` runs (manually or via cron)
3. Connects to Gmail SMTP using App Password
4. Sends emails through your Google Workspace account
5. Updates queue status (sent/failed)

## Benefits

✅ Professional domain emails (@csvlasik.com)
✅ Better deliverability (Google's reputation)
✅ All sent mail visible in Google Workspace Sent folder
✅ HIPAA-compliant (with proper BAA from Google)
✅ Free for basic usage (included in Workspace subscription)

## Limitations & Quotas

- **Daily sending limit**: 2,000 emails per day (for Google Workspace)
- **Rate limit**: ~100 emails per minute
- **File attachments**: Up to 25MB per email

## Alternative: OAuth2 (More Secure)

For production, consider OAuth2 instead of App Passwords:
- More secure (tokens can be revoked)
- Better audit trail
- Requires more setup (OAuth consent screen, etc.)

## Troubleshooting

**"Invalid credentials" error:**
- Verify 2-Step Verification is enabled
- Regenerate App Password
- Check for typos in password

**"Less secure app access" error:**
- Google Workspace doesn't have this setting - use App Passwords

**Emails not sending:**
- Check Edge Function logs in Supabase
- Verify secrets are set correctly
- Test with a simple email first

## Support

For issues, contact:
- Google Workspace Support: https://support.google.com/a/
- Supabase Support: https://supabase.com/support
