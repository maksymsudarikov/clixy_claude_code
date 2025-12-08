-- Добавляем все недостающие колонки в таблицу shoots
ALTER TABLE shoots 
ADD COLUMN IF NOT EXISTS start_time TEXT,
ADD COLUMN IF NOT EXISTS end_time TEXT,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_map_url TEXT,
ADD COLUMN IF NOT EXISTS moodboard_url TEXT,
ADD COLUMN IF NOT EXISTS moodboard_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS call_sheet_url TEXT,
ADD COLUMN IF NOT EXISTS final_photos_url TEXT,
ADD COLUMN IF NOT EXISTS styling_url TEXT,
ADD COLUMN IF NOT EXISTS styling_notes TEXT,
ADD COLUMN IF NOT EXISTS hair_makeup_notes TEXT;

-- Проверяем что все колонки добавились
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shoots' 
ORDER BY ordinal_position;
