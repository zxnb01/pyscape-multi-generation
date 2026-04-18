-- ============================================================================
-- QUIZ RPC FUNCTIONS - Critical Missing Procedures
-- ============================================================================
-- This migration adds the 3 essential RPC functions for quiz functionality
-- These functions were called in quizService.js but were missing from the database

-- ============================================================================
-- RPC: Can User Access Quiz
-- ============================================================================
-- Check if user has completed all lessons in a module and can take the quiz
DROP FUNCTION IF EXISTS can_user_access_quiz(UUID, UUID);
DROP FUNCTION IF EXISTS can_user_access_quiz(UUID, INTEGER);

CREATE OR REPLACE FUNCTION can_user_access_quiz(
  p_user_id UUID,
  p_module_id INTEGER
)
RETURNS TABLE(can_access BOOLEAN, reason TEXT, total_lessons INTEGER, completed_lessons INTEGER) AS $$
DECLARE
  v_module_lessons_count INTEGER;
  v_user_completed_count INTEGER;
BEGIN
  -- Get total lessons in module
  SELECT COUNT(*) INTO v_module_lessons_count
  FROM lessons
  WHERE module_id = p_module_id;

  -- Get completed lessons for this user in this module (using progress table)
  SELECT COUNT(*) INTO v_user_completed_count
  FROM progress p
  JOIN lessons l ON p.lesson_id = l.id
  WHERE p.user_id = p_user_id
    AND l.module_id = p_module_id
    AND p.state = 'completed';

  -- User can access quiz if they completed all lessons OR if no lessons exist
  IF v_module_lessons_count = 0 OR v_user_completed_count >= v_module_lessons_count THEN
    RETURN QUERY SELECT true, 'User has completed all lessons'::TEXT, v_module_lessons_count, v_user_completed_count;
  ELSE
    RETURN QUERY SELECT false, CONCAT('Complete ', (v_module_lessons_count - v_user_completed_count), ' more lessons')::TEXT, v_module_lessons_count, v_user_completed_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: Submit Quiz Attempt
-- ============================================================================
-- Submit quiz answers, calculate score, award XP, and update streak
-- Drop old conflicting versions first
DROP FUNCTION IF EXISTS submit_quiz_attempt(UUID, UUID, JSONB, INTEGER);
DROP FUNCTION IF EXISTS submit_quiz_attempt(UUID, BIGINT, JSONB, INTEGER);

CREATE OR REPLACE FUNCTION submit_quiz_attempt(
  p_user_id UUID,
  p_quiz_id UUID,
  p_answers JSONB,
  p_time_spent_sec INTEGER DEFAULT 0
)
RETURNS TABLE(
  score INTEGER,
  correct_count INTEGER,
  total_count INTEGER,
  is_passing BOOLEAN,
  xp_earned INTEGER,
  max_score INTEGER
) AS $$
DECLARE
  v_score INTEGER;
  v_correct_count INTEGER;
  v_total_questions INTEGER;
  v_max_xp_reward INTEGER;
  v_xp_to_award INTEGER;
  v_passing_score INTEGER;
  v_is_passing BOOLEAN;
  v_attempt_id UUID;
  v_module_id INTEGER;
  v_question_id UUID;
  v_user_selected_index INTEGER;
  v_correct_index INTEGER;
BEGIN
  -- Get quiz info
  SELECT mq.passing_score, mq.max_xp_reward, mq.module_id
  INTO v_passing_score, v_max_xp_reward, v_module_id
  FROM module_quizzes mq
  WHERE mq.id = p_quiz_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz not found: %', p_quiz_id;
  END IF;

  -- Get total questions
  SELECT COUNT(*) INTO v_total_questions
  FROM quiz_questions
  WHERE quiz_id = p_quiz_id;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'No questions found in quiz: %', p_quiz_id;
  END IF;

  -- Process each answer and count correct responses
  v_correct_count := 0;

  FOR v_question_id, v_user_selected_index IN
    SELECT 
      qq.id,
      (p_answers ->> qq.id::text)::INTEGER
    FROM quiz_questions qq
    WHERE qq.quiz_id = p_quiz_id
  LOOP
    -- Get correct option index for this question
    SELECT qq.correct_option_index INTO v_correct_index
    FROM quiz_questions qq
    WHERE qq.id = v_question_id;

    -- Check if user selected correct answer
    IF v_user_selected_index IS NOT NULL AND v_user_selected_index = v_correct_index THEN
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;

  -- Calculate score as percentage
  v_score := CASE WHEN v_total_questions > 0 
    THEN (v_correct_count * 100) / v_total_questions 
    ELSE 0 
  END;

  -- Determine if passing
  v_is_passing := v_score >= v_passing_score;

  -- Calculate XP (only award if passing)
  v_xp_to_award := CASE WHEN v_is_passing
    THEN (v_score * v_max_xp_reward) / 100
    ELSE 0
  END;

  -- Record the attempt
  INSERT INTO user_quiz_attempts (
    user_id, quiz_id, score, max_score, xp_earned, 
    time_spent_sec, answers, completed_at
  ) VALUES (
    p_user_id, p_quiz_id, v_score, 100, v_xp_to_award,
    p_time_spent_sec, p_answers, NOW()
  ) RETURNING id INTO v_attempt_id;

  -- Award XP if passing (use module_id as source_id for quiz)
  IF v_is_passing AND v_xp_to_award > 0 THEN
    PERFORM award_xp(
      p_user_id,
      v_xp_to_award,
      'quiz',
      v_module_id  -- Use module_id (INTEGER) instead of quiz_id (UUID)
    );
    
    -- Update streak after passing quiz
    PERFORM update_streak(p_user_id);
  END IF;

  RETURN QUERY SELECT 
    v_score, 
    v_correct_count,
    v_total_questions,
    v_is_passing,
    v_xp_to_award,
    100;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: Get User Best Quiz Score
-- ============================================================================
-- Retrieve the best score a user achieved on a specific quiz
DROP FUNCTION IF EXISTS get_user_best_quiz_score(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_best_quiz_score(UUID, BIGINT);

CREATE OR REPLACE FUNCTION get_user_best_quiz_score(
  p_user_id UUID,
  p_quiz_id UUID
)
RETURNS TABLE(
  best_score INTEGER,
  attempts_count INTEGER,
  is_passing BOOLEAN,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  first_attempt_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_passing_score INTEGER;
  v_best_score INTEGER;
BEGIN
  -- Get passing score for this quiz
  SELECT mq.passing_score INTO v_passing_score
  FROM module_quizzes mq
  WHERE mq.id = p_quiz_id;

  IF NOT FOUND THEN
    v_passing_score := 70;
  END IF;

  -- Get best score
  SELECT MAX(uqa.score) INTO v_best_score
  FROM user_quiz_attempts uqa
  WHERE uqa.user_id = p_user_id
    AND uqa.quiz_id = p_quiz_id;

  RETURN QUERY
  SELECT 
    COALESCE(v_best_score, 0)::INTEGER as best_score,
    COUNT(*)::INTEGER as attempts_count,
    (COALESCE(v_best_score, 0) >= v_passing_score)::BOOLEAN as is_passing,
    MAX(uqa.completed_at) as last_attempt_at,
    MIN(uqa.completed_at) as first_attempt_at
  FROM user_quiz_attempts uqa
  WHERE uqa.user_id = p_user_id
    AND uqa.quiz_id = p_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Optional: RPC for Getting Quiz Attempts History
-- ============================================================================
-- Get all attempts for a user on a quiz with full details
DROP FUNCTION IF EXISTS get_quiz_attempts_history(UUID, UUID);
DROP FUNCTION IF EXISTS get_quiz_attempts_history(UUID, BIGINT);

CREATE OR REPLACE FUNCTION get_quiz_attempts_history(
  p_user_id UUID,
  p_quiz_id UUID
)
RETURNS TABLE(
  attempt_id UUID,
  score INTEGER,
  xp_earned INTEGER,
  time_spent_sec INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_passing BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uqa.id,
    uqa.score,
    uqa.xp_earned,
    uqa.time_spent_sec,
    uqa.completed_at,
    (uqa.score >= mq.passing_score)::BOOLEAN
  FROM user_quiz_attempts uqa
  JOIN module_quizzes mq ON uqa.quiz_id = mq.id
  WHERE uqa.user_id = p_user_id
    AND uqa.quiz_id = p_quiz_id
  ORDER BY uqa.completed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant permissions to authenticated users
-- ============================================================================
GRANT EXECUTE ON FUNCTION can_user_access_quiz(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_quiz_attempt(UUID, UUID, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_best_quiz_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quiz_attempts_history(UUID, UUID) TO authenticated;