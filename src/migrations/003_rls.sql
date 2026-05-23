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
