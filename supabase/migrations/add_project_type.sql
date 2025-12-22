-- Add project type and video-specific fields to shoots table

-- Add project_type column (defaults to 'photo_shoot' for existing records)
ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'photo_shoot'
CHECK (project_type IN ('photo_shoot', 'video_project', 'hybrid'));

-- Add video-specific columns
ALTER TABLE shoots
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status TEXT
CHECK (video_status IN ('draft', 'editing', 'review', 'final')),
ADD COLUMN IF NOT EXISTS revision_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN shoots.project_type IS 'Type of project: photo_shoot, video_project, or hybrid';
COMMENT ON COLUMN shoots.video_url IS 'URL for video deliverables (Google Drive, WeTransfer, etc.)';
COMMENT ON COLUMN shoots.video_status IS 'Video workflow status';
COMMENT ON COLUMN shoots.revision_notes IS 'Client revision notes for video projects';
