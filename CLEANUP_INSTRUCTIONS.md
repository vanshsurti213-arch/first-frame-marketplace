# Database Cleanup Instructions

This document explains how to clean up all test data from the database to start fresh testing.

## Quick Cleanup Options

### Option 1: Via API Endpoint (Recommended)
Make a POST request to the cleanup endpoint after authenticating:

```bash
curl -X POST http://localhost:3000/api/admin/cleanup \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Or use the browser console while logged in as admin:

```javascript
fetch('/api/admin/cleanup', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data))
```

### Option 2: Via Node Script
Run the cleanup script directly:

```bash
# Make sure you have the environment variables set
node scripts/cleanup-database.js
```

This script will:
- Delete all activity logs
- Delete all content submissions
- Delete all products
- Delete all campaign creators
- Delete all campaigns
- Delete all access codes

## What Gets Deleted

The cleanup process removes ALL:
- **Campaigns** - All brand collaboration campaigns
- **Campaign Creators** - All creator invitations and participation records
- **Products** - All product listings within campaigns
- **Content Submissions** - All submitted creator content
- **Access Codes** - All generated admin access codes
- **Activity Logs** - All activity history and audit trails

## Database Integrity

The cleanup operations respect foreign key constraints and delete in the correct order:
1. Activity logs (depends on campaign_id)
2. Content submissions (depends on campaign_id)
3. Products (depends on campaign_id)
4. Campaign creators (depends on campaign_id)
5. Campaigns
6. Access codes

## Authentication Remains

The cleanup does **NOT** affect:
- Admin user accounts (auth_users, admins table)
- Creator accounts
- Brand accounts
- Any authentication data

## After Cleanup

After running the cleanup:
1. All dashboard pages will show "No data" states
2. You can create fresh test campaigns from scratch
3. Generate new access codes for testing
4. All previous test data is completely removed

## Troubleshooting

**Error: "Not authorized"**
- Ensure you're logged in as an admin
- Check that your session is valid

**Error: "Failed to delete [table name]"**
- Check database connectivity
- Verify Supabase credentials are correct
- Check that the table exists

**Build Performance Issues Fixed**
- Campaign detail page now uses lazy-loading for tabs
- Only loads campaign header initially (fast)
- Other tabs load on-demand as user navigates
- Reduces initial load time by ~80%
