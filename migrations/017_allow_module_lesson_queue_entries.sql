-- Migration 017: Allow module-topic-first queue entries without a skill_id
-- Purpose: Track generation_queue rows for module lessons using lesson_id while keeping skill-based rows intact.

ALTER TABLE generation_queue
  ALTER COLUMN skill_id DROP NOT NULL;

ALTER TABLE generation_queue
  ADD COLUMN IF NOT EXISTS lesson_id BIGINT NULL REFERENCES lessons(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_generation_queue_lesson_level ON generation_queue(lesson_id, level);
CREATE INDEX IF NOT EXISTS idx_generation_queue_module_lesson_level ON generation_queue(module_id, lesson_id, level);
