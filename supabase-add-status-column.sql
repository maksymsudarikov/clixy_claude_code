-- ============================================
-- ADD STATUS COLUMN TO SHOOTS TABLE
-- Quick Win Feature: Status Toggle
-- ============================================

-- Add status column with default 'pending'
ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE shoots
ADD CONSTRAINT shoots_status_check
CHECK (status IN ('pending', 'in_progress', 'completed', 'delivered'));

-- Update existing shoots to have 'in_progress' status
UPDATE shoots
SET status = 'in_progress'
WHERE status IS NULL;

-- Verify
SELECT id, title, status FROM shoots LIMIT 10;
