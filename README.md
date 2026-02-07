# 📸 CLIXY - Photography Production Management Platform

A modern, secure photography project management system for Studio Olga Prudka. Manage shoots, teams, timelines, and client delivery with a brutalist design language.

---

## ✨ Features

### 🎯 For Photographers (Admin)
- **Project Management**: Create and manage photo shoots with complete details
- **Timeline Builder**: Visual timeline creation for shoot schedules
- **Team Management**: Track crew members with contact info
- **Moodboard System**: Upload inspiration images or link external boards
- **Photo Workflow**: Track photo selection and editing status
- **Auto-save Drafts**: Never lose your work - automatic draft saving every 30 seconds
- **Signed Share Links**: Expiring, hashed client links for secure shoot access

### 👥 For Clients
- **Public Shoot Pages**: Beautiful, shareable shoot details (no login required)
- **Photo Status Tracking**: Real-time updates on photo selection and editing
- **Timeline View**: See the shoot schedule and team
- **Secure Client Access**: Client links resolve through signed token validation

### 🔐 Security Features
- **Email OTP Admin Auth**: Supabase one-time-code login for admin access
- **Signed Share Links**: Hashed, expiring tokens stored server-side
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

   **Edit `.env` file:**
   ```env
   # Supabase (required)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Allowed admin emails (comma-separated)
   VITE_ADMIN_EMAIL_ALLOWLIST=owner@example.com,producer@example.com
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

6. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

---

## 🔐 Security Configuration

### Managing Admin Access

1. Add allowed admin emails to `.env`:
   ```env
   VITE_ADMIN_EMAIL_ALLOWLIST=owner@example.com,producer@example.com
   ```
2. Add the same emails to the `admin_users` table in Supabase.
3. Restart the development server.

### Sharing Shoots with Clients

Each shoot should be shared using signed links generated from the admin dashboard:

1. **In Admin Dashboard**, click the "Copy Link" button next to any shoot
2. The link includes a signed token: `https://yoursite.com/#/shoot/shoot-id?token=...`
3. Share this link with your client via WhatsApp, Email, etc.
4. **Without a valid token or admin session**, the shoot page shows "Access Denied"

**Security Benefits:**
- ✅ Tokens are random and never stored in plaintext
- ✅ Token hashes are validated server-side
- ✅ Tokens have an expiration window
- ✅ Prevents unauthorized access to client information
- ✅ No need for clients to create accounts or remember passwords
- ✅ New links can be generated if compromised

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
├── services/            # API services
│   ├── shootService.ts
│   ├── authService.ts
│   └── shareLinkService.ts
├── utils/               # Utilities
│   ├── validation.ts    # Input validation
│   ├── tokenUtils.ts    # Access token generation
│   └── autosave.ts      # Draft auto-save
├── types/               # TypeScript types
├── contexts/            # React contexts
├── constants/           # App constants
└── supabase/            # SQL setup, migrations, edge functions
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
npm run build
```

### Type Checking
```bash
npm run build
```

---

## 📦 Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend & database
- **React Router** - Navigation

---

## 🚨 Troubleshooting

### Admin login code not working
- Verify your email is listed in `VITE_ADMIN_EMAIL_ALLOWLIST`
- Ensure the same email exists in the `admin_users` table
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
3. **Keep admin allowlists minimal** and regularly review them
4. **Use signed share links** and rotate links when needed
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
- Gift card UI is currently disabled
- Keep DB access admin-only until payment flow is audited

---

**Built with 💙 for Studio Olga Prudka**
