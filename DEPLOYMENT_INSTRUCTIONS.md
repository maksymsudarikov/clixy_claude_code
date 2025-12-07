# Deployment Instructions for Clixy

## Step 1: Configure GitHub Secrets

To deploy the gift card feature with Supabase integration, you need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/clixy
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following two secrets:

### Secret 1: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://xxzjkgsmvpkacuosenhp.supabase.co`

### Secret 2: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4emprZ3NtdnBrYWN1b3NlbmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzAxNDYsImV4cCI6MjA4MDEwNjE0Nn0.-d5eH4wpifc-CDduxzzbyzpzc0Md0KfhCjY1M77x9Kk`

## Step 2: Deploy to GitHub Pages

Once the secrets are configured, you can deploy:

```bash
# Commit your changes
git add .
git commit -m "Add gift card feature with PIN protection"

# Push to main branch (this will trigger automatic deployment)
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build your application with the Supabase environment variables
2. Deploy to GitHub Pages
3. Your site will be available at your configured domain

## Step 3: Update PIN Code (Optional)

The default PIN code is **1234**. To change it:

1. Open `components/PinProtection.tsx`
2. Find line 6: `const CORRECT_PIN = '1234';`
3. Change '1234' to your desired PIN code
4. Commit and push the changes

## Features

### Gift Card Page
- **Public URL**: `https://your-domain.com/#/gift-card`
- No PIN required - anyone can purchase gift cards
- Integrated with Supabase for data storage
- Automatic gift card code generation

### Protected Pages (PIN Required)
- Main portfolio: `https://your-domain.com/`
- Admin dashboard: `https://your-domain.com/#/admin`
- Shoot details: `https://your-domain.com/#/shoot/:id`

### PIN Protection Details
- PIN is valid for 24 hours after entry
- Stored in browser's localStorage
- Gift card pages remain publicly accessible
- Link to gift card page available on PIN screen

## Troubleshooting

### Build fails on GitHub Actions
- Verify that both secrets are added correctly
- Check that the secret names match exactly (case-sensitive)
- Ensure there are no extra spaces in the values

### Gift cards not saving to database
- Check Supabase dashboard to verify tables exist
- Run the SQL from `supabase-setup.sql` if tables are missing
- Verify the anon key has correct permissions

### PIN protection not working
- Clear browser localStorage
- Check browser console for errors
- Verify PinProtection component is imported in App.tsx

## Support

For issues or questions:
- Email: art@olgaprudka.com
- WhatsApp: +1-347-583-9777
