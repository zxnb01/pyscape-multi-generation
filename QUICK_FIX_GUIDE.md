# 🚀 QUICK START - Apply the Fix in 2 Minutes

## ⚡ IMMEDIATE ACTION REQUIRED

### Step 1: Update Database (1 minute)

1. Open Supabase: https://supabase.com/dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. **Copy & Paste this entire block:**

```sql
-- Migration 024: Fix Progress Table RLS Issues
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read their own progress" ON public.progress;
DROP POLICY IF EXISTS "Users can insert/update their own progress" ON public.progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.progress;
DROP POLICY IF EXISTS "Admin users can read all progress" ON public.progress;

-- Disable RLS on progress table to allow client-side upserts
ALTER TABLE public.progress DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with a permissive policy for authenticated users
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy that allows authenticated users to manage their own records
CREATE POLICY "Authenticated users can manage their own progress"
  ON public.progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all progress
CREATE POLICY "Admins can read all progress"
  ON public.progress
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Add RPC Function for safer updates
DROP FUNCTION IF EXISTS update_lesson_progress(UUID, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION update_lesson_progress(
  p_user_id UUID,
  p_lesson_id INTEGER,
  p_state TEXT,
  p_score NUMERIC DEFAULT 0
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  current_state TEXT
) AS $$
DECLARE
  v_inserted BOOLEAN := FALSE;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL OR p_lesson_id IS NULL OR p_state IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid parameters: user_id, lesson_id, and state are required'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Validate state value
  IF p_state NOT IN ('not_started', 'in_progress', 'completed', 'failed') THEN
    RETURN QUERY SELECT FALSE, 'Invalid state: ' || p_state, p_state;
    RETURN;
  END IF;

  -- Try to insert, on conflict update
  BEGIN
    INSERT INTO public.progress (user_id, lesson_id, state, score, updated_at)
    VALUES (p_user_id, p_lesson_id, p_state, p_score, NOW())
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
      state = EXCLUDED.state,
      score = CASE WHEN EXCLUDED.score > 0 THEN EXCLUDED.score ELSE public.progress.score END,
      updated_at = NOW();

    RETURN QUERY SELECT TRUE, 'Progress updated successfully'::TEXT, p_state;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Error updating progress: ' || SQLERRM, NULL::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done!
SELECT 'Migration complete - Progress RLS fixed!' AS status;
```

5. Click **Run** (blue button)
6. Wait for success message ✅

### Step 2: Restart App (1 minute)

- **Stop** the running app (press Ctrl+C in terminal)
- **Pull latest code** if needed: `git pull`
- **Restart** app: `npm start`

---

## ✅ Verify It Works

1. **Open the app** → Log in
2. **Go to any lesson** → Module 1 > Lesson 1 > Level 1
3. **Click "Mark In Progress"** → no errors ✅
4. **Click "Mark Complete"** → XP shows up ✅

---

## ⚠️ If It Still Doesn't Work

Try these in order:

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Check console logs** (F12 key): 
   - Look for: `✅ Progress saved successfully: completed`
   - Should NOT see: `Upsert error` with code 42501
3. **Verify you're logged in** (check profile picture)
4. **Try a different browser** (rule out cache issues)
5. **Check Supabase Dashboard**:
   - SQL Editor → check query execution history
   - Verify migration ran without errors

---

## 📞 Getting Help

If still having issues:
1. Share console errors (F12 → Console tab)
2. Share Supabase query error message
3. Check GAMIFICATION_RLS_FIX_GUIDE.md for detailed troubleshooting

---

**That's it! Your gamification should now work! 🎉**
