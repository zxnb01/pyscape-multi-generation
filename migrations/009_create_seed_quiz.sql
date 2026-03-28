-- ============================================
-- SEED: Onboarding Quiz
-- Migration 009: Create quiz table and seed data
-- Also add missing column to profiles
-- ============================================

-- 1. Add onboarding_answers to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='onboarding_answers') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_answers JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Create Quiz Table
CREATE TABLE IF NOT EXISTS public.quiz (
    id SERIAL PRIMARY KEY,
    section VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.quiz ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so unauthenticated or newly authenticating users can take the quiz)
DROP POLICY IF EXISTS "Public read access to quiz" ON public.quiz;
CREATE POLICY "Public read access to quiz" ON public.quiz
    FOR SELECT USING (true);

-- 3. Seed Quiz Data
TRUNCATE public.quiz RESTART IDENTITY;

INSERT INTO public.quiz (section, question, options) VALUES
-- Section 1: Background
('Background', 'What is your current programming experience?', 
 '[
    {"text": "Beginner (No prior experience)", "is_correct": null},
    {"text": "Intermediate (Know some Python or other languages)", "is_correct": null},
    {"text": "Advanced (Comfortable building projects)", "is_correct": null}
  ]'::jsonb
),
('Background', 'What are your primary goals for learning Python?', 
 '[
    {"text": "Web Development (Django, Flask)", "is_correct": null},
    {"text": "Data Science & Analysis (Pandas, SQL)", "is_correct": null},
    {"text": "Machine Learning & AI (TensorFlow, PyTorch)", "is_correct": null},
    {"text": "General Automation & scripting", "is_correct": null}
  ]'::jsonb
),
('Background', 'How much time can you dedicate to learning per week?', 
 '[
    {"text": "Less than 2 hours", "is_correct": null},
    {"text": "2 to 5 hours", "is_correct": null},
    {"text": "More than 5 hours", "is_correct": null}
  ]'::jsonb
),

-- Section 2: Skill Quiz (used to evaluate starting level)
('Skill Quiz', 'Which of the following is a valid Python data type?', 
 '[
    {"text": "Array", "is_correct": false},
    {"text": "Vector", "is_correct": false},
    {"text": "Dictionary", "is_correct": true},
    {"text": "Hash", "is_correct": false}
  ]'::jsonb
),
('Skill Quiz', 'How do you define a function in Python?', 
 '[
    {"text": "function myFunc():", "is_correct": false},
    {"text": "def myFunc():", "is_correct": true},
    {"text": "myFunc def():", "is_correct": false},
    {"text": "define myFunc():", "is_correct": false}
  ]'::jsonb
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT id, section, question FROM public.quiz;

DO $$
BEGIN
    RAISE NOTICE '✅ Successfully created and seeded the quiz table and updated profiles!';
END $$;
