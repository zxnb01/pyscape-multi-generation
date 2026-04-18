-- Migration 029: Fix lesson badge counting to use progress table instead of xp_history
-- This fixes the issue where lesson badges were awarded for level completions instead of full lesson completions.

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
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

  -- Get completed lesson count from progress table (full lesson completions)
  SELECT COUNT(*) INTO v_lesson_count
  FROM progress
  WHERE user_id = p_user_id
    AND state = 'completed';

  -- Get completed project count
  SELECT COUNT(DISTINCT source_id) INTO v_project_count
  FROM xp_history
  WHERE user_id = p_user_id
    AND source_type = 'project'
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

SELECT 'Lesson badge counting fixed to use progress table' AS status;