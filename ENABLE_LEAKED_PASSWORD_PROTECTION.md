# Enable Leaked Password Protection

## What This Feature Does

Supabase Auth can check passwords against the HaveIBeenPwned.org database to prevent users from using passwords that have been compromised in data breaches.

## How to Enable

This feature **must be enabled in the Supabase Dashboard** - it cannot be enabled via SQL migrations.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Policies" or "Settings"

3. **Enable Password Protection**
   - Look for "Password Protection" or "Breach Detection"
   - Toggle "Check against HaveIBeenPwned.org" to **ON**
   - Or look for "Leaked Password Protection"

4. **Save Changes**
   - Click "Save" to apply the setting

## What This Prevents

When enabled, this feature will:
- ✅ Reject passwords that appear in known data breaches
- ✅ Protect users from using compromised credentials
- ✅ Prevent account takeover attacks using leaked passwords
- ✅ Meet compliance requirements for password security

## Important Notes

- This check happens in real-time during user registration and password changes
- Passwords are checked using k-anonymity (only partial hash sent to API)
- No actual passwords are sent to HaveIBeenPwned.org
- This is a one-way check - your passwords remain secure

## Alternative: Manual SQL Configuration

If the dashboard option is not available, you may need to contact Supabase support or check their latest documentation for the SQL command to enable this feature.

As of 2025, this is typically a project-level setting that requires dashboard access.

## Verification

After enabling, test by:
1. Try to create a user with password: "password123"
2. Should be rejected with error about compromised password
3. Try with a strong unique password
4. Should succeed

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- Password security best practices

---

**Status:** Manual configuration required via Supabase Dashboard
**Priority:** High - Important security feature
**Compliance:** Recommended for HIPAA, GDPR, ISO 27001
