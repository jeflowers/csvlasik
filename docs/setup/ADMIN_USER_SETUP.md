# Admin User Setup - Step-by-Step Guide

Complete instructions for creating your first admin user in the ClearSight LASIK CMS.

---

## Prerequisites

Before you begin, ensure you have:
- ✅ Supabase project created
- ✅ Environment variables configured in `.env` file
- ✅ Database migrations applied (tables created)
- ✅ Application running locally

---

## Method 1: Browser Console Method (Easiest)

This is the **recommended method** for first-time setup.

### Step 1: Start the Development Server

Open a terminal and run:

```bash
npm run dev
```

Wait until you see: `Local: http://localhost:5173/`

### Step 2: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Step 3: Open Browser Console

Press one of these key combinations:
- **Windows/Linux**: `F12` or `Ctrl + Shift + J`
- **Mac**: `Cmd + Option + J`

Or right-click anywhere → **Inspect** → **Console** tab

### Step 4: Copy and Paste This Code

Copy the ENTIRE code block below and paste it into the console:

```javascript
async function createAdmin() {
  console.log('🚀 Starting admin user creation...\n');

  // Get admin details
  const email = prompt('Enter admin email:');
  if (!email) {
    alert('❌ Email is required!');
    return;
  }

  const password = prompt('Enter admin password (minimum 6 characters):');
  if (!password || password.length < 6) {
    alert('❌ Password must be at least 6 characters!');
    return;
  }

  const name = prompt('Enter admin full name:');
  if (!name) {
    alert('❌ Name is required!');
    return;
  }

  console.log('📧 Email:', email);
  console.log('👤 Name:', name);
  console.log('\n⏳ Creating admin user...');

  try {
    // Import Supabase
    const { createClient } = await import('@supabase/supabase-js');

    // Get environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Create auth user
    console.log('1️⃣ Creating authentication user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'admin'
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create authentication user');

    console.log('✅ Auth user created with ID:', authData.user.id);

    // Step 2: Create database user record
    console.log('2️⃣ Creating database user record...');
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        password: 'SUPABASE_MANAGED',
        name: name,
        role: 'admin'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to create database user: ${dbError.message}`);
    }

    console.log('✅ Database user record created');

    // Success!
    console.log('\n🎉 SUCCESS! Admin user created!\n');
    console.log('📋 Your admin credentials:');
    console.log('   Email:', email);
    console.log('   Role: admin');
    console.log('\n🔐 Next steps:');
    console.log('   1. Go to: http://localhost:5173/admin/login');
    console.log('   2. Log in with your email and password');
    console.log('   3. Start managing your content!\n');

    alert(`✅ Admin user created successfully!\n\nEmail: ${email}\nRole: admin\n\nYou can now log in at:\nhttp://localhost:5173/admin/login`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    alert(`❌ Error creating admin user:\n\n${error.message}\n\nCheck the console for more details.`);
  }
}

// Run the function
createAdmin();
```

### Step 5: Follow the Prompts

The console will prompt you to enter:

1. **Admin Email**: Enter your email address (e.g., `admin@clearsight.com`)
2. **Password**: Enter a secure password (minimum 6 characters)
3. **Full Name**: Enter your full name (e.g., `John Admin`)

### Step 6: Wait for Confirmation

You'll see console messages showing progress:
```
🚀 Starting admin user creation...
📧 Email: admin@clearsight.com
👤 Name: John Admin
⏳ Creating admin user...
1️⃣ Creating authentication user...
✅ Auth user created with ID: [uuid]
2️⃣ Creating database user record...
✅ Database user record created
🎉 SUCCESS! Admin user created!
```

### Step 7: Log In

1. Navigate to: `http://localhost:5173/admin/login`
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to the admin dashboard

✅ **You're done!**

---

## Method 2: Using Supabase Dashboard

If the browser console method doesn't work, use this method.

### Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your ClearSight project

### Step 2: Create Auth User

1. Click **Authentication** in the left sidebar
2. Click **Users** tab
3. Click **Add User** button
4. Fill in the form:
   - **Email**: `admin@clearsight.com`
   - **Password**: Your secure password
   - **Auto Confirm User**: ✅ **CHECK THIS BOX**
5. Click **Create User**
6. **IMPORTANT**: Copy the UUID that appears in the ID column

### Step 3: Create Database User Record

1. Click **Table Editor** in the left sidebar
2. Find and click the **users** table
3. Click **Insert** → **Insert row**
4. Fill in the row:
   - **id**: Paste the UUID you copied (must match auth user ID)
   - **email**: `admin@clearsight.com` (must match auth email)
   - **password**: `SUPABASE_MANAGED` (exactly as shown)
   - **name**: `Admin User` (your full name)
   - **role**: `admin` (exactly as shown, lowercase)
   - **created_at**: Leave as default (or current timestamp)
5. Click **Save**

### Step 4: Verify User Creation

1. Go to **Table Editor** → **users**
2. Find your user in the list
3. Verify these fields:
   - ✅ email matches
   - ✅ role is `admin`
   - ✅ name is filled in

### Step 5: Log In

1. Open browser to: `http://localhost:5173/admin/login`
2. Enter your email and password
3. Click "Sign In"
4. You should see the admin dashboard

✅ **You're done!**

---

## Method 3: Using SQL Editor (Advanced)

For users comfortable with SQL.

### Step 1: Create Auth User via Dashboard

First, you **must** create the authentication user via the Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email, password, and check **Auto Confirm User**
4. Click **Create User**
5. **Copy the user's UUID** from the ID column

### Step 2: Run SQL Script

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Paste this SQL (replace the values):

```sql
-- Insert admin user into users table
INSERT INTO public.users (
  id,
  email,
  password,
  name,
  role,
  created_at
)
VALUES (
  'PASTE_AUTH_USER_UUID_HERE',  -- Replace with UUID from auth.users
  'admin@clearsight.com',        -- Replace with your email
  'SUPABASE_MANAGED',            -- Do not change this value
  'Admin User',                   -- Replace with your full name
  'admin',                        -- Do not change this value
  NOW()
);

-- Verify the user was created
SELECT id, email, name, role, created_at
FROM public.users
WHERE role = 'admin';
```

4. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify and Log In

Check the query results to confirm the user was created, then log in at:
```
http://localhost:5173/admin/login
```

✅ **You're done!**

---

## Verification Checklist

After creating your admin user, verify these steps:

- [ ] User exists in **auth.users** table (Supabase Auth)
- [ ] User exists in **public.users** table
- [ ] Both records have the **same UUID** (id field)
- [ ] Email matches in both tables
- [ ] Role is set to `'admin'` in public.users
- [ ] Password in public.users is `'SUPABASE_MANAGED'`
- [ ] You can access: `http://localhost:5173/admin/login`
- [ ] Login redirects you to: `http://localhost:5173/admin`
- [ ] Admin sidebar shows all menu items

---

## Common Issues & Solutions

### ❌ "User not found in database"

**Problem**: User exists in auth but not in public.users table

**Solution**:
1. Go to Supabase Dashboard → Table Editor → users
2. Manually insert the user record (see Method 2, Step 3)
3. Make sure the UUID matches the auth user

### ❌ "Invalid login credentials"

**Problem**: Email or password is incorrect

**Solution**:
1. Double-check the email address (case-sensitive)
2. Try resetting the password in Supabase Dashboard:
   - Authentication → Users → [your user] → Reset Password
3. Make sure email is confirmed in auth.users

### ❌ "Insufficient permissions"

**Problem**: User role is not 'admin' or not set

**Solution**:
1. Go to Table Editor → users → find your user
2. Click edit and set role to `admin` (lowercase)
3. Save and try logging in again

### ❌ "Failed to create user" in console

**Problem**: Supabase connection issue

**Solution**:
1. Check `.env` file has correct values:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
2. Restart the dev server: `npm run dev`
3. Verify Supabase project is active in dashboard

### ❌ Environment variables not found

**Problem**: `.env` file not loaded

**Solution**:
1. Make sure `.env` file exists in project root
2. Restart the development server
3. Check file has correct format (no quotes around values)

### ❌ Database table doesn't exist

**Problem**: Migrations not applied

**Solution**:
1. Check if migrations were run
2. Go to Supabase Dashboard → SQL Editor
3. Verify these tables exist:
   - users
   - articles
   - testimonials
   - media
   - statistics

---

## Security Best Practices

### Password Requirements

- ✅ Minimum 12 characters (production)
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ Unique password (not reused elsewhere)
- ❌ Avoid common words or patterns

### Account Security

- 🔒 Never commit credentials to Git
- 🔒 Use environment variables for sensitive data
- 🔒 Enable 2FA in production (future enhancement)
- 🔒 Regularly rotate admin passwords
- 🔒 Limit admin accounts to necessary personnel only

### Production Considerations

When deploying to production:

1. **Change all default credentials**
2. **Use strong passwords** (12+ characters)
3. **Enable email confirmation** in Supabase Auth settings
4. **Set up password reset flow**
5. **Enable 2FA** (when implemented)
6. **Audit admin access regularly**
7. **Set up activity logging**

---

## Next Steps

After successfully creating your admin user:

### 1. Configure Your Profile
- Log in to the admin panel
- Go to Settings → Profile
- Update your profile information
- Upload a profile photo (optional)

### 2. Create Additional Users
- Navigate to Users section
- Add editors, contributors, or viewers as needed
- Assign appropriate roles

### 3. Configure Site Settings
- Go to Settings → General
- Update site metadata
- Configure default languages
- Set up email notifications (future feature)

### 4. Start Managing Content
- **Articles**: Create educational content
- **Testimonials**: Moderate patient reviews
- **Media**: Upload images and videos
- **Statistics**: Update procedure counts

---

## Testing Your Setup

Run these tests to ensure everything works:

### ✅ Test 1: Login
```
1. Go to http://localhost:5173/admin/login
2. Enter your credentials
3. Should redirect to /admin dashboard
```

### ✅ Test 2: Access Control
```
1. Open a private/incognito window
2. Try to access http://localhost:5173/admin
3. Should redirect to /admin/login
```

### ✅ Test 3: Profile Display
```
1. Log in to admin panel
2. Check top-right corner shows your name
3. Verify admin badge is visible
```

### ✅ Test 4: Permissions
```
1. Navigate through all admin sections:
   - Dashboard
   - Testimonials
   - Articles
   - Media Library
   - Statistics
   - Users
   - Settings
   - Translations
2. All sections should be accessible
```

---

## Getting Help

If you're still experiencing issues:

1. **Check Browser Console**
   - Press F12 → Console tab
   - Look for error messages
   - Copy any error messages

2. **Check Supabase Logs**
   - Go to Supabase Dashboard
   - Click Settings → Logs
   - Look for authentication errors

3. **Verify Database**
   - Table Editor → users
   - Confirm your user exists
   - Check all fields are correct

4. **Review Documentation**
   - See `docs/SECURITY.md` for security info
   - See `README.md` for general setup
   - See `TROUBLESHOOTING.md` for common issues

---

## Summary

You've learned three methods to create an admin user:

1. ✅ **Browser Console** (Easiest) - Copy/paste script
2. ✅ **Supabase Dashboard** (Manual) - Click through UI
3. ✅ **SQL Editor** (Advanced) - Run SQL commands

Choose the method that works best for you. The browser console method is recommended for most users.

**Admin Panel URL**: `http://localhost:5173/admin/login`

🎉 **Welcome to the ClearSight LASIK CMS!**
