# Email Login System - Complete Overview

## Status: ✅ FULLY IMPLEMENTED & OPERATIONAL

The FirstFrame platform includes a complete email-based authentication system for admin users. This document explains how it works and how to use it.

## System Architecture

```
┌─────────────────────┐
│   Admin User        │
│  (Email + Password) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Frontend: /admin/login              │
│ - Email input field                 │
│ - Password input field              │
│ - Sign In button                    │
└──────────┬────────────────────────┐
           │                        │
           ▼                        │
  ┌────────────────────────┐       │
  │ Supabase Auth          │       │
  │ (Email verification)   │       │
  └────────────┬───────────┘       │
               │                   │
               ▼                   │
  ┌────────────────────────┐       │
  │ admins table           │       │
  │ (Authorization check)  │       │
  └────────────┬───────────┘       │
               │                   │
               ├─ Authorized ───────┘
               │
               ▼
  ┌────────────────────────┐
  │ /admin/dashboard       │
  │ Granted access         │
  └────────────────────────┘
```

## Key Components

### 1. Frontend Login Page
**File:** `src/app/admin/login/page.tsx`

**Features:**
- Email input with validation
- Password input (masked)
- Real-time error messages
- Loading state with spinner
- Timeout protection (15s)
- Auto-fill with default email `admin@firstframe.in`

**Form Workflow:**
```
1. User enters email + password
2. Click "Sign In" button
3. Form validates inputs
4. Calls Supabase auth API
5. If auth successful:
   - Query admins table
   - Verify user authorization
   - Redirect to dashboard
6. If auth fails:
   - Show error message
   - User can retry
```

### 2. Auth Context
**File:** `src/context/AuthContext.tsx`

**Responsibilities:**
- Manages admin session state
- Monitors auth changes
- Protects admin routes
- Auto-logout on auth change
- Provides `admin` + `loading` to components

**Hook Usage:**
```typescript
const { admin, loading } = useAuth();

if (loading) return <Spinner />;
if (!admin) return <Redirect to="/admin/login" />;

return <AdminContent />;
```

### 3. Supabase Client
**File:** `src/lib/supabase/client.ts`

**Features:**
- Lazy initialization (only on browser)
- Validates environment variables
- Returns null gracefully if not configured
- Cached singleton instance

### 4. Database Schema

**Three core tables:**

**auth.users** (Supabase built-in)
```
id: UUID (Primary Key)
email: VARCHAR
encrypted_password: TEXT
created_at: TIMESTAMP
```

**admins** (Your application)
```
id: UUID (Foreign Key → auth.users.id)
email: VARCHAR (indexed)
name: VARCHAR
created_at: TIMESTAMP (default now)
updated_at: TIMESTAMP (default now)
```

**admin_activity_logs** (optional, for auditing)
```
id: UUID (Primary Key)
admin_id: UUID (FK → admins.id)
action: VARCHAR
details: JSON
timestamp: TIMESTAMP (default now)
```

## Authentication Flow (Detailed)

### Step 1: User Submits Login Form
```typescript
// In login page
const handleLogin = async (e: React.FormEvent) => {
  // Validate inputs
  // Call supabase.auth.signInWithPassword()
}
```

### Step 2: Supabase Verifies Credentials
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@firstframe.in",
  password: "password123"
});
// Supabase checks auth.users table
// Returns user if credentials match
```

### Step 3: Authorization Check
```typescript
// Query admins table to verify access
const { data: adminData } = await supabase
  .from("admins")
  .select("id, email, name")
  .eq("id", data.user.id)
  .single();

// If user not in admins table, deny access
if (!adminData) {
  await supabase.auth.signOut();
  throw new Error("Not authorized");
}
```

### Step 4: Session Management
```typescript
// AuthContext monitors this
supabase.auth.onAuthStateChange((event, session) => {
  // SIGNED_IN: User logged in
  // SIGNED_OUT: User logged out
  // USER_UPDATED: User info changed
  // Update admin state accordingly
});
```

### Step 5: Route Protection
```typescript
// In admin pages/components
export default function AdminDashboard() {
  const { admin, loading } = useAuth();
  
  if (!admin) {
    return <Redirect to="/admin/login" />;
  }
  
  return <DashboardContent />;
}
```

## Setting Up Email Login

### Quick Start

1. **Get Supabase Credentials** (see `SUPABASE_SETUP.md`)

2. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Create Admin Users** in Supabase Dashboard:
   - Go to Authentication → Users
   - Click "Create new user" or "Invite"
   - Enter email and password
   - Copy the User ID

4. **Add to admins Table:**
   ```sql
   INSERT INTO admins (id, email, name) VALUES (
     'user-id-from-step-3',
     'admin@firstframe.in',
     'Admin Name'
   );
   ```

5. **Test Login:**
   - Go to http://localhost:3000/admin/login
   - Enter credentials from step 3
   - Should redirect to /admin/dashboard

### Admin User Management

**Create New Admin:**
```sql
-- 1. Create in Supabase Auth (via dashboard)
-- 2. Add to admins table:
INSERT INTO admins (id, email, name) VALUES (
  'user-id-here',
  'newadmin@company.com',
  'New Admin'
);
```

**Remove Admin Access:**
```sql
-- This removes admin without deleting auth user
DELETE FROM admins WHERE id = 'user-id';

-- To fully delete:
-- 1. Delete from admins table
-- 2. Delete from auth.users in Supabase dashboard
```

**Reset Admin Password:**
1. Go to Supabase Dashboard
2. Authentication → Users
3. Find user
4. Click menu → Reset Password
5. Send reset link to admin

## Testing Email Login

### Test Cases

```javascript
// Valid credentials - should succeed
Email: admin@firstframe.in
Password: [correct password]
Expected: Redirect to /admin/dashboard

// Wrong password - should fail
Email: admin@firstframe.in
Password: wrong-password
Expected: Error message "Invalid email or password"

// Non-admin user - should fail
Email: user@firstframe.in (exists in auth but not in admins)
Password: correct-password
Expected: Error message "Not authorized"

// Network timeout - should fail gracefully
Expected: Error message "Connection timed out"

// Empty fields - should fail
Email: (empty)
Password: (empty)
Expected: Error message "Please enter both..."
```

### Manual Testing

```bash
# 1. Start dev server
npm run dev

# 2. Open in browser
http://localhost:3000/admin/login

# 3. Try login with test account
# 4. Check browser console for debug logs [v0]
# 5. Verify redirect to /admin/dashboard
```

## Security Features

✅ **Built-in:**
- Password hashing (Supabase bcrypt)
- HTTPS-only authentication
- Secure session tokens
- CORS protection
- Rate limiting (Supabase)
- Email verification ready

✅ **Application Level:**
- Authorization check (admins table)
- Session validation on page load
- Auto-logout if user removed from admins
- Error message sanitization
- Timeout protection (15s)

🔒 **For Production:**
- Enable email verification
- Add 2FA (Supabase supports)
- Log all admin actions
- Set strong password requirements
- Monitor failed login attempts
- Implement session timeout

## Troubleshooting

### "Supabase is not configured"
- Check `.env.local` has both env vars
- Restart dev server
- Verify URLs match exactly

### "Invalid email or password"
- Confirm credentials in Supabase dashboard
- Check email isn't case-sensitive issue
- Verify user exists in `auth.users`

### "Not authorized. This account is not registered as an admin"
- User exists in auth but not in admins table
- Add user to admins table:
  ```sql
  INSERT INTO admins (id, email, name) VALUES ('user-id', 'email', 'name');
  ```

### Login button doesn't respond
- Check browser console for errors
- Verify Supabase credentials
- Check network tab for API calls
- Ensure Supabase project is active

### Session not persisting
- Check if Supabase session storage enabled
- Verify auth context is in layout
- Check browser allows cookies/local storage

## Integration with Other Auth Systems

**Creator Login:** (Different system)
- Separate auth table: `creators`
- Different login page: `/creator/login`
- Uses same Supabase but different table

**Brand Login:** (Different system)
- Separate auth table: `brands`
- Different login page: `/brand/login`
- Uses same Supabase but different table

Each role (admin, creator, brand) has:
- Independent login page
- Independent auth table
- Independent auth context
- Independent dashboard

## Next Steps

1. **Configure Supabase:** Follow `SUPABASE_SETUP.md`
2. **Create Admin Users:** See "Admin User Management" above
3. **Test Email Login:** See "Testing Email Login"
4. **Add More Features:**
   - Password reset flow
   - Email verification
   - 2FA authentication
   - Admin audit logging
5. **Deploy:** Update env vars in Vercel dashboard

## API Reference

### Frontend API

```typescript
// Supabase Auth
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
const { data } = await supabase.auth.getUser()

// Check Admin Status
const { admin, loading } = useAuth()

// Query admins table
const { data } = await supabase
  .from("admins")
  .select("*")
  .eq("id", userId)
```

### Backend API

```typescript
// Server-side auth
const authSupabase = await createServerSupabase()
const serviceSupabase = createServiceRoleClient()

// Login endpoint
POST /api/admin/auth/login
Body: { email, password }
Response: { success, data: { admin } }

// Get current admin
GET /api/admin/auth/login
Response: { success, data: { admin } }
```

---

**Complete Setup Guide:** See `ADMIN_LOGIN_SETUP.md`  
**Supabase Configuration:** See `SUPABASE_SETUP.md`  
**General Quick Start:** See `QUICK_START.md`
