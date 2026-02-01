-- ============================================
-- CLIXY SUPABASE SECURITY FIX - ФИНАЛЬНАЯ ВЕРСИЯ
-- Дата: 2025-12-07
-- Исправляет ошибку "policy already exists"
-- ============================================

-- ШАГ 1: Удаляем ВСЕ существующие политики
DROP POLICY IF EXISTS "Enable read access for all users" ON shoots;
DROP POLICY IF EXISTS "Enable all operations for all users" ON shoots;
DROP POLICY IF EXISTS "Public can view shoots" ON shoots;
DROP POLICY IF EXISTS "Enable read for all users" ON gift_cards;
DROP POLICY IF EXISTS "Enable insert for all users" ON gift_cards;
DROP POLICY IF EXISTS "Enable update for all users" ON gift_cards;
DROP POLICY IF EXISTS "Anyone can create gift cards" ON gift_cards;

-- ШАГ 2: Создаем БЕЗОПАСНЫЕ политики заново
-- ============================================

-- ТАБЛИЦА: shoots
-- Логика: ВСЕ могут читать портфолио
CREATE POLICY "Public can view shoots" ON shoots
  FOR SELECT
  USING (true);

-- ТАБЛИЦА: gift_cards
-- Логика: ВСЕ могут создавать (форма на сайте)
--         НИКТО не может читать (success страница использует URL параметры)
CREATE POLICY "Anyone can create gift cards" ON gift_cards
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- ✅ БЕЗОПАСНОСТЬ:
-- ============================================
-- - Gift cards данные защищены (никто не может прочитать)
-- - Success страница получает данные через URL, не из базы
-- - В базе хранятся полные данные (email, телефон) для админа
-- - На success странице показываются только: код, название, сумма, имя получателя
--
-- 💡 ДЛЯ ПРОСМОТРА GIFT CARDS:
-- Используй Supabase Dashboard → Table Editor
-- Или создай админ панель с service_role ключом
-- ============================================

-- ПРОВЕРКА: Убедись что политики применились
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('shoots', 'gift_cards')
ORDER BY tablename, policyname;
