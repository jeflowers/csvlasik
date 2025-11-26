# How to Create a Superadmin User

I've created helper functions in your Supabase database to make it easy to create superadmin users.

## Method 1: Assign Superadmin Role to Existing User

If you want to upgrade an existing user to superadmin, run this in your Supabase SQL Editor:

```sql
-- Upgrade existing user to superadmin
SELECT assign_superadmin_role('admin@csvlasik.com');
```

Or for the other user:
```sql
SELECT assign_superadmin_role('jeflowers@gmail.com');
```

## Method 2: Create New Superadmin User

### Step 1: Create user in Supabase Dashboard
1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **"Add User"**
3. Enter:
   - Email: `superadmin@clearsight.com` (or your preferred email)
   - Password: Your secure password
4. Check **"Auto Confirm User"**
5. Click **"Create User"**

### Step 2: Assign Superadmin Role
Run this in SQL Editor (replace email with the one you created):

```sql
SELECT assign_superadmin_role('superadmin@clearsight.com');
```

## Method 3: Create Everything in One Step (Advanced)

Try this function to create everything at once (may require service_role permissions):

```sql
SELECT create_superadmin_user(
  'superadmin@clearsight.com',  -- Email
  'YourSecurePassword123!',      -- Password
  'Super Administrator'          -- Full Name
);
```

**Note:** If this fails with permissions error, use Method 2 instead.

## Verify Superadmin Was Created

Run this to verify:

```sql
-- Check user and role assignment
SELECT
  u.email,
  u.name,
  u.role,
  u.is_active,
  r.name as role_name,
  r.level as role_level,
  ur.granted_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@clearsight.com'  -- Replace with your email
ORDER BY r.level DESC;
```

## Current Users in System

Your existing users:
- `admin@csvlasik.com` - Admin User (currently: admin role)
- `jeflowers@gmail.com` - Super Admin (currently: admin role)

You can upgrade either of these to superadmin using Method 1.

## What Superadmin Can Do

Superadmin role has:
- Level: 100 (highest privilege)
- Full system access
- Can manage all users including other admins
- Can access all system settings
- Complete control over content, media, and compliance features

## Security Notes

1. Use a strong password (at least 12 characters, mix of letters, numbers, symbols)
2. Enable MFA after first login
3. Keep superadmin credentials secure
4. Don't share superadmin access
5. Delete this guide file after creating your superadmin
