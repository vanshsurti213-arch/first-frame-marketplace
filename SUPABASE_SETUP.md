# Firstframe V1 — Supabase Setup Guide

This guide covers everything you need to know to get your local environment connected to Supabase and to initialize your Firstframe platform.

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and create an account/sign in.
2. Create a new project.
3. Wait for the database setup to complete.

## 2. Environment Variables
You need to copy your API credentials from your Supabase project dashboard (Settings → API). 
Open your `.env.local` file (create it if it doesn't exist) in the root directory and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
> [!WARNING]
> Keep your `SUPABASE_SERVICE_ROLE_KEY` secret. It bypasses all database security rules and should NEVER be exposed to the browser.

## 3. Database Schema
You need to create the required tables in your Supabase database.
1. In your Supabase Dashboard, go to the **SQL Editor**.
2. Click **New Query**.
3. Open `scripts/schema.sql` from the project repository.
4. Copy the entire contents of `scripts/schema.sql` and paste it into the SQL Editor.
5. Click **Run** to execute the query. 
*This will create all 11 required tables, performance indexes, and set up the initial (open) Row Level Security policies for V1 development.*

## 4. Storage Bucket
1. Go to **Storage** in the Supabase Dashboard.
2. Click **New Bucket**.
3. Name the bucket exactly `firstframe`.
4. Make sure to toggle **Public bucket** to `true`.
5. Click Save.

## 5. Seed the Admin Account
To access the Admin Dashboard, you need an initial admin account. Run the provided NodeJS seed script:

```bash
node scripts/seed-supabase.js
```
This script will use the Supabase Admin API to securely generate the first admin user:
- **Email:** `admin@firstframe.in`
- **Password:** `password123`

## 6. Run the Application
Finally, start your local Next.js development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/login` and sign in with the admin credentials generated in step 5!
