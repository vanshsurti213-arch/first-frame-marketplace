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
