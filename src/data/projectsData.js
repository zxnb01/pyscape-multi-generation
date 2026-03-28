import supabase from '../utils/supabaseClient';

// Local cache
let cachedProjects = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all projects from Supabase, transforming the DB shape
 * into the shape the frontend expects.
 */
export async function fetchProjects() {
  // Check cache validity
  if (cachedProjects && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION_MS)) {
    console.log('📦 Returning cached projects');
    return cachedProjects;
  }

  try {
    console.log('🔄 Fetching projects from Supabase...');
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, description, difficulty, estimated_hours, steps, xp_reward, unlock_threshold, is_published')
      .eq('is_published', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No projects found in database');
      return [];
    }

    // Transform DB shape → frontend shape
    const diffMap = { beginner: 'Easy', intermediate: 'Medium', advanced: 'Hard' };
    
    const projects = (data || []).map(p => {
      const meta = p.steps || {};
      const mappedDifficulty = diffMap[p.difficulty] || 'Medium';
      
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        tagline: p.description,
        difficulty: mappedDifficulty,
        difficultyLabel: meta.difficultyLabel || mappedDifficulty,
        category: meta.category || 'General',
        xp: p.xp_reward,
        status: meta.status || 'available',
        completions: meta.completions || 0,
        timeEstimate: meta.timeEstimate || `${p.estimated_hours}h`,
        keywords: meta.keywords || [],
        keyConcepts: meta.keyConcepts || [],
        series: meta.series || [],
        summary: meta.summary || { headline: '', intro: p.description, whatYoullLearn: [], previewCaption: '' },
        steps: {
          onYourOwn: meta.onYourOwn || [],
          someGuidance: meta.someGuidance || [],
          stepByStep: meta.stepByStep || [],
        },
      };
    });

    // Update cache
    cachedProjects = projects;
    cacheTimestamp = Date.now();
    
    console.log(`✅ Successfully loaded ${projects.length} projects`);
    return projects;
  } catch (err) {
    console.error('❌ Error fetching projects from Supabase:', err);
    
    // Return cached data if available, even if expired
    if (cachedProjects) {
      console.warn('📦 Returning cached projects despite network error');
      return cachedProjects;
    }

    // Return empty array as last resort
    console.error('💥 No projects available - returning empty array');
    return [];
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id) {
  const projects = await fetchProjects();
  return projects.find(p => p.id === parseInt(id));
}

/**
 * Default export for backward compatibility
 * Returns empty array - components should use fetchProjects()
 */
export const projects = [];

