require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  const email = "admin@firstframe.in";
  const password = "firstframeadmin123!"; // Strong password for the admin account
  const name = "Vansh Surti";

  console.log(`Creating/Verifying admin user: ${email}...`);

  // 1. Create or retrieve user in Supabase Auth
  let { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  let userId;

  if (authError) {
    if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
      console.log("User already exists in auth.users, trying to fetch...");
      // We can't directly fetch user by email easily without listUsers, let's list users
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("Error listing users:", listError.message);
        return;
      }
      const existingUser = usersData.users.find(u => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
        console.log(`Found existing auth user with ID: ${userId}`);
        
        // Update password just in case
        await supabase.auth.admin.updateUserById(userId, { password: password });
        console.log("Updated password for existing admin user.");
      } else {
        console.error("Failed to find existing user.");
        return;
      }
    } else {
      console.error("Failed to create auth user:", authError.message);
      return;
    }
  } else {
    userId = authData.user.id;
    console.log(`Successfully created auth user with ID: ${userId}`);
  }

  // 2. Add user to admins table
  console.log("Adding user to 'admins' table...");
  const { data: existingAdmin } = await supabase.from("admins").select("id").eq("id", userId).single();
  
  if (existingAdmin) {
    console.log("User already exists in admins table.");
  } else {
    const { error: dbError } = await supabase
      .from("admins")
      .insert({
        id: userId,
        email: email,
        name: name,
      });

    if (dbError) {
      console.error("Failed to add user to admins table:", dbError.message);
      return;
    }
    console.log("Successfully added user to admins table.");
  }

  console.log("\n=================================");
  console.log("✅ Admin Setup Complete!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("=================================\n");
}

setupAdmin();
