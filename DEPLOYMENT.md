# Vercel Deployment

This project is configured for Vercel deployment (not GitHub Pages).

## 1. Required Environment Variables

Set these in Vercel Project Settings:

- `VITE_TENANT` (`olga` or `generic`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL_ALLOWLIST`

For Supabase Edge Functions, also set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL_ALLOWLIST`
- `ALLOWED_ORIGINS` (comma-separated, e.g. `https://app.example.com`)
- `RESEND_API_KEY` (if using notifications)

## 2. Build and Deploy

```bash
npm install
npm run build
vercel --prod
```

`vercel.json` already includes SPA rewrites and security headers.

## 3. Post-Deploy Checks

1. Confirm `/studio` requires email OTP login.
2. Confirm non-admin users cannot read/write `shoots` in Supabase.
3. Generate a share link and verify it opens `/shoot/:id?token=...`.
4. Confirm expired or invalid tokens are denied.
5. Confirm gift card pages are not reachable from UI.
