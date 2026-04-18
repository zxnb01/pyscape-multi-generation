# XP System Update - Project Lessons Integration

## Overview
The XP system has been updated to properly track experience points for project lessons that are now integrated into the lesson hierarchy with multiple parts/levels (Phase 4).

## Problem Solved
**Issue:** XP was not updating correctly when users completed lessons in projects because the system didn't differentiate between:
- Regular module lessons (type: 'read', 'quiz', 'code')
- Project lessons (type: 'labTrigger')

The XP source tracking needed to be updated to properly categorize project lesson progress separately from regular lesson progress.

---

## Changes Made

### 1. Updated `awardLevelXP()` Function
**File:** `src/gamification/gamificationService.js`

**Changes:**
- Added `lessonType` parameter (default: 'read')
- Uses different source_type values based on lesson type:
  - Regular lessons: `lesson_level_${levelNumber}`
  - Project lessons: `project_lesson_level_${levelNumber}`
- Enhanced logging to show whether it's a project or regular lesson

**Signature:**
```javascript
export const awardLevelXP = async (userId, lessonId, levelNumber, xpAmount = 10, lessonType = 'read')
```

**Usage:**
```javascript
// Regular lesson
await awardLevelXP(userId, lessonId, levelNumber, 10, 'read');

// Project lesson
await awardLevelXP(userId, projectLessonId, levelNumber, 10, 'labTrigger');
```

---

### 2. Updated `awardLessonXP()` Function
**File:** `src/gamification/gamificationService.js`

**Changes:**
- Added `lessonType` parameter (default: 'read')
- Uses different source_type values:
  - Regular lessons: `lesson`
  - Project lessons: `project_lesson`
- Better logging with lesson type indicators

**Signature:**
```javascript
export const awardLessonXP = async (userId, lessonId, xpAmount = 50, lessonType = 'read')
```

---

### 3. Added `awardProjectLessonPartXP()` Function
**File:** `src/gamification/gamificationService.js`

**Purpose:** Dedicated function for awarding XP to individual project lesson parts.

**Features:**
- Tracks project lesson parts with source_type: `project_lesson_part_${partLevel}`
- Default XP amount: 15 (distinguishes from regular lesson parts at 10 XP)
- Full gamification updates: streak + badges

**Signature:**
```javascript
export const awardProjectLessonPartXP = async (userId, projectLessonId, partLevel, xpAmount = 15)
```

---

### 4. Updated `LevelPage.js`
**File:** `src/pages/LevelPage.js`

**Changes:**
- Added `lessonType` state to track the lesson type
- Fetch lesson type from database when loading content:
  ```javascript
  const { data: lessonData } = await supabase
    .from('lessons')
    .select('type')
    .eq('id', content.lessonDbId)
    .single();
  ```
- Pass `lessonType` to `awardLevelXP()` call:
  ```javascript
  const result = await awardLevelXP(userId, lessonDbId, parsedLevelId, xp, lessonType);
  ```

**Result:** XP awards now properly reflect whether the lesson is a project lesson or regular lesson.

---

## XP Tracking Breakdown

### XP Source Types (stored in xp_history.source_type)

**Regular Lessons:**
- `lesson_level_1` through `lesson_level_5` - Individual part/level completion (10 XP each)
- `lesson` - Full lesson completion (50 XP)
- `quiz` - Quiz completion (50 XP)

**Project Lessons:**
- `project_lesson_level_1` through `project_lesson_level_5` - Individual part/level completion (10 XP each)
- `project_lesson_part_1` through `project_lesson_part_5` - Alternative tracking via awardProjectLessonPartXP (15 XP each)
- `project_lesson` - Full project lesson completion (50 XP)
- `project` - Full project completion (100 XP)

**Other:**
- `lesson_level_${levelNumber}` - Generic level tracking
- `module_quiz` - Module quiz rewards
- `code_duel` - Competitive duel results

---

## How It Works

### Flow for Project Lesson Completion

```
User navigates to project lesson → LevelPage.js loads
    ↓
Fetch lesson content + lesson.type
    ↓
If lesson.type === 'labTrigger' → set lessonType = 'labTrigger'
    ↓
User completes level
    ↓
Call awardLevelXP(userId, lessonId, levelNumber, 10, 'labTrigger')
    ↓
gamificationService uses sourceType = 'project_lesson_level_${levelNumber}'
    ↓
RPC checks UNIQUE(user_id, source_type='project_lesson_level_${levelNumber}', source_id=lessonId)
    ├─ If duplicate → xpAwarded = 0 (already earned this before)
    └─ If new → Award XP, update streak, check badges
    ↓
XP properly tracked and displayed in UI
```

---

## Benefits

1. **Proper Categorization:** Project lessons are tracked separately from regular lessons in xp_history
2. **Analytics:** Can now query XP awards by lesson type for better insights
3. **Scalability:** Can adjust XP amounts for project lessons independently (currently 10-15 XP per part)
4. **Consistency:** Follows the same gamification flow as other content types
5. **Prevention:** UNIQUE constraint still prevents duplicate XP awards

---

## Testing Checklist

- [ ] Navigate to a project lesson (type: 'labTrigger')
- [ ] Complete a level/part
- [ ] Verify XP is awarded (check browser console for logs)
- [ ] Check xp_history table for entry with source_type containing 'project_lesson'
- [ ] Verify total_xp updates in user_xp table
- [ ] Test streak increments correctly
- [ ] Attempt to re-complete the same level (should not award XP again - duplicate prevention)
- [ ] Complete a regular lesson level and verify it uses 'lesson_level_*' source_type

---

## Backward Compatibility

All changes are backward compatible:
- `lessonType` parameter has default value 'read'
- Existing calls without lessonType still work correctly
- Legacy progress tracking in `progress` table unchanged
- All XP functions work with or without the new parameter

---

## Files Modified

1. **src/gamification/gamificationService.js**
   - Updated `awardLevelXP()` - added lessonType parameter
   - Updated `awardLessonXP()` - added lessonType parameter
   - Added `awardProjectLessonPartXP()` - new function

2. **src/pages/LevelPage.js**
   - Added `lessonType` state
   - Added lesson type fetching in useEffect
   - Updated awardLevelXP() call to pass lessonType

---

## Next Steps (Optional Enhancements)

1. **ProjectDetailPage Enhancement:** Update to track XP for individual project steps
2. **Skill Lessons Modal:** Ensure project lessons properly show in skill progression
3. **Dashboard Analytics:** Update gamification dashboard to show project vs regular lesson XP breakdown
4. **Achievements:** Add achievements specific to project completion milestones

---

## Notes

- The xp_history table's UNIQUE constraint on (user_id, source_type, source_id) ensures no duplicate XP awards
- Project lesson XP defaults are higher (15 XP) than regular lesson parts (10 XP) to reflect difficulty
- Streak and badge systems work identically for project and regular lessons
- All logging shows whether it's a "📊 Project Lesson" or "✅ Regular Lesson" for easy debugging
