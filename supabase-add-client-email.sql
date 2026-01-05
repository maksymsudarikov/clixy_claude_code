-- Add client_email column to shoots table for email notifications
-- Run this in your Supabase SQL Editor

ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS client_email TEXT;

COMMENT ON COLUMN shoots.client_email IS 'Client email address for automated notifications';

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'shoots' AND column_name = 'client_email';
