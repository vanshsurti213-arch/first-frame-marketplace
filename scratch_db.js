const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnshcacvlqpxqtbxzzsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2hjYWN2bHFweHF0Ynh6enNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Mzg3NjAsImV4cCI6MjA5NTAxNDc2MH0.NWRwXeMVQPpX5gsYsv8aNzaNC5iDa0W2MWbfF_RUIXs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Checking if vansh code is in DB...");
  const { data, error } = await supabase.from('access_codes')
    .select('*')
    .eq('brand_company_name', 'vansh');
    
  if (error) {
    console.error("Query error:", error);
  } else {
    console.log("Query success:", data);
  }
}

test();
