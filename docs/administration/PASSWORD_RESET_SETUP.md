# Password Reset Setup Guide

This guide explains how to configure password reset functionality for your CMS using Supabase authentication.

## Overview

The password reset system uses Supabase's built-in email authentication with magic links. When a user forgets their password:

1. User enters their email on `/admin/forgot-password`
2. Supabase sends a password reset email with a secure token
3. User clicks the link in the email
4. User is redirected to `/admin/reset-password` with the token
5. User enters and confirms their new password
6. Password is securely updated in Supabase

## Setup Instructions

### 1. Configure Supabase Email Settings

Go to your Supabase Dashboard:

1. Navigate to **Authentication** → **Email Templates**
2. Find the **Reset Password** template
3. Customize the template (optional)

### 2. Default Email Template

Supabase provides a default reset password email template. The default includes:
- A secure magic link that expires after 24 hours
- Your app name and branding
- Clear call-to-action button

### 3. Customize Email Template (Optional)

You can customize the email template in the Supabase dashboard:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for ClearSight CMS.</p>
<p>Click the button below to create a new password:</p>
<a href="{{ .ConfirmationURL }}">Reset Password</a>
<p>This link will expire in 24 hours.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Thanks,<br>The ClearSight Team</p>
```

### 4. Configure Redirect URLs

In your Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add your redirect URL to the **Redirect URLs** list:
   - Development: `http://localhost:5173/admin/reset-password`
   - Production: `https://yourdomain.com/admin/reset-password`

### 5. Email Provider Setup

By default, Supabase uses its own email service (limited to 3 emails per hour in development).

For production, configure a custom SMTP provider:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your SMTP provider (SendGrid, AWS SES, etc.)

#### Example SMTP Configuration (SendGrid):

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: YOUR_SENDGRID_API_KEY
Sender Email: noreply@yourdomain.com
Sender Name: ClearSight CMS
```

## Security Features

### Password Requirements

The reset password form enforces strong passwords:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&#)

### Token Security

- Reset tokens expire after 24 hours
- Tokens are single-use only
- Tokens are cryptographically secure
- All communication uses HTTPS

### Rate Limiting

Supabase automatically rate limits password reset requests to prevent abuse:
- Maximum 5 requests per hour per email address
- Additional protection against brute force attacks

## User Flow

### 1. Request Password Reset

```
User → /admin/forgot-password
  ↓
Enter email address
  ↓
Submit form
  ↓
Supabase sends email
  ↓
Success message displayed
```

### 2. Reset Password

```
User clicks email link
  ↓
Redirected to /admin/reset-password?token=...
  ↓
Enter new password
  ↓
Confirm password
  ↓
Submit form
  ↓
Password updated
  ↓
Redirect to /admin/login
```

## Testing

### Test Password Reset Flow

1. Go to `/admin/forgot-password`
2. Enter a test user's email
3. Check your email inbox (and spam folder)
4. Click the reset link
5. Enter a new password meeting requirements
6. Verify you can login with the new password

### Common Issues

**Email not received:**
- Check spam folder
- Verify email settings in Supabase dashboard
- Check SMTP configuration if using custom provider
- Verify redirect URLs are whitelisted

**"Invalid or expired reset link":**
- Link expires after 24 hours
- Links are single-use only
- Request a new reset link

**Password requirements not met:**
- Review password requirements displayed on screen
- Ensure all criteria are satisfied

## API Reference

### Reset Password Request

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/admin/reset-password`,
});
```

### Update Password

```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

## Security Best Practices

1. **Always use HTTPS** - Never send reset tokens over HTTP
2. **Rate limit requests** - Prevent abuse and spam
3. **Validate tokens** - Check expiration and validity
4. **Strong passwords** - Enforce password complexity requirements
5. **Audit logging** - Log all password reset attempts
6. **User notification** - Send confirmation email after password change

## Production Checklist

- [ ] SMTP provider configured
- [ ] Custom email template designed
- [ ] Redirect URLs whitelisted for all environments
- [ ] SSL/HTTPS enabled
- [ ] Email deliverability tested
- [ ] Rate limiting verified
- [ ] User documentation provided
- [ ] Support process established

## Support

If users continue to have issues with password reset:

1. Verify their email address is correct
2. Check Supabase Auth logs for errors
3. Manually reset password via Supabase dashboard if needed
4. Contact Supabase support for platform issues

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
