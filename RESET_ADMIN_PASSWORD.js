/**
 * Reset Admin Password Script
 *
 * This script resets the admin user password in Supabase
 * Usage: node RESET_ADMIN_PASSWORD.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qdcykazqmowkmkhykepb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || prompt('Enter Supabase Service Role Key:');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  const EMAIL = 'jeflowers@gmail.com';
  const NEW_PASSWORD = 'Admin123!'; // Change this to your desired password

  console.log(`\n🔐 Resetting password for: ${EMAIL}`);
  console.log(`📧 New password will be: ${NEW_PASSWORD}`);
  console.log('\n⏳ Processing...\n');

  try {
    // Update the user's password using Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      '0bc8b284-7148-40ca-8578-e3a9003aefc2',
      { password: NEW_PASSWORD }
    );

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Password reset successful!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log('\n🌐 You can now log in at: /admin/login\n');

  } catch (err) {
    console.error('❌ Exception:', err.message);
    process.exit(1);
  }
}

resetPassword();
