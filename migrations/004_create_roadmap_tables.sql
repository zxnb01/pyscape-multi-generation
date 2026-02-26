-- ============================================
-- ADAPTIVE SKILL GRAPH ROADMAP SYSTEM
-- Migration 004: Create Roadmap Tables
-- ============================================

-- 1. Skills Table (Core skill definitions)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('python', 'ml', 'dsa', 'ai')),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  estimated_minutes INTEGER DEFAULT 60,
  icon TEXT DEFAULT '📘',
  description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Skill Dependencies (DAG structure)
CREATE TABLE IF NOT EXISTS skill_dependencies (
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  depends_on UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, depends_on),
  CHECK (skill_id != depends_on), -- prevent self-loop
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient graph traversal
CREATE INDEX IF NOT EXISTS idx_skill_deps_skill ON skill_dependencies(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_deps_depends ON skill_dependencies(depends_on);

-- 3. User Skill Mastery (Progress tracking)
CREATE TABLE IF NOT EXISTS user_skill_mastery (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  mastery FLOAT DEFAULT 0.0 CHECK (mastery >= 0.0 AND mastery <= 1.0),
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'eligible', 'in_progress', 'mastered')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_user_mastery_user ON user_skill_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mastery_status ON user_skill_mastery(user_id, status);

-- 4. Lesson-Skill Mapping (Connect lessons to skills)
CREATE TABLE IF NOT EXISTS lesson_skills (
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  contribution FLOAT DEFAULT 0.3 CHECK (contribution >= 0.0 AND contribution <= 1.0),
  PRIMARY KEY (lesson_id, skill_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for lesson completion lookups
CREATE INDEX IF NOT EXISTS idx_lesson_skills_lesson ON lesson_skills(lesson_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment mastery safely (with cap at 1.0)
CREATE OR REPLACE FUNCTION increment_mastery(
  p_user_id UUID,
  p_skill_id UUID,
  p_delta FLOAT
)
RETURNS VOID AS $$
DECLARE
  v_new_mastery FLOAT;
  v_new_status TEXT;
BEGIN
  -- Calculate new mastery (capped at 1.0)
  SELECT LEAST(COALESCE(mastery, 0.0) + p_delta, 1.0)
  INTO v_new_mastery
  FROM user_skill_mastery
  WHERE user_id = p_user_id AND skill_id = p_skill_id;

  -- If no record exists, insert with initial mastery
  IF NOT FOUND THEN
    INSERT INTO user_skill_mastery (user_id, skill_id, mastery, status, started_at)
    VALUES (p_user_id, p_skill_id, LEAST(p_delta, 1.0), 
            CASE WHEN p_delta >= 0.75 THEN 'mastered'
                 WHEN p_delta > 0.0 THEN 'in_progress'
                 ELSE 'eligible' END,
            NOW());
    RETURN;
  END IF;

  -- Determine new status
  v_new_status := CASE
    WHEN v_new_mastery >= 0.75 THEN 'mastered'
    WHEN v_new_mastery > 0.0 THEN 'in_progress'
    ELSE 'eligible'
  END;

  -- Update existing record
  UPDATE user_skill_mastery
  SET mastery = v_new_mastery,
      status = v_new_status,
      updated_at = NOW(),
      started_at = COALESCE(started_at, NOW()),
      completed_at = CASE WHEN v_new_status = 'mastered' THEN NOW() ELSE completed_at END
  WHERE user_id = p_user_id AND skill_id = p_skill_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if all dependencies are mastered
CREATE OR REPLACE FUNCTION check_dependencies_met(
  p_user_id UUID,
  p_skill_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_unmet_count INTEGER;
BEGIN
  -- Count how many dependencies are NOT mastered
  SELECT COUNT(*)
  INTO v_unmet_count
  FROM skill_dependencies sd
  LEFT JOIN user_skill_mastery usm 
    ON sd.depends_on = usm.skill_id 
    AND usm.user_id = p_user_id
  WHERE sd.skill_id = p_skill_id
    AND (usm.status IS NULL OR usm.status != 'mastered');

  RETURN v_unmet_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_skills_updated ON skills;
CREATE TRIGGER trigger_skills_updated
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_user_mastery_updated ON user_skill_mastery;
CREATE TRIGGER trigger_user_mastery_updated
  BEFORE UPDATE ON user_skill_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE skills IS 'Core skill definitions forming the learning graph';
COMMENT ON TABLE skill_dependencies IS 'DAG structure - defines prerequisite relationships';
COMMENT ON TABLE user_skill_mastery IS 'User progress tracking per skill';
COMMENT ON TABLE lesson_skills IS 'Maps lessons to skills they contribute to';
COMMENT ON FUNCTION increment_mastery IS 'Safely increments user mastery for a skill';
COMMENT ON FUNCTION check_dependencies_met IS 'Checks if all prerequisites are mastered';
