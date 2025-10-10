# Quick Admin User Setup

The fastest way to create your first admin user.

---

## Method 1: Using the Script File (Recommended)

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Open Browser Console
1. Go to `http://localhost:5173`
2. Press `F12` (or `Cmd+Option+J` on Mac)
3. Click the **Console** tab

### Step 3: Open the Script File
In your code editor, open:
```
CREATE_ADMIN_USER.js
```

### Step 4: Copy and Paste
1. Select ALL the code in `CREATE_ADMIN_USER.js`
2. Copy it (`Ctrl+C` or `Cmd+C`)
3. Paste it into the browser console (`Ctrl+V` or `Cmd+V`)
4. Press `Enter`

### Step 5: Follow Prompts
The script will ask for:
1. **Email**: `admin@clearsight.com`
2. **Password**: Your secure password (min 6 chars)
3. **Full Name**: `Admin User`

### Step 6: Log In
Go to `http://localhost:5173/admin/login` and log in with your credentials.

✅ Done!

---

## Method 2: Using Supabase Dashboard

### Step 1: Create Auth User
1. Go to https://app.supabase.com
2. Select your project
3. Click **Authentication** → **Users**
4. Click **Add User**
5. Fill in:
   - Email: `admin@clearsight.com`
   - Password: Your password
   - Auto Confirm User: ✅ CHECK THIS
6. Click **Create User**
7. **COPY the UUID** from the ID column

### Step 2: Create Database Record
1. Click **Table Editor** → **users**
2. Click **Insert** → **Insert row**
3. Fill in:
   - **id**: Paste the UUID you copied
   - **email**: `admin@clearsight.com`
   - **password**: `SUPABASE_MANAGED`
   - **name**: `Admin User`
   - **role**: `admin`
4. Click **Save**

### Step 3: Log In
Go to `http://localhost:5173/admin/login` and log in.

✅ Done!

---

## Troubleshooting

### Script Error
If you get an error in the console:
1. Make sure you copied the ENTIRE script
2. Check that the dev server is running
3. Verify you're on `http://localhost:5173`
4. Try refreshing the page and running again

### "User not found in database"
- You created auth user but not database record
- Use Method 2, Step 2 to create the database record
- Make sure the UUIDs match

### "Invalid login credentials"
- Check email spelling (case-sensitive)
- Verify password is correct
- Check that email is confirmed in Supabase Auth

### Environment Variables Missing
- Check `.env` file exists
- Verify it contains:
  ```
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJxxx...
  ```
- Restart dev server: `npm run dev`

---

## After Setup

Once logged in, you can:
- ✅ Access the admin dashboard
- ✅ Manage articles and testimonials
- ✅ Upload media files
- ✅ Update statistics
- ✅ Create additional users
- ✅ Configure settings
- ✅ Manage translations

---

## Security Tips

- Use a strong password (12+ characters)
- Don't share admin credentials
- Create separate accounts for team members
- Use appropriate roles (admin/editor/viewer)
- Regularly update passwords

---

Need more detailed instructions? See `ADMIN_USER_SETUP.md`
