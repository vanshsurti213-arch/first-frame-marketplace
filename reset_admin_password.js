const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function parseEnv() {
  try {
    const content = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    });
    return env;
  } catch (e) {
    console.error('Could not read .env.local file');
    return {};
  }
}

const env = parseEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  const email = 'admin@firstframe.in';
  const newPassword = 'password123';

  console.log(`Looking up user: ${email}...`);

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
      console.error("Error listing users:", usersError);
      return;
  }
  
  const existingUser = usersData.users.find(u => u.email === email);
  if (!existingUser) {
      console.error("User not found!");
      return;
  }

  console.log(`Found user ${existingUser.id}, updating password...`);

  const { data, error } = await supabase.auth.admin.updateUserById(
    existingUser.id,
    { password: newPassword, email_confirm: true }
  );

  if (error) {
    console.error("Failed to update password:", error);
  } else {
    console.log("✅ Password successfully reset to:", newPassword);
  }
}

resetPassword();
