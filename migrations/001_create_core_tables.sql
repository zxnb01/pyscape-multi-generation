-- Pyscape Database Schema Migration
-- Version: 1.0
-- Date: 2025-10-08
-- Description: Initial creation of core tables for the Pyscape learning platform
-- Prerequisites: Supabase project with auth schema and profiles table already created

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NOTE: The profiles table is already defined in the README, included here for reference
-- CREATE TABLE public.profiles (
--   id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
--   full_name TEXT,
--   gender TEXT,
--   role TEXT,
--   organization TEXT,
--   bio TEXT,
--   avatar_url TEXT,
--   profile_complete BOOLEAN DEFAULT FALSE,
--   onboarding_completed BOOLEAN DEFAULT FALSE,
--   selected_topics TEXT[],
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- If the profiles table exists but doesn't have selected_topics, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'selected_topics'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN selected_topics TEXT[] DEFAULT NULL;
        COMMENT ON COLUMN public.profiles.selected_topics IS 'Array of topic IDs selected by user during onboarding';
    END IF;
END $$;

-- =====================
-- 1. Modules Table
-- =====================
CREATE TABLE public.modules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    prerequisites INTEGER[] DEFAULT '{}',
    estimated_hours INTEGER,
    order_index INTEGER,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.modules IS 'Learning modules that form the curriculum';
COMMENT ON COLUMN public.modules.prerequisites IS 'Array of module IDs that should be completed before this one';
COMMENT ON COLUMN public.modules.tags IS 'Array of tags for topic matching';

-- =====================
-- 2. Lessons Table
-- =====================
CREATE TABLE public.lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('read', 'quiz', 'code', 'labTrigger')),
    content JSONB,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER,
    xp_reward INTEGER DEFAULT 50,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX lessons_module_id_idx ON public.lessons(module_id);

COMMENT ON TABLE public.lessons IS 'Individual lesson units within modules';
COMMENT ON COLUMN public.lessons.type IS 'Type of lesson: read (content), quiz (questions), code (problem), labTrigger (project)';
COMMENT ON COLUMN public.lessons.content IS 'Lesson content structure depends on type - read: markdown, quiz: questions array, code: problem definition';
COMMENT ON COLUMN public.lessons.xp_reward IS 'XP points earned for completing this lesson';

-- =====================
-- 3. Problems Table
-- =====================
CREATE TABLE public.problems (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    language TEXT NOT NULL,
    starter_code TEXT,
    solution_code TEXT,
    tests_public JSONB,
    tests_hidden JSONB,
    time_limit_ms INTEGER DEFAULT 5000,
    memory_limit_mb INTEGER DEFAULT 256,
    xp_reward INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX problems_lesson_id_idx ON public.problems(lesson_id);

COMMENT ON TABLE public.problems IS 'Coding problems for auto-grading';
COMMENT ON COLUMN public.problems.tests_public IS 'Public test cases shown to users';
COMMENT ON COLUMN public.problems.tests_hidden IS 'Hidden test cases for evaluation only';
COMMENT ON COLUMN public.problems.time_limit_ms IS 'Max execution time in ms';
COMMENT ON COLUMN public.problems.memory_limit_mb IS 'Max memory usage in MB';

-- =====================
-- 4. Submissions Table
-- =====================
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id INTEGER NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'passed', 'failed', 'error', 'timeout')),
    score NUMERIC DEFAULT 0,
    runtime_ms INTEGER,
    memory_used_kb INTEGER,
    test_results JSONB,
    stdout TEXT,
    stderr TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX submissions_user_id_idx ON public.submissions(user_id);
CREATE INDEX submissions_problem_id_idx ON public.submissions(problem_id);
CREATE INDEX submissions_status_idx ON public.submissions(status);
CREATE INDEX submissions_created_at_idx ON public.submissions(created_at);

COMMENT ON TABLE public.submissions IS 'User code submissions and grading results';
COMMENT ON COLUMN public.submissions.test_results IS 'Results of test case execution';
COMMENT ON COLUMN public.submissions.stdout IS 'Standard output from execution (may be truncated)';
COMMENT ON COLUMN public.submissions.stderr IS 'Standard error from execution (may be truncated)';

-- =====================
-- 5. Events Table
-- =====================
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX events_user_id_idx ON public.events(user_id);
CREATE INDEX events_type_idx ON public.events(type);
CREATE INDEX events_ts_idx ON public.events(ts);

COMMENT ON TABLE public.events IS 'Event tracking for analytics';
COMMENT ON COLUMN public.events.type IS 'Event type (interests_selected, roadmap_generated, lesson_completed, etc)';
COMMENT ON COLUMN public.events.meta IS 'Additional metadata for the event in JSON format';

-- =====================
-- 6. Progress Table
-- =====================
CREATE TABLE public.progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    state TEXT NOT NULL CHECK (state IN ('not_started', 'in_progress', 'completed', 'failed')),
    score NUMERIC DEFAULT 0,
    time_spent_sec INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_position JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX progress_user_id_idx ON public.progress(user_id);
CREATE INDEX progress_lesson_id_idx ON public.progress(lesson_id);
CREATE INDEX progress_state_idx ON public.progress(state);

COMMENT ON TABLE public.progress IS 'User progress tracking per lesson';
COMMENT ON COLUMN public.progress.score IS 'Score achieved (if applicable)';
COMMENT ON COLUMN public.progress.last_position IS 'Last position in lesson (e.g., scroll position, step)';

-- =====================
-- 7. Gamification Table
-- =====================
CREATE TABLE public.gamification (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]',
    streak_days INTEGER DEFAULT 0,
    streak_last_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.gamification IS 'User gamification data - points, badges, streaks';
COMMENT ON COLUMN public.gamification.badges IS 'Array of earned badges with dates';
COMMENT ON COLUMN public.gamification.streak_days IS 'Current learning streak in days';
COMMENT ON COLUMN public.gamification.streak_last_date IS 'Date of last activity for streak calculation';

-- =====================
-- 8. Projects Table
-- =====================
CREATE TABLE public.projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours INTEGER,
    steps JSONB NOT NULL,
    repo_template TEXT,
    xp_reward INTEGER DEFAULT 200,
    unlock_threshold INTEGER DEFAULT 500, 
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.projects IS 'Project lab definitions';
COMMENT ON COLUMN public.projects.steps IS 'Ordered array of project steps with validation criteria';
COMMENT ON COLUMN public.projects.repo_template IS 'Optional GitHub template repo URL';
COMMENT ON COLUMN public.projects.unlock_threshold IS 'XP required to unlock this project';

-- =====================
-- 9. Artifacts Table
-- =====================
CREATE TABLE public.artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    step INTEGER NOT NULL,
    description TEXT,
    s3_key TEXT,
    storage_path TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX artifacts_user_id_idx ON public.artifacts(user_id);
CREATE INDEX artifacts_project_id_idx ON public.artifacts(project_id);

COMMENT ON TABLE public.artifacts IS 'Saved outputs and artifacts from project steps';
COMMENT ON COLUMN public.artifacts.s3_key IS 'S3 key for stored artifact (if using S3)';
COMMENT ON COLUMN public.artifacts.storage_path IS 'Storage path for artifact (if using Supabase Storage)';
COMMENT ON COLUMN public.artifacts.metadata IS 'Additional metadata about the artifact (type, metrics, etc)';

-- =====================
-- 10. Recommendations Table
-- =====================
CREATE TABLE public.recommendations (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap JSONB NOT NULL,
    algorithm_version TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.recommendations IS 'Personalized module roadmaps for users';
COMMENT ON COLUMN public.recommendations.roadmap IS 'Generated roadmap with ordered modules and metadata';
COMMENT ON COLUMN public.recommendations.algorithm_version IS 'Version of algorithm used for generation';

-- =====================
-- 11. Create updated_at Triggers for All Tables
-- =====================

-- NOTE: This reuses the handle_updated_at function from the profiles table example
-- Verify the function exists or create it

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Create triggers for each table with updated_at
CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER problems_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER gamification_updated_at
  BEFORE UPDATE ON public.gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================
-- 12. Setup Row Level Security (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- 1. Modules RLS (public read access)
CREATE POLICY "Anyone can read published modules"
  ON public.modules
  FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admin users can CRUD modules"
  ON public.modules
  USING (auth.jwt() ->> 'role' = 'admin');

-- 2. Lessons RLS
CREATE POLICY "Anyone can read published lessons"
  ON public.lessons
  FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admin users can CRUD lessons"
  ON public.lessons
  USING (auth.jwt() ->> 'role' = 'admin');

-- 3. Problems RLS
CREATE POLICY "Anyone can read published problems"
  ON public.problems
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE lessons.id = problems.lesson_id 
    AND lessons.is_published = TRUE
  ));

CREATE POLICY "Admin users can CRUD problems"
  ON public.problems
  USING (auth.jwt() ->> 'role' = 'admin');

-- 4. Submissions RLS
CREATE POLICY "Users can read their own submissions"
  ON public.submissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can read all submissions"
  ON public.submissions
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Events RLS (sensitive)
CREATE POLICY "Users can insert their own events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can read all events"
  ON public.events
  USING (auth.jwt() ->> 'role' = 'admin');

-- 6. Progress RLS
CREATE POLICY "Users can read their own progress"
  ON public.progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own progress"
  ON public.progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can read all progress"
  ON public.progress
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- 7. Gamification RLS
CREATE POLICY "Users can read their own gamification data"
  ON public.gamification
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can update gamification data"
  ON public.gamification
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- 8. Projects RLS
CREATE POLICY "Anyone can read published projects"
  ON public.projects
  FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admin users can CRUD projects"
  ON public.projects
  USING (auth.jwt() ->> 'role' = 'admin');

-- 9. Artifacts RLS
CREATE POLICY "Users can read their own artifacts"
  ON public.artifacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own artifacts"
  ON public.artifacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can read all artifacts"
  ON public.artifacts
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- 10. Recommendations RLS
CREATE POLICY "Users can read their own recommendations"
  ON public.recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own recommendations"
  ON public.recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can read all recommendations"
  ON public.recommendations
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- =====================
-- 13. Initial Setup for Admin Role (if needed)
-- =====================

-- Create admin storage bucket for sensitive system files (optional)
-- CREATE STORAGE BUCKET admin_bucket;

-- This ensures only system admins can access certain files
-- CREATE POLICY "Admin users can access admin bucket" ON storage.objects 
--   FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin' AND bucket_id = 'admin_bucket');

-- =====================
-- End of Migration
-- =====================