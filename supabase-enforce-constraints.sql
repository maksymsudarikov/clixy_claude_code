-- ============================================
-- ENFORCE DATABASE CONSTRAINTS
-- Run this AFTER auto-generation has populated all tokens
-- ============================================

-- This script adds database-level enforcement to prevent future issues

-- ============================================
-- STEP 1: VERIFY DATA IS CLEAN
-- ============================================

-- Check: All shoots should have tokens
SELECT
  COUNT(*) as total_shoots,
  COUNT(access_token) as shoots_with_tokens,
  COUNT(access_token) * 100.0 / NULLIF(COUNT(*), 0) as percentage
FROM shoots;

-- Expected result: 100% should have tokens
-- If not 100%, DO NOT proceed. Let auto-generation fix it first.

-- Check: All tokens are unique
SELECT
  COUNT(*) as total_tokens,
  COUNT(DISTINCT access_token) as unique_tokens,
  COUNT(*) - COUNT(DISTINCT access_token) as duplicates
FROM shoots;

-- Expected: duplicates = 0
-- If duplicates > 0, run this to regenerate duplicates:
-- UPDATE shoots
-- SET access_token = encode(gen_random_bytes(16), 'hex')
-- WHERE id IN (
--   SELECT id FROM shoots
--   WHERE access_token IN (
--     SELECT access_token FROM shoots
--     GROUP BY access_token HAVING COUNT(*) > 1
--   )
-- );

-- ============================================
-- STEP 2: MAKE access_token REQUIRED
-- ============================================

-- This prevents NULL tokens in the future
ALTER TABLE shoots
ALTER COLUMN access_token SET NOT NULL;

-- ============================================
-- STEP 3: ENSURE TOKENS ARE UNIQUE
-- ============================================

-- Prevent duplicate tokens (important for security)
CREATE UNIQUE INDEX IF NOT EXISTS idx_shoots_access_token
ON shoots(access_token);

-- ============================================
-- STEP 4: ADD CHECK CONSTRAINTS
-- ============================================

-- Ensure token is always 32 characters (our standard)
ALTER TABLE shoots
ADD CONSTRAINT check_access_token_length
CHECK (length(access_token) = 32);

-- Ensure status is valid (if status column exists)
-- Uncomment after running supabase-add-status-column.sql:
-- ALTER TABLE shoots
-- ADD CONSTRAINT check_status_valid
-- CHECK (status IN ('pending', 'in_progress', 'completed', 'delivered'));

-- ============================================
-- STEP 5: VERIFY CONSTRAINTS ARE ACTIVE
-- ============================================

-- List all constraints on shoots table
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'shoots'::regclass
ORDER BY conname;

-- You should see:
-- - check_access_token_length (CHECK)
-- - idx_shoots_access_token (UNIQUE)
-- - shoots_pkey (PRIMARY KEY)

-- ============================================
-- STEP 6: TEST CONSTRAINTS
-- ============================================

-- Test 1: Try to insert shoot without token (should FAIL)
-- INSERT INTO shoots (id, title, client, date, access_token)
-- VALUES ('test-fail', 'Test', 'Client', '2025-01-01', NULL);
-- Expected: ERROR - null value in column "access_token"

-- Test 2: Try to insert shoot with short token (should FAIL)
-- INSERT INTO shoots (id, title, client, date, access_token)
-- VALUES ('test-fail-2', 'Test', 'Client', '2025-01-01', 'short');
-- Expected: ERROR - check constraint "check_access_token_length"

-- Test 3: Try to insert shoot with duplicate token (should FAIL)
-- First get an existing token:
-- SELECT access_token FROM shoots LIMIT 1;
-- Then try to insert with same token:
-- INSERT INTO shoots (id, title, client, date, access_token)
-- VALUES ('test-fail-3', 'Test', 'Client', '2025-01-01', '<existing_token>');
-- Expected: ERROR - duplicate key value violates unique constraint

-- ============================================
-- SUCCESS!
-- ============================================

-- Your database now enforces:
-- ✅ All shoots MUST have access_token (NOT NULL)
-- ✅ All tokens MUST be unique (UNIQUE INDEX)
-- ✅ All tokens MUST be exactly 32 chars (CHECK CONSTRAINT)
-- ✅ Auto-generation code provides safety net for any edge cases

-- Future benefits:
-- 1. Can't accidentally create shoot without token
-- 2. Can't accidentally duplicate tokens
-- 3. Database rejects bad data before it causes issues
-- 4. Share links guaranteed to work

SELECT 'Constraints enforced successfully! 🎉' as status;
