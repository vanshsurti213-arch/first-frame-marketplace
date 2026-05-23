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
