-- Add documents column to shoots table
-- Documents: contracts, releases, permits (admin-only)

ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

COMMENT ON COLUMN shoots.documents IS 'Array of documents (contracts, releases, permits) - admin only';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'shoots' AND column_name = 'documents';

-- Example query to check existing shoots
SELECT id, title,
  jsonb_array_length(COALESCE(documents, '[]'::jsonb)) as document_count
FROM shoots
LIMIT 5;
