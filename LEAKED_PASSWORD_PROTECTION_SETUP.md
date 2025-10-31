# Enable Leaked Password Protection

## Overview

Leaked Password Protection is a critical security feature that prevents users from setting passwords that have been compromised in data breaches.

## Status

⚠️ **MANUAL ACTION REQUIRED** - This cannot be enabled via database migration

## How to Enable

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Navigate to your project dashboard at `https://supabase.com/dashboard/project/[your-project-id]`

2. **Navigate to Attack Protection**
   - Click on **Authentication** in the left sidebar
   - Click on **Attack Protection** (not "Settings")

3. **Enable Leaked Password Protection**
   - Under the "Bot and Abuse Protection" section
   - Find **"Prevent use of leaked passwords"**
   - The status will show as "Disabled"
   - Click the **"Configure email provider"** button

4. **Configure Email Provider**
   - You must have an email provider configured (SMTP or third-party service)
   - Supabase needs email to notify users if their password is rejected
   - Complete the email provider setup if not already done

5. **Verify Enabled**
   - The feature should now show as enabled
   - Test by trying to create an account with a known weak password like "password123"

## What This Feature Does

### Password Validation
- Checks passwords against the **HaveIBeenPwned.org** database
- Contains over 800 million compromised passwords
- Checks are done securely via k-anonymity API

### User Impact
- **Sign Up**: Rejects known compromised passwords during registration
- **Password Change**: Rejects compromised passwords when users change password
- **Existing Passwords**: Does NOT affect existing user passwords
- **User Feedback**: Clear error message explaining why password was rejected

### Security Benefits
- Prevents users from using passwords leaked in data breaches
- Reduces risk of credential stuffing attacks
- Protects user accounts from easy compromise
- Industry best practice for authentication security

## Technical Details

### How It Works
1. User submits a password
2. Supabase hashes the password with SHA-1
3. First 5 characters of hash sent to HaveIBeenPwned API (k-anonymity)
4. API returns all hashes starting with those 5 characters
5. Supabase checks if full hash matches any returned hashes
6. If match found, password is rejected

### Privacy Considerations
- **No passwords sent to external service**
- Only partial hash prefixes are transmitted
- K-anonymity ensures password cannot be determined from request
- Supabase acts as intermediary for added security

## Error Messages

When a user tries to use a compromised password, they'll see:

```
Password is too weak or has been found in a data breach.
Please choose a different password.
```

## Testing

### Test with Known Weak Passwords

Try these known compromised passwords (they should be rejected):
- `password123`
- `qwerty123`
- `letmein`
- `welcome123`

### Test with Strong Passwords

These should be accepted:
- Random strings: `xK9#mP2$vL8@nQ5`
- Passphrases: `correct-horse-battery-staple-2024`
- Generated passwords from password managers

## Troubleshooting

### Feature Not Available
- **Cause**: Email provider not configured
- **Solution**: Set up SMTP or third-party email provider first
- **Documentation**: See `/docs/setup/EMAIL_SETUP.md`

### Not Appearing in Dashboard
- **Cause**: May be on older Supabase plan or instance
- **Solution**: Update Supabase CLI and project
- **Alternative**: Contact Supabase support

### False Positives
- **Very rare**: Strong passwords shouldn't be rejected
- **If it happens**: The password genuinely appears in breach database
- **Solution**: Generate a new random password

## Related Security Features

Consider enabling these related features in **Attack Protection**:

### 1. Enable Captcha Protection
- Protects authentication endpoints from bots
- Prevents automated attacks
- Location: Same page, "Bot and Abuse Protection" section

### 2. Rate Limiting
- Under **Authentication** > **Rate Limits**
- Prevents brute force attacks
- Configure appropriate limits for your application

### 3. Email Confirmation
- Under **Authentication** > **Policies**
- Requires users to verify email before access
- Reduces fake account creation

## References

- [HaveIBeenPwned.org](https://haveibeenpwned.com/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

## Verification Checklist

- [ ] Navigated to Authentication > Attack Protection
- [ ] Email provider is configured
- [ ] Clicked "Configure email provider" button
- [ ] Feature shows as "Enabled"
- [ ] Tested with weak password (should be rejected)
- [ ] Tested with strong password (should be accepted)
- [ ] Documented in deployment checklist

## Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Verify email provider is working
3. Review Supabase status page
4. Contact Supabase support with project ID

---

**Last Updated**: October 31, 2024
**Feature Location**: Authentication > Attack Protection > Prevent use of leaked passwords
