-- Track AI-generated lessons
-- Add skill_id column if it doesn't exist
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS skill_id UUID;

-- Add tracking columns for AI-generated content
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS generated_by VARCHAR(50);

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS generation_prompt TEXT;

-- Add foreign key constraint to skills table
ALTER TABLE public.lessons 
ADD CONSTRAINT fk_lessons_skill_id 
FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;

-- Index for filtering AI-generated lessons
CREATE INDEX IF NOT EXISTS idx_lessons_generated 
ON public.lessons(generated_by) 
WHERE generated_by IS NOT NULL;

-- Index for faster skill lookups
CREATE INDEX IF NOT EXISTS idx_lessons_skill_id 
ON public.lessons(skill_id);
