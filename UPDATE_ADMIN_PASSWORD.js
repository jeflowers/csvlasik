/**
 * Direct Admin Password Update Script
 * Run this with: node UPDATE_ADMIN_PASSWORD.js
 *
 * This bypasses email confirmation and directly updates the password
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const SUPABASE_URL = 'https://qdcykazqmowkmkhykepb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3lrYXpxbW93a21raHlrZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjQwNzEsImV4cCI6MjA3NTQ0MDA3MX0.lDeWRNri-hPV6JMH2tRiwvYrN64hOKYuGUhre6rQeaA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔐 Admin Password Update Tool\n');
  console.log('⚠️  This will update the password for: jeflowers@gmail.com\n');

  const currentPassword = await question('Enter CURRENT password: ');
  const newPassword = await question('Enter NEW password (min 6 chars): ');
  const confirmPassword = await question('Confirm NEW password: ');

  if (newPassword !== confirmPassword) {
    console.error('❌ Passwords do not match!');
    rl.close();
    return;
  }

  if (newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters!');
    rl.close();
    return;
  }

  console.log('\n⏳ Logging in with current password...');

  // Login with current password
  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'jeflowers@gmail.com',
    password: currentPassword
  });

  if (loginError) {
    console.error('❌ Login failed:', loginError.message);
    console.log('\n💡 If you forgot your password, use the Supabase dashboard to reset it:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to Authentication > Users');
    console.log('   4. Find jeflowers@gmail.com and click "Reset Password"');
    rl.close();
    return;
  }

  console.log('✅ Login successful!');
  console.log('⏳ Updating password...');

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    console.error('❌ Password update failed:', updateError.message);
    rl.close();
    return;
  }

  console.log('✅ Password updated successfully!');
  console.log('\n🎉 You can now login with:');
  console.log('   Email: jeflowers@gmail.com');
  console.log('   Password: [your new password]');
  console.log('\n📍 Login at: http://localhost:5173/admin/login');

  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
});
