// Fix Existing User - Add Database Record
// Use this if auth user exists but database record is missing
//
// This script will:
// 1. Get the existing auth user ID
// 2. Create the missing database record
//
// INSTRUCTIONS:
// 1. Open http://localhost:5173
// 2. Press F12 (console)
// 3. Copy and paste this entire script
// 4. Press Enter
// 5. Follow the prompts

async function fixExistingUser() {
  console.log('='.repeat(60));
  console.log('FIX EXISTING USER - Add Database Record');
  console.log('='.repeat(60));
  console.log('');

  // Get user email
  const email = prompt('Enter the email address you used:');
  if (!email) {
    alert('Email is required!');
    return;
  }

  const password = prompt('Enter the password you used:');
  if (!password) {
    alert('Password is required!');
    return;
  }

  const name = prompt('Enter the full name for this user:');
  if (!name) {
    alert('Name is required!');
    return;
  }

  console.log('Email:', email);
  console.log('Name:', name);
  console.log('');

  // Get Supabase credentials
  const supabaseUrl = prompt('Paste your VITE_SUPABASE_URL:');
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    alert('Invalid Supabase URL');
    return;
  }

  const supabaseKey = prompt('Paste your VITE_SUPABASE_ANON_KEY:');
  if (!supabaseKey || supabaseKey.length < 20) {
    alert('Invalid Supabase Key');
    return;
  }

  try {
    console.log('[1/3] Loading Supabase client...');
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[2/3] Logging in to get user ID...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      throw new Error('Login failed: ' + authError.message + '. Check your email and password.');
    }

    if (!authData.user) {
      throw new Error('No user data returned from login');
    }

    const userId = authData.user.id;
    console.log('  Success! User ID:', userId);
    console.log('');

    console.log('[3/3] Creating database record...');

    // Check if record already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingUser) {
      console.log('  Database record already exists!');
      console.log('');
      console.log('='.repeat(60));
      console.log('USER IS ALREADY SET UP CORRECTLY');
      console.log('='.repeat(60));
      console.log('');
      console.log('You can log in at: http://localhost:5173/admin/login');
      console.log('Email:', email);
      console.log('');

      alert('User is already set up correctly!\n\nYou can log in at:\nhttp://localhost:5173/admin/login\n\nEmail: ' + email);

      // Sign out
      await supabase.auth.signOut();
      return;
    }

    // Create database record
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        password: 'SUPABASE_MANAGED',
        name: name,
        role: 'admin'
      });

    if (dbError) {
      console.error('  Database error:', dbError);
      throw new Error('Failed to create database record: ' + dbError.message);
    }

    console.log('  Success! Database record created');
    console.log('');
    console.log('='.repeat(60));
    console.log('SUCCESS! User setup completed!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Login Details:');
    console.log('  Email:', email);
    console.log('  Password: (the password you entered)');
    console.log('  Role: admin');
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Go to: http://localhost:5173/admin/login');
    console.log('  2. Enter your email and password');
    console.log('  3. You will be redirected to the admin dashboard');
    console.log('');
    console.log('='.repeat(60));

    alert(
      'SUCCESS!\n\n' +
      'User setup completed!\n\n' +
      'Email: ' + email + '\n' +
      'Role: admin\n\n' +
      'Go to: http://localhost:5173/admin/login\n' +
      'and log in with your credentials.'
    );

    // Sign out so they can log in fresh
    await supabase.auth.signOut();

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('ERROR!');
    console.log('='.repeat(60));
    console.error('Error:', error.message);
    console.error('');
    console.error('Full error:', error);
    console.log('');
    console.log('What to try:');
    console.log('  1. Verify your email and password are correct');
    console.log('  2. Check Supabase credentials are correct');
    console.log('  3. Go to Supabase Dashboard and manually add user');
    console.log('');
    console.log('='.repeat(60));

    alert(
      'ERROR!\n\n' +
      error.message + '\n\n' +
      'Check console (F12) for details.'
    );
  }
}

// Run the fix
fixExistingUser();
