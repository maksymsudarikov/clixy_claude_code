-- Add Terms & Conditions tracking columns to shoots table
-- Client agreement tracking: has client accepted terms, when, and from which IP

ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS client_accepted_terms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_accepted_ip VARCHAR(45);

COMMENT ON COLUMN shoots.client_accepted_terms IS 'Has client agreed to Terms & Conditions?';
COMMENT ON COLUMN shoots.terms_accepted_at IS 'ISO timestamp when client accepted terms';
COMMENT ON COLUMN shoots.terms_accepted_ip IS 'IP address when client accepted terms (optional)';

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'shoots'
  AND column_name IN ('client_accepted_terms', 'terms_accepted_at', 'terms_accepted_ip')
ORDER BY ordinal_position;

-- Example query to check existing shoots and their terms status
SELECT id, title, client,
  client_accepted_terms,
  terms_accepted_at,
  CASE
    WHEN client_accepted_terms = true THEN '✅ Accepted'
    ELSE '⏳ Pending'
  END as terms_status
FROM shoots
ORDER BY created_at DESC
LIMIT 5;
