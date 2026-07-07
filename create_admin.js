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

async function createAdmin() {
  const email = 'firstframecreators@gmail.com';
  const password = 'password123';

  console.log(`Creating admin user: ${email}...`);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  let userId = authData?.user?.id;

  if (authError) {
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
       console.log('User already exists in auth.users, looking up ID...');
       const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
       if (usersError) {
           console.error("Error listing users:", usersError);
           return;
       }
       const existingUser = usersData.users.find(u => u.email === email);
       if (existingUser) {
           userId = existingUser.id;
       } else {
           console.error("Could not find user after creation error.");
           return;
       }
    } else {
       console.error("Error creating user in auth:", authError.message);
       return;
    }
  }

  const { error: dbError } = await supabase
    .from('admins')
    .upsert({
      id: userId,
      email: email,
      name: 'Super Admin'
    });

  if (dbError) {
    console.error("Error adding to admins table:", dbError.message);
  } else {
    console.log(`\n✅ Successfully created Admin User!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\nPlease make sure your Next.js development server is running (npm run dev) so the login page can "fetch" from the API.`);
  }
}

createAdmin();
