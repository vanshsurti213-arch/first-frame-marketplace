#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Deletes all test data (campaigns, codes, creators, submissions, logs)
 * Run with: node scripts/cleanup-database.js
 */

const fs = require('fs');
const path = require('path');

async function cleanupDatabase() {
  // Load environment variables
  const envPath = '/vercel/share/.env.project';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }

  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧹 Starting database cleanup...\n');

  try {
    // Delete in order of foreign key dependencies
    const tables = [
      { name: 'activity_log', label: 'Activity Logs' },
      { name: 'content_submissions', label: 'Content Submissions' },
      { name: 'products', label: 'Products' },
      { name: 'campaign_creators', label: 'Campaign Creators' },
      { name: 'campaigns', label: 'Campaigns' },
      { name: 'access_codes', label: 'Access Codes' },
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          console.error(`❌ ${table.label}: ${error.message}`);
        } else {
          console.log(`✓ ${table.label}: Deleted successfully`);
        }
      } catch (err) {
        console.error(`❌ ${table.label}: ${err.message}`);
      }
    }

    console.log('\n✅ Database cleanup completed!');
    console.log('All test data has been removed. Ready for fresh testing.\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupDatabase();
