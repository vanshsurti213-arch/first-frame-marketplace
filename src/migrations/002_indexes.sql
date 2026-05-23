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
