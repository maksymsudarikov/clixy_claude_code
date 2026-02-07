-- Security hardening migration
-- Date: 2026-02-07
-- Goals:
-- 1) Enforce admin-only CRUD via Supabase Auth + allowlist table
-- 2) Add expiring signed-link storage for public shoot access
-- 3) Remove permissive public write/read policies

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin allowlist (emails that can use /studio and CRUD data)
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public share links (tokens are stored hashed)
CREATE TABLE IF NOT EXISTS shoot_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoot_id TEXT NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shoot_share_links_shoot_id ON shoot_share_links(shoot_id);
CREATE INDEX IF NOT EXISTS idx_shoot_share_links_expires_at ON shoot_share_links(expires_at);

ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_share_links ENABLE ROW LEVEL SECURITY;

-- Helper used by RLS policies
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users au
    WHERE lower(au.email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  );
$$;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Public can view shoots" ON shoots;
DROP POLICY IF EXISTS "Allow write operations for shoots" ON shoots;
DROP POLICY IF EXISTS "Allow update operations for shoots" ON shoots;
DROP POLICY IF EXISTS "Allow delete operations for shoots" ON shoots;
DROP POLICY IF EXISTS "Enable read for all users" ON gift_cards;
DROP POLICY IF EXISTS "Rate limited gift card creation" ON gift_cards;
DROP POLICY IF EXISTS "Enable update for admin" ON gift_cards;

-- Admin-only policies (CRUD)
CREATE POLICY "Admin read shoots" ON shoots
  FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin insert shoots" ON shoots
  FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin update shoots" ON shoots
  FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin delete shoots" ON shoots
  FOR DELETE USING (is_admin_user());

-- Gift cards disabled in UI, keep admin-only access at DB level
CREATE POLICY "Admin read gift_cards" ON gift_cards
  FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin insert gift_cards" ON gift_cards
  FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin update gift_cards" ON gift_cards
  FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin delete gift_cards" ON gift_cards
  FOR DELETE USING (is_admin_user());

-- No direct client access to share-link records
DROP POLICY IF EXISTS "No direct access to shoot_share_links" ON shoot_share_links;
CREATE POLICY "No direct access to shoot_share_links" ON shoot_share_links
  FOR ALL USING (false) WITH CHECK (false);

-- Admin list visibility for allowlist table
DROP POLICY IF EXISTS "Admin read admin_users" ON admin_users;
CREATE POLICY "Admin read admin_users" ON admin_users
  FOR SELECT USING (is_admin_user());
