-- ============================================
-- SEED: Python Domain Skills with Dependencies
-- Migration 005: Initial Python Skill Graph
-- ============================================

-- ============================================
-- CREATE TEST USER (for development)
-- ============================================
-- profiles.id references auth.users(id), so we must create
-- the auth user first, then the profile.

-- Step 1: Create test user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev@pyscape.test',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dev User"}',
  false,
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create profile for the test user
INSERT INTO public.profiles (id, full_name, nickname, role, profile_complete, onboarding_completed, selected_topics, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dev User',
  'DevUser',
  'student',
  true,
  true,
  ARRAY['python', 'web-development'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Clear existing data (for clean re-seeding)
TRUNCATE skill_dependencies, lesson_skills, user_skill_mastery, skills CASCADE;

-- ============================================
-- FOUNDATIONAL SKILLS (No dependencies)
-- ============================================

INSERT INTO skills (id, name, domain, difficulty, estimated_minutes, icon, description) VALUES
-- Tier 1: Absolute Basics
('11111111-1111-1111-1111-111111111101', 'Python Syntax Basics', 'python', 1, 45, '🐍', 'Variables, print statements, basic data types'),
('11111111-1111-1111-1111-111111111102', 'Basic Math Operations', 'python', 1, 30, '➕', 'Arithmetic operators, operator precedence'),
('11111111-1111-1111-1111-111111111103', 'Strings and Text', 'python', 1, 45, '📝', 'String manipulation, concatenation, formatting');

-- ============================================
-- INTERMEDIATE FUNDAMENTALS
-- ============================================

INSERT INTO skills (id, name, domain, difficulty, estimated_minutes, icon, description) VALUES
-- Tier 2: Control Flow
('11111111-1111-1111-1111-111111111201', 'Boolean Logic', 'python', 2, 40, '✅', 'True/False, comparison operators, logical operators'),
('11111111-1111-1111-1111-111111111202', 'If-Else Statements', 'python', 2, 50, '🔀', 'Conditional execution, elif chains'),
('11111111-1111-1111-1111-111111111203', 'Loops - While', 'python', 2, 60, '🔁', 'While loops, break, continue'),
('11111111-1111-1111-1111-111111111204', 'Loops - For', 'python', 2, 60, '🔄', 'For loops, range, iteration'),

-- Tier 3: Data Structures
('11111111-1111-1111-1111-111111111301', 'Lists', 'python', 2, 70, '📋', 'List creation, indexing, slicing, methods'),
('11111111-1111-1111-1111-111111111302', 'Tuples', 'python', 2, 40, '📦', 'Immutable sequences, tuple unpacking'),
('11111111-1111-1111-1111-111111111303', 'Dictionaries', 'python', 2, 70, '📚', 'Key-value pairs, dictionary methods'),
('11111111-1111-1111-1111-111111111304', 'Sets', 'python', 2, 50, '🎯', 'Unique collections, set operations'),

-- Tier 4: Functions
('11111111-1111-1111-1111-111111111401', 'Functions Basics', 'python', 2, 60, '⚙️', 'Function definition, parameters, return values'),
('11111111-1111-1111-1111-111111111402', 'Function Arguments', 'python', 3, 50, '🎛️', 'Args, kwargs, default parameters'),
('11111111-1111-1111-1111-111111111403', 'Lambda Functions', 'python', 3, 40, 'λ', 'Anonymous functions, functional programming'),
('11111111-1111-1111-1111-111111111404', 'Scope and Closures', 'python', 3, 50, '🔒', 'Variable scope, nested functions, closures');

-- ============================================
-- ADVANCED PYTHON
-- ============================================

INSERT INTO skills (id, name, domain, difficulty, estimated_minutes, icon, description) VALUES
-- Tier 5: Advanced Data Structures
('11111111-1111-1111-1111-111111111501', 'List Comprehensions', 'python', 3, 60, '⚡', 'Compact list creation, filtering, mapping'),
('11111111-1111-1111-1111-111111111502', 'Generators', 'python', 4, 70, '🌊', 'Yield, lazy evaluation, memory efficiency'),
('11111111-1111-1111-1111-111111111503', 'Iterators', 'python', 3, 50, '↪️', 'iter(), next(), custom iterators'),

-- Tier 6: Object-Oriented Programming
('11111111-1111-1111-1111-111111111601', 'Classes and Objects', 'python', 3, 80, '🏗️', 'Class definition, instantiation, self'),
('11111111-1111-1111-1111-111111111602', 'Inheritance', 'python', 4, 70, '👨‍👦', 'Class inheritance, super(), method overriding'),
('11111111-1111-1111-1111-111111111603', 'Magic Methods', 'python', 4, 60, '✨', '__init__, __str__, __repr__, operator overloading'),
('11111111-1111-1111-1111-111111111604', 'Class Design Patterns', 'python', 4, 90, '🎨', 'Singleton, factory, decorator patterns'),

-- Tier 7: Error Handling & Files
('11111111-1111-1111-1111-111111111701', 'Exception Handling', 'python', 3, 60, '🛡️', 'Try-except, raising exceptions, custom exceptions'),
('11111111-1111-1111-1111-111111111702', 'File Operations', 'python', 3, 70, '📁', 'Reading, writing, context managers'),
('11111111-1111-1111-1111-111111111703', 'Working with JSON', 'python', 3, 50, '📊', 'JSON parsing, serialization, APIs'),

-- Tier 8: Advanced Concepts
('11111111-1111-1111-1111-111111111801', 'Decorators', 'python', 4, 80, '🎭', 'Function decorators, wrapping functions'),
('11111111-1111-1111-1111-111111111802', 'Context Managers', 'python', 4, 60, '🚪', 'with statement, __enter__, __exit__'),
('11111111-1111-1111-1111-111111111803', 'Regular Expressions', 'python', 4, 90, '🔍', 'Pattern matching, regex syntax, re module'),

-- Tier 9: Libraries & Tools
('11111111-1111-1111-1111-111111111901', 'NumPy Fundamentals', 'python', 3, 100, '🔢', 'Arrays, vectorization, numerical computing'),
('11111111-1111-1111-1111-111111111902', 'Pandas Basics', 'python', 4, 120, '🐼', 'DataFrames, data manipulation, analysis'),
('11111111-1111-1111-1111-111111111903', 'Virtual Environments', 'python', 2, 40, '📦', 'venv, pip, dependency management');

-- ============================================
-- SKILL DEPENDENCIES (DAG Structure)
-- ============================================

-- Tier 2 depends on Tier 1
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111101'), -- Boolean Logic needs Syntax
('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111102'), -- Boolean Logic needs Math
('11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111201'), -- If-Else needs Boolean Logic
('11111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111202'), -- While needs If-Else
('11111111-1111-1111-1111-111111111204', '11111111-1111-1111-1111-111111111203'); -- For needs While

-- Tier 3 depends on basics + loops
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111204'), -- Lists need For loops
('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111301'), -- Tuples need Lists
('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111204'), -- Dicts need For loops
('11111111-1111-1111-1111-111111111304', '11111111-1111-1111-1111-111111111301'); -- Sets need Lists

-- Tier 4 depends on control flow + data structures
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111202'), -- Functions need If-Else
('11111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111301'), -- Functions need Lists
('11111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111401'), -- Advanced args need Functions
('11111111-1111-1111-1111-111111111403', '11111111-1111-1111-1111-111111111401'), -- Lambda needs Functions
('11111111-1111-1111-1111-111111111404', '11111111-1111-1111-1111-111111111402'); -- Closures need Advanced args

-- Tier 5 depends on functions + data structures
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111501', '11111111-1111-1111-1111-111111111301'), -- List comp needs Lists
('11111111-1111-1111-1111-111111111501', '11111111-1111-1111-1111-111111111403'), -- List comp needs Lambda
('11111111-1111-1111-1111-111111111502', '11111111-1111-1111-1111-111111111401'), -- Generators need Functions
('11111111-1111-1111-1111-111111111503', '11111111-1111-1111-1111-111111111502'); -- Iterators need Generators

-- Tier 6 depends on functions
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111601', '11111111-1111-1111-1111-111111111401'), -- Classes need Functions
('11111111-1111-1111-1111-111111111601', '11111111-1111-1111-1111-111111111303'), -- Classes need Dicts
('11111111-1111-1111-1111-111111111602', '11111111-1111-1111-1111-111111111601'), -- Inheritance needs Classes
('11111111-1111-1111-1111-111111111603', '11111111-1111-1111-1111-111111111601'), -- Magic methods need Classes
('11111111-1111-1111-1111-111111111604', '11111111-1111-1111-1111-111111111602'); -- Patterns need Inheritance

-- Tier 7 depends on basics
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111701', '11111111-1111-1111-1111-111111111202'), -- Exceptions need If-Else
('11111111-1111-1111-1111-111111111702', '11111111-1111-1111-1111-111111111701'), -- Files need Exceptions
('11111111-1111-1111-1111-111111111702', '11111111-1111-1111-1111-111111111103'), -- Files need Strings
('11111111-1111-1111-1111-111111111703', '11111111-1111-1111-1111-111111111702'), -- JSON needs Files
('11111111-1111-1111-1111-111111111703', '11111111-1111-1111-1111-111111111303'); -- JSON needs Dicts

-- Tier 8 depends on advanced concepts
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111801', '11111111-1111-1111-1111-111111111404'), -- Decorators need Closures
('11111111-1111-1111-1111-111111111802', '11111111-1111-1111-1111-111111111601'), -- Context managers need Classes
('11111111-1111-1111-1111-111111111802', '11111111-1111-1111-1111-111111111701'), -- Context managers need Exceptions
('11111111-1111-1111-1111-111111111803', '11111111-1111-1111-1111-111111111103'); -- Regex needs Strings

-- Tier 9 depends on multiple advanced skills
INSERT INTO skill_dependencies (skill_id, depends_on) VALUES
('11111111-1111-1111-1111-111111111901', '11111111-1111-1111-1111-111111111301'), -- NumPy needs Lists
('11111111-1111-1111-1111-111111111901', '11111111-1111-1111-1111-111111111501'), -- NumPy needs List comp
('11111111-1111-1111-1111-111111111902', '11111111-1111-1111-1111-111111111901'), -- Pandas needs NumPy
('11111111-1111-1111-1111-111111111902', '11111111-1111-1111-1111-111111111303'), -- Pandas needs Dicts
('11111111-1111-1111-1111-111111111903', '11111111-1111-1111-1111-111111111401'); -- Venv needs Functions

-- ============================================
-- INITIALIZE TEST USER (for development)
-- ============================================
-- Note: Using a test UUID that matches the dev bypass in AuthContext
-- If you're using real authentication, remove or update this section

-- Give first 3 skills "mastered" status for test user
INSERT INTO user_skill_mastery (user_id, skill_id, mastery, status, completed_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', 1.0, 'mastered', NOW()),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111102', 1.0, 'mastered', NOW()),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111103', 0.85, 'mastered', NOW());

-- Mark next tier as eligible
INSERT INTO user_skill_mastery (user_id, skill_id, mastery, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111201', 0.0, 'eligible'),
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111202', 0.0, 'locked');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count skills per domain
SELECT domain, COUNT(*) as skill_count
FROM skills
GROUP BY domain
ORDER BY domain;

-- Verify no circular dependencies (should return 0)
WITH RECURSIVE skill_path AS (
  SELECT skill_id, depends_on, ARRAY[skill_id, depends_on] as path
  FROM skill_dependencies
  UNION ALL
  SELECT sp.skill_id, sd.depends_on, sp.path || sd.depends_on
  FROM skill_path sp
  JOIN skill_dependencies sd ON sp.depends_on = sd.skill_id
  WHERE sd.depends_on = ANY(sp.path) -- detect cycle
)
SELECT COUNT(*) as circular_deps FROM skill_path WHERE depends_on = ANY(path);

-- Show root skills (no dependencies)
SELECT s.name, s.difficulty, s.icon
FROM skills s
LEFT JOIN skill_dependencies sd ON s.id = sd.skill_id
WHERE sd.skill_id IS NULL
ORDER BY s.difficulty, s.name;
