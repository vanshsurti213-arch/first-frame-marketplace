# FirstFrame Authentication System - Complete Guide

## Overview

FirstFrame uses a **multi-role authentication system** powered by Supabase. Each user role (Admin, Creator, Brand) has independent authentication flows.

## User Roles & Authentication

### 1. ADMIN Users
**Login:** `/admin/login`  
**Auth Table:** `admins`  
**Dashboard:** `/admin/dashboard`  
**Auth Method:** Email + Password

**Admin Capabilities:**
- Manage campaigns
- Create access codes
- View analytics
- Manage creators & brands
- Approve content submissions
- View activity logs

**Setup:**
1. Create user in Supabase Auth
2. Add record to `admins` table
3. User can login at `/admin/login`

**Table Schema:**
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

### 2. CREATOR Users
**Login:** `/creator/login` (or via invite link)  
**Auth Table:** `creators`  
**Dashboard:** `/creator/dashboard`  
**Auth Methods:** Email + Password OR Magic Link

**Creator Capabilities:**
- View assigned campaigns
- Submit content
- Track submissions status
- Update portfolio
- Accept/decline invites

**Setup:**
1. Admin invites creator (sends email link)
2. Creator creates account via invite
3. Creator can login at `/creator/login`

**Table Schema:**
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  portfolio_url VARCHAR,
  social_media JSON,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

### 3. BRAND Users
**Login:** `/brand/login` (or via invite link)  
**Auth Table:** `brands`  
**Dashboard:** `/brand/dashboard`  
**Auth Methods:** Email + Password OR Magic Link

**Brand Capabilities:**
- Create campaigns
- Manage content creators
- Review submissions
- Approve content
- Track campaign metrics

**Setup:**
1. Admin invites brand (sends email link)
2. Brand creates account via invite
3. Brand can login at `/brand/login`

**Table Schema:**
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  industry VARCHAR,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Authentication Architecture

### Supabase Auth Layer
All users authenticate via Supabase's email/password system:

```
User Email + Password
        ↓
[Supabase Auth]
   auth.users table
        ↓
    ✓ Valid ✗ Invalid
        │         │
        ▼         ▼
   Check Role  Show Error
   (admins/creators/brands)
        │
        ▼
   ✓ Authorized ✗ Not Authorized
        │                    │
        ▼                    ▼
   Grant Access         Deny Access
   (set session)        (sign out)
```

### Per-Role Authorization

Each role has its own verification table that acts as an authorization layer:

**ADMIN:**
```typescript
// 1. Supabase Auth validates email/password
const { data: { user } } = await supabase.auth.signInWithPassword({
  email, password
});

// 2. Check authorization (is user an admin?)
const { data: admin } = await supabase
  .from('admins')
  .select('*')
  .eq('id', user.id)
  .single();

// If not found, deny access
if (!admin) {
  await supabase.auth.signOut();
  throw new Error('Not authorized');
}
```

**CREATOR:**
```typescript
// Same pattern for creators
const { data: creator } = await supabase
  .from('creators')
  .select('*')
  .eq('id', user.id)
  .single();

if (!creator) {
  await supabase.auth.signOut();
  throw new Error('Not authorized');
}
```

**BRAND:**
```typescript
// Same pattern for brands
const { data: brand } = await supabase
  .from('brands')
  .select('*')
  .eq('id', user.id)
  .single();

if (!brand) {
  await supabase.auth.signOut();
  throw new Error('Not authorized');
}
```

---

## Email Authentication Details

### Email + Password Flow

**Frontend:** `/src/app/[role]/login/page.tsx`
- Email input field
- Password input field
- "Sign In" button
- Error/loading states

**Backend:** `/src/app/api/[role]/auth/login/route.ts`
- Validates input schema
- Calls `supabase.auth.signInWithPassword()`
- Checks authorization table
- Returns session/admin data

**Process:**
```
1. User enters email + password
2. Frontend calls Supabase auth
3. Supabase checks auth.users table
4. If valid, return user object
5. Frontend queries role table (admins/creators/brands)
6. If user found in role table → Success
7. If user NOT found in role table → Logout + Error
8. On success → Redirect to dashboard
```

### Password Requirements

- Minimum 8 characters (configurable in Supabase)
- Should include numbers and special characters
- Supabase hashes with bcrypt

### Password Reset

Users can reset password:
1. Click "Forgot password?" link on login page
2. Enter email
3. Supabase sends reset link to email
4. User clicks link and sets new password
5. Can login with new password

---

## Session Management

### How Sessions Work

```typescript
// Supabase automatically manages sessions
// in localStorage and cookies

// Get current session
const { data: { user } } = await supabase.auth.getUser();

// Session persists across page refreshes
// Sessions expire after ~1 hour (configurable)

// Monitor session changes
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED'
  // session: { user, access_token, refresh_token }
});
```

### Session Storage

- **localStorage:** Persists session token
- **Cookies:** Optional, for server-side auth
- **Memory:** Cached in React state

### Session Expiry

- Access token: ~1 hour
- Refresh token: ~30 days
- Automatic refresh when token expires
- User must login again if refresh token expires

---

## Auth Context Providers

Each role has an auth context provider:

### AdminAuthProvider
**File:** `src/context/AdminAuthContext.tsx`

```typescript
<AdminAuthProvider>
  <AdminLayout>
    <AdminPage />
  </AdminLayout>
</AdminAuthProvider>
```

Provides:
```typescript
const { admin, loading, signOut } = useAdminAuth();
```

### CreatorAuthProvider
**File:** `src/context/CreatorAuthContext.tsx`

Provides:
```typescript
const { creator, loading, signOut } = useCreatorAuth();
```

### BrandAuthProvider
**File:** `src/context/BrandAuthContext.tsx`

Provides:
```typescript
const { brand, loading, signOut } = useBrandAuth();
```

---

## Protected Routes

### Route Protection Pattern

All protected pages check if user is authenticated:

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { admin, loading } = useAuth();
  const router = useRouter();

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if not authenticated
  if (!admin) {
    router.push('/admin/login');
    return null;
  }

  // Show dashboard if authenticated
  return <Dashboard admin={admin} />;
}
```

### Automatic Protection

All routes under `/admin/*` are protected:
- If not logged in → Redirect to `/admin/login`
- If logged in but not admin → Redirect to `/admin/login`
- If logged in and admin → Access granted

Same for `/creator/*` and `/brand/*`

---

## Email Verification

### Optional Email Verification

Enable email verification in Supabase:
1. Go to Authentication → Providers → Email
2. Enable "Require email confirmation"
3. Users must verify email before accessing app

### Email Verification Flow

```
1. User creates account / logs in
2. Supabase sends verification email
3. User clicks link in email
4. Email confirmed
5. User can access dashboard
```

---

## Security Best Practices

### ✅ Do

- Use strong passwords (16+ characters)
- Enable email verification
- Enable 2FA for admins
- Monitor failed login attempts
- Regular password rotation
- Use HTTPS only
- Keep Supabase keys secure
- Audit admin actions
- Use row-level security (RLS)

### ❌ Don't

- Share passwords via chat/email
- Hardcode credentials
- Store passwords in code
- Use same password across services
- Allow permanent sessions
- Expose Supabase service key
- Skip email verification
- Allow weak passwords
- Store passwords in plaintext

### Environment Variables

**Public (safe to expose):**
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Secret (never expose):**
```env
SUPABASE_SERVICE_ROLE_KEY  # Backend only
DATABASE_URL               # Backend only
```

---

## Invite System

### How Invites Work

**Admin invites Creator/Brand:**

1. Admin clicks "Invite Creator" button
2. Admin enters creator email
3. System creates invite record
4. System sends email with invite link
5. Creator clicks link
6. Creator sees signup form (pre-filled email)
7. Creator creates account
8. Creator added to creators table
9. Creator can login

**Database:**
```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL,  -- 'creator' | 'brand'
  status VARCHAR DEFAULT 'pending',  -- 'pending' | 'accepted' | 'expired'
  token VARCHAR UNIQUE NOT NULL,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT now() + INTERVAL '7 days'
);
```

**Invite Link:**
```
https://firstframe.com/invite?token=abc123&role=creator
```

**Accept Invite:**
1. Verify token is valid
2. Verify email matches
3. Create Supabase Auth user
4. Create role table record (creator/brand)
5. Mark invite as accepted
6. Redirect to dashboard

---

## API Endpoints

### Admin Auth

```
POST /api/admin/auth/login
  Body: { email, password }
  Response: { success, data: { admin } }

GET /api/admin/auth/login
  Response: { success, data: { admin } }

POST /api/admin/auth/logout
  Response: { success }

POST /api/admin/auth/reset-password
  Body: { email }
  Response: { success }
```

### Creator Auth

```
POST /api/creator/auth/login
  Body: { email, password }
  Response: { success, data: { creator } }

POST /api/creator/auth/signup
  Body: { email, password, name, ... }
  Response: { success, data: { creator } }

POST /api/creator/auth/accept-invite
  Body: { token, email, password, name }
  Response: { success, data: { creator } }
```

### Brand Auth

```
POST /api/brand/auth/login
  Body: { email, password }
  Response: { success, data: { brand } }

POST /api/brand/auth/signup
  Body: { email, password, company_name, ... }
  Response: { success, data: { brand } }

POST /api/brand/auth/accept-invite
  Body: { token, email, password, company_name }
  Response: { success, data: { brand } }
```

---

## Testing Authentication

### Manual Testing

```bash
# 1. Create test users in Supabase
# 2. Start dev server
npm run dev

# 3. Test admin login
http://localhost:3000/admin/login
Email: admin@test.com
Password: test-password

# 4. Test creator login
http://localhost:3000/creator/login
Email: creator@test.com
Password: test-password

# 5. Test brand login
http://localhost:3000/brand/login
Email: brand@test.com
Password: test-password
```

### Test Cases

```javascript
// Valid credentials
✓ Login successful
✓ Redirects to dashboard
✓ Session persists on refresh

// Invalid password
✗ Shows error: "Invalid email or password"
✗ Does not redirect

// Non-existent user
✗ Shows error: "User not found"

// User not authorized for role
✗ Shows error: "Not authorized"
✗ Logs out automatically

// Session timeout
✗ Redirects to login
✓ Prompts to login again

// Email verification required
✗ Blocks access until verified
✓ Sends verification email
```

---

## Troubleshooting

### Common Issues

**"Invalid email or password"**
- Check email spelling
- Verify password is correct
- User exists in Supabase auth

**"Not authorized. This account is not registered as an admin."**
- User exists in auth but not in role table
- Add user to correct table (admins/creators/brands)

**"Supabase is not configured"**
- Check .env.local has both variables
- Restart dev server
- Verify URLs and keys are correct

**Session not persisting**
- Check browser allows localStorage/cookies
- Verify auth context is in root layout
- Check browser console for errors

**Email verification not working**
- Check email address is correct
- Verify Supabase email provider configured
- Check email in spam folder

---

## Next Steps

1. **Setup Supabase** → `SUPABASE_SETUP.md`
2. **Admin Email Login** → `ADMIN_LOGIN_SETUP.md`
3. **Email Auth Details** → `EMAIL_LOGIN_SYSTEM.md`
4. **Add Creator Auth** → Create `/creator/login`
5. **Add Brand Auth** → Create `/brand/login`
6. **Implement Invites** → Create invite system
7. **Add 2FA** → For admins (optional)
8. **Deploy** → Update Vercel env vars

---

**For Admins:** See `ADMIN_LOGIN_SETUP.md`  
**For Email Details:** See `EMAIL_LOGIN_SYSTEM.md`  
**For Supabase Setup:** See `SUPABASE_SETUP.md`
