# Login Troubleshooting Guide

## 🔍 Current Database Status

**Admin User Found:**
- ✅ Email: `jeflowers@gmail.com`
- ✅ Role: `admin`
- ✅ Email confirmed: Yes
- ✅ Created: October 10, 2025

**Database Status:**
- ✅ All 9 tables exist
- ✅ RLS policies configured correctly
- ✅ Supabase connection working

---

## 🛠️ Troubleshooting Steps

### Step 1: Test Your Login

**Option A: Use the Test Login Page**
```bash
npm run dev
```
Then open: `http://localhost:5173/TEST_LOGIN.html`

This diagnostic tool will show you exactly what's failing.

---

### Step 2: Common Issues & Solutions

#### ❌ Issue: "Invalid login credentials"

**Cause:** Wrong password or email

**Solution 1 - Reset via Email:**
1. Open: `http://localhost:5173/RESET_PASSWORD.html`
2. Enter new password
3. Check email for reset link

**Solution 2 - Update Password Directly:**
```bash
node UPDATE_ADMIN_PASSWORD.js
```
This will prompt you for current and new password.

**Solution 3 - Use Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project: `qdcykazqmowkmkhykepb`
3. Go to **Authentication** > **Users**
4. Find `jeflowers@gmail.com`
5. Click the three dots ⋮ > **Reset Password**

---

#### ❌ Issue: "User not found in database"

**Cause:** Auth user exists but not in `users` table

**Solution:** The user exists in both tables, so this shouldn't be the issue. But if it happens:

```sql
-- Run this in Supabase SQL Editor
SELECT * FROM auth.users WHERE email = 'jeflowers@gmail.com';
SELECT * FROM public.users WHERE email = 'jeflowers@gmail.com';
```

If auth user exists but public user doesn't, run:
```sql
INSERT INTO public.users (id, email, password, name, role)
SELECT
    id,
    email,
    'SUPABASE_MANAGED' as password,
    'Admin' as name,
    'admin' as role
FROM auth.users
WHERE email = 'jeflowers@gmail.com';
```

---

#### ❌ Issue: "No active session"

**Cause:** Session expired or cleared

**Solution:** Just login again. Sessions last 24 hours by default.

---

#### ❌ Issue: "Insufficient permissions"

**Cause:** User role is not 'admin', 'editor', or 'viewer'

**Solution:** Check and update role:
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'jeflowers@gmail.com';
```

---

#### ❌ Issue: "Email not confirmed"

**Cause:** Email confirmation required but not completed

**Solution 1 - Disable Email Confirmation:**
1. Go to Supabase Dashboard
2. **Authentication** > **Settings**
3. Find **Email Confirmation** setting
4. Disable it for development

**Solution 2 - Confirm Email Manually:**
```sql
-- Run in Supabase SQL Editor
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'jeflowers@gmail.com';
```

---

### Step 3: Check Environment Variables

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://qdcykazqmowkmkhykepb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3lrYXpxbW93a21raHlrZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjQwNzEsImV4cCI6MjA3NTQ0MDA3MX0.lDeWRNri-hPV6JMH2tRiwvYrN64hOKYuGUhre6rQeaA
```

**After changing .env:**
```bash
# Stop the dev server (Ctrl+C)
# Restart it
npm run dev
```

---

### Step 4: Browser Console Check

1. Open the login page: `http://localhost:5173/admin/login`
2. Open browser console (F12)
3. Try to login
4. Look for error messages in the console

Common console errors:
- **CORS errors**: Environment variables not loaded
- **Network errors**: Supabase connection issue
- **404 errors**: Incorrect Supabase URL

---

### Step 5: Test Database Connection

Run this in your browser console:
```javascript
// Test Supabase connection
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'https://qdcykazqmowkmkhykepb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3lrYXpxbW93a21raHlrZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjQwNzEsImV4cCI6MjA3NTQ0MDA3MX0.lDeWRNri-hPV6JMH2tRiwvYrN64hOKYuGUhre6rQeaA'
);

// Test query
const { data, error } = await supabase.from('users').select('email, role').limit(1);
console.log('Data:', data);
console.log('Error:', error);
```

---

## 🔧 Quick Fixes

### Create New Admin User

If you want to create a fresh admin user:

```bash
npm run dev
```

Then in browser console:
```javascript
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Create new admin
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'newadmin@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      name: 'New Admin',
      role: 'admin'
    }
  }
});

if (authError) {
  console.error('Auth error:', authError);
} else {
  // Add to users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: 'newadmin@example.com',
      password: 'SUPABASE_MANAGED',
      name: 'New Admin',
      role: 'admin'
    });

  if (userError) {
    console.error('User error:', userError);
  } else {
    console.log('✅ New admin created!');
  }
}
```

---

## 📞 Still Having Issues?

### Diagnostic Checklist:

- [ ] Ran `TEST_LOGIN.html` to identify the exact error
- [ ] Checked browser console for errors
- [ ] Verified environment variables in `.env`
- [ ] Restarted dev server after `.env` changes
- [ ] Tested database connection
- [ ] Checked RLS policies are enabled
- [ ] Verified user exists in both `auth.users` and `public.users`
- [ ] Email is confirmed in `auth.users`
- [ ] User role is set correctly

### Get More Help:

1. **Check Supabase Dashboard Logs:**
   - Go to your project dashboard
   - **Logs** section
   - Filter by authentication events

2. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to **Network** tab
   - Try to login
   - Look for failed requests to Supabase

3. **Check Auth Settings:**
   - Supabase Dashboard > **Authentication** > **Settings**
   - Verify email confirmation is disabled for development

---

## ✅ Success Checklist

Once login works, you should see:
- ✅ Redirect to `/admin` dashboard
- ✅ User name displayed in header
- ✅ Access to all admin features
- ✅ No console errors

---

**Last Updated:** October 11, 2025
**Admin Email:** jeflowers@gmail.com
**Supabase Project:** qdcykazqmowkmkhykepb
