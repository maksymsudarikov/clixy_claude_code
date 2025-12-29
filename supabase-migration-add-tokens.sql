-- ============================================
-- MIGRATION: Add access_token to shoots table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add access_token column if it doesn't exist
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS project_type TEXT;

-- Generate tokens for existing shoots (if any)
UPDATE shoots
SET access_token = encode(gen_random_bytes(16), 'hex')
WHERE access_token IS NULL;

-- Make access_token required and unique
ALTER TABLE shoots ALTER COLUMN access_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_shoots_access_token ON shoots(access_token);

-- Add index for project_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_shoots_project_type ON shoots(project_type);
