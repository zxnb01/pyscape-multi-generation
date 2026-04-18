# Quiz Issues - Fixes Applied

## Critical Issues Found and Fixed

### 0. ✅ CRITICAL: Generated Questions Have WRONG Answer Options
**File:** `src/services/quizService.js` - LLM prompt in `generateWithOpenRouter()`
**Problem:** LLM was generating code output questions but NOT including the actual correct output in the options
**Evidence from generated quizzes:**
- Q1: "What is output of x = [1,2,3]; print(x)?" 
  - ❌ Options: "list", "array", "type:list"
  - Missing: "[1, 2, 3]" (actual output!)
- Q3: "What does y.append(4) output?"
  - ❌ Options: "3", "4", "None", "x"
  - Missing: "[1, 2, 3, 4]" (actual output!)

**Solution:** Enhanced LLM prompt with:
1. **WRONG example** showing what NOT to do
2. **RIGHT example** showing correct approach with actual output in options
3. **Critical instruction**: "For CODE OUTPUT questions: THE CORRECT ANSWER OPTION MUST SHOW THE ACTUAL OUTPUT"

**Key prompt changes:**
```
WRONG EXAMPLE:
{"question":"What is the output of x = [1,2,3]; print(x)?","options":[{"text":"list","isCorrect":true},...]}
❌ Correct output [1, 2, 3] is missing!

RIGHT EXAMPLE:
{"question":"What is the output of x = [1,2,3]; print(x)?","options":[{"text":"[1, 2, 3]","isCorrect":true},...]}
✓ One option shows actual output
```

### 2. ✅ Type Casting Error in RPC (Critical)
**File:** `migrations/021_add_quiz_rpc_functions.sql`
**Problem:** `cannot cast type uuid to integer` error when submitting quiz
**Root Cause:** The `submit_quiz_attempt()` RPC was trying to cast `p_quiz_id::INTEGER` when quiz_id is UUID
**Solution:** Changed to use `v_module_id` (INTEGER) instead of quiz_id when calling `award_xp()`

```sql
-- OLD (WRONG):
PERFORM award_xp(p_user_id, v_xp_to_award, 'quiz', p_quiz_id::INTEGER);

-- NEW (CORRECT):
PERFORM award_xp(p_user_id, v_xp_to_award, 'quiz', v_module_id);
```

### 3. ✅ Answer Validation Issues
**File:** `src/services/quizService.js`

**Improvements:**
- Enhanced `parseJSONResponse()` to support both `isCorrect` and `is_correct` field naming from LLM
- Added warning logging when questions don't have exactly 1 correct answer
- Improved answer validation to force first option as correct if none marked

### 4. ✅ Enhanced Debug Logging
**Added detailed logging to track answer correctness:**

**In `generateQuizQuestionsWithLLM()`:**
- Logs which answer is marked as correct for each generated question
- Shows all option texts with their correctness status

**In `saveGeneratedQuizToDatabase()`:**
- Logs the correct_option_index for each question being saved
- Shows the correct answer text and all options

**In `submitQuiz()`:**
- Logs the full answers object being sent to RPC
- Shows number of answers submitted

### 5. ✅ Fixed 406 Error on Quiz Progress Retrieval
**File:** `src/services/quizService.js` - `getQuizProgress()`
**Problem:** Using `.single()` on query that might return no results
**Solution:** Removed `.single()` and manually check for empty results

## Next Steps to Apply Fixes

### ⚠️ IMPORTANT: Delete Old Quizzes
Since existing quizzes were generated with wrong answer options, they need to be regenerated:

**Option A - Delete via SQL:**
```sql
-- Delete all old quizzes (they will regenerate automatically on next quiz load)
DELETE FROM user_quiz_attempts;
DELETE FROM user_quiz_progress;
DELETE FROM quiz_questions;
DELETE FROM module_quizzes;
```

**Option B - Keep tracking but mark for regeneration:**
Just navigate to a quiz and it will auto-regenerate with new prompt if no questions exist.

### 1. Run Migration to Update RPC Function
```bash
npm run migrate
```

This will update the `submit_quiz_attempt()` RPC function with the type casting fix.

### 2. Test Quiz Generation with New Prompt
- Navigate to a module's quiz
- A NEW quiz will be generated with the UPDATED prompt
- **Expected behavior:**
  - For code output questions, one option MUST show actual output
  - Console logs should show which answer is correct for each question
  - XP should be awarded upon passing
  - No 406 errors

### 3. Monitor Console Logs
When generating a new quiz, you should see logs like:
```
✅ OpenRouter generated quiz questions
📋 Generated 5 questions with correct answers:
   Q1: Correct = "[1, 2, 3]"          ← Actual output!
   Q2: Correct = "sorted()"
   Q3: Correct = "[1, 2, 3, 4]"       ← Actual output!
```

When saving to database:
```
   Q1: Correct option index = 0
        Correct answer: "[1, 2, 3]"
        All options: [1, 2, 3] (✓) | list (✗) | array (✗) | type:list (✗)
```

## Verification Checklist

- [ ] Old quizzes deleted from database
- [ ] Migration updated (run `npm run migrate`)
- [ ] Quiz generates without errors
- [ ] Console shows correct answer options are ACTUAL code outputs
- [ ] Code output questions include execution results like [1, 2, 3]
- [ ] Quiz can be submitted
- [ ] XP is awarded upon passing
- [ ] Answer review shows correct indicators (✓ for correct, ✗ for wrong)
- [ ] No 406 errors when checking progress

## If Issues Persist

1. **Check browser console** - Look for the detailed logs showing correct answers
2. **Verify LLM response** - Confirm LLM is following the new prompt format with examples
3. **Check options stored** - Query `quiz_questions` table to see if correct option is the actual output
4. **Test specific question** - Run Python code yourself to verify the output matches what's stored
