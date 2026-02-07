# 📸 CLIXY - Photography Production Management Platform

A modern, secure photography project management system for Studio Olga Prudka. Manage shoots, teams, timelines, and gift cards with a beautiful brutalist design.

---

## ✨ Features

### 🎯 For Photographers (Admin)
- **Project Management**: Create and manage photo shoots with complete details
- **Timeline Builder**: Visual timeline creation for shoot schedules
- **Team Management**: Track crew members with contact info
- **Moodboard System**: Upload inspiration images or link external boards
- **Photo Workflow**: Track photo selection and editing status
- **Auto-save Drafts**: Never lose your work - automatic draft saving every 30 seconds
- **Gift Card Management**: Create and track gift card purchases

### 👥 For Clients
- **Public Shoot Pages**: Beautiful, shareable shoot details (no login required)
- **Photo Status Tracking**: Real-time updates on photo selection and editing
- **Timeline View**: See the shoot schedule and team
- **Gift Cards**: Purchase and send photography gift cards

### 🔐 Security Features
- **PIN Protection**: Hashed PIN authentication for admin access
- **Token-Based Shoot Access**: Each shoot has a unique access token for client sharing
- **Rate Limiting**: Brute-force protection with exponential backoff
- **XSS Protection**: URL sanitization and validation
- **Session Management**: Secure session storage
- **Email/Phone Validation**: Input validation for all forms

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd clixy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   **Generate your PIN hash:**
   ```bash
   node scripts/hashPin.cjs YOUR_PIN_HERE
   ```

   Example:
   ```bash
   node scripts/hashPin.cjs 9634
   # Output: Hash: ebe922af8d4560c73368a88eeac07d16
   ```

   **Edit `.env` file:**
   ```env
   # Gemini API Key (for AI features)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Admin PIN Hash (use hash from script above)
   VITE_ADMIN_PIN_HASH=ebe922af8d4560c73368a88eeac07d16

   # Supabase (if using)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **⚠️ IMPORTANT**: Never commit your `.env` file to git!

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

---

## 🔐 Security Configuration

### Changing the Admin PIN

1. Generate a new hash:
   ```bash
   node scripts/hashPin.cjs YOUR_NEW_PIN
   ```

2. Update `.env` with the new hash:
   ```env
   VITE_ADMIN_PIN_HASH=your_new_hash_here
   ```

3. Restart the development server

### Sharing Shoots with Clients

Each shoot is protected by a unique access token. When you share a shoot with clients:

1. **In Admin Dashboard**, click the "Copy Link" button next to any shoot
2. The link includes a secure token: `https://yoursite.com/#/shoot/shoot-id?token=abc123...`
3. Share this link with your client via WhatsApp, Email, etc.
4. **Without the token**, the shoot page shows "Access Denied"

**Security Benefits:**
- ✅ Each shoot has its own unique 32-character token
- ✅ Tokens are generated automatically when creating shoots
- ✅ Prevents unauthorized access to client information
- ✅ No need for clients to create accounts or remember passwords
- ✅ Tokens can be regenerated if compromised

### Rate Limiting

The app includes built-in protection against brute-force attacks:
- **5 failed attempts** → Account lockout
- **15 minute** lockout duration
- **Exponential backoff** between attempts

---

## 📚 Documentation

**Полная документация проекта:**

- 📖 **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Текущее состояние проекта (читай первым!)
- 📝 **[CHANGELOG.md](CHANGELOG.md)** - История всех изменений
- 🔐 **[SECURITY_TESTING.md](SECURITY_TESTING.md)** - Гайд по тестированию безопасности
- 🤖 **[.claude/PROJECT_CONTEXT.md](.claude/PROJECT_CONTEXT.md)** - Guidelines для AI агентов

**Quick Links:**
- [Quick Start](#-quick-start)
- [Security Configuration](#-security-configuration)
- [Troubleshooting](#-troubleshooting)

---

## 📁 Project Structure

```
clixy/
├── components/           # React components
│   ├── AdminDashboard.tsx
│   ├── ShootForm.tsx
│   ├── PinProtection.tsx
│   ├── form/            # Form builders
│   │   ├── TeamBuilder.tsx
│   │   ├── TimelineBuilder.tsx
│   │   └── MoodboardBuilder.tsx
│   └── giftcard/        # Gift card components
├── services/            # API services
│   ├── shootService.ts
│   └── giftCardService.ts
├── utils/               # Utilities
│   ├── validation.ts    # Input validation
│   ├── pinSecurity.ts   # PIN hashing & rate limiting
│   ├── tokenUtils.ts    # Access token generation
│   └── autosave.ts      # Draft auto-save
├── types/               # TypeScript types
├── contexts/            # React contexts
├── constants/           # App constants
└── scripts/            # Build scripts
    └── hashPin.cjs      # PIN hash generator
```

---

## 🎨 Design System

Clixy uses a brutalist design inspired by Studio Olga Prudka:

### Color Palette
- **Background**: `#D8D9CF` (Warm Gray)
- **Primary Text**: `#141413` (Near Black)
- **Secondary Text**: `#9E9E98` (Mid Gray)
- **Accent**: `#F0F0EB` (Light Beige)

### Typography
- **Headers**: Bold, uppercase, tight tracking
- **Body**: Clean, readable, uppercase labels
- **Mono**: Time codes and technical data

---

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Type Checking
```bash
npm run type-check
```

---

## 📦 Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend & database
- **React Router** - Navigation
- **Google Gemini AI** - AI assistant features

---

## 🚨 Troubleshooting

### PIN not working
- Ensure you've generated the hash correctly
- Check that `VITE_ADMIN_PIN_HASH` is set in `.env`
- Restart the dev server after changing `.env`

### Auto-save not working
- Check browser localStorage is enabled
- Ensure you've filled in the shoot title (auto-save only works when title is present)

### Build fails
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear dist folder: `rm -rf dist`

---

## 🔒 Security Best Practices

1. **Never hardcode credentials** in source code
2. **Use environment variables** for all sensitive data
3. **Change default PIN** immediately after setup
4. **Use strong PINs** (not 1111, 1234, etc.)
5. **Enable HTTPS** in production
6. **Regularly update dependencies**: `npm update`

---

## 📝 TODO & Roadmap

### High Priority
- [ ] Email notifications when photos are ready
- [ ] Implement pagination for shoots (when > 50 shoots)
- [ ] Error tracking with Sentry

### Medium Priority
- [ ] Calendar view for admin dashboard
- [ ] Duplicate shoot functionality
- [ ] Advanced search filters
- [ ] Mobile optimization improvements

### Low Priority
- [ ] Analytics tracking
- [ ] Multi-user support
- [ ] Export shoots to PDF
- [ ] Dark mode

---

## 📄 License

Private project for Studio Olga Prudka. All rights reserved.

---

## 🤝 Contributing

This is a private project. For bugs or feature requests, please contact the development team.

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- Form navigation with `Tab`
- Submit forms with `Ctrl/Cmd + Enter`

### Draft System
- Drafts auto-save every **30 seconds** after changes
- Drafts persist until you publish or discard
- Only works for new shoots (not edits)

### Gift Cards
- Codes are auto-generated
- Clients can purchase without PIN
- Track status in admin dashboard

---

**Built with 💙 for Studio Olga Prudka**
