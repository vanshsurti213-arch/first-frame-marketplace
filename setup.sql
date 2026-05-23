-- ============================================================
-- Firstframe V2 — 001: Core Tables
-- ============================================================
-- Run this migration first. All tables use UUID primary keys
-- and TIMESTAMPTZ for timestamps.

-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- 1. admins ----
CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 2. brands ----
CREATE TABLE IF NOT EXISTS brands (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  email        TEXT NOT NULL,
  brand_size   TEXT,
  campaign_id  UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID
);

-- ---- 3. creators ----
CREATE TABLE IF NOT EXISTS creators (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  niche            TEXT NOT NULL CHECK (niche IN ('Beauty', 'Lifestyle', 'Tech', 'Fashion', 'Food', 'Fitness')),
  city             TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  best_video_url   TEXT,
  thumbnail_url    TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  default_address  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 4. campaigns ----
CREATE TABLE IF NOT EXISTS campaigns (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id          UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_name        TEXT NOT NULL,
  name              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  collab_type       TEXT,
  ad_rights_duration TEXT,
  brand_size        TEXT,
  creator_kind      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 5. campaign_creators ----
CREATE TABLE IF NOT EXISTS campaign_creators (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id      UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id       UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  creator_name     TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited', 'negotiating', 'accepted', 'rejected',
    'preference_pending', 'preference_submitted',
    'product_dispatched', 'brief_received',
    'content_submitted', 'content_under_review',
    'revision_requested', 'content_approved', 'completed'
  )),
  agreed_rate      NUMERIC,
  brand_rate       NUMERIC,
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at      TIMESTAMPTZ,
  notes            TEXT,
  tracking_link    TEXT,
  shipping_address TEXT,
  revision_count   INTEGER NOT NULL DEFAULT 0,
  last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, creator_id)
);

-- ---- 6. creator_tokens ----
CREATE TABLE IF NOT EXISTS creator_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at    TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---- 7. access_codes ----
CREATE TABLE IF NOT EXISTS access_codes (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code               TEXT NOT NULL UNIQUE,
  brand_email        TEXT NOT NULL,
  brand_company_name TEXT NOT NULL,
  brand_id           UUID,
  is_used            BOOLEAN NOT NULL DEFAULT FALSE,
  used_at            TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ,
  created_by         UUID,
  creator_link       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 8. products ----
CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id          UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  variants             JSONB NOT NULL DEFAULT '[]'::JSONB,
  assigned_creator_ids UUID[] NOT NULL DEFAULT '{}',
  script_content       TEXT,
  script_version       INTEGER NOT NULL DEFAULT 0,
  script_updated_at    TIMESTAMPTZ,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'dispatched', 'completed')),
  product_url          TEXT,
  brief_url            TEXT,
  sop_url              TEXT,
  tracking_link        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- 9. creator_preferences ----
CREATE TABLE IF NOT EXISTS creator_preferences (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id            UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id             UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  creator_name           TEXT NOT NULL,
  product_id             UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  selected_variant_id    TEXT NOT NULL,
  selected_variant_label TEXT NOT NULL,
  submitted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (creator_id, product_id)
);

-- ---- 10. content_submissions ----
CREATE TABLE IF NOT EXISTS content_submissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id       UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id        UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  creator_name      TEXT NOT NULL,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name      TEXT NOT NULL,
  drive_link        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'revision_requested', 'approved')),
  revision_feedback TEXT,
  revision_count    INTEGER NOT NULL DEFAULT 0,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at       TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  reviewed_count    INTEGER NOT NULL DEFAULT 0
);

-- ---- 11. activity_log ----
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  actor_type  TEXT NOT NULL CHECK (actor_type IN ('admin', 'brand', 'creator')),
  actor_id    TEXT NOT NULL,
  actor_name  TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================================
-- Firstframe V2 — 002: Performance Indexes
-- ============================================================

-- ---- campaigns ----
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ---- campaign_creators ----
CREATE INDEX IF NOT EXISTS idx_campaign_creators_campaign_id ON campaign_creators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_creator_id ON campaign_creators(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_status ON campaign_creators(status);
CREATE INDEX IF NOT EXISTS idx_campaign_creators_campaign_status ON campaign_creators(campaign_id, status);

-- ---- creators ----
CREATE INDEX IF NOT EXISTS idx_creators_email ON creators(email);
CREATE INDEX IF NOT EXISTS idx_creators_is_active ON creators(is_active);

-- ---- products ----
CREATE INDEX IF NOT EXISTS idx_products_campaign_id ON products(campaign_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ---- content_submissions ----
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign_id ON content_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_creator_id ON content_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_product_id ON content_submissions(product_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_status ON content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_content_submissions_campaign_status ON content_submissions(campaign_id, status);

-- ---- creator_preferences ----
CREATE INDEX IF NOT EXISTS idx_creator_preferences_campaign_id ON creator_preferences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creator_preferences_creator_id ON creator_preferences(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_preferences_product_id ON creator_preferences(product_id);

-- ---- activity_log ----
CREATE INDEX IF NOT EXISTS idx_activity_log_campaign_id ON activity_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_campaign_timestamp ON activity_log(campaign_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log(actor_type, actor_id);

-- ---- access_codes ----
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_brand_email ON access_codes(brand_email);
CREATE INDEX IF NOT EXISTS idx_access_codes_is_used ON access_codes(is_used);

-- ---- creator_tokens ----
CREATE INDEX IF NOT EXISTS idx_creator_tokens_token ON creator_tokens(token);
CREATE INDEX IF NOT EXISTS idx_creator_tokens_creator_id ON creator_tokens(creator_id);

-- ---- brands ----
CREATE INDEX IF NOT EXISTS idx_brands_campaign_id ON brands(campaign_id);
CREATE INDEX IF NOT EXISTS idx_brands_email ON brands(email);
-- ============================================================
-- Firstframe V2 — 003: Row Level Security
-- ============================================================
-- RLS is enabled on all tables. The API layer uses the service
-- role client (which bypasses RLS) for all operations.
-- Only the admins table has a self-read policy so that
-- admin users can verify their own session.

-- Enable RLS on all tables
ALTER TABLE admins              ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands              ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators            ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_creators   ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tokens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log        ENABLE ROW LEVEL SECURITY;

-- ---- Admin self-read policy ----
-- Allows an authenticated admin to read their own row from the admins table.
-- All other table access goes through service role (bypasses RLS).
CREATE POLICY "admins_self_read"
  ON admins
  FOR SELECT
  USING (auth.uid() = id);
-- ============================================================
-- Firstframe V2 — 004: Triggers
-- ============================================================
-- Automatically update the `updated_at` column on row changes.

-- ---- Trigger function ----
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---- Apply trigger to tables with updated_at ----

-- campaigns
DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- products
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- creators
DROP TRIGGER IF EXISTS trg_creators_updated_at ON creators;
CREATE TRIGGER trg_creators_updated_at
  BEFORE UPDATE ON creators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
-- ============================================================
-- Firstframe V2 — 005: Storage Buckets
-- ============================================================
-- Creates Supabase Storage buckets for creator media.
-- These are inserted into storage.buckets directly.

-- ---- creator-videos bucket (private) ----
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-videos', 'creator-videos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ---- creator-thumbnails bucket (public) ----
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-thumbnails', 'creator-thumbnails', TRUE)
ON CONFLICT (id) DO NOTHING;
