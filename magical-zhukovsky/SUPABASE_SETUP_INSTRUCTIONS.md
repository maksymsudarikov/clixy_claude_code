# Supabase Setup Instructions

## ✅ What's Already Done

1. ✅ Supabase client installed (package.json)
2. ✅ Environment variables configured (.env.local)
3. ✅ Supabase client configured (services/supabase.ts)
4. ✅ Gift card types created (types.ts)
5. ✅ Gift card packages configured (constants.ts)
6. ✅ Gift card service created (services/giftCardService.ts)

---

## 🔧 What You Need to Do Now

### Step 1: Install Dependencies

Run this in your terminal:

\`\`\`bash
npm install
\`\`\`

This will install the `@supabase/supabase-js` package.

---

### Step 2: Create Database Tables

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project `clixy`
3. In the left sidebar, click **SQL Editor**
4. Click **New query**
5. Copy the entire contents of `supabase-setup.sql` file
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message. This will create:
- `shoots` table (for photoshoot data)
- `gift_cards` table (for gift card data)
- Indexes for performance
- Row Level Security policies
- Auto-update triggers

---

### Step 3: Verify Tables Were Created

1. In the left sidebar, click **Table Editor**
2. You should see two tables:
   - `shoots`
   - `gift_cards`

---

### Step 4: Test the Connection

Run your development server:

\`\`\`bash
npm run dev
\`\`\`

The app should start without errors. If you see any Supabase-related errors, check:
- Environment variables are correct in `.env.local`
- Tables were created successfully
- Supabase project is active

---

## 📋 Next Steps

After Supabase is set up, we'll create:

1. **Admin Panel for Gift Cards**
   - Create new gift card
   - View all gift cards
   - Manage status and payments

2. **Client Gift Card Form**
   - Select package
   - Fill purchaser/recipient details
   - Schedule delivery

3. **Success Page**
   - Payment instructions
   - Zelle details
   - Reference code

4. **Email Templates** (optional)
   - For recipient
   - For purchaser confirmation

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"

Make sure `.env.local` contains:
\`\`\`
VITE_SUPABASE_URL=https://xxzjkgsmvpkacuosenhp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
\`\`\`

### Error: "relation 'gift_cards' does not exist"

You need to run the SQL script in Step 2 above.

### Error: "Invalid API key"

Double-check the `VITE_SUPABASE_ANON_KEY` in `.env.local` matches the one in your Supabase dashboard.

---

## 📞 Contact Info

The following contact information is configured in `constants.ts`:

- **WhatsApp:** +1 347-933-5770
- **Email:** studio@olgaprudka.com
- **Zelle:** Olha Prudka | 347-933-5770

This will be displayed on the gift card success page and emails.

---

## 🎁 Gift Card Packages

Four packages are configured:

1. **COUPLE PHOTOSHOOT** - $1,000
2. **STREET STYLE** - $1,000 (single outfit)
3. **STREET STYLE PRO** - $1,300 (two outfits)
4. **FAMILY PHOTOSHOOT** - $1,300

You can edit these in `constants.ts` under `GIFT_CARD_PACKAGES`.
