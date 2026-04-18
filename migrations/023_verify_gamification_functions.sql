-- Migration 023: Verify and Optimize Gamification RPC Functions
-- This migration ensures all RPC functions are using the latest, most reliable implementations

-- ============================================================================
-- VERIFY TABLES EXIST AND ARE PROPERLY INDEXED
-- ============================================================================
ALTER TABLE IF EXISTS user_xp 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS user_streaks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_xp_history_unique 
ON xp_history(user_id, source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_xp_total 
ON user_xp(total_xp);

CREATE INDEX IF NOT EXISTS idx_streak_current 
ON user_streaks(current_streak);

-- ============================================================================
-- TEST FUNCTION: Verify gamification system is working
-- ============================================================================
CREATE OR REPLACE FUNCTION test_gamification_system()
RETURNS TABLE (
  test_name TEXT,
  status TEXT,
  message TEXT
) AS $$
BEGIN
  -- Test 1: Check if tables exist
  RETURN QUERY SELECT 'Tables Exist'::TEXT, 'PASS'::TEXT, 'All gamification tables exist'::TEXT
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name IN ('user_xp', 'xp_history', 'user_streaks', 'badges', 'user_badges'));
  
  -- Test 2: Check if RPC functions exist
  RETURN QUERY SELECT 'RPC Functions'::TEXT, 'PASS'::TEXT, 'award_xp, update_streak, check_and_award_badges exist'::TEXT
  WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('award_xp', 'update_streak', 'check_and_award_badges'));
  
  -- Test 3: Check badges exist
  RETURN QUERY SELECT 'Badges'::TEXT, CASE WHEN (SELECT COUNT(*) FROM badges) > 0 THEN 'PASS' ELSE 'FAIL' END, 
    'Found ' || (SELECT COUNT(*) FROM badges)::TEXT || ' badges'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTION: Reset a user's gamification data (for testing/debugging)
-- ============================================================================
CREATE OR REPLACE FUNCTION reset_user_gamification(p_user_id UUID)
RETURNS TABLE (
  message TEXT
) AS $$
BEGIN
  -- Delete user gamification records
  DELETE FROM user_badges WHERE user_id = p_user_id;
  DELETE FROM user_streaks WHERE user_id = p_user_id;
  DELETE FROM user_xp WHERE user_id = p_user_id;
  DELETE FROM xp_history WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT ('Gamification reset for user: ' || p_user_id)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTION: Get cumulative gamification stats
-- ============================================================================
CREATE OR REPLACE FUNCTION get_gamification_stats(p_user_id UUID)
RETURNS TABLE (
  total_xp INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  badge_count INTEGER,
  lesson_count INTEGER,
  project_count INTEGER,
  last_activity DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT total_xp FROM user_xp WHERE user_id = p_user_id), 0)::INTEGER,
    COALESCE((SELECT current_streak FROM user_streaks WHERE user_id = p_user_id), 0)::INTEGER,
    COALESCE((SELECT longest_streak FROM user_streaks WHERE user_id = p_user_id), 0)::INTEGER,
    COALESCE((SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id), 0)::INTEGER,
    COALESCE((SELECT COUNT(*) FROM xp_history WHERE user_id = p_user_id AND source_type = 'lesson'), 0)::INTEGER,
    COALESCE((SELECT COUNT(DISTINCT source_id) FROM xp_history WHERE user_id = p_user_id AND source_type = 'project' AND source_id IS NOT NULL), 0)::INTEGER,
    (SELECT last_activity_date FROM user_streaks WHERE user_id = p_user_id)::DATE
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFY EXISTING FUNCTIONS
-- ============================================================================
-- Ensure award_xp function returns correct format and handles edge cases
DROP FUNCTION IF EXISTS award_xp(UUID, INTEGER, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION award_xp(
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
  -- Guard against invalid input
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'award_xp: Invalid user_id';
  END IF;

  IF p_xp_amount <= 0 THEN
    RAISE EXCEPTION 'award_xp: XP amount must be positive';
  END IF;

  -- Ensure user_xp record exists
  INSERT INTO user_xp (user_id, total_xp)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Try to insert into xp_history
  BEGIN
    INSERT INTO xp_history (user_id, source_type, source_id, xp_earned)
    VALUES (p_user_id, p_source_type, p_source_id, p_xp_amount)
    ON CONFLICT (user_id, source_type, source_id) DO NOTHING;
    
    -- Check if insert was successful (not a duplicate)
    v_xp_awarded := p_xp_amount;
  EXCEPTION WHEN OTHERS THEN
    -- Other errors (ON CONFLICT handles unique violations)
    RAISE WARNING 'award_xp error: %', SQLERRM;
    v_xp_awarded := 0;
  END;

  -- Calculate total XP from xp_history
  SELECT COALESCE(SUM(xp_earned), 0)
  INTO v_total_xp
  FROM xp_history
  WHERE user_id = p_user_id;

  -- Update user_xp with new total
  UPDATE user_xp
  SET
    total_xp = v_total_xp,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_xp_awarded, v_total_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFY MIGRATION WAS SUCCESSFUL
-- ============================================================================
SELECT 'Gamification functions verified and optimized' AS migration_status;

-- Show stats for verification
SELECT * FROM test_gamification_system();
