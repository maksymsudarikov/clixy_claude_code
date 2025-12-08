-- =============================================
-- PHOTO STATUS FEATURE - DATABASE MIGRATION
-- =============================================
-- This migration adds photo selection workflow fields to shoots table
--
-- New fields:
-- 1. photo_selection_url - URL for client to select photos (Adobe/Google Drive/WeTransfer)
-- 2. photo_status - Workflow status: selection_ready, editing_in_progress, completed
--
-- Note: final_photos_url already exists in the table

-- Add new columns
ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS photo_selection_url TEXT,
ADD COLUMN IF NOT EXISTS photo_status TEXT DEFAULT 'selection_ready';

-- Add check constraint for valid photo_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'shoots_photo_status_check'
  ) THEN
    ALTER TABLE shoots
    ADD CONSTRAINT shoots_photo_status_check
    CHECK (photo_status IN ('selection_ready', 'editing_in_progress', 'completed'));
  END IF;
END $$;

-- Create index for faster queries by photo status
CREATE INDEX IF NOT EXISTS idx_shoots_photo_status ON shoots(photo_status);

-- Verify the migration
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'shoots'
  AND column_name IN ('photo_selection_url', 'photo_status', 'final_photos_url')
ORDER BY column_name;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Photo status migration completed successfully!';
  RAISE NOTICE 'New columns added: photo_selection_url, photo_status';
  RAISE NOTICE 'Default photo_status: selection_ready';
END $$;
