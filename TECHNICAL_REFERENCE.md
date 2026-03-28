# 🔧 Technical Reference - Supabase Integration

## API Endpoints & Methods

### LessonContentService Methods

```javascript
import lessonContentService from '../services/lessonContentService';

// Get complete 3-level structure (cache-friendly)
const complete = await lessonContentService.getCompleteStructure();
// Result: { 1: { 1: { 1: levelContent, 2: levelContent } } }

// Get specific level content
const level = await lessonContentService.getLevelContent(moduleId, lessonId, partLevel);
// Result: { title, description, content, examples, keyPoints, exercise, ... }

// Get module
const module = await lessonContentService.getModule(1);

// Get all modules
const modules = await lessonContentService.getModules();

// Get lessons for a module
const lessons = await lessonContentService.getLessonsForModule(1);

// Get specific lesson
const lesson = await lessonContentService.getLesson(lessonId);

// Get lesson part
const part = await lessonContentService.getLessonPart(lessonId, partLevel);

// Search lessons
const results = await lessonContentService.searchLessons('python');

// Get lessons by type
const readLessons = await lessonContentService.getLessonsByType('read');

// Clear cache
lessonContentService.clearCache();

// Preload all content
await lessonContentService.preloadAllContent();
```

### RoadmapService Methods (Updated)

```javascript
import roadmapService from '../services/roadmapService';

// Get complete roadmap
const roadmap = await roadmapService.getRoadmap(userId, domain);
// Result: { recommended, all, stats, dependencies }

// Get specific skill details
const skill = await roadmapService.getSkillDetails(skillId);

// Get lessons for a skill
const lessons = await roadmapService.getLessonsForSkill(skillId, userId);

// Update mastery from lesson completion
await roadmapService.updateMasteryFromLesson(userId, lessonId, score);

// Initialize roadmap for new user
await roadmapService.initializeUserRoadmap(userId);
```

### ProjectsData Methods

```javascript
import { fetchProjects, getProjectById } from '../data/projectsData';

// Get all projects (cached, 5-minute TTL)
const projects = await fetchProjects();

// Get single project by ID
const project = await getProjectById(projectId);
```

---

## Database Query Examples

### Fetch from Lessons Table
```sql
-- Get lesson with parts
SELECT * FROM lessons
WHERE module_id = 1 AND is_published = true
ORDER BY order_index ASC;

-- Update a lesson with parts
UPDATE lessons 
SET parts = jsonb_set(parts, '{0}', '{"level": 1, "title": "..."}')
WHERE id = 1;
```

### Fetch Skills
```sql
SELECT * FROM skills
WHERE domain = 'python' AND is_published = true
ORDER BY difficulty ASC;
```

### Track User Progress
```sql
SELECT * FROM user_skill_mastery
WHERE user_id = 'user-uuid'
ORDER BY status ASC;
```

---

## Error Handling Patterns

### In Services
```javascript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  return data;
} catch (err) {
  console.error('Error message:', err);
  // Return fallback or null
  return null;
}
```

### In Components
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true);
      const content = await service.getContent();
      setData(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);

// In render
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NotFound />;
return <Content data={data} />;
```

---

## Data Structure Examples

### Level Content Structure
```javascript
{
  title: "Welcome to Python!",
  description: "Begin your journey...",
  content: "# Markdown content here\n\nWith formatting",
  examples: [
    {
      title: "Your First Program",
      code: "print('Hello, World!')",
      description: "A simple example",
      testCases: [
        { description: "...", check: "Hello, World!" }
      ]
    }
  ],
  keyPoints: [
    "Python is easy to learn",
    "Point 2"
  ],
  exercise: {
    title: "Exercise Name",
    instructions: "Do this...",
    starterCode: "# Your code here\n",
    solution: "# Solution code"
  },
  estimated_minutes: 20,
  xp_reward: 50
}
```

### Lesson with Parts (JSONB)
```javascript
// In database
{
  id: 1,
  module_id: 1,
  title: "Python Basics",
  parts: [
    { level: 1, title: "Part 1", content: "..." },
    { level: 2, title: "Part 2", content: "..." },
    { level: 3, title: "Part 3", content: "..." }
  ],
  type: "read",
  is_published: true
}
```

### Skill Graph Structure
```javascript
// Skills table
{
  id: "uuid",
  name: "Python Syntax",
  domain: "python",
  difficulty: 1,
  estimated_minutes: 60,
  description: "..."
}

// Dependencies
{
  skill_id: "uuid-2",
  depends_on: "uuid-1",  // uuid-2 depends on uuid-1
  created_at: "..."
}

// User Progress
{
  user_id: "user-uuid",
  skill_id: "skill-uuid",
  mastery: 0.75,  // 0-1 scale
  status: "in_progress",  // locked, eligible, in_progress, mastered
  started_at: "...",
  completed_at: "..."
}
```

---

## Performance Optimization

### Caching Strategy
```javascript
// lessonContentService
class LessonContentService {
  constructor() {
    this.contentCache = {};      // Full 3-level structure
    this.lessonCache = {};       // Individual lessons
    this.moduleCache = {};       // Individual modules
  }

  async getCompleteStructure() {
    // Return cached if available
    if (Object.keys(this.contentCache).length > 0) {
      return this.contentCache;
    }
    // Otherwise fetch and cache
  }
}

// projectsData
// 5-minute TTL cache
const CACHE_DURATION_MS = 5 * 60 * 1000;
if (cachedProjects && timestamp && (Date.now() - timestamp < CACHE_DURATION_MS)) {
  return cachedProjects;
}
```

### Query Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_lessons_module_published ON lessons(module_id, is_published);
CREATE INDEX idx_lessons_type ON lessons(type);
CREATE INDEX idx_user_mastery_user ON user_skill_mastery(user_id);
CREATE INDEX idx_user_mastery_status ON user_skill_mastery(user_id, status);
```

---

## Testing Checklist

- [ ] Load LevelPage for Module 1, Lesson 1, Level 1
- [ ] Verify loading spinner appears
- [ ] Verify content loads from database
- [ ] Check browser console - should show ✅ fetching messages
- [ ] Try navigating to different lessons
- [ ] Test error handling (use DevTools to simulate offline)
- [ ] Verify roadmap page loads skills from database
- [ ] Verify projects page shows projects list
- [ ] Check that examples run properly
- [ ] Verify practice exercises work

---

## Common Issues & Solutions

### Issue: Content not loading
**Solution**: Check Supabase credentials in .env
```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx
```

### Issue: "Level content not found"
**Solution**: Verify data was seeded to database
```bash
# Check if lessons exist
SELECT COUNT(*) FROM lessons WHERE is_published = true;
```

### Issue: Slow loading
**Solution**: Check for cache and preload
```javascript
// Preload on app startup
await lessonContentService.preloadAllContent();
```

### Issue: CORS errors
**Solution**: Verify Supabase RLS policies allow anon access
```sql
-- Allow anon SELECT on lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published lessons"
  ON lessons FOR SELECT
  USING (is_published = true);
```

---

## Environment Setup

### .env file (create if not exists)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Verify Setup
```javascript
// In browser console
import supabase from './src/utils/supabaseClient';
const { data } = await supabase.from('lessons').select('count');
console.log(data); // Should show count
```

---

## Monitoring & Debugging

### Enable Verbose Logging
```javascript
// In services
console.log('📚 Fetching level content...'); // Data fetching
console.log('✅ Content loaded successfully'); // Success
console.log('❌ Error loading content:', err); // Errors
```

### Check Database Directly
```sql
-- Supabase Dashboard > Query Editor
SELECT * FROM lessons LIMIT 1;
SELECT * FROM skills LIMIT 1;
SELECT * FROM user_skill_mastery LIMIT 1;
```

### Network Monitoring
1. Open DevTools > Network tab
2. Filter for API requests
3. Look for requests to `supabase.co`
4. Verify response includes expected data

---

## File Structure Reference

```
src/
├── pages/
│   ├── LevelPage.js (✅ Database-driven)
│   ├── RoadmapPage.js (✅ Database-driven)
│   ├── Dashboard.js (🔄 Partial)
│   └── ...
├── services/
│   ├── roadmapService.js (✅ Database-driven)
│   ├── lessonContentService.js (✅ NEW - Database-driven)
│   └── ...
├── data/
│   └── projectsData.js (✅ Database-driven)
└── utils/
    ├── supabaseClient.js (✅ Configured)
    └── seedDatabase.js (✅ NEW)

migrations/
├── 010_seed_lesson_content.sql (✅ NEW)
└── 011_extend_lessons_for_sublevels.sql (✅ NEW)
```

---

## Next Development Tasks

1. **Create Admin Panel** - CRUD for lessons/skills
2. **User Analytics** - Track learning progress
3. **Content Management** - Rich editor for lesson creation
4. **Multi-language** - Support multiple languages
5. **Mobile App** - React Native using same services
6. **Real-time Features** - WebSocket for live updates
7. **Search & Discovery** - Full-text search on lessons

