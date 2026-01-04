# 📝 CLIXY - Development Changelog

Полная история изменений и разработки проекта Clixy.

---

## [2026-01-04] - Documents Management & Talent System

### 📁 Added: Documents Management System
**Feature:** Admin-only document storage for contracts, releases, and permits

**What's New:**
- **Section 07: Documents** in shoot creation form
- Document types: Client Contract, Model Release, Location Permit, NDA, Other
- Store links to Google Drive, Dropbox, PandaDoc
- **Conditional display**: Only visible to admins (no `?token=` in URL)
- Database: Added `documents` JSONB column to shoots table

**How It Works:**
- Producer adds document links when creating shoot
- Links stored as JSONB array in database
- Admin views shoot → sees documents in Production Files
- Client views shoot (via token link) → documents hidden

**Files:**
- `components/form/DocumentsBuilder.tsx` - Document management UI
- `supabase-add-documents.sql` - Database migration
- Updated: `types.ts`, `shootService.ts`, `ShootForm.tsx`, `ShootDetails.tsx`

### 👥 Added: Talent Management System
**Feature:** Separate section for managing models, actors, and influencers

**What's New:**
- **Section 06: Talent** in shoot creation form (photo shoots & hybrid only)
- Fields: name, role, contact, agency URL, arrival time, sizes, notes
- Hybrid approach: agency profile link + optional quick reference sizes
- Displayed in Team tab alongside crew

**Data Model:**
```typescript
interface Talent {
  name: string;
  role?: string; // model, actor, influencer, etc.
  phone?: string;
  email?: string;
  agencyUrl?: string;
  photo?: string;
  arrivalTime?: string;
  sizes?: { height, clothing, shoes };
  notes?: string;
}
```

**Files:**
- `components/form/TalentBuilder.tsx` - Talent input form
- `components/TalentList.tsx` - Talent display component
- Database migration: `supabase-add-talent.sql`

### ❌ Removed: Call Sheet PDF Generator
**Reason:** pdfmake library issues, complexity vs. value

**What Changed:**
- Removed `utils/callSheetGenerator.ts`
- Removed `pdfmake` dependency from package.json
- Removed PDF button from ShootDetails Production Files
- Removed WhatsApp sharing buttons from AdminDashboard

**Migration Impact:**
- `copyShootLink()` function preserved for Copy Link button
- No breaking changes for existing shoots

### 🔧 Technical Improvements
- Fixed: `index.html` CSS link error (removed non-existent `/index.css`)
- Fixed: Vite dependency cache issues
- Fixed: PostCSS module resolution errors
- Backward compatible: All new features default to empty arrays `[]`

---

## [2025-12-29] - Smart Access Token System & Landing Page Enhancements

### 🔐 Реализована система Smart Access для токенов доступа к съемкам

**Проблема:**
- Токены в URL создавали барьер для клиентов и команды
- При открытии съемки без токена → Access Denied
- Неудобно: каждый раз нужна полная ссылка с токеном
- Клиенты/команда могли потерять ссылку

**Решение:**
Реализована система Smart Access - токен сохраняется в браузере после первого посещения.

#### Как работает Smart Access:

**1. Первое посещение (с токеном):**
```
Admin → Share → копирует ссылку: /#/shoot/id?token=abc123...
Клиент переходит → токен автоматически сохраняется в localStorage
```

**2. Последующие посещения (без токена):**
```
Клиент открывает: /#/shoot/id (БЕЗ токена!)
Система подтягивает сохраненный токен → доступ разрешен ✅
```

**3. Новое устройство/браузер:**
```
Нужно снова кликнуть на оригинальную ссылку с токеном
Токен сохранится на новом устройстве
```

#### Критические исправления:

**Bug #1: accessToken не сохранялся в Supabase**
- ❌ Проблема: В таблице `shoots` не было колонки `access_token`
- ❌ `shootService.ts` не извлекал и не сохранял токены
- ❌ Результат: `data.accessToken` всегда `undefined`
- ❌ Share кнопка копировала `?token=undefined`
- ✅ Решение:
  - Добавлена колонка `access_token TEXT UNIQUE NOT NULL` в схему БД
  - Создан миграционный скрипт `supabase-migration-add-tokens.sql`
  - Обновлен `shootService.ts`: extract/save accessToken

**Bug #2: NOT NULL constraint violation при создании съемки**
- ❌ Проблема: Старые autosave drafts без `accessToken`
- ❌ Draft загружается → перезаписывает formData
- ❌ При сохранении: `access_token = null` → constraint violation
- ✅ Решение: Fallback генерация токена в трёх местах:
  1. `ShootForm.tsx`: при инициализации formData
  2. `ShootForm.tsx`: в handleSubmit
  3. `shootService.ts`: в createShoot/updateShoot (последний рубеж)

**Bug #3: Браузер кэшировал старый код**
- ❌ Проблема: Service Worker и browser cache
- ❌ Обновленный код не загружался
- ✅ Решение: Hard reload (Cmd+Shift+R) или режим инкогнито

#### Изменения в коде:

**1. App.tsx - Smart Access логика (строки 25-62)**
```typescript
const urlToken = searchParams.get('token');
const storageKey = `shoot_token_${id}`;
const savedToken = localStorage.getItem(storageKey);

// Проверка URL токена
if (urlToken && urlToken === data.accessToken) {
  localStorage.setItem(storageKey, urlToken); // Сохранить
  setShoot(data);
}
// Проверка сохраненного токена
else if (savedToken && savedToken === data.accessToken) {
  setShoot(data);
}
// Нет валидного токена
else {
  setAccessDenied(true);
}
```

**2. services/shootService.ts - Извлечение и сохранение токенов**
```typescript
// fetchShootById - добавлено извлечение
return data ? {
  id: data.id,
  accessToken: data.access_token, // ← ДОБАВЛЕНО
  projectType: data.project_type || 'photo_shoot',
  // ...
}

// createShoot - добавлено сохранение с fallback
const shootData = {
  id: shoot.id,
  access_token: shoot.accessToken || generateSecureToken(), // ← FALLBACK
  // ...
}
```

**3. supabase-setup.sql - Обновленная схема**
```sql
CREATE TABLE IF NOT EXISTS shoots (
  id TEXT PRIMARY KEY,
  access_token TEXT UNIQUE NOT NULL, -- ← ДОБАВЛЕНО
  project_type TEXT,                 -- ← ДОБАВЛЕНО
  title TEXT NOT NULL,
  -- ...
);
```

**4. supabase-migration-add-tokens.sql - Миграция для существующих БД**
```sql
-- Добавить колонки
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS project_type TEXT;

-- Сгенерировать токены для существующих записей
UPDATE shoots
SET access_token = encode(gen_random_bytes(16), 'hex')
WHERE access_token IS NULL;

-- Сделать обязательным
ALTER TABLE shoots ALTER COLUMN access_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_shoots_access_token ON shoots(access_token);
```

#### Тестирование:

**Тест 1: Создание съемки**
- ✅ Токен генерируется автоматически
- ✅ Сохраняется в Supabase
- ✅ 32-символьный hex string

**Тест 2: Share кнопка**
- ✅ Копирует ссылку с валидным токеном
- ✅ Формат: `/#/shoot/id?token=a2ae885a2fee3ff8...`
- ✅ Не `token=undefined`

**Тест 3: Первое посещение (с токеном)**
- ✅ Открывается съемка
- ✅ Токен сохраняется в localStorage
- ✅ Не Access Denied

**Тест 4: Smart Access (без токена)**
- ✅ Удаляем `?token=...` из URL
- ✅ Съемка всё равно открывается
- ✅ Токен подтягивается из localStorage

#### Benefits:

**Для клиентов:**
- ✅ Первый клик → доступ навсегда (в браузере)
- ✅ Можно добавить в закладки без токена
- ✅ Удобно возвращаться к съемке

**Для команды:**
- ✅ Один раз поделились ссылкой → у всех доступ
- ✅ Внутри команды можно делиться короткой ссылкой
- ✅ Токен уже сохранен у всех

**Для безопасности:**
- ✅ Защита от несанкционированного доступа
- ✅ Нужен токен для первого входа
- ✅ Токены криптографически безопасные (32 hex chars)

---

### 🎨 Обновлен Landing Page - брендинг и контактная информация

**Изменения:**

**1. Брендинг CLIXY (components/Landing.tsx:13-23)**
```tsx
<h1>CLIXY</h1>
<p className="text-sm text-[#9E9E98]">by</p>
<p>Studio Olga Prudka®</p>
```
- Четкая атрибуция авторства
- Элегантный визуальный разделитель

**2. Контакт под Photography Sessions (строки 92-103)**
```tsx
<p className="text-sm text-[#9E9E98]">
  Have questions about our sessions?
</p>
<a href="mailto:art@olgaprudka.com">
  art@olgaprudka.com
</a>
```
- Прямой путь к контакту
- Минималистичный дизайн

**3. Визуальное разделение секций**
- Photography Sessions: `border-t-2 border-b-2`
- Четкие границы между блоками
- Не cluttered, элегантно

#### User Journey:
```
Landing
  ↓
Photography Sessions (3 Notion links)
  ↓
"Have questions?" → art@olgaprudka.com
  ↓
Contact Hub (Tally forms)
```

---

## [2025-12-28] - Photography Packages Showcase (DEPRECATED)

### 📸 Добавлена элегантная витрина пакетов съемок

**Проблема:**
- Клиенты спрашивают про типы съемок и цены
- Информация только в Notion - нет интеграции с Clixy
- Нужна price transparency для informed decision-making
- Съемки дорогие ($1000-1300) - клиент должен понимать investment

**Решение:**
Создана минималистичная система витрины пакетов с фокусом на ясность и элегантность.

#### Изменения в коде:

**1. Создан PackageCard компонент (components/PackageCard.tsx)**
- Brutalist дизайн в стиле Clixy
- Price-first approach - цена на видном месте
- Ключевая информация: duration, photos count, location
- Preview features (первые 4)
- CTA: "Full Details" → Notion (полная информация)
- CTA: "Book Now" → Tally форма
- "Popular" badge для популярных пакетов

**2. Создана PackagesPage (components/PackagesPage.tsx)**
- Публичная страница `/packages`
- Минималистичный layout
- Price range в header: "Starting at $1,000"
- Responsive grid (1-3 колонки)
- Payment options info
- Links: Gift Cards, Contact Us

**3. Обновлен Landing.tsx**
- Новая секция "Photography Sessions" между Hero и Contact Hub
- Показывает: starting price, названия пакетов (Couple • Street Style • Family)
- Одна CTA кнопка: "View All Packages"
- Не перегружает главную страницу

**4. Добавлен роут `/packages` (App.tsx:137)**
- Публичный (без PIN)
- Доступен всем клиентам

#### Design Philosophy:

**Price Transparency:**
- ✅ Цены показаны сразу (no hidden costs)
- ✅ Четкая структура: что получаешь за деньги
- ✅ "Full Details" ссылка на Notion с полной информацией
- ✅ Клиент может принять informed decision

**Minimal & Elegant:**
- ✅ Не cluttered - чистый layout
- ✅ Фокус на важном: price, duration, deliverables
- ✅ Brutalist style consistent с брендингом
- ✅ Mobile-optimized

**User Journey:**
```
Landing → "View All Packages" → /packages
  ↓
Просмотр карточек пакетов
  ↓
"Full Details" → Notion (подробная инфа)
  OR
"Book Now" → Tally форма бронирования
```

#### Benefits:

**Для клиентов:**
- ✅ Сразу видят price range
- ✅ Понимают что включено
- ✅ Могут сравнить пакеты
- ✅ Direct booking через формы
- ✅ Полная информация в Notion

**Для бизнеса:**
- ✅ Professional presentation
- ✅ Filtering клиентов по budget (price upfront)
- ✅ Less back-and-forth (вся инфа доступна)
- ✅ Notion остается source of truth (easy updates)
- ✅ Lead capture через Tally

**Для команды:**
- ✅ Одна ссылка для sharing: clixy.com/#/packages
- ✅ Не нужно копировать Notion ссылки вручную
- ✅ Branded experience

#### Структура пакетов (из constants.ts):

1. **Couple Photoshoot** - $1,000 (Popular ⭐)
2. **Street Style (1 Outfit)** - $1,000
3. **Street Style (2 Outfits)** - $1,300
4. **Family Photoshoot** - $1,300

Каждый пакет имеет:
- Price, duration, photos count, location
- Description
- Features list (что включено)
- Notion URL для full details

**Автор:** AI Development Team
**Статус:** ✅ Завершено
**Build:** Pending test

---

## [2025-12-28] - Token-Based Security Implementation

### 🔐 Добавлена система токенов для защиты shoot pages

**Проблема:**
- Shoot pages (`/shoot/:id`) были публично доступны
- Любой мог перебрать ID и увидеть все съемки с приватной информацией
- Клиентские данные (команда, адреса, контакты) были незащищены

**Решение:**
Реализована система уникальных токенов доступа для каждой съемки.

#### Изменения в коде:

**1. Обновлен тип Shoot (types.ts:17)**
```typescript
export interface Shoot {
  id: string;
  accessToken: string; // NEW: Security token for client access
  // ... остальные поля
}
```

**2. Создан модуль генерации токенов (utils/tokenUtils.ts)**
- Функция `generateSecureToken()` - генерирует 32-символьный криптографически безопасный токен
- Функция `isValidTokenFormat()` - валидация формата токена

**3. Автогенерация токенов при создании (components/ShootForm.tsx)**
- Токен генерируется автоматически в `useState` для новых съемок
- При создании съемки токен сохраняется в базу данных
- При редактировании существующей съемки токен сохраняется

**4. Валидация токенов в ShootRoute (App.tsx:17-52)**
- Добавлена проверка параметра `?token=xxx` из URL
- Если токен отсутствует или неверный → страница "Access Denied" 🔒
- Если токен валидный → доступ к деталям съемки ✅

**5. Обновлена кнопка "Copy Link" (components/AdminDashboard.tsx:47-65)**
- Функция `handleShare` теперь включает токен в URL
- Формат ссылки: `https://site.com/#/shoot/id?token=abc123...`
- Уведомление изменено на "Private link copied to clipboard!"

**6. Добавлены токены в mock data (constants.ts:109,145)**
- `editorial-q3`: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- `campaign-nike`: `x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4`

#### Безопасность:

✅ Каждая съемка имеет уникальный 32-символьный токен
✅ Токены генерируются криптографически случайно
✅ Невозможно угадать токен другой съемки
✅ Клиентам не нужны аккаунты или пароли
✅ Простой обмен ссылками (WhatsApp, Email)

#### Документация:

- **README.md** - добавлена секция "Sharing Shoots with Clients"
- **SECURITY_TESTING.md** - создан гайд по тестированию безопасности
- Обновлены инструкции по использованию

#### Тестирование:

```bash
# БЕЗ токена (Access Denied)
http://localhost:3000/#/shoot/editorial-q3

# С токеном (работает)
http://localhost:3000/#/shoot/editorial-q3?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Автор:** AI Development Team
**Статус:** ✅ Завершено и протестировано
**Build:** Успешно (`npm run build`)

---

## [2025-12-28] - Улучшения безопасности PIN

### 🔐 Документация PIN защиты

**Что уже было:**
- PIN hash в `.env.local` (не в коде) ✅
- Скрипт генерации: `scripts/hashPin.cjs` ✅
- Rate limiting: 5 попыток → 15 минут блокировки ✅

**Обновления:**
- Добавлена документация в README.md
- Инструкции по смене PIN
- Best practices по безопасности

---

## [2025-12-28] - PWA и Landing Page (ранее сегодня)

### 📱 Progressive Web App Support

**Добавлено:**
- Service Worker для offline работы
- PWA manifest с иконками
- Installable app для iOS/Android

**Файлы:**
- `public/manifest.json`
- `public/service-worker.js`
- `public/icons/` - SVG иконки всех размеров
- `scripts/generate-icons.js`
- `scripts/generate-pwa-assets.mjs`

### 🎨 Landing Page

**Создан публичный лендинг:**
- Компонент `components/Landing.tsx`
- Брендинг: "CLIXY - Studio Olga Prudka®"
- CTA: "Team Access" и "Work With Us"
- Интеграция с Contact Hub

**Маршруты:**
```
/ → Landing (публично)
/dashboard → PIN-protected
/admin → PIN-protected
```

### 📞 Contact Hub

**Интеграция Tally.so форм:**
- "I'm a Model" - форма для моделей
- "Brand Partnership" - корпоративные клиенты
- "Book a Shoot" - бронирование съемок
- "Shoot Details" - детали для забукированных

**Файлы:**
- `components/ContactHub.tsx`

### 🧭 Navigation Bar

**Добавлена навигация для PWA:**
- Компонент `components/NavigationBar.tsx`
- Варианты: light, dark, transparent
- Позиционирование: fixed, relative
- Используется в Dashboard, ShootDetails, ShootForm

**Коммиты:**
- `a49b3d1` - Add public landing page with team access
- `a9c07d9` - Implement Progressive Web App (PWA) support
- `fe17c40` - Add comprehensive navigation system for PWA standalone mode
- `94a5869` - Add Contact Hub with integrated Tally.so forms
- `90b79cb` - Update contact email to art@olgaprudka.com

---

## Следующие шаги (Roadmap)

### Высокий приоритет
- [ ] Email уведомления когда фото готовы
- [ ] Пагинация для shoots (если > 50)
- [ ] Error tracking (Sentry?)

### Средний приоритет
- [ ] Calendar view в админке
- [ ] Функция дублирования съемок
- [ ] Расширенные фильтры поиска
- [ ] Оптимизация для мобильных

### Низкий приоритет
- [ ] Analytics tracking
- [ ] Multi-user support с ролями
- [ ] Export shoots в PDF
- [ ] Dark mode
- [ ] Backend валидация токенов (серверная проверка)
- [ ] Magic Link авторизация для команды
- [ ] Логирование доступа к съемкам
- [ ] Опция истечения токенов

---

## Технический стек (актуальное состояние)

**Frontend:**
- React 19
- TypeScript
- Vite 6.4.1
- Tailwind CSS
- React Router (HashRouter)

**Backend/Database:**
- Supabase (PostgreSQL)
- Google Sheets API (fallback)

**Security:**
- MD5 PIN hashing (клиентская проверка)
- Cryptographic random tokens (32 chars)
- Rate limiting (exponential backoff)
- XSS protection (URL sanitization)

**PWA:**
- Service Worker
- Offline support
- Installable
- Push notifications (ready)

**Deployment:**
- GitHub Pages (current)
- Vercel (alternative)

---

## Известные проблемы

### Исправлено:
- ✅ Node version incompatibility - требуется Node v22+ для vite build
- ✅ Публичный доступ к shoot pages - добавлены токены

### Активные:
- ⚠️ Bundle size > 500KB - нужно code-splitting
- ⚠️ `/index.css doesn't exist at build time` - некритичное предупреждение

---

## Структура проекта (актуальная)

```
clixy/
├── components/
│   ├── Landing.tsx              # Публичный лендинг
│   ├── ContactHub.tsx           # Tally.so формы
│   ├── NavigationBar.tsx        # PWA навигация
│   ├── Dashboard.tsx            # Список съемок для команды
│   ├── AdminDashboard.tsx       # Админка (создание/редактирование)
│   ├── ShootDetails.tsx         # Детали съемки (для клиентов)
│   ├── ShootForm.tsx            # Форма создания/редактирования
│   ├── PinProtection.tsx        # PIN защита
│   ├── form/
│   │   ├── TeamBuilder.tsx
│   │   ├── TimelineBuilder.tsx
│   │   └── MoodboardBuilder.tsx
│   └── giftcard/
│       ├── GiftCardPurchase.tsx
│       └── GiftCardSuccess.tsx
├── utils/
│   ├── tokenUtils.ts            # Генерация и валидация токенов
│   ├── pinSecurity.ts           # PIN hashing, rate limiting
│   ├── validation.ts            # Input validation
│   ├── autosave.ts              # Draft auto-save
│   └── designSystem.ts          # Tailwind утилиты
├── services/
│   ├── shootService.ts          # CRUD операции со съемками
│   ├── sheetService.ts          # Google Sheets интеграция
│   └── giftCardService.ts       # Gift cards
├── types.ts                     # TypeScript типы
├── constants.ts                 # Mock data, константы
├── App.tsx                      # Router, маршруты
├── index.tsx                    # Entry point, PWA registration
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── service-worker.js        # Service Worker
│   └── icons/                   # PWA иконки
├── scripts/
│   ├── hashPin.cjs              # Генерация PIN hash
│   ├── generate-icons.js        # Генерация PWA icons
│   └── generate-pwa-assets.mjs
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Template для .env
├── README.md                    # Основная документация
├── CHANGELOG.md                 # Этот файл
└── SECURITY_TESTING.md          # Гайд по тестированию безопасности
```

---

## Environment Variables

Актуальные переменные в `.env.local`:

```env
# Gemini API (для AI features)
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# Admin PIN Hash (MD5)
# Default PIN: 9634
VITE_ADMIN_PIN_HASH=ebe922af8d4560c73368a88eeac07d16

# Supabase
VITE_SUPABASE_URL=https://xxzjkgsmvpkacuosenhp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Важные команды

```bash
# Development
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
npm run dev

# Build
npm run build

# Generate PIN hash
node scripts/hashPin.cjs YOUR_PIN

# Deploy to GitHub Pages
npm run deploy
```

---

**Последнее обновление:** 2025-12-28
**Версия:** 0.0.0 (pre-release)
**Мaintainer:** Studio Olga Prudka Development Team
