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

async function checkData() {
  const { data: brands } = await supabase.from('brands').select('*');
  console.log("BRANDS:", JSON.stringify(brands, null, 2));

  const { data: campaigns } = await supabase.from('campaigns').select('*');
  console.log("CAMPAIGNS:", JSON.stringify(campaigns, null, 2));
}

checkData();
