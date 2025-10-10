// Admin User Creation Script for Browser Console
// Copy and paste this ENTIRE script into your browser console at http://localhost:5173

async function createAdmin() {
  console.log('Starting admin user creation...');

  const email = prompt('Enter admin email:');
  if (!email) {
    alert('Email is required!');
    return;
  }

  const password = prompt('Enter admin password (minimum 6 characters):');
  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters!');
    return;
  }

  const name = prompt('Enter admin full name:');
  if (!name) {
    alert('Name is required!');
    return;
  }

  console.log('Email:', email);
  console.log('Name:', name);
  console.log('Creating admin user...');

  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Step 1: Creating authentication user...');
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

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create authentication user');

    console.log('Auth user created with ID:', authData.user.id);

    console.log('Step 2: Creating database user record...');
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
      throw new Error('Failed to create database user: ' + dbError.message);
    }

    console.log('Database user record created');
    console.log('SUCCESS! Admin user created!');
    console.log('Email:', email);
    console.log('Role: admin');
    console.log('Next: Go to http://localhost:5173/admin/login');

    alert('Admin user created successfully!\n\nEmail: ' + email + '\nRole: admin\n\nYou can now log in at:\nhttp://localhost:5173/admin/login');

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', error);
    alert('Error creating admin user:\n\n' + error.message + '\n\nCheck the console for more details.');
  }
}

createAdmin();
