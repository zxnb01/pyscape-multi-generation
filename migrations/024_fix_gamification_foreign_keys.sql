-- Migration 024: Fix Gamification Foreign Key Constraints
-- This migration fixes the foreign key constraints on gamification tables to reference auth.users instead of profiles

-- ============================================================================
-- FIX FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Drop the incorrect foreign key constraint on user_streaks
ALTER TABLE user_streaks DROP CONSTRAINT IF EXISTS user_streaks_user_id_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE user_streaks ADD CONSTRAINT user_streaks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the incorrect foreign key constraint on user_xp
ALTER TABLE user_xp DROP CONSTRAINT IF EXISTS user_xp_user_id_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE user_xp ADD CONSTRAINT user_xp_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the incorrect foreign key constraint on user_badges
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the incorrect foreign key constraint on xp_history
ALTER TABLE xp_history DROP CONSTRAINT IF EXISTS xp_history_user_id_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE xp_history ADD CONSTRAINT xp_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT 'Gamification foreign key constraints fixed' AS status;