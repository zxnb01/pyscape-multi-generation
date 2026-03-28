-- Migration: Store comprehensive lesson content with sublevels
-- This extends lessons to support multiple parts/sublevels per lesson

-- Update lessons table to support multiple parts
-- Each lesson can have multiple "levels" or "parts" stored as an array in JSONB

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS parts JSONB DEFAULT '[]';

COMMENT ON COLUMN public.lessons.parts IS 'Array of lesson parts/sublevels, each with title, content, examples, keyPoints, exercise';

-- Example structure for parts:
-- [
--   {
--     "level": 1,
--     "title": "Welcome to Python!",
--     "description": "...",
--     "content": "...",
--     "examples": [...],
--     "keyPoints": [...],
--     "exercise": {...}
--   },
--   {
--     "level": 2,
--     "title": "Your First Program",
--     ...
--   }
-- ]

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_published ON public.lessons(module_id, is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(type);
