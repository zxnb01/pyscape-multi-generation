-- Migration 025: Add per-lesson part progress tracking
-- This migration creates a new table for tracking progress at the lesson part/level granularity.

CREATE TABLE IF NOT EXISTS lesson_part_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  part_level INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'not_started' CHECK (state IN ('not_started', 'in_progress', 'completed', 'failed')),
  score NUMERIC DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_position JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id, part_level)
);

CREATE INDEX IF NOT EXISTS idx_lesson_part_progress_user_id ON lesson_part_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_part_progress_lesson_id ON lesson_part_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_part_progress_state ON lesson_part_progress(state);

ALTER TABLE lesson_part_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own lesson part progress" ON lesson_part_progress;
DROP POLICY IF EXISTS "Users can insert their own lesson part progress" ON lesson_part_progress;
DROP POLICY IF EXISTS "Users can update their own lesson part progress" ON lesson_part_progress;

CREATE POLICY "Users can read their own lesson part progress"
  ON lesson_part_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson part progress"
  ON lesson_part_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson part progress"
  ON lesson_part_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can read all lesson part progress"
  ON lesson_part_progress
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

SELECT 'Lesson part progress tracking table created successfully' AS status;
