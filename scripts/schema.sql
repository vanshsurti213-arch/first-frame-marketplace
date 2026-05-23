-- ============================================================
-- Firstframe V1 — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Creators
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  best_video_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID,
  brand_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  creator_limit INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- 5. Access Codes
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  brand_email TEXT NOT NULL,
  brand_company_name TEXT NOT NULL,
  creator_limit INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Campaign Creators (join table)
CREATE TABLE IF NOT EXISTS campaign_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  creator_id UUID REFERENCES creators(id) NOT NULL,
  creator_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending_admin_approval',
  brand_rate INTEGER,
  agreed_rate INTEGER,
  ad_rights_duration TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  notes TEXT,
  tracking_link TEXT,
  shipping_address TEXT,
  revision_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  name TEXT NOT NULL,
  variants JSONB DEFAULT '[]',
  assigned_creator_ids TEXT[] DEFAULT '{}',
  script_content TEXT,
  brief_url TEXT,
  sop_url TEXT,
  script_version INTEGER DEFAULT 0,
  script_updated_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','dispatched','completed')),
  product_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Creator Preferences
CREATE TABLE IF NOT EXISTS creator_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  creator_id UUID REFERENCES creators(id) NOT NULL,
  creator_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  variant_choice TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Content Submissions
CREATE TABLE IF NOT EXISTS content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) NOT NULL,
  creator_id UUID REFERENCES creators(id) NOT NULL,
  creator_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  product_name TEXT NOT NULL,
  drive_link TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','revision_requested','approved')),
  revision_feedback TEXT,
  revision_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- 10. Creator Tokens (magic links)
CREATE TABLE IF NOT EXISTS creator_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- 11. Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin','brand','creator')),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_campaign_creators_campaign ON campaign_creators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_creator ON campaign_creators(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_campaign ON products(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creator_preferences_campaign ON creator_preferences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign ON content_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_campaign ON activity_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_creator_tokens_token ON creator_tokens(token);

-- ============================================================
-- Storage bucket (run in Supabase Dashboard → Storage → New Bucket)
-- Name: firstframe, Public: true
-- ============================================================

-- ============================================================
-- Disable RLS for V1 (enable in production)
-- ============================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (V1 dev policy)
CREATE POLICY "Allow all for anon" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON creators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON access_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON campaign_creators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON creator_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON content_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON creator_tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON activity_log FOR ALL USING (true) WITH CHECK (true);
