# Gift Card System - Instructions

## ✅ What's Been Created

The gift card system is now fully set up! Here's how it works:

---

## 📋 HOW TO USE (Step by Step)

### For You (Producer/Admin):

#### Step 1: Client asks "Do you have gift cards?"

You answer: **"Yes! I'll send you a link."**

#### Step 2: Send them the universal link

Copy and send this link to your client:
```
https://clixyspace.com/#/gift-card
```

That's it! One universal link for all gift cards.

---

### For the Client:

#### Step 1: Client opens the link

They see a beautiful page with all 4 packages:

1. **COUPLE PHOTOSHOOT** - $1,000
   - 1.5–2 hours
   - 40 edited photos
   - [View Full Details] → links to Notion

2. **STREET STYLE (1 Outfit)** - $1,000
   - 1.5–2 hours
   - 35 edited photos
   - [View Full Details] → links to Notion

3. **STREET STYLE (2 Outfits)** - $1,300
   - 2–3 hours
   - 50 edited photos
   - [View Full Details] → links to Notion

4. **FAMILY PHOTOSHOOT** - $1,300
   - 2–2.5 hours
   - 40 edited photos
   - [View Full Details] → links to Notion

#### Step 2: Client clicks "View Full Details"

Opens your Notion page with complete package information.

#### Step 3: Client selects a package

Clicks **"Select This Package →"**

#### Step 4: Client fills out the form

- **Their Details:** Name, Email, Phone
- **Recipient Details:** Recipient Name, Recipient Email
- **Personal Message:** (Optional) A heartfelt message
- **Delivery:**
  - ○ Send immediately
  - ○ Schedule for specific date [select date]

#### Step 5: Client submits

Clicks **"Submit Gift Card Request →"**

#### Step 6: Success page

Client sees:
- ✓ **REQUEST SUBMITTED**
- Gift card summary
- **Gift Card Code:** `CLIXY-XXXX-XXXX`
- **Payment Instructions:**
  - **Zelle:** Olha Prudka | 347-933-5770
  - Amount: $1,000 (or $1,300)
  - Reference: CLIXY-XXXX-XXXX
- Buttons:
  - **Contact via WhatsApp** → Opens WhatsApp with pre-filled message
  - **Send Email** → Opens email with details

---

## 💳 PAYMENT FLOW

1. Client submits form → Gets gift card code
2. Client pays via Zelle (preferred) or other methods
3. You receive payment → Verify in Supabase admin panel
4. You mark as "Paid" in admin panel
5. On delivery date → You send gift card to recipient

---

## 🗂️ ADMIN PANEL (Coming Next)

You'll have an admin panel at `/admin` with a "Gift Cards" tab where you can:

- View all gift card requests
- See status (Pending Payment / Paid / Sent / Redeemed)
- Mark as paid after receiving payment
- Copy recipient email to send gift card
- Track redemptions

---

## 📧 WHAT THE RECIPIENT RECEIVES

On the scheduled delivery date, the recipient gets:

**Subject:** You've Received a Photoshoot Gift! 🎁

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     STUDIO OLGA PRUDKA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi [Recipient Name],

[Purchaser Name] has gifted you an exclusive
photoshoot experience.

YOUR GIFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Package: COUPLE PHOTOSHOOT
Value: $1,000

PERSONAL MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"[Their personal message]"

YOUR GIFT CARD CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIXY-XXXX-XXXX

Valid until: [Date + 12 months]

TO REDEEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact us to book your session:

📱 WhatsApp: +1-347-583-9777
📧 Email: art@olgaprudka.com

[CONTACT US VIA WHATSAPP] →
[SEND EMAIL] →
```

---

## 🎯 PACKAGE DETAILS

All packages now have:
- ✅ Updated names (removed "PRO", added "(1 Outfit)" / "(2 Outfits)")
- ✅ Notion links for full details
- ✅ Clear pricing
- ✅ Feature lists

---

## 📱 CONTACT INFORMATION

Updated contact info:
- **WhatsApp:** +1-347-583-9777
- **Email:** art@olgaprudka.com
- **Zelle:** Olha Prudka | 347-933-5770

---

## 🔗 LINKS

### Client-facing:
- **Main gift card page:** `https://clixyspace.com/#/gift-card`

### Notion package pages:
- **Couple:** https://www.notion.so/COUPLE-PHOTOSHOOT-2af387bff96a803b9a85d88b01b15066
- **Street Style:** https://www.notion.so/STREET-STYLE-PHOTOSHOOT-2af387bff96a80fd943cd55499d4b657
- **Family:** https://www.notion.so/FAMILY-PHOTOSHOOT-2a5387bff96a80289610d556cc0b2bc9

---

## 🚀 NEXT STEPS

1. **Set up Supabase database:**
   - Follow `SUPABASE_SETUP_INSTRUCTIONS.md`
   - Run `supabase-setup.sql` in SQL Editor

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test it out:**
   ```bash
   npm run dev
   ```
   Then visit: `http://localhost:3000/#/gift-card`

4. **Admin panel** (optional, we can add later):
   - View all gift cards
   - Manage statuses
   - Track payments

---

## ❓ QUESTIONS?

Everything is designed to be:
- ✅ **Simple** - One link for everything
- ✅ **Beautiful** - Same design as your site
- ✅ **Clear** - Clients know exactly what to do
- ✅ **Premium** - Feels exclusive and professional

Ready to test it! 🎁
