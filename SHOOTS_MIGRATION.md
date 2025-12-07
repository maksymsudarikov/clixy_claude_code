# 🔄 SHOOTS MIGRATION - localStorage → Supabase

## Проблема:
- Съемки хранятся в localStorage (локально в браузере)
- Клиенты не могут видеть съемки по ссылкам
- "Shoot Not Found" ошибка

## Решение:
Перенести съемки в Supabase database

---

## ШАГ 1: Создать таблицу в Supabase

Открой Supabase Dashboard → SQL Editor → New query:

```sql
-- Создаем таблицу shoots
CREATE TABLE shoots (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  style_guide JSONB,
  timeline JSONB,
  team JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS политика: все могут читать
CREATE POLICY "Public can view shoots" ON shoots
  FOR SELECT
  USING (true);

-- RLS политика: только авторизованные могут создавать/обновлять
-- (временно разрешим всем, потом добавим auth)
CREATE POLICY "Anyone can create shoots" ON shoots
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update shoots" ON shoots
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete shoots" ON shoots
  USING (true);

-- Включаем RLS
ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;

-- Проверка
SELECT * FROM shoots;
```

---

## ШАГ 2: Обновить sheetService.ts

Изменить код чтобы использовать Supabase вместо localStorage.

Я могу помочь с этим! Хочешь чтобы я:
1. Создал новый `shootService.ts` с Supabase интеграцией?
2. Добавил миграцию данных из localStorage в Supabase?
3. Обновил все компоненты?

---

## ШАГ 3: Мигрировать существующие данные

После обновления кода, можно будет:
1. Открыть админку
2. Нажать кнопку "Migrate to Supabase"
3. Все shoots из localStorage загрузятся в Supabase

---

## Альтернатива (быстрое решение на сегодня):

Если нужно СРОЧНО, можно:
1. Экспортировать shoots из localStorage в JSON
2. Вручную создать shoots заново в Supabase через SQL
3. Потом уже сделать нормальную интеграцию

Что выбираешь?
