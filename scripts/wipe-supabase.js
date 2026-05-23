const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  console.log('--- Wiping Firstframe V1 Test Data ---');
  
  // We wipe these tables but leave 'creators' and 'admins' alone so the pool is still available.
  const tables = [
    'activity_log',
    'content_submissions',
    'creator_preferences',
    'products',
    'campaign_creators',
    'access_codes',
    'brands',
    'campaigns',
    'creator_tokens'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`Error wiping ${table}:`, error.message);
    } else {
      console.log(`✅ Wiped table: ${table}`);
    }
  }

  console.log('\nWipe complete. You can now test fresh.');
}

wipe();
