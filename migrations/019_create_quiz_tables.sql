-- ============================================================================
-- QUIZ TABLES - Complete Schema for Quiz Generation
-- ============================================================================

-- ============================================================================
-- MODULE_QUIZZES TABLE
-- ============================================================================
-- Drop existing table if it has wrong schema (INTEGER id instead of UUID)
DROP TABLE IF EXISTS module_quizzes CASCADE;

CREATE TABLE module_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  description TEXT,
  num_questions INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  max_xp_reward INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_module_quizzes_module_id ON module_quizzes(module_id);

-- ============================================================================
-- QUIZ_QUESTIONS TABLE
-- ============================================================================
-- Drop existing table if it exists
DROP TABLE IF EXISTS quiz_questions CASCADE;

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  options JSONB NOT NULL DEFAULT '[]',
  correct_option_index INTEGER DEFAULT 0,
  explanation TEXT,
  learning_point TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- ============================================================================
-- USER_QUIZ_ATTEMPTS TABLE
-- ============================================================================
-- Drop existing table if it exists
DROP TABLE IF EXISTS user_quiz_attempts CASCADE;

CREATE TABLE user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 100,
  xp_earned INTEGER DEFAULT 0,
  streak_increased BOOLEAN DEFAULT false,
  answers JSONB,
  time_spent_sec INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user_id ON user_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_quiz_id ON user_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_completed_at ON user_quiz_attempts(completed_at);

-- ============================================================================
-- USER_QUIZ_PROGRESS TABLE (for resume functionality)
-- ============================================================================
-- Drop existing table if it exists
DROP TABLE IF EXISTS user_quiz_progress CASCADE;

CREATE TABLE user_quiz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  current_question_index INTEGER DEFAULT 0,
  answered_questions JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_quiz ON user_quiz_progress(user_id, quiz_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Module Quizzes (Public Read, Admin Write)
-- ============================================================================
-- Allow anyone to read published quizzes
CREATE POLICY "Public can read module quizzes"
  ON module_quizzes
  FOR SELECT
  USING (is_published = true);

-- Allow authenticated users to insert (for auto-generation)
CREATE POLICY "Authenticated users can create quizzes"
  ON module_quizzes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- RLS POLICIES - Quiz Questions (Public Read)
-- ============================================================================
-- Allow anyone to read quiz questions
CREATE POLICY "Public can read quiz questions"
  ON quiz_questions
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert questions"
  ON quiz_questions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- RLS POLICIES - User Quiz Attempts (User Specific)
-- ============================================================================
-- Users can only read their own attempts
CREATE POLICY "Users can read own quiz attempts"
  ON user_quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own quiz attempts"
  ON user_quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - User Quiz Progress (User Specific)
-- ============================================================================
-- Users can read and update their own progress
CREATE POLICY "Users can read own quiz progress"
  ON user_quiz_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz progress"
  ON user_quiz_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz progress"
  ON user_quiz_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA (Optional for testing)
-- ============================================================================
-- Insert sample quiz if needed
-- INSERT INTO module_quizzes (module_id, quiz_title, description, num_questions, passing_score, max_xp_reward)
-- VALUES ('module_id_here', 'Python Basics Quiz', 'A quiz to test your Python basics knowledge', 3, 70, 100);