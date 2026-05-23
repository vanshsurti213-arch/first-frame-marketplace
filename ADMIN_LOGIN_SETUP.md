# Admin Email Login Setup Guide

## Overview

FirstFrame uses **Supabase Email + Password Authentication** for admin access. This is a secure, production-ready authentication system.

## How Admin Email Login Works

### 1. Authentication Flow
- Admin enters email and password on `/admin/login`
- Credentials are verified against Supabase Auth (`auth.users`)
- User ID is cross-checked with the `admins` table for authorization
- Only users in the `admins` table can access admin features

### 2. Database Requirements

#### Required Tables:

**`auth.users`** (Managed by Supabase)
- Built-in Supabase authentication table
- Stores email, password hash, and auth metadata
- Automatically created when you set up Supabase

**`admins`** (Your application table)
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Setting Up Supabase

### Step 1: Create a Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Select your organization and enter project details
4. Wait for the project to be created

### Step 2: Get Your Credentials
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (public API key starting with `eyJ...`)

### Step 3: Set Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Create Admin Users

#### Option A: Via Supabase Dashboard (Easiest)
1. Go to your Supabase project
2. Go to Authentication → Users
3. Click "Invite" or "Create new user"
4. Enter admin email and password
5. Note the User ID (UUID)

#### Option B: Programmatically (Backend)
```typescript
const { createServiceRoleClient } = require('@/lib/supabase/server');

const supabase = createServiceRoleClient();

// Create auth user
const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@firstframe.in',
  password: 'secure-password-here',
  email_confirm: true,
});

if (authError) throw authError;

// Add to admins table
const { error: dbError } = await supabase
  .from('admins')
  .insert({
    id: user.id,
    email: user.email,
    name: 'Admin Name',
  });

if (dbError) throw dbError;
```

## Test Admin Account

Default test credentials (after Supabase setup):
```
Email:    admin@firstframe.in
Password: (set during Supabase user creation)
```

Change the password in the login page before production:
1. Open `/src/app/admin/login/page.tsx`
2. Line 10: Update the email in `useState("admin@firstframe.in")`
3. Or remove the default entirely

## Login Flow (Technical Details)

### Frontend Login (`src/app/admin/login/page.tsx`)
1. User submits email + password
2. Call `supabase.auth.signInWithPassword()`
3. If successful, query `admins` table to verify access
4. Redirect to `/admin/dashboard` if authorized
5. Show error if not an admin

### Backend Verification (`src/app/api/admin/auth/login/route.ts`)
- Validates email/password format
- Authenticates with Supabase Auth
- Checks `admins` table for authorization
- Returns admin record on success

### Session Management (`src/context/AuthContext.tsx`)
- Monitors auth state changes
- Keeps admin session in sync
- Auto-logs out if user removed from `admins` table
- Protects admin routes

## Protecting Admin Routes

All admin pages are automatically protected:
```typescript
// In any admin component
const { admin, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!admin) return <redirect href="/admin/login" />;

return <AdminDashboard />;
```

## Common Issues & Solutions

### Issue: "Supabase credentials missing"
**Solution:** Check that `.env.local` has both environment variables and dev server is restarted

### Issue: "Not authorized. This account is not registered as an admin."
**Solution:** Make sure the user exists in the `admins` table with the correct user ID

### Issue: "Invalid email or password"
**Solution:** Verify credentials match what was set in Supabase dashboard

### Issue: Can't create new admin users
**Solution:** Use the Supabase dashboard or ensure `createServiceRoleClient()` has correct permissions

## Adding More Admin Users

### Method 1: Supabase Dashboard
1. Go to Authentication → Users
2. Click "Invite user"
3. Enter email and set password
4. Copy the User ID
5. Add to `admins` table:
```sql
INSERT INTO admins (id, email, name) VALUES (
  'user-id-here',
  'newadmin@example.com',
  'Admin Name'
);
```

### Method 2: Manual API Call
```bash
curl -X POST http://localhost:3000/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newadmin@example.com","password":"secure-password"}'
```

## Security Best Practices

✅ **DO:**
- Use strong, unique passwords (16+ characters)
- Enable 2FA if available (can be added via Supabase)
- Regularly audit who has admin access
- Rotate passwords periodically
- Never commit `.env.local` to git

❌ **DON'T:**
- Store passwords in comments or code
- Share admin credentials via email/chat
- Use the same password as other services
- Leave default test accounts in production
- Hardcode email/password in components

## Testing Admin Login

```bash
# Start the dev server
npm run dev

# Open http://localhost:3000/admin/login
# Enter test credentials:
# Email: admin@firstframe.in
# Password: (your set password)

# Should redirect to /admin/dashboard
```

## Production Deployment

Before deploying:
1. ✅ Add real Supabase project URL & anon key to Vercel env vars
2. ✅ Create production admin users in Supabase
3. ✅ Remove/change default test account
4. ✅ Enable "Confirm email" in Supabase if desired
5. ✅ Test login flow on preview deployment

## Next Steps

After email login is working:
- Set up creator/brand authentication (different flows)
- Add 2FA for additional security
- Implement audit logging for admin actions
- Set up email verification for admin accounts

---

**Questions?** Check `SUPABASE_SETUP.md` for general Supabase configuration.
