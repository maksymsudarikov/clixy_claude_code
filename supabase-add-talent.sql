-- =====================================================
-- Add Talent Support to Shoots Table
-- =====================================================
-- Run this in BOTH Olga and Generic Supabase projects
-- =====================================================

-- Add talent column (JSONB array)
ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS talent JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN shoots.talent IS 'Array of talent (models, actors, influencers) being photographed. Each item has: name, role, phone, email, agencyUrl, photo, arrivalTime, sizes (height, clothing, shoes), notes';

-- Verify
SELECT id, title,
  jsonb_array_length(COALESCE(team, '[]'::jsonb)) as team_count,
  jsonb_array_length(COALESCE(talent, '[]'::jsonb)) as talent_count
FROM shoots
LIMIT 5;

-- =====================================================
-- DONE!
-- =====================================================
-- The talent column is now ready to use
-- Existing shoots will have empty talent array []
-- New shoots can add talent via the UI
-- =====================================================
