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
  const { data, error } = await supabase.from('access_codes').select('id').limit(1);
  if (error) {
    console.log("Error querying access_codes:", error);
    
    // Try to force schema cache reload
    const { error: rpcError } = await supabase.rpc('reload_schema_cache', {});
    if (rpcError) console.log("Note: Could not force reload schema cache (normal).");
  } else {
    console.log("Table exists! Rows found or empty:", data);
  }
}

checkSchema();
