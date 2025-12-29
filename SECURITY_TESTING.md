# 🔐 Security Testing Guide

**Last Updated:** 2025-12-29

## Smart Access Token System Testing

### Test 1: Access WITHOUT Token - First Time (Should be DENIED)

1. Open browser to: `http://localhost:3000/`
2. Navigate to: `http://localhost:3000/#/shoot/editorial-q3`
3. **Expected Result**: 🔒 "Access Denied" page should appear

### Test 2: Access WITH Valid Token (Should WORK)

1. Get the token from constants.ts:
   - For `editorial-q3`: token is `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - For `campaign-nike`: token is `x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4`

2. Navigate to: `http://localhost:3000/#/shoot/editorial-q3?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. **Expected Result**: ✅ Shoot details page should load successfully

### Test 3: Access WITH Invalid Token (Should be DENIED)

1. Navigate to: `http://localhost:3000/#/shoot/editorial-q3?token=wrongtoken123`
2. **Expected Result**: 🔒 "Access Denied" page should appear

### Test 4: Copy Private Link from Admin Dashboard

1. Enter PIN to access dashboard: `http://localhost:3000/#/dashboard`
   - Default PIN: `9634`

2. Go to Admin Dashboard: `http://localhost:3000/#/admin`

3. Click "Copy Link" button next to any shoot

4. **Expected Result**:
   - ✅ Notification: "Private link copied to clipboard!"
   - Paste the link - it should include `?token=...` parameter
   - Opening that link should show the shoot details

### Test 5: Create New Shoot (Token Auto-Generation)

1. Go to: `http://localhost:3000/#/admin/create`

2. Fill out the form and create a new shoot

3. Go back to Admin Dashboard

4. Click "Copy Link" for the newly created shoot

5. **Expected Result**:
   - ✅ Link should include a unique 32-character token
   - Token should be different from existing shoots
   - Opening the link should work

### Test 6: Smart Access - Token Persistence (NEW! 2025-12-29)

**Goal:** Test that tokens are saved to browser and work without URL parameter

1. **First Visit (with token):**
   - Open NEW incognito window (Cmd+Shift+N)
   - Navigate to: `http://localhost:3000/#/shoot/qqq-4751?token=a2ae885a2fee3ff87db080d2a0a0c69b`
   - **Expected Result**: ✅ Shoot details page loads
   - **Check Console**: No "Access Denied" errors

2. **Second Visit (WITHOUT token):**
   - In the SAME incognito window
   - Edit URL to remove `?token=...` → `http://localhost:3000/#/shoot/qqq-4751`
   - Press Enter
   - **Expected Result**: ✅ Shoot STILL loads (token from localStorage)
   - **Reason**: Token was saved on first visit

3. **Third Visit (NEW browser):**
   - Open DIFFERENT incognito window (close first one)
   - Navigate to: `http://localhost:3000/#/shoot/qqq-4751` (no token)
   - **Expected Result**: 🔒 "Access Denied" (no saved token in new browser)

4. **Verification:**
   - Open DevTools → Console in first window
   - Run: `localStorage.getItem('shoot_token_qqq-4751')`
   - **Expected**: Shows the saved token

### Test 7: Database Token Persistence

**Goal:** Verify tokens are stored in Supabase correctly

1. **Create new shoot in Admin:**
   - Fill required fields, save shoot

2. **Check Supabase:**
   - Open Supabase Dashboard → SQL Editor
   - Run:
     ```sql
     SELECT id, access_token, title
     FROM shoots
     ORDER BY created_at DESC
     LIMIT 5;
     ```
   - **Expected Result**: All shoots have 32-char hex `access_token`
   - **Expected**: No NULL values in `access_token` column

3. **Share Button Test:**
   - Click "Copy Link" in Admin Dashboard
   - Paste link somewhere
   - **Expected Format**: `/#/shoot/{id}?token={32_char_hex}`
   - **NOT**: `token=undefined` or `token=null`

### Test 8: Fallback Token Generation

**Goal:** Test that tokens are generated even if missing from formData

1. **Clear localStorage drafts:**
   - Open DevTools → Console
   - Run:
     ```javascript
     Object.keys(localStorage)
       .filter(key => key.includes('draft'))
       .forEach(key => localStorage.removeItem(key));
     ```

2. **Create shoot:**
   - Fill form, save
   - **Expected**: No "null value in column access_token" error

3. **Verify in DB:**
   - Check Supabase as in Test 7
   - **Expected**: New shoot has valid `access_token`

## PIN Protection Testing

### Test 9: Admin Access Protection

1. Try to access: `http://localhost:3000/#/admin`
2. **Expected Result**: PIN protection screen should appear

3. Enter wrong PIN (e.g., `0000`)
4. **Expected Result**: "Incorrect PIN" error

5. Enter correct PIN: `9634`
6. **Expected Result**: Access granted to admin dashboard

### Test 10: Rate Limiting

1. Access: `http://localhost:3000/#/dashboard`
2. Enter wrong PIN 5 times
3. **Expected Result**:
   - After 5 attempts: "Too many failed attempts. Please wait 900 seconds."
   - Button should be disabled for 15 minutes

## Security Checklist

### Basic Token Security:
- [ ] Cannot access shoots without token (first time)
- [ ] Valid token grants access
- [ ] Invalid token denies access
- [ ] "Copy Link" includes token in URL (not `undefined`)
- [ ] New shoots get unique 32-char hex tokens
- [ ] Access Denied page looks good

### Smart Access:
- [ ] Token saves to localStorage on first visit
- [ ] Can access shoot without token after first visit (same browser)
- [ ] Cannot access without token in new browser
- [ ] Tokens stored correctly in Supabase (not NULL)
- [ ] Fallback token generation works (no constraint violations)

### PIN Protection:
- [ ] Admin dashboard requires PIN
- [ ] Wrong PIN is rejected
- [ ] Rate limiting activates after 5 failed attempts
- [ ] Works on mobile devices

## Production Security Notes

Before deploying to production:

1. **Change the default PIN**:
   ```bash
   node scripts/hashPin.cjs YOUR_SECURE_PIN
   ```
   Add the hash to `.env`:
   ```
   VITE_ADMIN_PIN_HASH=your_new_hash_here
   ```

2. **Verify .env is gitignored**:
   ```bash
   grep .env .gitignore
   ```

3. **Use a strong PIN** (6+ digits, not obvious like 1234)

4. **Enable HTTPS** in production (use Vercel/Netlify for automatic SSL)

5. **Share shoot links securely** (WhatsApp, Email - not public social media)

---

## Troubleshooting

### "Access Denied" on valid token
- Check URL has exact token: `?token=abc123...`
- Verify token in constants.ts or database matches
- Clear browser cache and try again

### PIN not working
- Ensure `.env.local` exists with `VITE_ADMIN_PIN_HASH`
- Restart dev server after changing `.env`
- Verify hash was generated correctly

### Rate limit stuck
- Clear localStorage: `localStorage.clear()`
- Or wait 15 minutes

---

**Test Date**: 2025-12-29
**Smart Access**: ✅ Implemented & Tested
**Status**: ✅ All tests passing
