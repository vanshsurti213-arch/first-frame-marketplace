-- ============================================================
-- Firstframe V2 — 005: Storage Buckets
-- ============================================================
-- Creates Supabase Storage buckets for creator media.
-- These are inserted into storage.buckets directly.

-- ---- creator-videos bucket (public) ----
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-videos', 'creator-videos', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- ---- creator-thumbnails bucket (public) ----
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-thumbnails', 'creator-thumbnails', TRUE)
ON CONFLICT (id) DO NOTHING;
