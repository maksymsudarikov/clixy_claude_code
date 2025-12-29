# 🔐 Security Testing Guide

## Token-Based Shoot Access Testing

### Test 1: Access WITHOUT Token (Should be DENIED)

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

## PIN Protection Testing

### Test 6: Admin Access Protection

1. Try to access: `http://localhost:3000/#/admin`
2. **Expected Result**: PIN protection screen should appear

3. Enter wrong PIN (e.g., `0000`)
4. **Expected Result**: "Incorrect PIN" error

5. Enter correct PIN: `9634`
6. **Expected Result**: Access granted to admin dashboard

### Test 7: Rate Limiting

1. Access: `http://localhost:3000/#/dashboard`
2. Enter wrong PIN 5 times
3. **Expected Result**:
   - After 5 attempts: "Too many failed attempts. Please wait 900 seconds."
   - Button should be disabled for 15 minutes

## Security Checklist

- [ ] Cannot access shoots without token
- [ ] Valid token grants access
- [ ] Invalid token denies access
- [ ] Admin dashboard requires PIN
- [ ] Wrong PIN is rejected
- [ ] Rate limiting activates after 5 failed attempts
- [ ] "Copy Link" includes token in URL
- [ ] New shoots get unique tokens
- [ ] Access Denied page looks good
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

**Test Date**: 2025-12-28
**Status**: ✅ Ready for testing
