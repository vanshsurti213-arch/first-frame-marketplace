const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function parseEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      env[key] = val;
    }
  });
  return env;
}

const env = parseEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'campaigns' });
  if (error) {
    // try querying pg_attribute directly or just rely on a dummy insert to see the exact error
    const { error: insertError } = await supabase.from('campaigns').insert({ name: 'Test', brand_name: 'Test' });
    console.log("Insert Error:", insertError);
  } else {
    console.log(data);
  }
}

checkSchema();
