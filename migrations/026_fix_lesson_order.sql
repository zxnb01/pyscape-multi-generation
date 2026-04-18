-- Migration: Fix lesson order_index to be sequential per module
-- This ensures lessons display in the correct order

-- Update order_index to be sequential within each module
WITH ordered_lessons AS (
  SELECT
    id,
    module_id,
    ROW_NUMBER() OVER (PARTITION BY module_id ORDER BY id) as new_order
  FROM public.lessons
  WHERE is_published = true
)
UPDATE public.lessons
SET order_index = ordered_lessons.new_order
FROM ordered_lessons
WHERE public.lessons.id = ordered_lessons.id;

-- Verification
SELECT module_id, id, title, order_index
FROM public.lessons
WHERE is_published = true
ORDER BY module_id, order_index;