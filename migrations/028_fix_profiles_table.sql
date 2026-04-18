-- Migration 028: Fix profiles table schema
-- Ensure profile build columns exist and remove deprecated nickname column.

DO $$
BEGIN
    -- Remove old nickname column if present
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'nickname'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN nickname;
    END IF;

    -- Ensure the profile columns required by ProfileBuild exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN organization TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'profile_complete'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
          AND column_name = 'selected_topics'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN selected_topics TEXT[] DEFAULT NULL;
        COMMENT ON COLUMN public.profiles.selected_topics IS 'Array of topic IDs selected by user during onboarding';
    END IF;
END $$;
