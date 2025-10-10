// SIMPLE Admin User Creation Script
//
// BEFORE RUNNING: Open your .env file and have these values ready:
// - VITE_SUPABASE_URL
// - VITE_SUPABASE_ANON_KEY
//
// INSTRUCTIONS:
// 1. Copy this ENTIRE file
// 2. Open http://localhost:5173 in your browser
// 3. Press F12 to open console
// 4. Paste this code and press Enter
// 5. Follow the prompts

async function createAdmin() {
  console.log('='.repeat(60));
  console.log('ADMIN USER CREATION');
  console.log('='.repeat(60));

  // Step 1: Get user details
  const email = prompt('Step 1/5: Enter admin email address:');
  if (!email) {
    alert('Email is required!');
    return;
  }

  const password = prompt('Step 2/5: Enter admin password (minimum 6 characters):');
  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters!');
    return;
  }

  const name = prompt('Step 3/5: Enter admin full name:');
  if (!name) {
    alert('Name is required!');
    return;
  }

  console.log('User Details:');
  console.log('  Email:', email);
  console.log('  Name:', name);
  console.log('');

  // Step 2: Get Supabase credentials
  console.log('Now we need your Supabase credentials from the .env file');
  console.log('Open your .env file and copy the values');
  console.log('');

  const supabaseUrl = prompt('Step 4/5: Paste your VITE_SUPABASE_URL here:');
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    alert('Invalid Supabase URL. It should start with https://');
    return;
  }

  const supabaseKey = prompt('Step 5/5: Paste your VITE_SUPABASE_ANON_KEY here:');
  if (!supabaseKey || supabaseKey.length < 20) {
    alert('Invalid Supabase Anon Key. It should be a long string starting with "eyJ"');
    return;
  }

  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseKey.substring(0, 20) + '...');
  console.log('');

  try {
    console.log('[1/3] Loading Supabase client library...');
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

    console.log('[2/3] Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[3/3] Creating admin user...');
    console.log('');

    // Create auth user
    console.log('  > Creating authentication user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          role: 'admin'
        }
      }
    });

    if (authError) {
      throw new Error('Auth error: ' + authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create authentication user - no user data returned');
    }

    console.log('  ✓ Authentication user created');
    console.log('    User ID:', authData.user.id);
    console.log('');

    // Create database user
    console.log('  > Creating database user record...');
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
      console.error('  ✗ Database error:', dbError);
      throw new Error('Database error: ' + dbError.message);
    }

    console.log('  ✓ Database user record created');
    console.log('');
    console.log('='.repeat(60));
    console.log('SUCCESS! Admin user created successfully!');
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
      'Admin user created successfully!\n\n' +
      'Email: ' + email + '\n' +
      'Role: admin\n\n' +
      'Go to: http://localhost:5173/admin/login\n' +
      'and log in with your credentials.'
    );

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('ERROR!');
    console.log('='.repeat(60));
    console.error('Error:', error.message);
    console.error('');
    console.error('Full error details:', error);
    console.log('');
    console.log('Common solutions:');
    console.log('  1. Check your Supabase URL and Key are correct');
    console.log('  2. Verify your Supabase project is active');
    console.log('  3. Make sure the database tables exist (run migrations)');
    console.log('  4. Check if email already exists (try different email)');
    console.log('');
    console.log('='.repeat(60));

    alert(
      'ERROR!\n\n' +
      error.message + '\n\n' +
      'Check the browser console (F12) for details.\n\n' +
      'Common issues:\n' +
      '- Wrong Supabase credentials\n' +
      '- Email already exists\n' +
      '- Database tables not created\n' +
      '- Supabase project not active'
    );
  }
}

// Start the process
createAdmin();
