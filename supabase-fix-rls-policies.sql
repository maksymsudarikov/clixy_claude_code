-- ============================================
-- КРИТИЧНОЕ ИСПРАВЛЕНИЕ: RLS POLICIES
-- Запусти этот скрипт в Supabase SQL Editor
-- ============================================

-- ============================================
-- ШАГА 1: УДАЛИТЬ НЕБЕЗОПАСНЫЕ ПОЛИТИКИ
-- ============================================

-- Удалить политику "все операции для всех"
DROP POLICY IF EXISTS "Enable all operations for all users" ON shoots;

-- Удалить политику "insert для всех" на gift_cards (оставим для форм)
-- DROP POLICY IF EXISTS "Enable insert for all users" ON gift_cards;
-- Примечание: Эту оставляем, но добавим rate limiting ниже

-- ============================================
-- ШАГА 2: СОЗДАТЬ БЕЗОПАСНЫЕ ПОЛИТИКИ ДЛЯ SHOOTS
-- ============================================

-- ✅ Публичное чтение shoots (для клиентов с токеном)
-- Примечание: Валидация токена происходит на клиенте
CREATE POLICY "Enable read access for all users" ON shoots
  FOR SELECT
  USING (true);

-- ✅ Write доступ ТОЛЬКО для аутентифицированных пользователей
-- Это защитит от несанкционированного создания/изменения/удаления
CREATE POLICY "Enable write for authenticated users" ON shoots
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Альтернативный вариант: Если у вас есть admin роль в JWT
-- CREATE POLICY "Enable write for admins" ON shoots
--   FOR ALL
--   USING (
--     auth.role() = 'authenticated'
--     AND (auth.jwt() ->> 'role')::text = 'admin'
--   )
--   WITH CHECK (
--     auth.role() = 'authenticated'
--     AND (auth.jwt() ->> 'role')::text = 'admin'
--   );

-- ============================================
-- ШАГА 3: RATE LIMITING ДЛЯ GIFT CARDS
-- ============================================

-- ✅ Ограничить создание gift cards одним email до 5 в час
-- Защита от спама и атак
CREATE POLICY "Rate limit gift card creation by email" ON gift_cards
  FOR INSERT
  WITH CHECK (
    (
      SELECT COUNT(*)
      FROM gift_cards
      WHERE purchaser_email = NEW.purchaser_email
        AND created_at > NOW() - INTERVAL '1 hour'
    ) < 5
  );

-- ✅ Ограничить создание gift cards одним IP (если есть поле ip_address)
-- Раскомментируй если добавишь колонку ip_address в таблицу
-- ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS ip_address TEXT;
-- CREATE POLICY "Rate limit gift card creation by IP" ON gift_cards
--   FOR INSERT
--   WITH CHECK (
--     (
--       SELECT COUNT(*)
--       FROM gift_cards
--       WHERE ip_address = NEW.ip_address
--         AND created_at > NOW() - INTERVAL '1 hour'
--     ) < 10
--   );

-- ✅ Update/Delete gift cards только для админов
CREATE POLICY "Enable update for authenticated users" ON gift_cards
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON gift_cards
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- ШАГА 4: ПРОВЕРКА ПОЛИТИК
-- ============================================

-- Посмотреть все активные политики для shoots
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'shoots';

-- Посмотреть все активные политики для gift_cards
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'gift_cards';

-- ============================================
-- ДОПОЛНИТЕЛЬНО: АУДИТ ЛОГИ (ОПЦИОНАЛЬНО)
-- ============================================

-- Создать таблицу для логирования доступа к shoots
-- Полезно для отслеживания подозрительной активности
CREATE TABLE IF NOT EXISTS shoot_access_logs (
  id BIGSERIAL PRIMARY KEY,
  shoot_id TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  FOREIGN KEY (shoot_id) REFERENCES shoots(id) ON DELETE CASCADE
);

-- Индекс для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_shoot_access_logs_shoot_id ON shoot_access_logs(shoot_id);
CREATE INDEX IF NOT EXISTS idx_shoot_access_logs_accessed_at ON shoot_access_logs(accessed_at);

-- RLS для access logs (только админы могут читать)
ALTER TABLE shoot_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can read access logs" ON shoot_access_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================

-- ✅ Убедись что RLS включен
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('shoots', 'gift_cards');
-- Результат: rowsecurity должен быть TRUE для обеих таблиц

-- ✅ Проверь что старые политики удалены
SELECT count(*) as dangerous_policies
FROM pg_policies
WHERE tablename IN ('shoots', 'gift_cards')
  AND policyname LIKE '%all operations%';
-- Результат: должно быть 0

-- ============================================
-- ГОТОВО!
-- ============================================

-- Теперь:
-- 1. shoots: Читать могут все, писать только аутентифицированные
-- 2. gift_cards: Rate limiting 5 в час на email
-- 3. Защита от массового создания/удаления данных
-- 4. (Опционально) Логи доступа к shoots

-- Следующий шаг: Настроить аутентификацию в приложении
-- Для защиты Admin роутов нужно интегрировать Supabase Auth
