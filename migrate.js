const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnshcacvlqpxqtbxzzsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2hjYWN2bHFweHF0Ynh6enNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQzODc2MCwiZXhwIjoyMDk1MDE0NzYwfQ.L9WH-qfc2DY9fJHD0jgXquFTmfEo32OR8Ztcpn5Aj38';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error } = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE creators ADD COLUMN IF NOT EXISTS default_address TEXT; NOTIFY pgrst, 'reload schema';"
  });
  console.log('Migration:', error ? error.message : 'Success');
}

run();
