# Admin User Setup Guide

This guide will help you create your first admin user for the ClearSight CMS.

## Prerequisites

- Supabase project is set up (check `.env` file for credentials)
- Application is running locally (`npm run dev`)

## Option 1: Using the Browser Console (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to: `http://localhost:5173`

3. **Open the browser console** (F12 or Right-click → Inspect → Console)

4. **Run the following code in the console:**

   ```javascript
   // Create admin user function
   async function createAdmin() {
     const email = prompt('Enter admin email:');
     const password = prompt('Enter admin password (min 6 chars):');
     const name = prompt('Enter admin full name:');

     if (!email || !password || !name) {
       alert('All fields are required!');
       return;
     }

     if (password.length < 6) {
       alert('Password must be at least 6 characters!');
       return;
     }

     console.log('Creating admin user...');

     try {
       // Import Supabase client
       const { createClient } = await import('@supabase/supabase-js');

       const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
       const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
       const supabase = createClient(supabaseUrl, supabaseKey);

       // Create auth user
       const { data: authData, error: authError } = await supabase.auth.signUp({
         email,
         password,
         options: {
           data: { name, role: 'admin' }
         }
       });

       if (authError) throw authError;
       if (!authData.user) throw new Error('Failed to create user');

       // Create database user
       const { error: dbError } = await supabase
         .from('users')
         .insert({
           id: authData.user.id,
           email,
           password: 'SUPABASE_MANAGED',
           name,
           role: 'admin'
         });

       if (dbError) throw dbError;

       console.log('✅ Admin user created successfully!');
       console.log('Email:', email);
       console.log('Role: admin');
       alert(`Admin user created! You can now log in at /admin/login with:\nEmail: ${email}`);

     } catch (error) {
       console.error('❌ Error:', error.message);
       alert(`Error: ${error.message}`);
     }
   }

   // Run the function
   createAdmin();
   ```

5. **Follow the prompts** to enter your admin details

6. **Navigate to the admin login:** `http://localhost:5173/admin/login`

7. **Log in** with your newly created credentials

## Option 2: Using Supabase Dashboard

1. Go to your [Supabase Dashboard](https://app.supabase.com)

2. Navigate to: **Authentication → Users**

3. Click **Add User** and enter:
   - Email: your-admin@email.com
   - Password: (secure password)
   - Auto Confirm User: ✓ (checked)

4. After user is created, go to **Table Editor → users**

5. Click **Insert Row** and add:
   - `id`: (copy the UUID from the auth.users table)
   - `email`: same email as auth user
   - `password`: `SUPABASE_MANAGED`
   - `name`: Your Full Name
   - `role`: `admin`

6. **Log in** at `http://localhost:5173/admin/login`

## Option 3: Using SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)

2. Navigate to: **SQL Editor**

3. Run this SQL (replace the values):

   ```sql
   -- First, create the auth user via the dashboard or use this helper
   -- Note: You need to create the auth user first via the dashboard
   -- Then insert into public.users table:

   INSERT INTO public.users (id, email, password, name, role)
   VALUES (
     'REPLACE_WITH_AUTH_USER_UUID',
     'admin@clearsight.com',
     'SUPABASE_MANAGED',
     'Admin User',
     'admin'
   );
   ```

## Verify Setup

1. Navigate to: `http://localhost:5173/admin/login`

2. Enter your credentials

3. You should be redirected to the admin dashboard

## Default Admin Credentials (Development Only)

For development/testing purposes, you can use these credentials if you've already created them:

- **Email:** admin@clearsight.com
- **Password:** (the one you set)

## Troubleshooting

### "User not found in database"
- Make sure you created the user in both `auth.users` AND `public.users` tables
- Check that the UUID matches in both tables

### "Insufficient permissions"
- Verify the user's role in `public.users` is set to `'admin'`

### "Invalid login credentials"
- Verify email/password are correct
- Make sure email is confirmed in Supabase Auth dashboard

### "Failed to create user"
- Check Supabase connection in `.env` file
- Verify Supabase project is active
- Check browser console for detailed error messages

## Security Notes

- **Never commit** admin credentials to version control
- **Use strong passwords** (minimum 12 characters recommended)
- **Enable 2FA** in production (when implementing auth enhancements)
- **Regularly rotate** admin passwords
- **Limit admin accounts** to only necessary personnel

## Next Steps

After creating your admin user:

1. ✅ Log in to the admin panel
2. ✅ Update your profile information
3. ✅ Create additional users (editors/viewers) as needed
4. ✅ Configure site settings
5. ✅ Start managing content!

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Supabase credentials in `.env`
3. Check Supabase Dashboard for auth/database status
4. Review this guide for common solutions
