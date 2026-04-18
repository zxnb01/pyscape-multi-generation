-- ============================================================================
-- ADD MISSING learning_point COLUMN TO quiz_questions
-- ============================================================================

-- Add learning_point column if it doesn't exist
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS learning_point TEXT;

-- Add explanation column if it doesn't exist (in case it's also missing)
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Add correct_option_index if it doesn't exist
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS correct_option_index INTEGER DEFAULT 0;

-- Create index for quiz_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);