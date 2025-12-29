# ⚡ Clixy - Quick Reference

> Шпаргалка для быстрого старта

---

## 🚀 Development

```bash
# Start dev server (IMPORTANT: Node v22!)
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
npm run dev
# → http://localhost:3000

# Build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 🔐 Security

### Default Credentials (dev only)
```
PIN: 9634
Token (editorial-q3): a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Token (campaign-nike): x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

### Generate new PIN hash
```bash
node scripts/hashPin.cjs YOUR_PIN
# Copy hash to .env.local
```

### Test URLs
```bash
# Without token (Access Denied)
http://localhost:3000/#/shoot/editorial-q3

# With token (Works)
http://localhost:3000/#/shoot/editorial-q3?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Admin (requires PIN)
http://localhost:3000/#/admin
```

---

## 📁 Routes

```
PUBLIC:
/                    → Landing Page
/gift-card           → Gift Cards
/shoot/:id?token=xxx → Shoot Details (TOKEN REQUIRED!)

PROTECTED (PIN):
/dashboard           → Shoots List
/admin               → Admin Dashboard
/admin/create        → Create Shoot
/admin/edit/:id      → Edit Shoot
```

---

## 🎨 Design System

```css
/* Colors */
bg-[#D8D9CF]    /* Background */
text-[#141413]  /* Primary text */
text-[#9E9E98]  /* Secondary text */

/* Shadow */
shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]

/* Typography */
text-2xl font-bold uppercase tracking-tight
text-xs uppercase tracking-widest
```

---

## 📂 Key Files

```
components/
  Landing.tsx          # Public landing page
  Dashboard.tsx        # Shoots list (team)
  AdminDashboard.tsx   # CRUD operations
  ShootDetails.tsx     # Client view (token-protected)
  ShootForm.tsx        # Create/Edit form
  PinProtection.tsx    # PIN gate

utils/
  tokenUtils.ts        # Token generation
  pinSecurity.ts       # PIN + rate limiting
  validation.ts        # Input validation

App.tsx                # Routes + token validation
types.ts               # TypeScript types
```

---

## 🔧 Common Tasks

### Create new shoot
1. Go to `/admin/create`
2. Fill form
3. Token auto-generated
4. Click "Copy Link" to share with client

### Share shoot with client
1. Go to `/admin`
2. Click "Copy Link" next to shoot
3. URL includes token: `?token=abc123...`
4. Send via WhatsApp/Email

### Change PIN
```bash
node scripts/hashPin.cjs NEW_PIN
# Update .env.local with new hash
# Restart dev server
```

---

## 📚 Documentation

```
README.md              # Technical docs
PROJECT_STATUS.md      # Current state (start here!)
CHANGELOG.md           # Full history
SECURITY_TESTING.md    # Testing guide
.claude/PROJECT_CONTEXT.md  # AI agent guidelines
```

---

## ⚠️ Critical Rules

```
❌ DON'T:
- Remove tokens from /shoot/:id
- Make shoot pages public
- Commit .env files
- Change security without asking

✅ DO:
- Generate tokens for new shoots
- Validate tokens before showing ShootDetails
- Use .env for credentials
- Update CHANGELOG.md after changes
```

---

## 🐛 Troubleshooting

**Build fails:**
```bash
# Use Node v22+
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
```

**PIN not working:**
```bash
# Check .env.local exists with VITE_ADMIN_PIN_HASH
# Restart dev server
```

**Access Denied on valid token:**
```bash
# Verify URL has exact token: ?token=abc123...
# Clear browser cache
```

---

## 📞 Contact

**Email:** art@olgaprudka.com
**WhatsApp:** +13475839777
**Project:** github.com/studio-olga-prudka/clixy

---

**Last Updated:** 2025-12-28
