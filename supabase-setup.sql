-- ============================================
-- CLIXY DATABASE SETUP (SECURE BASELINE)
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS shoots (
  id TEXT PRIMARY KEY,
  access_token TEXT UNIQUE NOT NULL,
  project_type TEXT DEFAULT 'photo_shoot',
  status TEXT DEFAULT 'pending',
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  client_email TEXT,
  date TEXT NOT NULL,
  start_time TEXT DEFAULT '09:00',
  end_time TEXT DEFAULT '18:00',
  location_name TEXT DEFAULT '',
  location_address TEXT DEFAULT '',
  location_map_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  moodboard_url TEXT DEFAULT '',
  moodboard_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  call_sheet_url TEXT DEFAULT '',
  photo_selection_url TEXT DEFAULT '',
  selected_photos_url TEXT DEFAULT '',
  final_photos_url TEXT DEFAULT '',
  photo_status TEXT DEFAULT 'selection_ready',
  video_url TEXT DEFAULT '',
  video_status TEXT DEFAULT 'draft',
  revision_notes TEXT DEFAULT '',
  styling_url TEXT DEFAULT '',
  styling_notes TEXT DEFAULT '',
  hair_makeup_notes TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  team JSONB NOT NULL DEFAULT '[]'::jsonb,
  talent JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_accepted_terms BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  terms_accepted_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gift_cards (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  purchaser_name TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  purchaser_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  personal_message TEXT,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  delivery_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  sent_date TIMESTAMPTZ,
  redeemed_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'sent', 'redeemed', 'expired', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  redeemed_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure upgrades are idempotent for existing projects
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'photo_shoot';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS location_address TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS location_map_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS moodboard_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS moodboard_images JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS call_sheet_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS photo_selection_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS selected_photos_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS final_photos_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS photo_status TEXT DEFAULT 'selection_ready';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'draft';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS revision_notes TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS styling_url TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS styling_notes TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS hair_makeup_notes TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '';
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS team JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS talent JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS timeline JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS client_accepted_terms BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS terms_accepted_ip TEXT;

-- Admin allowlist (emails allowed to access admin CRUD)
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public share links (store only token hash)
CREATE TABLE IF NOT EXISTS shoot_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoot_id TEXT NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_shoots_date ON shoots(date);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_delivery_date ON gift_cards(delivery_date);
CREATE INDEX IF NOT EXISTS idx_shoot_share_links_shoot_id ON shoot_share_links(shoot_id);
CREATE INDEX IF NOT EXISTS idx_shoot_share_links_expires_at ON shoot_share_links(expires_at);

-- ============================================
-- RLS + POLICIES (ADMIN-ONLY CRUD)
-- ============================================

ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_share_links ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Public can view shoots" ON shoots;
DROP POLICY IF EXISTS "Allow write operations for shoots" ON shoots;
DROP POLICY IF EXISTS "Allow update operations for shoots" ON shoots;
DROP POLICY IF EXISTS "Allow delete operations for shoots" ON shoots;
DROP POLICY IF EXISTS "Enable read access for all users" ON shoots;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON shoots;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON shoots;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON shoots;

DROP POLICY IF EXISTS "Enable read for all users" ON gift_cards;
DROP POLICY IF EXISTS "Rate limited gift card creation" ON gift_cards;
DROP POLICY IF EXISTS "Enable update for admin" ON gift_cards;

DROP POLICY IF EXISTS "Admin read shoots" ON shoots;
DROP POLICY IF EXISTS "Admin insert shoots" ON shoots;
DROP POLICY IF EXISTS "Admin update shoots" ON shoots;
DROP POLICY IF EXISTS "Admin delete shoots" ON shoots;

DROP POLICY IF EXISTS "Admin read gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admin insert gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admin update gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admin delete gift_cards" ON gift_cards;

DROP POLICY IF EXISTS "Admin read admin_users" ON admin_users;
DROP POLICY IF EXISTS "No direct access to shoot_share_links" ON shoot_share_links;

CREATE POLICY "Admin read shoots" ON shoots
  FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin insert shoots" ON shoots
  FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin update shoots" ON shoots
  FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin delete shoots" ON shoots
  FOR DELETE USING (is_admin_user());

CREATE POLICY "Admin read gift_cards" ON gift_cards
  FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin insert gift_cards" ON gift_cards
  FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admin update gift_cards" ON gift_cards
  FOR UPDATE USING (is_admin_user()) WITH CHECK (is_admin_user());
CREATE POLICY "Admin delete gift_cards" ON gift_cards
  FOR DELETE USING (is_admin_user());

CREATE POLICY "Admin read admin_users" ON admin_users
  FOR SELECT USING (is_admin_user());

CREATE POLICY "No direct access to shoot_share_links" ON shoot_share_links
  FOR ALL USING (false) WITH CHECK (false);

-- ============================================
-- TIMESTAMP TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shoots_updated_at ON shoots;
CREATE TRIGGER update_shoots_updated_at
BEFORE UPDATE ON shoots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gift_cards_updated_at ON gift_cards;
CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON gift_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
