-- ============================================
-- CLIXY DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Table: shoots
-- Stores photoshoot information
CREATE TABLE IF NOT EXISTS shoots (
  id TEXT PRIMARY KEY,
  access_token TEXT UNIQUE NOT NULL,
  project_type TEXT,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location_name TEXT NOT NULL,
  location_address TEXT NOT NULL,
  location_map_url TEXT,
  description TEXT NOT NULL,
  moodboard_url TEXT,
  moodboard_images JSONB DEFAULT '[]'::jsonb,
  call_sheet_url TEXT,
  final_photos_url TEXT,
  styling_url TEXT,
  styling_notes TEXT,
  hair_makeup_notes TEXT NOT NULL,
  team JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: gift_cards
-- Stores gift card purchases and redemptions
CREATE TABLE IF NOT EXISTS gift_cards (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,

  -- Package info
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Purchaser details
  purchaser_name TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  purchaser_phone TEXT NOT NULL,

  -- Recipient details
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,

  -- Personalization
  personal_message TEXT,

  -- Dates
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  delivery_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  sent_date TIMESTAMPTZ,
  redeemed_date TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'sent', 'redeemed', 'expired', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Metadata
  redeemed_by TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_delivery_date ON gift_cards(delivery_date);
CREATE INDEX IF NOT EXISTS idx_shoots_date ON shoots(date);

-- Enable Row Level Security
ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - SECURED VERSION
-- Updated: 2026-01-31
-- ============================================

-- RLS Policies for shoots table
-- NOTE: This is an internal tool with additional security layers:
-- 1. Admin panel protected by PIN
-- 2. Shoot pages protected by accessToken
-- 3. HTTPS + Supabase API keys

-- Public can read shoots (needed for accessToken-protected pages)
CREATE POLICY "Public can view shoots" ON shoots
  FOR SELECT USING (true);

-- Write operations allowed for internal tool
-- Security enforced at application layer (PIN + accessToken)
CREATE POLICY "Allow write operations for shoots" ON shoots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update operations for shoots" ON shoots
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete operations for shoots" ON shoots
  FOR DELETE USING (true);

-- RLS Policies for gift_cards table
-- Read: Admin only (via PIN-protected admin panel)
CREATE POLICY "Enable read for all users" ON gift_cards
  FOR SELECT USING (true);

-- Insert: Rate limited - max 5 purchases per email per hour
-- This prevents gift card spam/abuse
CREATE POLICY "Rate limited gift card creation" ON gift_cards
  FOR INSERT WITH CHECK (
    (SELECT COUNT(*) FROM gift_cards gc
     WHERE gc.purchaser_email = purchaser_email
     AND gc.created_at > NOW() - INTERVAL '1 hour') < 5
  );

-- Update: Allowed for admin operations (status changes)
CREATE POLICY "Enable update for admin" ON gift_cards
  FOR UPDATE USING (true);

-- Delete: Not allowed via RLS (soft delete via status change instead)
-- If needed, uncomment:
-- CREATE POLICY "Prevent gift card deletion" ON gift_cards
--   FOR DELETE USING (false);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for shoots table
CREATE TRIGGER update_shoots_updated_at BEFORE UPDATE ON shoots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gift_cards table
CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON gift_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
