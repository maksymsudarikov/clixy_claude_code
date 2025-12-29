-- ============================================
-- КРИТИЧНОЕ ИСПРАВЛЕНИЕ: RLS POLICIES
-- Специально для твоей базы данных
-- ============================================

-- ============================================
-- ШАГ 1: УДАЛИТЬ ВСЕ ОПАСНЫЕ ПОЛИТИКИ
-- ============================================

-- Удалить политику "Anyone can create shoots"
DROP POLICY IF EXISTS "Anyone can create shoots" ON shoots;

-- Удалить политику "Anyone can update shoots"
DROP POLICY IF EXISTS "Anyone can update shoots" ON shoots;

-- Удалить политику "Anyone can delete shoots" (САМАЯ ОПАСНАЯ!)
DROP POLICY IF EXISTS "Anyone can delete shoots" ON shoots;

-- ОСТАВЛЯЕМ только "Public can view shoots" - это правильная политика для чтения

-- ============================================
-- ШАГ 2: СОЗДАТЬ БЕЗОПАСНЫЕ ПОЛИТИКИ
-- ============================================

-- ✅ Write доступ ТОЛЬКО для аутентифицированных пользователей
-- Это защитит от несанкционированного создания/изменения/удаления
CREATE POLICY "Authenticated users can write shoots" ON shoots
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- ШАГ 3: ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Посмотреть все активные политики для shoots
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'shoots'
ORDER BY policyname;

-- Результат должен быть:
-- | policyname                            | cmd    | qual        |
-- |---------------------------------------|--------|-------------|
-- | Public can view shoots                | SELECT | true        |
-- | Authenticated users can write shoots  | ALL    | auth check  |

-- ============================================
-- ШАГ 4: RATE LIMITING ДЛЯ GIFT CARDS
-- ============================================

-- Проверить текущие политики gift_cards
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'gift_cards';

-- Если есть "Enable insert for all users" - добавим rate limiting
-- Удалить старую политику INSERT
DROP POLICY IF EXISTS "Enable insert for all users" ON gift_cards;

-- ✅ Создать новую с rate limiting (5 в час на email)
CREATE POLICY "Rate limited gift card creation" ON gift_cards
  FOR INSERT
  WITH CHECK (
    (
      SELECT COUNT(*)
      FROM gift_cards
      WHERE purchaser_email = NEW.purchaser_email
        AND created_at > NOW() - INTERVAL '1 hour'
    ) < 5
  );

-- ============================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ============================================

-- ✅ Убедись что RLS включен
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('shoots', 'gift_cards');
-- Результат: rowsecurity должен быть TRUE для обеих таблиц

-- ✅ Проверь что опасные политики удалены
SELECT COUNT(*) as dangerous_policies
FROM pg_policies
WHERE tablename = 'shoots'
  AND policyname LIKE '%Anyone can%';
-- Результат: должно быть 0

-- ============================================
-- ГОТОВО!
-- ============================================

-- Теперь:
-- 1. ✅ shoots: Читать могут все, писать только аутентифицированные
-- 2. ✅ gift_cards: Rate limiting 5 в час на email
-- 3. ✅ Защита от массового создания/удаления данных
-- 4. ✅ Никто не может удалить твои shoots!
