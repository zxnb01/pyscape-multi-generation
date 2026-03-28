# Supabase Integration - Action Plan

## Completed ✅
- [x] Created lessonContentService.js with proper Supabase integration
- [x] Updated projectsData.js to remove hardcoded FALLBACK_PROJECTS
- [x] Created seed migrations for lessons with parts/sublevels structure  
- [x] Updated roadmapService to fetch from Supabase database
- [x] Added lessonContentService import to LevelPage

##  In Progress 🔄
- [ ] Remove all hardcoded levelContent from LevelPage (lines 99-2931)
- [ ] Update projectDetailPage to use Supabase
- [ ] Verify all services are properly connected

## Remaining Tasks ⏳

### 1. Remove Hardcoded Content
The file `src/pages/LevelPage.js` has a massive hardcoded `levelContent` object from line 99 to line 2931 that needs removal.

**Solution**: Replace lines 99-2931 with minimal content by using this replacement:

```
OLD: (lines 99-2931) - All the hardcoded levelContent object  
NEW: (nothing - delete it entirely) 

The component will now fetch content from lessonContentService
```

### 2. Update Seed Data Strategy
Since LevelPage uses a 3-level structure (Module > Lesson > Part), we need to:
- Either manually migrate the hardcoded content to Supabase `lessons.parts` column
- Or create a migration script that parses the hardcoded data and inserts it

### 3. Verify Component Rendering
After removing hardcoded data, LevelPage will use:
```javascript
const level = state from useEffect
// Renders using the fetched content
```

### 4. Test Database Connectivity
Run these checks:
1. Verify Supabase client is configured properly
2. Test lessonContentService.getCompleteStructure()
3. Verify LevelPage loads content for Module 1, Lesson 1, Level 1
4. Check that all navigation works

### 5. Remove Remote Hardcoded Data
Once database is populated:
- Remove MOCK_SKILLS from roadmapService.js (keep only for fallback)
- Remove MOCK_LESSONS from roadmapService.js
- Remove MOCK_DEPENDENCIES from roadmapService.js
- Remove MOCK_MASTERY from roadmapService.js

## Files Status

### ✅ Configured for Supabase
- `src/utils/supabaseClient.js` - Client setup
- `src/services/roadmapService.js` - Fetches from database
- `src/services/lessonContentService.js` - NEW, fetches lessons
- `src/data/projectsData.js` - Updated to fetch from database

### 🔄 Partial Integration
- `src/pages/LevelPage.js` - Importing service but still has hardcoded data
- `src/pages/RoadmapPage.js` - Uses roadmapService correctly

### ⏳ Still Hardcoded
- `src/pages/Dashboard.js` - May have hardcoded previews
- `src/pages/OnboardingQuiz.js` - May have hardcoded questions
- Various component preview data

## Database Tables Ready
- ✅ modules
- ✅ lessons (with new 'parts' column)
- ✅ skills
- ✅ skill_dependencies
- ✅ user_skill_mastery
- ✅ lesson_skills
- ✅ projects (already exists)

## Next Immediate Steps
1. Remove the huge hardcoded levelContent object from LevelPage.js
2. Test that lessons load from Supabase
3. Seed sample data into the database
4. Verify all pages render correctly with database data
5. Remove remaining MOCK_ data constants
