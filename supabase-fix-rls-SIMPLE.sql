-- ============================================
-- КРИТИЧНОЕ ИСПРАВЛЕНИЕ: RLS POLICIES (УПРОЩЕННАЯ ВЕРСИЯ)
-- Без сложных проверок, которые могут вызвать ошибки
-- ============================================

-- ============================================
-- ШАГ 1: УДАЛИТЬ ОПАСНЫЕ ПОЛИТИКИ ДЛЯ SHOOTS
-- ============================================

DROP POLICY IF EXISTS "Anyone can create shoots" ON shoots;
DROP POLICY IF EXISTS "Anyone can update shoots" ON shoots;
DROP POLICY IF EXISTS "Anyone can delete shoots" ON shoots;

-- ============================================
-- ШАГ 2: СОЗДАТЬ БЕЗОПАСНУЮ ПОЛИТИКУ ДЛЯ SHOOTS
-- ============================================

-- ✅ Write доступ ТОЛЬКО для аутентифицированных
CREATE POLICY "Authenticated users can write shoots" ON shoots
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- ШАГ 3: ПРОВЕРКА
-- ============================================

-- Посмотреть все политики для shoots
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'shoots'
ORDER BY policyname;

-- Должно быть:
-- | policyname                           | cmd    | qual                       |
-- |--------------------------------------|--------|----------------------------|
-- | Public can view shoots               | SELECT | true                       |
-- | Authenticated users can write shoots | ALL    | auth.role() = 'authenticated' |
