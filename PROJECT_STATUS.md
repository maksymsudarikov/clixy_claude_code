# 🎯 CLIXY - Current Project Status

> **Читай это ПЕРВЫМ при начале каждой сессии!**
> Последнее обновление: 2025-12-29

---

## 📌 Что такое Clixy?

**Clixy** - внутренний портал для управления фотосъемками Studio Olga Prudka.

**НЕ портфолио!** - это рабочий инструмент для:
- Команды (фотографы, стилисты, модели) - создание и управление съемками
- Клиентов - просмотр деталей их съемки (команда, локация, расписание, фото)

**Цель:** Убрать переписку back-and-forth, все в одном месте.

---

## 🏗️ Текущая архитектура

### Маршруты:

```
ПУБЛИЧНЫЕ (без защиты):
✅ / → Landing Page (Studio Olga Prudka branding)
✅ /gift-card → Покупка подарочных карт
✅ /gift-card/success → Успешная покупка
✅ /shoot/:id?token=xxx → Детали съемки (ЗАЩИЩЕНО ТОКЕНОМ!)

ЗАЩИЩЕННЫЕ (PIN: 9634):
🔒 /dashboard → Список всех съемок (для команды)
🔒 /admin → Админка (управление съемками)
🔒 /admin/create → Создание новой съемки
🔒 /admin/edit/:id → Редактирование съемки
```

### Безопасность:

**1. Smart Access Token System** (НОВОЕ! 2025-12-29)
- Каждая съемка имеет уникальный `accessToken` (32 hex символа)
- **Первый доступ:** Требуется токен в URL `?token=abc123...`
- **Smart Access:** Токен сохраняется в `localStorage` после первого посещения
- **Последующие визиты:** Можно открывать без токена в URL - используется сохраненный
- **Новое устройство:** Нужна оригинальная ссылка с токеном снова
- Кнопка "Copy Link" в админке копирует полную ссылку с токеном
- **Хранение в БД:** `access_token TEXT UNIQUE NOT NULL` в таблице `shoots`
- **Генерация:** `crypto.getRandomValues()` - криптографически безопасно

**Как работает:**
```
1. Admin → Share → /#/shoot/id?token=xxx
2. Клиент открывает → токен сохраняется в localStorage
3. В следующий раз: /#/shoot/id (без токена) → работает ✅
```

**2. PIN для команды**
- PIN: `9634` (для development)
- Hash в `.env.local`: `VITE_ADMIN_PIN_HASH`
- Rate limiting: 5 попыток → 15 минут блокировки
- Скрипт генерации: `node scripts/hashPin.cjs YOUR_PIN`

---

## 📁 Ключевые файлы и компоненты

### Основные компоненты:

| Файл | Назначение | Защита |
|------|-----------|--------|
| `Landing.tsx` | Публичный лендинг с CTA | Публично |
| `ContactHub.tsx` | Tally.so формы для клиентов | Публично |
| `Dashboard.tsx` | Список съемок для команды | PIN |
| `AdminDashboard.tsx` | CRUD операции со съемками | PIN |
| `ShootDetails.tsx` | Детали съемки для клиентов | Token |
| `ShootForm.tsx` | Создание/редактирование | PIN |
| `PinProtection.tsx` | PIN gate | - |

### Утилиты:

| Файл | Что делает |
|------|-----------|
| `utils/tokenUtils.ts` | Генерация токенов (crypto.getRandomValues) |
| `utils/pinSecurity.ts` | PIN hash, rate limiting |
| `utils/validation.ts` | Валидация форм, URL sanitization |
| `utils/autosave.ts` | Auto-save черновиков (30 сек) |

### Сервисы:

| Файл | Backend |
|------|---------|
| `services/shootService.ts` | Supabase (съемки) |
| `services/sheetService.ts` | Google Sheets (fallback) |
| `services/giftCardService.ts` | Gift cards |

---

## 🔐 Критически важно о безопасности

### ⚠️ НИКОГДА не делай:
- ❌ Убирать токен из `/shoot/:id` маршрута
- ❌ Делать shoot pages публичными без токена
- ❌ Коммитить `.env` или `.env.local` в git
- ❌ Хардкодить PIN или токены в коде

### ✅ ВСЕГДА:
- ✅ Генерировать токен при создании новой съемки
- ✅ Проверять токен перед показом ShootDetails
- ✅ Использовать `handleShare(e, shoot)` с токеном в URL
- ✅ Сохранять чувствительные данные в `.env`

---

## 🛠️ Технический стек

**Framework:** React 19 + TypeScript + Vite 6.4.1
**Styling:** Tailwind CSS (brutalist design)
**Routing:** React Router (HashRouter для GitHub Pages)
**Database:** Supabase (PostgreSQL)
**PWA:** Service Worker, manifest.json, offline support
**Deployment:** GitHub Pages (можно Vercel)

**Node version:** v22.19.0 (критично для build!)
```bash
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
```

---

## 🎨 Design System

**Цвета:**
- Background: `#D8D9CF` (warm gray)
- Primary text: `#141413` (near black)
- Secondary text: `#9E9E98` (mid gray)
- Accent: `#F0F0EB` (light beige)

**Стиль:** Brutalist, bold uppercase, tight tracking, shadows `[8px_8px_0px_0px_rgba(20,20,19,1)]`

---

## 📊 Типы данных

### Shoot (главный тип)

```typescript
interface Shoot {
  id: string;
  accessToken: string; // 🔐 ВАЖНО!
  projectType?: 'photo_shoot' | 'video_project' | 'hybrid';

  // Основное
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;

  // Локация
  locationName: string;
  locationAddress: string;
  locationMapUrl?: string;

  // Контент
  description: string;
  moodboardUrl?: string;
  moodboardImages: string[];

  // Photo workflow
  photoSelectionUrl?: string;
  finalPhotosUrl?: string;
  photoStatus?: 'selection_ready' | 'editing_in_progress' | 'completed';

  // Video workflow
  videoUrl?: string;
  videoStatus?: 'draft' | 'editing' | 'review' | 'final';
  revisionNotes?: string;

  // Команда и расписание
  team: TeamMember[];
  timeline: TimelineEvent[];

  // Styling
  stylingUrl?: string;
  stylingNotes?: string;
  hairMakeupNotes: string;

  coverImage: string;
}
```

---

## 🚀 Быстрые команды

```bash
# Development (ВАЖНО: Node v22!)
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
npm run dev

# Build
npm run build

# Deploy
npm run deploy

# Generate PIN
node scripts/hashPin.cjs 1234

# Check git status
git status
git log --oneline -5
```

---

## 📋 Текущие задачи и статус

### ✅ Завершено (2025-12-29):

**Security Improvements:**
- [x] **RLS Policies Fixed** - Supabase защищен, shoots доступны только аутентифицированным для записи
- [x] **Hardcoded Tokens Removed** - динамическая генерация с `generateSecureToken()`
- [x] **bcrypt Migration Ready** - PIN хэширование обновлено с MD5 на bcrypt (код готов, нужно обновить .env)
- [x] **Smart Access Token System** - токены сохраняются в браузере
- [x] **Supabase токены** - access_token в БД, миграция готова

**Product & Documentation:**
- [x] **Comprehensive Analysis** - PM/Developer roadmap с Quick Wins и приоритетами (TEAM_WORKFLOW_IMPROVEMENTS.md)
- [x] **Landing page enhancements** - брендинг "by Studio Olga Prudka®", контакт под sessions
- [x] **Photography Sessions** - 3 простых Notion ссылки (Couple, Street Style, Family)
- [x] Token-based security для shoot pages (2025-12-28)
- [x] Landing page с Contact Hub (2025-12-28)
- [x] PWA support (offline, installable)
- [x] Navigation system для standalone mode
- [x] Документация (README, CHANGELOG, SECURITY_TESTING, ARCHITECTURE_REVIEW, SECURITY_FIXES_GUIDE, TEAM_WORKFLOW_IMPROVEMENTS)

### ⏳ В процессе:
- Нет активных задач

### 📝 Backlog (высокий приоритет):

**Immediate (Quick Wins - 1-2 days):**
- [ ] **Add Error Boundary** (2h) - Prevent app crashes
- [ ] **Keyboard Shortcuts** (4h) - N=new, Cmd+F=search, Del=delete
- [ ] **Duplicate Shoot** (2h) - One-click duplicate with pre-filled fields
- [ ] **Quick Status Toggle** (2h) - Click status badge to change
- [ ] **Better Delete Confirmation** (2h) - Type "DELETE" to confirm
- [ ] **Inline Date Edit** (6h) - Click date in table to edit
- [ ] **Apply bcrypt hash** (5 min) - Update .env.local with new hash

**Sprint 2 (Week 2 - Form Improvements):**
- [ ] **Multi-Step Form Wizard** (10h) - Break ShootForm into 3 steps
- [ ] **Real-time Validation** (8h) - Instant field validation
- [ ] **Loading States** (3h) - Proper loading indicators

**Sprint 3 (Week 3 - Bulk Operations):**
- [ ] **Advanced Search** (12h) - Filters by date/status/location/type
- [ ] **Bulk Operations** (10h) - Multi-select + bulk delete/update
- [ ] **WhatsApp Share Integration** (6h) - Direct share button

**Production Essentials:**
- [ ] Error tracking (Sentry) - See SECURITY_FIXES_GUIDE.md
- [ ] Email notifications когда фото готовы
- [ ] Pagination для shoots (если > 50)

### 💡 Идеи (средний/низкий приоритет):
- [ ] Calendar view в админке
- [ ] Backend token validation (серверная проверка)
- [ ] Magic Link auth для команды
- [ ] Access logging (кто когда открывал)
- [ ] Token expiration (опция)
- [ ] Dark mode
- [ ] Analytics dashboard
- [ ] Mobile app (React Native + Expo)
- [ ] Client collaboration (select favorites, request edits)
- [ ] AI Features (auto-categorize, smart albums)

**См. TEAM_WORKFLOW_IMPROVEMENTS.md для полного roadmap**

---

## 🐛 Известные проблемы

### Критические:
- Нет (все критичные уязвимости исправлены 2025-12-29)

### Некритические (из comprehensive analysis):
- ⚠️ **ShootForm.tsx** (650 lines) - Form paralysis, нужен multi-step wizard
- ⚠️ **No bulk operations** - нельзя удалить/обновить несколько shoots одновременно
- ⚠️ **Limited search** - только title + client, нет фильтров по дате/статусу/локации
- ⚠️ **No Error Boundaries** - app crash при ошибке в компоненте
- ⚠️ **MD5 Legacy Support** - isLegacyHash() все еще в коде (удалить после bcrypt миграции)
- ⚠️ **localStorage quota** - не обрабатываются ошибки при превышении лимита
- ⚠️ **Rate limiting client-side** - нужно на backend (Supabase Edge Functions)
- ⚠️ Bundle size > 500KB (нужно code-splitting в будущем)
- ⚠️ Node v12 по умолчанию (нужно v22 для vite)

**Priority Fixes:** См. TEAM_WORKFLOW_IMPROVEMENTS.md для roadmap

---

## 📞 Контакты и доступы

**Email:** art@olgaprudka.com
**WhatsApp:** +13475839777

**Supabase:**
- URL: `https://xxzjkgsmvpkacuosenhp.supabase.co`
- Anon Key: в `.env.local`

**Default credentials (development only):**
- PIN: `9634`
- Token для `editorial-q3`: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- Token для `campaign-nike`: `x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4`

---

## 🔄 Workflow для AI Agent

### При начале новой сессии:
1. Прочитай `PROJECT_STATUS.md` (этот файл)
2. Проверь `CHANGELOG.md` для полной истории
3. Спроси пользователя что нужно сделать
4. **НЕ меняй** безопасность без явного запроса

### При завершении задачи:
1. Обнови `CHANGELOG.md` с новыми изменениями
2. Обнови `PROJECT_STATUS.md` если изменилась архитектура
3. Создай git commit с четким описанием

### При работе с безопасностью:
1. ВСЕГДА сохраняй токены в Shoot
2. ВСЕГДА проверяй токен в ShootRoute
3. НИКОГДА не делай shoot pages публичными
4. Используй `generateSecureToken()` для новых токенов

---

## 📚 Документация

| Файл | Назначение |
|------|-----------|
| `README.md` | Основная документация, Quick Start |
| `CHANGELOG.md` | Полная история изменений |
| `PROJECT_STATUS.md` | Текущий статус (этот файл) |
| `SECURITY_TESTING.md` | Гайд по тестированию безопасности |
| `SECURITY_FIXES_GUIDE.md` | Инструкция по применению security fixes (RLS, bcrypt, Sentry) |
| `ARCHITECTURE_REVIEW.md` | Полный architectural analysis с рейтингом 6.5/10 |
| `TEAM_WORKFLOW_IMPROVEMENTS.md` | PM/Developer roadmap с Quick Wins и приоритетами |
| `.env.example` | Template для environment variables |

**SQL Scripts:**
| Файл | Назначение |
|------|-----------|
| `supabase-setup.sql` | Initial database schema |
| `supabase-migration-add-tokens.sql` | Adds access_token column to existing DB |
| `supabase-fix-rls-SIMPLE.sql` | Fixes RLS policies (USED - 2025-12-29) |
| `supabase-fix-rls-YOUR-DB.sql` | Alternative RLS fix with rate limiting |

---

## 🎯 Следующие шаги (рекомендации на основе comprehensive analysis)

### **Immediate (This Week):**
1. **Apply bcrypt hash** (5 min) - Update .env.local with new hash from SECURITY_FIXES_GUIDE.md
2. **Add Error Boundary** (2h) - Prevent production crashes
3. **Quick Wins Sprint** (12h) - Keyboard shortcuts, duplicate shoot, quick status toggle

### **Sprint 2 (Next Week):**
1. **Multi-Step Form Wizard** (10h) - Solve "form paralysis" #1 pain point
2. **Real-time Validation** (8h) - Better UX
3. **Loading States** (3h) - Professional polish

### **Sprint 3 (Week 3):**
1. **Advanced Search** (12h) - Date/status/location filters
2. **Bulk Operations** (10h) - Multi-select + bulk actions
3. **WhatsApp Share** (6h) - Direct share button

### **Production Readiness:**
1. **Sentry Setup** - Follow SECURITY_FIXES_GUIDE.md instructions
2. **Email Notifications** - When photos ready
3. **Analytics** - Understand client behavior

**См. TEAM_WORKFLOW_IMPROVEMENTS.md для полного roadmap с 18 features**

---

**Статус проекта:** 🟢 Стабильный, готов к использованию
**Последний build:** ✅ Успешный (2025-12-28)
**Deployment:** GitHub Pages (live)
**Team:** Studio Olga Prudka + AI Development

---

> 💡 **Tip для AI:** Если не уверен - спроси у пользователя! Лучше уточнить, чем сломать работающую систему.
