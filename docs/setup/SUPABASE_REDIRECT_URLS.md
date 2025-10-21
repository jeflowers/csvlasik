# Supabase Redirect URL Configuration

## Issue
Password reset emails are using `http://localhost:3000` instead of production URL `https://csvlasik.com`

## Solution

You need to configure the allowed redirect URLs in your Supabase dashboard.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/qdcykazqmowkmkhykepb

2. **Open Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "URL Configuration"

3. **Add Production URLs**

   Add the following URLs to the **Redirect URLs** section:

   ```
   https://csvlasik.com/admin/reset-password
   https://www.csvlasik.com/admin/reset-password
   http://localhost:3000/admin/reset-password
   http://localhost:5173/admin/reset-password
   ```

4. **Update Site URL**

   Set the **Site URL** to:
   ```
   https://csvlasik.com
   ```

5. **Save Changes**
   - Click "Save" at the bottom of the page

### Alternative: Use Environment Variable

If you want more control, you can set a specific redirect URL in your environment:

1. Add to `.env`:
   ```
   VITE_APP_URL=https://csvlasik.com
   ```

2. Update `ForgotPassword.tsx` to use:
   ```typescript
   redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/admin/reset-password`
   ```

### Verify Configuration

After updating Supabase:

1. Request a password reset from the production site
2. Check the email - the link should now use `https://csvlasik.com`
3. Click the link - it should redirect to your production reset password page

### Current Configuration

The app code already uses `window.location.origin` which means:
- ✅ On `csvlasik.com` → will use `https://csvlasik.com`
- ✅ On `localhost:5173` → will use `http://localhost:5173`

The issue is purely in Supabase's allowed URLs configuration.

## Important Notes

- **Wildcard URLs are not supported** - you must add each specific URL
- **Protocol matters** - `http://` and `https://` are different URLs
- **Subdomain matters** - `csvlasik.com` and `www.csvlasik.com` are different
- Changes take effect immediately after saving

## Security

The redirect URLs are validated by Supabase to prevent open redirect vulnerabilities. Only URLs you explicitly add will work.
