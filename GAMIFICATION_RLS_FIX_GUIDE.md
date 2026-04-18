# 🔧 Gamification RLS Issues - FIX GUIDE

## Problem Summary
Users are getting RLS (Row-Level Security) violations (error code 42501) when trying to mark lessons as "in progress" or "complete". 

**Error Message:**
```
Upsert error: {code: '42501', details: null, hint: null, message: "new row violates row-level security policy for table 'progress'"}
```

## Root Cause
The `progress` table has RLS enabled with restrictive policies that are preventing direct upserts from the client-side code, even when the user is properly authenticated.

## Solution Overview
This fix involves three parts:

### 1. **Database Migration (024)**
Disables RLS on the progress table and adds a proper RPC function for updates.

### 2. **Code Update (LevelPage.js)**
Updates the progress update logic to use the new RPC function instead of direct upserts.

### 3. **RPC Function**
`update_lesson_progress()` - A SECURITY DEFINER function that safely handles progress updates.

---

## How to Apply the Fix

### Step 1: Apply Database Migration

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project: https://supabase.com
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the entire contents of `migrations/024_fix_progress_rls.sql`
5. Click "Run"
6. Verify the output shows: "Progress RLS issues fixed - users can now update their progress"

**Option B: Using CLI (if available)**
```bash
cd c:\pyscape\pyscape-multi-generation
# Use supabase CLI to apply migration
supabase db push migrations/024_fix_progress_rls.sql
```

### Step 2: Test the Fix

1. **Start the application**
   ```bash
   npm start
   ```

2. **Test Progress Updates**
   - Navigate to any lesson (e.g., Module 1 → Lesson 1 → Level 1)
   - Click "Mark In Progress" → should complete without errors
   - Click "Mark Complete" → should show success message and award XP

3. **Check Console for Success Indicators**
   - Should see: `✅ Progress saved successfully: in_progress`
   - Should see: `✅ Progress saved successfully: completed`
   - XP should be awarded and badges should be checked

---

## What Changed

### Code Changes (LevelPage.js)
✅ **Before:** Direct upsert that could trigger RLS violations
```javascript
const { error: upsertError } = await supabase
  .from('progress')
  .upsert([payload], {
    onConflict: 'user_id,lesson_id',
    ignoreDuplicates: false
  });
```

✅ **After:** RPC function call that bypasses RLS issues
```javascript
const { data, error: rpcError } = await supabase.rpc('update_lesson_progress', {
  p_user_id: userId,
  p_lesson_id: parsedLessonId,
  p_state: nextState,
  p_score: score
});
```

### Database Changes (Migration 024)
1. Disables RLS on progress table
2. Re-enables RLS with proper permissive policies
3. Creates `update_lesson_progress()` RPC function as SECURITY DEFINER
4. Allows authenticated users to manage their own progress records

---

## Verification Checklist

After applying the fix, verify with these checks:

### ✅ Database Level
Run these queries in Supabase SQL Editor:

**Check 1: Verify RLS Status**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'progress';
```
Expected: Should show rowsecurity = true (RLS re-enabled with proper policies)

**Check 2: Verify RLS Policies**
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'progress';
```
Expected: Should include "Authenticated users can manage their own progress"

**Check 3: Verify RPC Function Exists**
```sql
SELECT proname 
FROM pg_proc 
WHERE proname = 'update_lesson_progress';
```
Expected: Should return 'update_lesson_progress'

### ✅ Application Level
1. Sign in with a test account
2. Navigate to a lesson
3. Click "Mark In Progress"
   - ✅ No errors in console
   - ✅ Progress message shows "Progress saved."
   - ✅ Button state updates immediately

4. Click "Mark Complete"
   - ✅ No errors in console
   - ✅ XP notification appears (+50 or appropriate amount)
   - ✅ Badge checks run (you'll see logs)
   - ✅ Gamification data refreshes

5. Check browser console (F12 → Console tab)
   - ✅ No red errors
   - ✅ Should see log: "✅ Progress saved successfully: completed"

---

## Troubleshooting

### If you still see "42501" errors:

**1. Verify Migration Was Applied**
- Go to Supabase Dashboard → SQL Editor → Query History
- Check if your migration execution succeeded
- Re-run migration 024 if needed

**2. Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear Supabase local cache if using any

**3. Check Auth Session**
- Make sure you're properly logged in
- Open DevTools → Application → Cookies
- Verify `sb-auth-token` exists

**4. Check Latest Code**
- Ensure LevelPage.js has the updated version using RPC function
- Look for: `supabase.rpc('update_lesson_progress', ...)`

### If RPC function returns errors:

Check the error message returned by the function. Common issues:
- **"Invalid parameters"**: User is not signed in or lesson_id is invalid
- **"Invalid state"**: State must be one of: 'not_started', 'in_progress', 'completed', 'failed'
- **"Error updating progress"**: Check Supabase logs for database errors

---

## Files Modified/Created

✅ **Created:**
- `migrations/024_fix_progress_rls.sql` - Database migration
- `apply-migration-024.sh` - Helper script
- `GAMIFICATION_RLS_FIX_GUIDE.md` - This guide

✅ **Updated:**
- `src/pages/LevelPage.js` - Uses new RPC function

---

## Next Steps

If the fix works:
1. Mark this issue as resolved
2. Update deployment procedures to include migration 024
3. Monitor console logs for any additional RLS violations on other tables
4. Consider applying similar RPC patterns to other direct table updates

If issues persist:
1. Check Supabase database logs
2. Verify network requests in browser DevTools
3. Review RLS policy logs

---

## Additional Notes

- The RPC function `update_lesson_progress()` runs with SECURITY DEFINER privileges, bypassing RLS checks
- This is secure because the function validates the user_id matches the authenticated user
- All legacy direct upserts have been replaced with the RPC function
- The progress table now allows authenticated users to read, insert, and update their own records
- Admin roles can still view all progress records

---

**Last Updated:** April 14, 2026
**Status:** ✅ Fix Applied
