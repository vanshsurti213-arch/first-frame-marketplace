const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnshcacvlqpxqtbxzzsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2hjYWN2bHFweHF0Ynh6enNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQzODc2MCwiZXhwIjoyMDk1MDE0NzYwfQ.L9WH-qfc2DY9fJHD0jgXquFTmfEo32OR8Ztcpn5Aj38';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Querying triggers in the database...");
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        trigger_name, 
        event_object_table, 
        action_statement, 
        action_timing
      FROM information_schema.triggers;
    `
  });
  if (error) {
    console.error("SELECT error:", error);
  } else {
    console.log("Triggers:", JSON.stringify(data, null, 2));
  }
}

test();
