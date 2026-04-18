-- Migration 018: Complete Production-Ready Gamification System
-- This migration ensures all gamification tables are properly set up with the correct constraints,
-- indexes, and functions for a production-ready system.

-- ============================================================================
-- USER XP TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_xp (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own XP" ON user_xp;
DROP POLICY IF EXISTS "Users can insert their XP" ON user_xp;
DROP POLICY IF EXISTS "Users can update their own XP" ON user_xp;

CREATE POLICY "Users can view their own XP" ON user_xp
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their XP" ON user_xp
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP" ON user_xp
FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);

-- ============================================================================
-- XP HISTORY TABLE (Prevents duplicate XP for same source)
-- ============================================================================
CREATE TABLE IF NOT EXISTS xp_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (
    source_type IN ('lesson', 'project', 'quiz', 'bonus', 'project_lesson')
    OR source_type LIKE 'lesson_level_%'
    OR source_type LIKE 'project_lesson_level_%'
    OR source_type LIKE 'project_lesson_part_%'
  ),
  source_id INTEGER,
  xp_earned INTEGER NOT NULL CHECK (xp_earned > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, source_type, source_id)
);

ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their XP history" ON xp_history;
DROP POLICY IF EXISTS "Users can insert their XP history" ON xp_history;

CREATE POLICY "Users can view their XP history" ON xp_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their XP history" ON xp_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_source ON xp_history(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at DESC);

-- ============================================================================
-- USER STREAKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert their streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can update their streak" ON user_streaks;

CREATE POLICY "Users can view their streak" ON user_streaks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their streak" ON user_streaks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their streak" ON user_streaks
FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- ============================================================================
-- BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('xp', 'streak', 'lesson', 'project', 'module')),
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
  icon TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view badges" ON badges;

CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

-- Clear and re-insert badges (production-ready set)
DELETE FROM badges WHERE title IN (
  'Spark Streak', 'Flame Streak', 'Super Streak', 'Hyper Streak', 'Mega Streak',
  'First Lesson Completed', 'XP Rookie', 'XP Climber', 'XP Champion',
  'Python Explorer', 'Data Explorer', 'First Builder', 'Project Master', 'Perfect Shot'
);

INSERT INTO badges (title, description, badge_type, requirement_value, icon) VALUES
-- 🔥 STREAK BADGES
('Spark Streak', 'Maintain a 3-day streak', 'streak', 3, '✨'),
('Flame Streak', 'Maintain a 7-day streak', 'streak', 7, '🔥'),
('Super Streak', 'Maintain a 14-day streak', 'streak', 14, '💥'),
('Inferno Streak', 'Maintain a 30-day streak', 'streak', 30, '🌋'),
('Eternal Flame', 'Maintain a 100-day streak', 'streak', 100, '🌟'),

-- 📚 LESSON BADGES
('First Step', 'Complete your first lesson', 'lesson', 1, '🏁'),
('Lesson Master', 'Complete 10 lessons', 'lesson', 10, '📚'),
('Lesson Legend', 'Complete 50 lessons', 'lesson', 50, '📖'),

-- ⭐ XP BADGES
('XP Seed', 'Earn 500 XP', 'xp', 500, '🌱'),
('XP Sprout', 'Earn 1000 XP', 'xp', 1000, '🌿'),
('XP Growth', 'Earn 2500 XP', 'xp', 2500, '🌳'),
('XP Climber', 'Reach 5000 XP', 'xp', 5000, '⛰️'),
('XP Summit', 'Reach 10000 XP', 'xp', 10000, '🏔️'),
('XP Legend', 'Reach 25000 XP', 'xp', 25000, '👑'),

-- 🚀 PROJECT BADGES
('Project Starter', 'Complete your first project', 'project', 1, '🚀'),
('Project Builder', 'Complete 5 projects', 'project', 5, '🏗️'),
('Project Master', 'Complete 10 projects', 'project', 10, '🏭')
ON CONFLICT (title) DO NOTHING;

-- ============================================================================
-- USER BADGES TABLE (Tracks earned badges)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert their badges" ON user_badges;

CREATE POLICY "Users can view their badges" ON user_badges
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their badges" ON user_badges
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- FUNCTION: award_xp (Award XP and update total)
-- ============================================================================
DROP FUNCTION IF EXISTS award_xp(UUID, INTEGER, TEXT, INTEGER);

CREATE FUNCTION award_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source_type TEXT,
  p_source_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
  xp_awarded INTEGER,
  total_xp INTEGER
) AS $$
DECLARE
  v_xp_awarded INTEGER := 0;
  v_total_xp INTEGER := 0;
BEGIN
  -- Guard against invalid input before we hit the xp_history constraint
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'award_xp requires a valid user_id';
  END IF;

  -- Insert into xp_history (if duplicate, it will be ignored)
  INSERT INTO xp_history (user_id, source_type, source_id, xp_earned)
  VALUES (p_user_id, p_source_type, p_source_id, p_xp_amount)
  ON CONFLICT (user_id, source_type, source_id) DO NOTHING;

  -- Check if the insert actually happened
  IF FOUND THEN
    v_xp_awarded := p_xp_amount;
  ELSE
    v_xp_awarded := 0;
  END IF;

  -- Calculate total XP
  SELECT COALESCE(SUM(xp_earned), 0)
  INTO v_total_xp
  FROM xp_history
  WHERE user_id = p_user_id;

  -- Upsert user_xp
  INSERT INTO user_xp (user_id, total_xp)
  VALUES (p_user_id, v_total_xp)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = v_total_xp,
    updated_at = CURRENT_TIMESTAMP;

  RETURN QUERY SELECT v_xp_awarded, v_total_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: update_streak (Update user streak)
-- ============================================================================
DROP FUNCTION IF EXISTS update_streak(UUID);

CREATE FUNCTION update_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_days_diff INTEGER;
BEGIN

  -- 🔥 FORCE CREATE ROW IF NOT EXISTS
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (p_user_id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  -- NOW SAFE SELECT
  SELECT us.last_activity_date, us.current_streak, us.longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM user_streaks us
  WHERE us.user_id = p_user_id;

  IF v_last_date IS NULL THEN
    v_current_streak := 1;
  ELSE
    v_days_diff := v_today - v_last_date;

    IF v_days_diff = 1 THEN
      v_current_streak := v_current_streak + 1;
    ELSIF v_days_diff > 1 THEN
      v_current_streak := 1;
    END IF;
  END IF;

  v_longest_streak := GREATEST(v_longest_streak, v_current_streak);

  UPDATE user_streaks
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: check_and_award_badges (Award eligible badges and return new ones)
-- ============================================================================
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

  -- Get completed lesson count
  SELECT COUNT(*) INTO v_lesson_count
  FROM xp_history
  WHERE user_id = p_user_id
    AND source_type = 'lesson';

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

-- ============================================================================
-- FUNCTION: get_user_gamification_data (Get complete user gamification state)
-- ============================================================================
DROP FUNCTION IF EXISTS get_user_gamification_data(UUID);

CREATE FUNCTION get_user_gamification_data(p_user_id UUID)
RETURNS TABLE (
  total_xp INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  badge_count INTEGER,
  last_activity_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ux.total_xp, 0)::INTEGER,
    COALESCE(us.current_streak, 0)::INTEGER,
    COALESCE(us.longest_streak, 0)::INTEGER,
    COALESCE((SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id), 0)::INTEGER,
    us.last_activity_date
  FROM user_xp ux
  FULL OUTER JOIN user_streaks us ON ux.user_id = us.user_id
  WHERE COALESCE(ux.user_id, us.user_id) = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================================================
-- VERIFY SCHEMA
-- ============================================================================
SELECT 'Gamification schema created successfully' AS status;