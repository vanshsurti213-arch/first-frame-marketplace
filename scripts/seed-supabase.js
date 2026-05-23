// scripts/seed-supabase.js
// Run with: node scripts/seed-supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('--- Seeding Firstframe V1 DB ---');

  // 1. Create a dummy admin auth user + profile
  const adminEmail = 'admin@firstframe.in';
  let adminId;
  
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'password123',
      email_confirm: true,
    });
    
    if (authError && authError.code !== 'email_exists' && !authError.message.includes('already been registered')) {
      throw authError;
    }
    
    if (authData?.user) {
      adminId = authData.user.id;
      
      const { error: profileError } = await supabase.from('admins').upsert({
        auth_id: adminId,
        email: adminEmail,
        name: 'Super Admin',
      }, { onConflict: 'auth_id' });
      
      if (profileError) throw profileError;
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('⚠️ Admin user might already exist. Trying to fetch...');
      const { data: existingAdmin } = await supabase.from('admins').select('auth_id').eq('email', adminEmail).single();
      if (existingAdmin) {
        adminId = existingAdmin.auth_id;
        console.log('✅ Found existing admin:', adminId);
      }
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }

  console.log('\nSeed script complete. You can now login with:');
  console.log('Email:', adminEmail);
  console.log('Password: password123');
}

seed();
