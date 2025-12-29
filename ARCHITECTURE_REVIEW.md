# 🏗️ CLIXY - Architecture Review

**Дата анализа:** 2025-12-29
**Анализатор:** Claude Sonnet 4.5
**Строк кода:** 5,370
**Файлов:** 37
**Общий рейтинг:** 6.5/10

---

## EXECUTIVE SUMMARY

Clixy - хорошо структурированное React-приложение с четкой архитектурой и продуманным UX. Проект готов к использованию, но **требует немедленных исправлений безопасности** перед production deployment.

**Сильные стороны:** TypeScript типизация, Smart Access pattern, auto-save, brutalist design system
**Критичные проблемы:** RLS policies слишком открытые, hardcoded токены, устаревший MD5

---

## ✅ ЧТО РАБОТАЕТ ХОРОШО

### 1. АРХИТЕКТУРА (9/10)

**Четкая структура:**
```
/components/  - 20 React компонентов с разделением ответственности
/services/    - 4 сервиса (shootService, giftCardService, sheetService, supabase)
/utils/       - 6 утилит (tokenUtils, pinSecurity, validation, autosave)
/types.ts     - Централизованные TypeScript типы
/constants.ts - Константы и моковые данные
```

**Separation of Concerns:**
- UI компоненты фокусируются только на отображении
- Сервисы инкапсулируют бизнес-логику
- Утилиты переиспользуемые

### 2. БЕЗОПАСНОСТЬ (7/10)

**Smart Access Token System:**
```typescript
// generateSecureToken() - криптографически безопасный
export const generateSecureToken = (): string => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
};
```

**Pattern:**
- Первый доступ требует токен в URL
- Токен сохраняется в localStorage
- Повторный доступ без токена в URL

**PIN Protection:**
- Rate limiting: 5 попыток → 15 мин блокировка
- Session-based доступ
- Hash в .env (не в коде)

### 3. ТИПИЗАЦИЯ (8/10)

**Полные TypeScript интерфейсы:**
- `Shoot` - 20+ полей с явными типами
- `GiftCard` - полная типизация
- `TeamMember`, `TimelineEvent` - вложенные типы
- Union types для статусов

**Type safety:**
- Минимум использования `any`
- Строгие интерфейсы

### 4. USER EXPERIENCE (9/10)

**Auto-save:**
```typescript
// Каждые 30 секунд
useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft(draftKey, formData);
  }, 30000);
}, [formData]);
```

**Другие фичи:**
- Draft restoration при reopening формы
- Responsive design (mobile-first)
- Notification system с типами
- Loading states везде

---

## ⚠️ НЕКРИТИЧНЫЕ ЗАМЕЧАНИЯ

### 1. Дублирование кода

**Проблема:** shootService.ts и sheetService.ts имеют похожую логику конвертации snake_case ↔ camelCase

**Рекомендация:**
```typescript
// utils/caseConverter.ts
export function toCamelCase<T>(obj: any): T { /* ... */ }
export function toSnakeCase(obj: any): any { /* ... */ }
```

### 2. Много console.log (73 использования)

**Проблемные места:**
```typescript
console.log('Supabase Config:', { url, keyLength }); // ❌ Метаданные ключа
console.log('Creating shoot with data:', shootData); // ❌ Может содержать токены
```

**Рекомендация:** Централизованный logger с уровнями

### 3. Hardcoded values

```typescript
const DEFAULT_PIN_HASH = 'ebe922af...'; // ❌ Хардкод
export const MOCK_SHOOTS: Shoot[] = [/* 170 строк */]; // ❌ Большой объем
```

**Рекомендация:** Вынести в fixtures/mockData.ts

### 4. ShootForm.tsx слишком большой (651 строка)

**Рекомендация:** Разбить на подкомпоненты:
- ShootFormHeader
- BasicInfoSection
- PhotoWorkflowSection
- VideoWorkflowSection

### 5. Отсутствие unit тестов

**Что нужно покрыть:**
- tokenUtils.ts - генерация, валидация
- pinSecurity.ts - хэширование, rate limiting
- validation.ts - все валидаторы
- giftCardService.ts - генерация кодов

### 6. Inconsistent naming

```typescript
const draftKey = id || 'new-shoot'; // kebab-case
const STORAGE_KEY = 'clixy_shoots_data'; // snake_case
const autoSaveTimerRef = useRef(); // camelCase
```

**Стандарт:**
- Константы: UPPER_SNAKE_CASE
- Переменные: camelCase
- Компоненты: PascalCase

---

## ❌ КРИТИЧНЫЕ ПРОБЛЕМЫ

### 1. УТЕЧКА ТОКЕНОВ В КОДЕ

**Место:** constants.ts

```typescript
export const MOCK_SHOOTS: Shoot[] = [
  {
    id: 'editorial-q3',
    accessToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // ❌ ПУБЛИЧНО
  },
  {
    id: 'campaign-nike',
    accessToken: 'x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4', // ❌ ПУБЛИЧНО
  }
];
```

**Риск:** Токены в git истории навсегда, любой может получить доступ

**Решение:**
```typescript
export const MOCK_SHOOTS: Shoot[] = [
  {
    id: 'editorial-q3',
    accessToken: generateSecureToken(), // ✅ Динамически
  }
];
```

### 2. НЕБЕЗОПАСНАЯ ГЕНЕРАЦИЯ ID (Gift Cards)

```typescript
const generateId = (): string => {
  return `gc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  // ⚠️ Math.random() не криптографически безопасен
  // ⚠️ Предсказуемый паттерн
};
```

**Риск:** Brute force attack

**Решение:**
```typescript
const generateId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return `gc-${Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')}`;
};
```

### 3. EMAIL FALLBACK С PII

```typescript
const emailBody = encodeURIComponent(`
  CODE: ${code}
  Purchaser Email: ${formData.purchaserEmail}  // ❌ PII
  Purchaser Phone: ${formData.purchaserPhone}   // ❌ PII
`);
const mailtoLink = `mailto:maksym@...?body=${emailBody}`;
```

**Проблемы:**
1. PII в URL
2. Зависимость от клиента
3. Нет гарантии доставки
4. Email hardcoded

**Решение:** Убрать fallback или использовать proper email service

### 4. RACE CONDITIONS В AUTO-SAVE

```typescript
useEffect(() => {
  setTimeout(() => saveDraft(key, formData), 30000); // ⚠️
}, [formData]);

const handleSubmit = async () => {
  await createShoot(data); // ⚠️ Auto-save может выполняться параллельно
  clearDraft(key);
};
```

**Решение:**
```typescript
const handleSubmit = async () => {
  if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
  await createShoot(data);
  clearDraft(key);
};
```

### 5. 🚨 RLS POLICIES ОТКРЫТЫ ДЛЯ ВСЕХ

**Место:** supabase-setup.sql

```sql
-- ❌ КРИТИЧНО НЕБЕЗОПАСНО!
CREATE POLICY "Enable all operations for all users" ON shoots
  FOR ALL USING (true);  -- Любой может удалять shoots!

CREATE POLICY "Enable insert for all users" ON gift_cards
  FOR INSERT WITH CHECK (true);  -- Любой может создавать gift cards!
```

**Риск:**
- Любой может удалить все shoots
- Можно создать миллионы фальшивых gift cards
- Нет авторизации

**🚨 КРИТИЧНОЕ РЕШЕНИЕ:**
```sql
-- ✅ Только чтение
CREATE POLICY "Enable read access" ON shoots
  FOR SELECT USING (true);

-- ❌ УДАЛИТЬ
DROP POLICY "Enable all operations for all users" ON shoots;

-- ✅ Write только для админов
CREATE POLICY "Enable write for admins" ON shoots
  FOR ALL
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ✅ Rate limiting для gift_cards
CREATE POLICY "Limit gift card creation" ON gift_cards
  FOR INSERT
  WITH CHECK (
    (SELECT COUNT(*) FROM gift_cards
     WHERE purchaser_email = NEW.purchaser_email
     AND created_at > NOW() - INTERVAL '1 hour') < 5
  );
```

### 6. MD5 ДЛЯ PIN - УСТАРЕВШИЙ

```typescript
// utils/pinSecurity.ts - 193 строки MD5
function md5(str: string): string {
  // ⚠️ MD5 broken с 2004
  // ⚠️ Rainbow tables
  // ⚠️ Нет salt
}
```

**Решение:** bcrypt или Web Crypto API с SHA-256 + salt

```typescript
import bcrypt from 'bcryptjs';

export const hashPin = async (pin: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
};
```

### 7. НЕТ CSRF ЗАЩИТЫ

```typescript
export const createGiftCard = async (formData) => {
  // ⚠️ Нет проверки origin
  // ⚠️ Нет CSRF token
  await supabase.from('gift_cards').insert([/* ... */]);
};
```

**Решение:**
- Supabase RLS должен проверять origin
- Rate limiting (см. выше)
- reCAPTCHA для публичных форм

---

## 💡 РЕКОМЕНДАЦИИ

### ПРИОРИТЕТ 1: БЕЗОПАСНОСТЬ (КРИТИЧНО)

1. ✅ Исправить RLS policies - **СДЕЛАТЬ СЕЙЧАС**
2. ✅ Удалить hardcoded токены из constants.ts
3. ✅ Заменить MD5 на bcrypt
4. ✅ Удалить email fallback

### ПРИОРИТЕТ 2: ПРОИЗВОДИТЕЛЬНОСТЬ

1. React.memo для тяжелых компонентов
2. Lazy loading для ShootForm
3. Оптимизация изображений (WebP, lazy load)
4. Дебаунс для auto-save

### ПРИОРИТЕТ 3: DEVELOPER EXPERIENCE

1. ESLint + Prettier с автофиксом
2. Pre-commit hooks (Husky)
3. Централизованный logger
4. Environment validation

### ПРИОРИТЕТ 4: CODE QUALITY

1. Рефакторинг ShootForm (разбить на подкомпоненты)
2. Shared mapper utilities
3. JSDoc комментарии
4. Unit тесты

---

## МЕТРИКИ

**Сложность:**
- Средняя длина компонента: ~200 строк
- Самый большой: ShootForm.tsx (651 строка) ⚠️
- Cyclomatic complexity: Средняя

**Типизация:**
- TypeScript strict mode: ❌ Не включен
- Явные типы: ✅ 95%
- Использование `any`: ⚠️ 5%

**Зависимости:**
- React 19 ✅ Новейшая
- Supabase 2.39.0 ✅
- @google/genai - ⚠️ Используется?

---

## ЧЕКЛИСТ ДЛЯ PRODUCTION

- [ ] 🚨 Исправить RLS policies
- [ ] Удалить hardcoded токены
- [ ] Заменить MD5 на bcrypt
- [ ] Удалить email fallback
- [ ] TypeScript strict mode
- [ ] Rate limiting на API
- [ ] HTTPS (Vercel/Netlify)
- [ ] Monitoring (Sentry)
- [ ] Unit тесты
- [ ] Penetration testing
- [ ] CI/CD pipeline
- [ ] Error boundaries

---

## ФИНАЛЬНАЯ ОЦЕНКА

| Категория | Оценка | Комментарий |
|-----------|--------|-------------|
| Архитектура | 9/10 | Четкая структура, separation of concerns |
| Безопасность | 4/10 | Критичные проблемы в RLS, MD5, hardcoded tokens |
| Типизация | 8/10 | Хорошая, но strict mode не включен |
| UX | 9/10 | Auto-save, drafts, responsive |
| Performance | 7/10 | Можно оптимизировать (lazy load, memo) |
| Code Quality | 7/10 | Чистый код, но есть дублирование |
| Testing | 2/10 | Unit тесты отсутствуют |

**ОБЩИЙ РЕЙТИНГ: 6.5/10**

Проект готов к использованию, но требует исправлений безопасности перед production.

---

**Prepared by:** Claude Sonnet 4.5
**Date:** 2025-12-29
