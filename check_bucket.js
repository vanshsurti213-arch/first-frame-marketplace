const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function parseEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"')) val = val.slice(1, -1);
      env[key] = val;
    }
  });
  return env;
}

const env = parseEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.storage.getBucket('creator-videos');
  if (error) {
    console.error(error);
  } else {
    console.log('Bucket details:', data);
  }
}

check();
