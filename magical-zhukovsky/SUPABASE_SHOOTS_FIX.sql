-- Проверяем структуру таблицы shoots
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shoots'
ORDER BY ordinal_position;

-- Проверяем политики
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'shoots';
