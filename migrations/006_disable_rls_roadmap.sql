-- ============================================
-- Disable RLS on Roadmap Tables (Development)
-- Migration 006: Allow public access for development
-- ============================================
-- Note: In production, you should create proper RLS policies
-- instead of disabling RLS entirely.

-- Disable RLS on all roadmap tables
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE skill_dependencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_mastery DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_skills DISABLE ROW LEVEL SECURITY;

-- Verification: Show RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('skills', 'skill_dependencies', 'user_skill_mastery', 'lesson_skills')
ORDER BY tablename;
