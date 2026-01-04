-- Add selected_photos_url column to shoots table
-- For storing link to photos client already selected (for re-review)

ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS selected_photos_url TEXT;

COMMENT ON COLUMN shoots.selected_photos_url IS 'Link to photos client already selected (for re-review before final editing)';

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'shoots'
  AND column_name = 'selected_photos_url';

-- Example query to check shoots with selected photos URL
SELECT id, title, client,
  CASE
    WHEN selected_photos_url IS NOT NULL AND selected_photos_url != '' THEN '✅ Has selected photos link'
    ELSE '⏳ No link yet'
  END as selected_photos_status,
  photo_status
FROM shoots
WHERE photo_status IN ('editing_in_progress', 'completed')
ORDER BY created_at DESC
LIMIT 5;
