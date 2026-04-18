-- Migration 027: Fix Lesson-Level XP Source Types and Recalculate Totals
-- Ensures xp_history accepts lesson-level source types and reparses total XP from history.

-- Drop the existing source_type constraint if it exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relname = 'xp_history'
      AND relkind = 'r'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'xp_history'::regclass
        AND conname = 'xp_history_source_type_check'
    ) THEN
      ALTER TABLE xp_history DROP CONSTRAINT xp_history_source_type_check;
    END IF;
  END IF;
END
$$;

-- Create a corrected source_type check constraint.
ALTER TABLE xp_history
  ADD CONSTRAINT xp_history_source_type_check CHECK (
    source_type IN ('lesson', 'project', 'quiz', 'bonus', 'project_lesson')
    OR source_type LIKE 'lesson_level_%'
    OR source_type LIKE 'project_lesson_level_%'
    OR source_type LIKE 'project_lesson_part_%'
  );

-- Rebuild the xp_history index if needed.
CREATE INDEX IF NOT EXISTS idx_xp_history_source_type ON xp_history(source_type);

-- Recalculate the canonical total XP values for all users.
INSERT INTO user_xp (user_id, total_xp, updated_at)
SELECT
  user_id,
  COALESCE(SUM(xp_earned), 0) AS total_xp,
  CURRENT_TIMESTAMP
FROM xp_history
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE SET
  total_xp = EXCLUDED.total_xp,
  updated_at = EXCLUDED.updated_at;

-- Update badge counts to include lesson-level XP as lesson progress.
DROP FUNCTION IF EXISTS check_and_award_badges(UUID);

CREATE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE (
  badge_id BIGINT,
  title TEXT,
  icon TEXT
) AS $$
DECLARE
  v_total_xp INTEGER := 0;
  v_current_streak INTEGER := 0;
  v_lesson_count INTEGER := 0;
  v_project_count INTEGER := 0;
  v_badge RECORD;
BEGIN
  -- Get user's total XP
  SELECT COALESCE(total_xp, 0) INTO v_total_xp
  FROM user_xp WHERE user_id = p_user_id;

  -- Get user's current streak
  SELECT COALESCE(current_streak, 0) INTO v_current_streak
  FROM user_streaks WHERE user_id = p_user_id;

  -- Count completed lessons and lesson-level progress as lessons
  SELECT COUNT(*) INTO v_lesson_count
  FROM xp_history
  WHERE user_id = p_user_id
    AND (
      source_type = 'lesson'
      OR source_type LIKE 'lesson_level_%'
    );

  -- Count completed project activities as projects
  SELECT COUNT(DISTINCT source_id) INTO v_project_count
  FROM xp_history
  WHERE user_id = p_user_id
    AND (
      source_type = 'project'
      OR source_type LIKE 'project_lesson_%'
    )
    AND source_id IS NOT NULL;

  FOR v_badge IN
    SELECT b.id, b.title, b.icon
    FROM badges b
    WHERE
      (b.badge_type = 'xp' AND v_total_xp >= b.requirement_value)
      OR (b.badge_type = 'streak' AND v_current_streak >= b.requirement_value)
      OR (b.badge_type = 'lesson' AND v_lesson_count >= b.requirement_value)
      OR (b.badge_type = 'project' AND v_project_count >= b.requirement_value)
  LOOP
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user_id, v_badge.id
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id AND ub.badge_id = v_badge.id
    );

    IF FOUND THEN
      badge_id := v_badge.id;
      title := v_badge.title;
      icon := v_badge.icon;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

