import supabase from '../utils/supabaseClient';

/**
 * LessonContentService
 * Fetches structured lesson content from Supabase database
 * Handles 3-level hierarchy: Module > Lesson > Parts (Sublevels)
 */

class LessonContentService {
  constructor() {
    this.lessonCache = {};
    this.moduleCache = {};
    this.contentCache = {}; // Full 3-level structure cache
  }

  /**
   * Build a readable fallback description for legacy lessons.
   */
  buildFallbackDescription(title, contentText = '') {
    if (typeof contentText === 'string' && contentText.trim()) {
      const noMarkdown = contentText
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/[*_`>#-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (noMarkdown.length >= 24) {
        return noMarkdown.slice(0, 120).trim();
      }
    }

    return `Practice core concepts from ${title}.`;
  }

  /**
   * Get module by ID
   */
  async getModule(moduleId) {
    if (this.moduleCache[moduleId]) {
      return this.moduleCache[moduleId];
    }

    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      this.moduleCache[moduleId] = data;
      return data;
    } catch (err) {
      console.error(`Error fetching module ${moduleId}:`, err);
      return null;
    }
  }

  /**
   * Get all modules
   */
  async getModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching modules:', err);
      return [];
    }
  }

  /**
   * Get lesson by ID
   */
  async getLesson(lessonId) {
    if (this.lessonCache[lessonId]) {
      return this.lessonCache[lessonId];
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      this.lessonCache[lessonId] = data;
      return data;
    } catch (err) {
      console.error(`Error fetching lesson ${lessonId}:`, err);
      return null;
    }
  }

  /**
   * Get all lessons for a module
   */
  async getLessonsForModule(moduleId) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching lessons for module ${moduleId}:`, err);
      return [];
    }
  }

  /**
   * Get a specific part/sublevel from a lesson
   * @param {number} lessonId - Lesson ID
   * @param {number} partLevel - Part/sublevel number (1-indexed)
   */
  async getLessonPart(lessonId, partLevel) {
    try {
      const lesson = await this.getLesson(lessonId);
      if (!lesson) {
        console.error(`   ❌ Could not fetch lesson ${lessonId}`);
        return null;
      }

      // Handle parts - might be JSONB object, JSON string, or double-escaped string
      let parts = lesson.parts;
      
      console.log(`   Parts raw type: ${typeof parts}, value sample: ${JSON.stringify(parts)?.substring(0, 100)}`);
      
      if (typeof parts === 'string') {
        console.log(`   🔄 Parts is a string, attempting to parse...`);
        try {
          parts = JSON.parse(parts);
          console.log(`   ✓ First parse succeeded, type now: ${typeof parts}`);
          // Handle double-escaped case: parse again if result is still a string
          if (typeof parts === 'string') {
            console.log(`   🔄 Still a string after first parse, parsing again...`);
            parts = JSON.parse(parts);
            console.log(`   ✓ Second parse succeeded`);
          }
        } catch (e) {
          console.error(`   ❌ Failed to parse parts as JSON:`, e.message);
          parts = [];
        }
      }
      
      // Ensure parts is an array
      if (!Array.isArray(parts)) {
        console.warn(`   ⚠️  Parts is not an array:`, typeof parts, parts);
        parts = [];
      }
      
      console.log(`   📋 Lesson ${lessonId} has ${parts.length} parts. Looking for level=${partLevel}`);
      
      // Find the part with matching level (1-indexed)
      const part = parts.find(p => p && p.level === partLevel);
      
      if (!part) {
        console.warn(`   ⚠️  Part with level=${partLevel} not found in lesson ${lessonId}`);
        if (parts.length > 0) {
          console.warn(`   Available levels: ${parts.map(p => p?.level || 'unknown').join(', ')}`);
        }
        return null;
      }

      return part;
    } catch (err) {
      console.error(`   ❌ Error fetching lesson part ${lessonId}/${partLevel}:`, err);
      return null;
    }
  }

  /**
   * Get the complete 3-level structure: Module > Lesson > Parts
   * Matches the format: levelContent[moduleId][lessonId][partLevel]
   */
  async getCompleteStructure() {
    try {
      if (Object.keys(this.contentCache).length > 0) {
        return this.contentCache;
      }

      const modules = await this.getModules();
      const levelContent = {};

      for (const module of modules) {
        levelContent[module.id] = {};
        
        const lessons = await this.getLessonsForModule(module.id);
        
        lessons.forEach((lesson, lessonIndex) => {
          // Lessons are 1-indexed in the structure
          const lessonNumber = lessonIndex + 1;
          levelContent[module.id][lessonNumber] = {};

          // Process parts (sublevels) within the lesson
          let parts = lesson.parts || [];
          
          // Handle string/double-escaped parts
          if (typeof parts === 'string') {
            try {
              parts = JSON.parse(parts);
              if (typeof parts === 'string') {
                parts = JSON.parse(parts);
              }
            } catch (e) {
              console.error(`Failed to parse parts for lesson ${lesson.id}:`, e);
              parts = [];
            }
          }
          
          if (!Array.isArray(parts)) {
            parts = [];
          }
          
          parts.forEach(part => {
            const xpReward = part.xp_reward ?? part.xpReward ?? 10;
            levelContent[module.id][lessonNumber][part.level] = {
              title: part.title || lesson.title,
              description: part.description || lesson.title,
              content: part.content || '',
              examples: part.examples || [],
              keyPoints: part.keyPoints || [],
              exercise: part.exercise || null,
              testCases: part.testCases || [],
              estimated_minutes: lesson.estimated_minutes,
              xp_reward: xpReward,
              lessonDbId: lesson.id,
              lessonOrder: lesson.order_index || lessonNumber
            };
          });
        });
      }

      this.contentCache = levelContent;
      return levelContent;
    } catch (err) {
      console.error('Error fetching complete structure:', err);
      return {};
    }
  }

  /**
   * Get specific level/part content
   * @param {number} moduleId - Module ID
   * @param {number} lessonId - Lesson number (1-indexed)
   * @param {number} partLevel - Part level number (1-indexed)
   */
  async getLevelContent(moduleId, lessonId, partLevel) {
    try {
      // Convert 0-based levelId to 1-based part level (parts in DB are 1-indexed)
      const partLevel1Based = partLevel + 1;

      // Try cache first - use 1-based indexing
      const content = this.contentCache;
      if (content[moduleId]?.[lessonId]?.[partLevel1Based]) {
        console.log(`📦 Found in cache: module=${moduleId}, lesson=${lessonId}, part=${partLevel1Based}`);
        return content[moduleId][lessonId][partLevel1Based];
      }

      console.log(`🔍 Fetching from DB: module=${moduleId}, lesson=${lessonId}, part=${partLevel1Based} (0-based level: ${partLevel})`);

      // Fetch from database
      const modules = await this.getModules();
      const module = modules.find(m => m.id === moduleId);
      
      if (!module) {
        console.error(`❌ Module ${moduleId} not found`);
        return null;
      }

      let { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('module_id', moduleId)
        .single();

      if ((!lesson || lessonError) && lessonId != null) {
        console.log(`   🔄 Lesson ${lessonId} not found by ID, trying order_index fallback for module ${moduleId}`);
        const fallback = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', moduleId)
          .eq('order_index', lessonId)
          .single();

        lesson = fallback.data;
        lessonError = fallback.error;
      }

      if (lessonError || !lesson) {
        console.error(`❌ Lesson ${lessonId} not found in module ${moduleId}:`, lessonError?.message || 'No lesson returned');
        return null;
      }

      console.log(`   ✓ Got lesson: "${lesson.title}" (id=${lesson.id}, order_index=${lesson.order_index})`);

      const part = await this.getLessonPart(lesson.id, partLevel1Based);

      if (!part) {
        console.warn(`⚠️ Part ${partLevel1Based} not found for lesson ${lesson.id}. Trying legacy content fallback...`);

        // Fallback for legacy single-level lessons stored only in lesson.content
        // Only apply fallback to Level 1 so deeper levels still require explicit parts.
        if (partLevel1Based === 1 && lesson.content) {
          let legacyContent = lesson.content;

          if (typeof legacyContent === 'string') {
            try {
              legacyContent = JSON.parse(legacyContent);
            } catch (e) {
              // Keep as plain string markdown if JSON parsing fails
            }
          }

          if (typeof legacyContent === 'string') {
            return {
              title: lesson.title,
              description: this.buildFallbackDescription(lesson.title, legacyContent),
              content: legacyContent,
              examples: [],
              keyPoints: [],
              exercise: null,
              testCases: [],
              estimated_minutes: lesson.estimated_minutes,
              xp_reward: 10,
              lessonDbId: lesson.id,
              lessonOrder: lesson.order_index || null
            };
          }

          return {
            title: legacyContent.title || lesson.title,
            description: legacyContent.description || this.buildFallbackDescription(lesson.title, legacyContent.content || legacyContent.markdown || ''),
            content: legacyContent.content || legacyContent.markdown || '',
            examples: legacyContent.examples || [],
            keyPoints: legacyContent.keyPoints || [],
            exercise: legacyContent.exercise || null,
            testCases: legacyContent.testCases || [],
            estimated_minutes: lesson.estimated_minutes,
            xp_reward: 10,
            lessonDbId: lesson.id,
            lessonOrder: lesson.order_index || null
          };
        }

        console.error(`❌ Part ${partLevel1Based} not found in lesson. Parts count: ${lesson.parts?.length || 0}`);
        return null;
      }

      console.log(`   ✓ Got part: "${part.title}" (level=${part.level})`);

      const xpReward = part.xp_reward ?? part.xpReward ?? 10;
      return {
        title: part.title || lesson.title,
        description: part.description || lesson.title,
        content: part.content || '',
        examples: part.examples || [],
        keyPoints: part.keyPoints || [],
        exercise: part.exercise || null,
        testCases: part.testCases || [],
        estimated_minutes: lesson.estimated_minutes,
        xp_reward: xpReward,
        lessonOrder: lesson.order_index || null,
        lessonDbId: lesson.id
      };
    } catch (err) {
      console.error(`Error fetching level content ${moduleId}/${lessonId}/${partLevel}:`, err);
      return null;
    }
  }

  /**
   * Search lessons by keyword
   */
  async searchLessons(query) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .or(`title.ilike.%${query}%,content->>'markdown'.ilike.%${query}%`)
        .eq('is_published', true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching lessons:', err);
      return [];
    }
  }

  /**
   * Get lessons by type
   */
  async getLessonsByType(type) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('type', type)
        .eq('is_published', true)
        .order('module_id', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching lessons of type ${type}:`, err);
      return [];
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache() {
    this.lessonCache = {};
    this.moduleCache = {};
    this.contentCache = {};
  }

  /**
   * Preload all content into cache
   */
  async preloadAllContent() {
    console.log('📚 Preloading all lesson content...');
    const structure = await this.getCompleteStructure();
    console.log('✅ Preload complete');
    return structure;
  }
}

// Export singleton instance
const lessonContentService = new LessonContentService();
export default lessonContentService;
