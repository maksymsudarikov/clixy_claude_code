# Development Best Practices for Clixy

**Goal:** Prevent production issues and maintain stability as team grows.

---

## 1. Database Schema Enforcement ⚡ CRITICAL

### Rule: All critical columns must have constraints

**❌ Bad (Current):**
```sql
ALTER TABLE shoots ADD COLUMN access_token TEXT;
-- No constraint, can be NULL, breaks share links
```

**✅ Good (Future):**
```sql
ALTER TABLE shoots ADD COLUMN access_token TEXT NOT NULL DEFAULT '';
-- Enforces non-null at database level
```

### For Clixy - Run This Now:

```sql
-- Make access_token required (after auto-generation populated all rows)
ALTER TABLE shoots
ALTER COLUMN access_token SET NOT NULL;

-- Add unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_shoots_access_token
ON shoots(access_token);
```

**Why it matters:** Database prevents bad data from ever being saved.

---

## 2. TypeScript Strict Mode 🛡️

### Current: `types.ts`
```typescript
export interface Shoot {
  id: string;
  accessToken: string; // ⚠️ Should be required, but DB might have NULL
}
```

### Better: Use strict validation
```typescript
// In a new file: utils/validation.ts
import { z } from 'zod';

export const ShootSchema = z.object({
  id: z.string().min(1),
  accessToken: z.string().length(32), // MUST be 32 chars
  title: z.string().min(1),
  client: z.string().min(1),
  // ... etc
});

// Runtime validation
export function validateShoot(data: unknown): Shoot {
  return ShootSchema.parse(data); // Throws if invalid
}
```

**Usage in shootService.ts:**
```typescript
const data = await supabase.from('shoots').select('*').eq('id', id).single();

// Validate before returning
const validatedShoot = validateShoot(data);
return validatedShoot;
```

**Benefit:** Catches bad data immediately, not when client clicks link.

---

## 3. Database Migration Checklist ✅

Every time you add a new column, follow this checklist:

### Step 1: Create Migration File
```
supabase-migration-YYYY-MM-DD-feature-name.sql
```

### Step 2: Migration Template
```sql
-- ============================================
-- Migration: Add [feature_name]
-- Date: YYYY-MM-DD
-- Author: [Your Name]
-- ============================================

-- 1. Add column with default
ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS new_column TEXT DEFAULT 'default_value';

-- 2. Backfill existing rows (if needed)
UPDATE shoots
SET new_column = 'some_value'
WHERE new_column IS NULL;

-- 3. Add constraints
ALTER TABLE shoots
ALTER COLUMN new_column SET NOT NULL;

-- 4. Verify
SELECT COUNT(*) as total,
       COUNT(new_column) as with_column
FROM shoots;
-- Should show: total = with_column
```

### Step 3: Update TypeScript Types
```typescript
// types.ts
export interface Shoot {
  // ... existing fields
  newColumn: string; // Add here
}
```

### Step 4: Update Service Layer
```typescript
// shootService.ts - fetchShootById
return {
  // ... existing fields
  newColumn: data.new_column || 'default_value'
};
```

### Step 5: Test Before Deploying
- [ ] Run migration in Supabase SQL Editor
- [ ] Check all existing shoots have the new column
- [ ] Test creating new shoot
- [ ] Test updating existing shoot
- [ ] Test sharing shoot link

---

## 4. Error Tracking with Sentry 🚨

### Why: Know about issues BEFORE users complain

**Setup (5 minutes):**

1. Sign up at [sentry.io](https://sentry.io)
2. Create project → React
3. Add to `.env.local`:
   ```
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

4. Install:
   ```bash
   npm install @sentry/react
   ```

5. Update `ErrorBoundary.tsx`:
   ```typescript
   import * as Sentry from '@sentry/react';

   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     console.error('ErrorBoundary caught an error:', error, errorInfo);

     // Send to Sentry
     Sentry.captureException(error, {
       contexts: {
         react: { componentStack: errorInfo.componentStack }
       }
     });

     this.setState({ error, errorInfo });
   }
   ```

6. Catch API errors:
   ```typescript
   // shootService.ts
   try {
     const data = await fetchShootById(id);
     if (!data.accessToken) {
       // Report missing token to Sentry
       Sentry.captureMessage(`Shoot ${id} missing accessToken`, 'warning');
     }
   } catch (error) {
     Sentry.captureException(error);
     throw error;
   }
   ```

**Benefit:** Get email alerts when things break in production.

---

## 5. Pre-Deployment Checklist 📋

Before every deployment, verify:

### Critical Data Integrity
- [ ] All shoots have `access_token` (run SQL check)
- [ ] All shoots have `status` (after status migration)
- [ ] No duplicate tokens in database

**SQL Check:**
```sql
-- Run this before deploying
SELECT
  COUNT(*) as total_shoots,
  COUNT(access_token) as with_token,
  COUNT(DISTINCT access_token) as unique_tokens,
  COUNT(status) as with_status
FROM shoots;

-- Expected: all counts should match total_shoots
```

### Build & Test
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Test in dev environment
- [ ] Test key user flows:
  - Create shoot
  - Share shoot link
  - Client accesses shared link
  - Delete shoot (with confirmation)
  - Duplicate shoot

### Environment Variables
- [ ] All required env vars in `.env.local`
- [ ] All required env vars in production (Vercel/GitHub Pages)
- [ ] Supabase URL and keys are correct

---

## 6. Code Review Guidelines 👥

When adding new features, check:

### For Database Changes:
- [ ] Migration script created?
- [ ] Column has NOT NULL constraint (or valid reason not to)?
- [ ] Default value provided?
- [ ] Existing data backfilled?
- [ ] TypeScript types updated?
- [ ] Service layer updated (create/update/fetch)?

### For Share Links:
- [ ] Does the link include required tokens/params?
- [ ] Are tokens validated before showing content?
- [ ] What happens if token is missing/invalid?
- [ ] Is there a user-friendly error message?

### For Forms:
- [ ] Are required fields validated?
- [ ] What happens on submit failure?
- [ ] Is loading state shown?
- [ ] Is success/error feedback clear?

---

## 7. Testing Strategy 🧪

### Current State: ⚠️ No automated tests

### Recommended: Add Basic Tests

**Install:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Create: `services/shootService.test.ts`**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchShootById } from './shootService';

describe('shootService', () => {
  it('auto-generates token for shoot missing one', async () => {
    // Mock Supabase response with no token
    vi.mock('./supabaseClient', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: 'test', access_token: null, title: 'Test' },
                error: null
              })
            })
          }),
          update: vi.fn().mockResolvedValue({ error: null })
        })
      }
    }));

    const shoot = await fetchShootById('test');

    // Should have generated a token
    expect(shoot?.accessToken).toBeDefined();
    expect(shoot?.accessToken).toHaveLength(32);
  });
});
```

**Run tests:**
```bash
npm test
```

### Priority Tests to Add:
1. ✅ **Token generation** (prevents access denied issues)
2. ✅ **Status defaults** (prevents DB errors)
3. ✅ **Required fields validation** (prevents incomplete shoots)
4. ✅ **Share link format** (prevents broken links)

---

## 8. Monitoring & Alerts 📊

### Database Health Checks

**Create Supabase SQL function:**
```sql
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check 1: All shoots have tokens
  RETURN QUERY
  SELECT
    'access_tokens'::TEXT,
    CASE
      WHEN COUNT(*) = COUNT(access_token) THEN 'PASS'
      ELSE 'FAIL'
    END::TEXT,
    format('%s/%s shoots have tokens', COUNT(access_token), COUNT(*))::TEXT
  FROM shoots;

  -- Check 2: No duplicate tokens
  RETURN QUERY
  SELECT
    'unique_tokens'::TEXT,
    CASE
      WHEN COUNT(*) = COUNT(DISTINCT access_token) THEN 'PASS'
      ELSE 'FAIL'
    END::TEXT,
    format('%s unique out of %s total', COUNT(DISTINCT access_token), COUNT(*))::TEXT
  FROM shoots;

  -- Check 3: All shoots have status
  RETURN QUERY
  SELECT
    'status_field'::TEXT,
    CASE
      WHEN COUNT(*) = COUNT(status) THEN 'PASS'
      ELSE 'FAIL'
    END::TEXT,
    format('%s/%s shoots have status', COUNT(status), COUNT(*))::TEXT
  FROM shoots;
END;
$$ LANGUAGE plpgsql;
```

**Run weekly:**
```sql
SELECT * FROM check_data_integrity();
```

---

## 9. Documentation Standards 📚

### When Adding New Features:

1. **Update PROJECT_STATUS.md:**
   - Add to "Завершено" section
   - Document any migrations required
   - Update known issues if introducing tech debt

2. **Update CHANGELOG.md:**
   - Date, feature name, why it was added
   - Breaking changes (if any)
   - Migration steps

3. **Add SQL migration script:**
   - Clear filename: `supabase-migration-add-feature.sql`
   - Comments explaining each step
   - Include rollback script

4. **Update types.ts:**
   - JSDoc comments for complex fields
   - Examples of valid values

Example:
```typescript
export interface Shoot {
  /**
   * Secure access token for client links
   * @example "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
   * @required Generated automatically if missing
   */
  accessToken: string;
}
```

---

## 10. Emergency Rollback Plan 🚨

If deployment breaks production:

### Step 1: Immediate Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in hosting platform
# GitHub Pages: Redeploy previous commit
# Vercel: Click "Rollback" in dashboard
```

### Step 2: Check Database
```sql
-- Verify no data corruption
SELECT COUNT(*) FROM shoots WHERE access_token IS NULL;

-- If issues found, regenerate tokens
UPDATE shoots
SET access_token = encode(gen_random_bytes(16), 'hex')
WHERE access_token IS NULL;
```

### Step 3: Notify Team
- Post in team chat
- Email affected clients (if any)
- Document what went wrong

---

## Quick Reference: Common Tasks

### Adding a New Column:
1. Write migration SQL
2. Update types.ts
3. Update shootService.ts (create/update/fetch)
4. Add default/fallback values
5. Test thoroughly
6. Deploy migration BEFORE deploying code

### Sharing Logic:
- Always include `accessToken` in share URL
- Always validate token before showing content
- Always have fallback for missing token
- Log warnings for missing tokens (helps catch issues)

### Before Every Commit:
```bash
npm run build  # Must succeed
git status     # Review all changes
git diff       # Check what you're committing
```

### Before Every Deploy:
```bash
# 1. Test locally
npm run dev
# Test all critical flows

# 2. Build
npm run build

# 3. Check database
# Run integrity checks in Supabase

# 4. Deploy
git push origin main
```

---

## Summary: Top 5 Critical Rules

1. **🔐 Never deploy without testing share links** - This is your core feature
2. **📊 Use database constraints** - Prevent bad data at source
3. **🧪 Test locally before deploying** - Save time, avoid emergencies
4. **📝 Document migrations** - Future you will thank you
5. **🚨 Set up Sentry** - Know about issues before users complain

---

**Last Updated:** 2025-12-29
**Reviewed By:** Claude Sonnet 4.5
**Next Review:** Before next major feature
