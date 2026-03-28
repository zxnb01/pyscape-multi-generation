import supabase from '../utils/supabaseClient';

/**
 * Call OpenRouter API directly from browser
 * OpenRouter supports multiple LLM providers
 */
async function callOpenAI(prompt) {
  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      '❌ REACT_APP_OPENROUTER_API_KEY not found in .env\n' +
      'Add: REACT_APP_OPENROUTER_API_KEY=your-key to your .env file\n' +
      'Get key from: https://openrouter.ai/keys'
    );
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'X-Title': 'PyScape'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Python educator creating structured lesson content. Always respond with valid JSON only, no markdown wrapping.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse as JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If direct parse fails, try extracting from markdown code block
      const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse OpenRouter response as JSON');
      }
    }

    return parsed;
  } catch (err) {
    console.error('OpenRouter API call failed:', err);
    throw err;
  }
}

/**
 * Generate lesson content via OpenAI
 * Outputs structure matching LevelPage.js format
 */
async function generateLessonContent(skillId, skillName, description, prerequisites = []) {
  const prereqContext = prerequisites.length > 0 
    ? `Prerequisites (student already knows): ${prerequisites.join(', ')}\n`
    : 'No prerequisites - this is a foundational skill.\n';

  const prompt = `Create a comprehensive lesson for teaching "${skillName}" in Python.

${prereqContext}

Description: ${description}

Output ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "title": "Clear, engaging lesson title",
  "description": "One sentence summary (20-30 words)",
  "content": "2-3 paragraphs of markdown explanation with ### headers, **bold**, and \`code\`. Focus on core concepts and intuition. ~500-700 words.",
  "examples": [
    {
      "title": "Basic Example",
      "description": "Simple introductory example showing the core concept",
      "code": "# Python code - must be runnable\\n# Include comments\\n\\nprint('result')",
      "testCases": [
        {
          "description": "Verify basic functionality",
          "check": "# Simple assertion or check"
        }
      ]
    },
    {
      "title": "Intermediate Example",
      "description": "Shows practical application",
      "code": "# More complex, multi-line example",
      "testCases": [
        {
          "description": "Check common use case",
          "check": "# Another check"
        }
      ]
    },
    {
      "title": "Advanced Example",
      "description": "Real-world usage pattern",
      "code": "# Complex example showing best practices",
      "testCases": [
        {
          "description": "Advanced pattern",
          "check": "# Edge case check"
        }
      ]
    }
  ],
  "keyPoints": [
    "First key takeaway - what students must remember",
    "Second key takeaway - common mistake to avoid",
    "Third key takeaway - practical application",
    "Fourth key takeaway - how this connects to other skills"
  ],
  "exercise": {
    "title": "Challenge: ${skillName} Practice",
    "instructions": "Write Python code to solve this problem using ${skillName}. The code should... [2-3 sentences describing what to build]",
    "starterCode": "# TODO: Implement solution\\n# Your code here\\n\\nresult = None",
    "solution": "# Complete working solution\\n# This is the reference answer"
  }
}

Important:
- All code must be executable Python (no pseudocode)
- Examples should progress from simple to complex
- Keep it beginner-friendly but not patronizing
- Return ONLY the JSON object, nothing else`;

  console.log('🤖 Calling OpenAI for skill:', skillName);
  const lessonContent = await callOpenAI(prompt);
  
  console.log('✅ Generated content:', {
    title: lessonContent.title,
    examples: lessonContent.examples?.length,
    keyPoints: lessonContent.keyPoints?.length
  });

  return lessonContent;
}

/**
 * Save generated lesson to database
 */
async function saveLessonToDatabase(skillId, moduleId, skillName, lessonContent) {
  try {
    // Get the max order_index for this module to assign a unique one
    const { data: existingLessons, error: orderError } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1);

    if (orderError) throw orderError;

    const maxOrderIndex = existingLessons && existingLessons.length > 0 
      ? existingLessons[0].order_index 
      : 0;
    const nextOrderIndex = maxOrderIndex + 1;

    console.log(`📊 Module ${moduleId} - Max order_index: ${maxOrderIndex}, assigning: ${nextOrderIndex}`);

    // Wrap lesson content in parts array (single level per generated lesson)
    const partsArray = [{
      level: 1,
      title: lessonContent.title,
      description: lessonContent.description || '',
      content: lessonContent.content || '',
      examples: lessonContent.examples || [],
      keyPoints: lessonContent.keyPoints || [],
      exercise: lessonContent.exercise || null,
      testCases: lessonContent.testCases || []
    }];

    console.log(`📦 Saving lesson "${lessonContent.title}" with ${partsArray.length} part(s):`);
    console.log(`   Part 1: "${partsArray[0].title}"`);
    console.log(`   Parts data:`, JSON.stringify(partsArray).substring(0, 200) + '...');

    // Insert lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        module_id: moduleId,
        skill_id: skillId,
        title: lessonContent.title,
        type: 'code', // Type of lesson: 'read', 'code', etc.
        content: JSON.stringify(lessonContent), // Store full content in content column
        parts: partsArray, // Supabase will auto-convert to JSONB
        generated_by: 'ai-agent',
        is_published: true,
        order_index: nextOrderIndex
      })
      .select()
      .single();

    if (lessonError) throw lessonError;

    console.log(`✅ Lesson inserted: ID=${lesson.id}, Parts in DB: ${Array.isArray(lesson.parts) ? lesson.parts.length : 'ERROR'}`);

    // Create lesson-skill mapping
    const { error: mappingError } = await supabase
      .from('lesson_skills')
      .insert({
        lesson_id: lesson.id,
        skill_id: skillId,
        contribution: 1.0
      });

    if (mappingError) throw mappingError;

    console.log('💾 Lesson saved:', lesson.id, '- Order Index:', nextOrderIndex);
    return lesson;
  } catch (err) {
    console.error('Database save failed:', err);
    throw err;
  }
}

/**
 * Fetch prerequisites for a skill
 */
async function getSkillPrerequisites(skillId) {
  try {
    // Get skill dependencies - column is 'depends_on' not 'depends_on_id'
    const { data: deps, error: depsError } = await supabase
      .from('skill_dependencies')
      .select('depends_on')
      .eq('skill_id', skillId);

    if (depsError) throw depsError;

    if (deps.length === 0) return [];

    // Get prerequisite skill names
    const prereqIds = deps.map(d => d.depends_on);
    const { data: prereqSkills, error: skillsError } = await supabase
      .from('skills')
      .select('name')
      .in('id', prereqIds);

    if (skillsError) throw skillsError;

    return prereqSkills.map(s => s.name) || [];
  } catch (err) {
    console.error('Failed to fetch prerequisites:', err);
    return [];
  }
}

/**
 * Check if a lesson already exists for a skill
 */
async function lessonExistsForSkill(skillId) {
  try {
    const { count, error } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('skill_id', skillId);

    if (error) throw error;
    return count > 0;
  } catch (err) {
    console.error('Failed to check lesson existence:', err);
    return false;
  }
}

/**
 * Main function: Generate and save lesson for a single skill
 */
export async function generateAndSaveLessonForSkill(skillId, moduleId = 1) {
  try {
    console.log('🚀 Content Generation Started for skill:', skillId);

    // Fetch skill details
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError) throw new Error(`Skill not found: ${skillId}`);

    console.log('📚 Skill found:', skill.name);

    // Check if lesson already exists
    const alreadyExists = await lessonExistsForSkill(skillId);
    if (alreadyExists) {
      console.log('⚠️ Lesson already exists for this skill');
      return {
        success: false,
        error: `Lesson already exists for ${skill.name}`
      };
    }

    // Get prerequisites
    const prerequisites = await getSkillPrerequisites(skillId);
    console.log('🔗 Prerequisites:', prerequisites.length > 0 ? prerequisites : 'none');

    // Generate content via OpenAI
    const lessonContent = await generateLessonContent(
      skill.id,
      skill.name,
      skill.description,
      prerequisites
    );

    // Save to database
    const savedLesson = await saveLessonToDatabase(
      skill.id,
      moduleId,
      skill.name,
      lessonContent
    );

    console.log('✨ Complete! Lesson saved with ID:', savedLesson.id);

    return {
      success: true,
      skill: skill.name,
      lesson: savedLesson,
      content: lessonContent
    };
  } catch (err) {
    console.error('❌ Generation failed:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Batch function: Generate lessons for all skills without lessons
 */
export async function generateAllMissingLessons() {
  try {
    console.log('🔄 Starting batch lesson generation...');

    // Get all skills
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id, name')
      .eq('published', true); // Only published skills

    if (skillsError) throw skillsError;

    let generated = 0;
    let skipped = 0;

    for (const skill of skills) {
      const hasLesson = await lessonExistsForSkill(skill.id);
      
      if (hasLesson) {
        console.log(`⏭️  Skipping ${skill.name} (lesson exists)`);
        skipped++;
      } else {
        console.log(`⏳ Generating for ${skill.name}...`);
        const result = await generateAndSaveLessonForSkill(skill.id);
        
        if (result.success) {
          generated++;
          console.log(`✅ Generated lesson for ${skill.name}`);
        } else {
          console.error(`❌ Failed for ${skill.name}: ${result.error}`);
        }

        // Add delay between requests to avoid rate limiting
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`✨ Batch complete: ${generated} generated, ${skipped} skipped`);

    return {
      success: true,
      generated,
      skipped,
      total: skills.length
    };
  } catch (err) {
    console.error('❌ Batch generation failed:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Regenerate lesson for a skill (overwrite existing)
 */
export async function regenerateLessonForSkill(skillId, moduleId = 1) {
  try {
    console.log('🔄 Regenerating lesson for skill:', skillId);

    // Fetch skill details
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError) throw skillError;

    // Get prerequisites
    const prerequisites = await getSkillPrerequisites(skillId);

    // Generate new content
    const lessonContent = await generateLessonContent(
      skill.id,
      skill.name,
      skill.description,
      prerequisites
    );

    // Delete old lessons for this skill
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('skill_id', skillId);

    if (deleteError) throw deleteError;

    // Save new lesson using the corrected function
    const savedLesson = await saveLessonToDatabase(
      skill.id,
      moduleId,
      skill.name,
      lessonContent
    );

    console.log('✨ Lesson regenerated:', savedLesson.id);

    return {
      success: true,
      skill: skill.name,
      lesson: savedLesson,
      content: lessonContent
    };
  } catch (err) {
    console.error('❌ Regeneration failed:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}
