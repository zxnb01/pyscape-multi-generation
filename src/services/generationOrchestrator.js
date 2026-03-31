// generationOrchestrator.js - Orchestrates multi-level content generation workflow
// Coordinates specialized agents and manages queue tracking

import supabase from '../utils/supabaseClient.js';
import { getAgentForLevel } from './levelAgents.js';

/**
 * Update generation queue status with metadata
 */
async function updateQueueStatus(queueId, status, metadata = {}) {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
      ...metadata
    };

    if (status === 'processing' && !metadata.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'completed' && !metadata.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('generation_queue')
      .update(updates)
      .eq('id', queueId);

    if (error) throw error;
    console.log(`  ✅ Queue [${queueId}] updated: ${status}`);
  } catch (error) {
    console.error(`  ❌ Queue update failed:`, error.message);
  }
}

/**
 * Get skill details with prerequisites
 */
async function getSkillDetails(skillId, moduleId) {
  try {
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError) throw skillError;

    // Get prerequisites via DAG
    const { data: deps, error: depsError } = await supabase
      .from('skill_dependencies')
      .select('depends_on')
      .eq('skill_id', skillId);

    if (depsError) console.warn('Could not fetch dependencies:', depsError);

    let prerequisites = [];
    if (deps && deps.length > 0) {
      const depIds = deps.map(d => d.depends_on);
      const { data: prereqSkills } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', depIds);

      prerequisites = prereqSkills || [];
    }

    return { skill, prerequisites };
  } catch (error) {
    console.error(`❌ Failed to get skill details:`, error.message);
    throw error;
  }
}

/**
 * Get module details for module-topic-first generation context
 */
async function getModuleDetails(moduleId) {
  const { data: module, error } = await supabase
    .from('modules')
    .select('id, title, description, tags')
    .eq('id', moduleId)
    .single();

  if (error) throw error;
  return module;
}

/**
 * Get existing lesson for skill (if any)
 */
async function getExistingLesson(skillId, moduleId) {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, order_index, parts')
      .eq('skill_id', skillId)
      .eq('module_id', moduleId)
      .single();

    return lesson;
  } catch (error) {
    // No existing lesson, return null
    return null;
  }
}

/**
 * Map a level number to a queue generation type that fits the schema.
 */
function getQueueGenerationType(levelNumber) {
  switch (levelNumber) {
    case 1:
      return 'intro';
    case 2:
    case 3:
      return 'practical';
    case 4:
      return 'projects';
    case 5:
      return 'challenges';
    default:
      return 'custom';
  }
}

/**
 * Reuse an existing generation queue row or create one when missing.
 */
async function getOrCreateQueueEntry(skillId, moduleId, levelNumber, batchConfig = {}, lessonId = null) {
  try {
    let query = supabase
      .from('generation_queue')
      .select('id');

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    } else if (skillId) {
      query = query.eq('skill_id', skillId);
    }

    let { data: existingRows, error: selectError } = await query
      .eq('module_id', moduleId)
      .eq('level', levelNumber)
      .order('created_at', { ascending: false })
      .limit(1);

    if ((!existingRows || existingRows.length === 0) && lessonId && skillId) {
      const skillFallback = await supabase
        .from('generation_queue')
        .select('id')
        .eq('skill_id', skillId)
        .eq('module_id', moduleId)
        .eq('level', levelNumber)
        .order('created_at', { ascending: false })
        .limit(1);

      if (skillFallback.error) throw skillFallback.error;
      existingRows = skillFallback.data;
    }

    if (selectError) throw selectError;

    if (existingRows && existingRows.length > 0) {
      return existingRows[0];
    }

    const { data: createdRow, error: insertError } = await supabase
      .from('generation_queue')
      .insert({
        skill_id: skillId || null,
        lesson_id: lessonId || null,
        module_id: moduleId,
        level: levelNumber,
        generation_type: getQueueGenerationType(levelNumber),
        status: 'pending',
        batch_config: {
          mode: batchConfig.mode || 'skill_first',
          levels_selected: batchConfig.selectedLevels || [1, 2, 3, 4, 5]
        }
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return createdRow;
  } catch (error) {
    console.warn(`  ⚠️ Queue entry unavailable for skill ${skillId}, level ${levelNumber}:`, error.message);
    return null;
  }
}

/**
 * Calculate next order_index for skill in module using prerequisite awareness
 * PHASE 3 ENHANCEMENT: Respects skill prerequisite chains
 */
async function getNextOrderIndex(moduleId, skillId = null) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('order_index, skill_id')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(100); // Get more to analyze prerequisite ordering

    if (error) throw error;

    const lessonsBySkill = {};
    let maxOrderIndex = 0;

    // Build map of skills and their order_indices
    (data || []).forEach(lesson => {
      if (lesson.skill_id) {
        lessonsBySkill[lesson.skill_id] = lesson.order_index;
        maxOrderIndex = Math.max(maxOrderIndex, lesson.order_index);
      }
    });

    // If no skill_id provided, simple increment
    if (!skillId) {
      return maxOrderIndex + 1;
    }

    // PHASE 3 ENHANCEMENT: Check prerequisites
    try {
      const { data: prereqs, error: prereqError } = await supabase
        .from('skill_dependencies')
        .select('depends_on')
        .eq('skill_id', skillId);

      if (prereqError) {
        console.warn(`  ⚠️ Could not fetch prerequisites for skill ${skillId}, using simple increment`);
        return maxOrderIndex + 1;
      }

      if (!prereqs || prereqs.length === 0) {
        // No prerequisites, use next sequential order_index
        return maxOrderIndex + 1;
      }

      // Get prerequisite order indices
      const prereqIds = prereqs.map(p => p.depends_on);
      const prereqOrderIndices = prereqIds
        .map(pId => lessonsBySkill[pId])
        .filter(idx => idx !== undefined);

      if (prereqOrderIndices.length === 0) {
        // Prerequisites exist but not yet generated, assign after max current
        console.log(`  ⚠️ Skill ${skillId} has prerequisites not yet generated, assigning after current max`);
        return maxOrderIndex + 1;
      }

      // Assign this skill after all prerequisites
      const maxPrereqOrder = Math.max(...prereqOrderIndices);
      const assignedOrder = maxPrereqOrder + 1;

      console.log(`  📊 Prerequisite-aware ordering: skill ${skillId} positioned at ${assignedOrder} (after prerequisites at ${maxPrereqOrder})`);
      return assignedOrder;
    } catch (error) {
      console.warn(`  ⚠️ Prerequisite check failed, using simple increment:`, error.message);
      return maxOrderIndex + 1;
    }
  } catch (error) {
    console.error(`❌ Failed to get next order_index:`, error.message);
    return 1;
  }
}

/**
 * Save generated level content to database
 */
async function saveLevelContent(skillId, moduleId, levelContent, existingLessonId = null, lessonTitleOverride = null) {
  try {
    const levelNumber = levelContent.level;
    
    if (!existingLessonId) {
      // Create new lesson with PREREQUISITE-AWARE ordering (PHASE 3)
      const nextOrderIndex = await getNextOrderIndex(moduleId, skillId);

      const { data: newLesson, error: createError } = await supabase
        .from('lessons')
        .insert({
          skill_id: skillId,
          module_id: moduleId,
          title: lessonTitleOverride || levelContent.title,
          type: 'read', // 'read' for AI-generated content lessons
          content: JSON.stringify(levelContent),
          parts: [levelContent], // Array with first level - let Supabase handle JSONB
          order_index: nextOrderIndex,
          generated_by: 'multi-agent-orchestrator',
          is_published: false
        })
        .select('id')
        .single();

      if (createError) throw createError;

      console.log(`  📝 Created new lesson [${newLesson.id}] with level ${levelNumber} at order_index ${nextOrderIndex}`);
      return newLesson.id;
    } else {
      // Update existing lesson - append level to parts array
      const { data: existingLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('parts')
        .eq('id', existingLessonId)
        .single();

      if (fetchError) throw fetchError;

      let partsArray = [];
      if (existingLesson.parts) {
        if (typeof existingLesson.parts === 'string') {
          partsArray = JSON.parse(existingLesson.parts);
        } else {
          partsArray = existingLesson.parts;
        }
      }

      // Replace or append level
      const levelIndex = levelNumber - 1;
      if (partsArray[levelIndex]) {
        partsArray[levelIndex] = levelContent;
      } else {
        partsArray[levelIndex] = levelContent;
      }

      // PHASE 4: Keep content field in sync with parts[0] for backward compatibility
      const updatePayload = {
        parts: partsArray, // Let Supabase handle JSONB
        updated_at: new Date().toISOString()
      };
      
      // If updating Level 1, also update content field
      if (levelIndex === 0) {
        updatePayload.content = JSON.stringify(levelContent);
        if (lessonTitleOverride) {
          updatePayload.title = lessonTitleOverride;
        }
      }

      const { error: updateError } = await supabase
        .from('lessons')
        .update(updatePayload)
        .eq('id', existingLessonId);

      if (updateError) throw updateError;

      console.log(`  📝 Updated lesson with level ${levelNumber}${levelIndex === 0 ? ' + synced content field' : ''}`);
      return existingLessonId;
    }
  } catch (error) {
    console.error(`  ❌ Failed to save level content:`, error.message);
    throw error;
  }
}

/**
 * Main orchestration: Generate all 5 levels for a skill
 */
export async function generateSkillMultiLevel(skillId, moduleId, batchConfig = {}) {
  const {
    mode = 'skill_first', // 'skill_first' or 'level_first'
    selectedLevels = [1, 2, 3, 4, 5],
    generationContext = {}
  } = batchConfig;

  console.log(`\n🎯 Starting multi-level generation for skill ${skillId} in module ${moduleId}`);
  console.log(`   Mode: ${mode} | Levels: ${selectedLevels.join(', ')}`);

  try {
    // Get skill details
    const { skill, prerequisites } = await getSkillDetails(skillId, moduleId);
    console.log(`   Skill: "${skill.name}" (ID: ${skillId})`);

    // Check for existing lesson
    let existingLessonId = null;
    const existing = await getExistingLesson(skillId, moduleId);
    if (existing) {
      existingLessonId = existing.id;
      console.log(`   Found existing lesson [${existingLessonId}], will append levels`);
    }

    // Track costs
    let totalCost = 0;
    let totalTokens = 0;
    const generatedLevels = [];

    // Generate each selected level
    for (const levelNumber of selectedLevels) {
      console.log(`\n   📌 Level ${levelNumber}/${Math.max(...selectedLevels)}`);

      const queueEntry = await getOrCreateQueueEntry(skillId, moduleId, levelNumber, {
        mode,
        selectedLevels
      }, null);

      if (queueEntry) {
        await updateQueueStatus(queueEntry.id, 'processing');
      }

      try {
        // Get agent for this level
        const agent = getAgentForLevel(levelNumber);
        console.log(`   🤖 Using ${agent.name}`);

        // Generate level (2s rate limit between calls)
        if (selectedLevels.indexOf(levelNumber) > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const levelContent = await agent.generateLevel(
          skillId,
          skill.name,
          skill.description,
          prerequisites,
          levelNumber,
          generationContext
        );

        // Extract token info (if available in OpenAI response)
        // For now, estimate: ~500 tokens per level
        const estimatedTokens = 500;
        const estimatedCost = (estimatedTokens / 1000) * 0.002; // ~$0.002 per 1K tokens

        totalTokens += estimatedTokens;
        totalCost += estimatedCost;

        // Save to database
        const lessonId = await saveLevelContent(skillId, moduleId, levelContent, existingLessonId);
        if (!existingLessonId) existingLessonId = lessonId;

        // Update queue
        if (queueEntry) {
          await updateQueueStatus(queueEntry.id, 'completed', {
            tokens_used: estimatedTokens,
            cost_usd: estimatedCost.toFixed(6)
          });
        }

        generatedLevels.push({
          level: levelNumber,
          type: levelContent.type,
          status: 'completed'
        });

        console.log(`   ✅ Level ${levelNumber} completed (${estimatedTokens} tokens, $${estimatedCost.toFixed(4)})`);
      } catch (error) {
        console.error(`   ❌ Level ${levelNumber} failed:`, error.message);

        // Mark queue as failed
        if (queueEntry) {
          await updateQueueStatus(queueEntry.id, 'failed', {
            error_message: error.message
          });
        }

        generatedLevels.push({
          level: levelNumber,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log(`\n✅ Skill generation complete!`);
    console.log(`   Total tokens: ${totalTokens}`);
    console.log(`   Total cost: $${totalCost.toFixed(4)}`);
    console.log(`   Levels: ${generatedLevels.map(l => l.level).join(', ')}`);

    return {
      skillId,
      moduleId,
      skill: skill.name,
      generatedLevels,
      totalTokens,
      totalCost,
      lessonId: existingLessonId
    };
  } catch (error) {
    console.error(`❌ Skill generation orchestration failed:`, error.message);
    throw error;
  }
}

/**
 * Main orchestration: Generate all selected levels for a module lesson target.
 * Module context is primary, skill graph is enrichment when available.
 */
export async function generateModuleLessonMultiLevel(moduleId, lessonSeed, batchConfig = {}) {
  const {
    mode = 'module_topic_first',
    selectedLevels = [1, 2, 3, 4, 5]
  } = batchConfig;

  const lessonTitle = lessonSeed?.title || lessonSeed?.name || `Module ${moduleId} Lesson`;

  console.log(`\n🎯 Starting module-topic generation for lesson "${lessonTitle}" in module ${moduleId}`);
  console.log(`   Mode: ${mode} | Levels: ${selectedLevels.join(', ')}`);

  try {
    const module = await getModuleDetails(moduleId);

    let skill = null;
    let prerequisites = [];

    if (lessonSeed?.skillId) {
      try {
        const skillDetails = await getSkillDetails(lessonSeed.skillId, moduleId);
        skill = skillDetails.skill;
        prerequisites = (skillDetails.prerequisites || []).map(p => p.name);
      } catch (error) {
        console.warn('⚠️ Skill enrichment unavailable, continuing with module-topic context only');
      }
    }

    const syntheticSkillName = lessonTitle || skill?.name || `${module.title} Lesson`;
    const syntheticDescription = skill?.description || `${module.description || ''} Focus: ${lessonTitle || 'module lesson'}`;

    let existingLessonId = lessonSeed?.id || null;

    if (!existingLessonId && lessonSeed?.skillId) {
      const existing = await getExistingLesson(lessonSeed.skillId, moduleId);
      if (existing) existingLessonId = existing.id;
    }

    let totalCost = 0;
    let totalTokens = 0;
    const generatedLevels = [];

    const generationContext = {
      source: 'module-topic-first',
      moduleId,
      moduleTitle: module?.title,
      moduleDescription: module?.description,
      moduleTags: module?.tags || [],
      lessonId: lessonSeed?.id || null,
      lessonTitle,
      lessonOrderIndex: lessonSeed?.order_index,
      mode
    };

    for (const levelNumber of selectedLevels) {
      console.log(`\n   📌 Level ${levelNumber}/${Math.max(...selectedLevels)}`);

      try {
        const agent = getAgentForLevel(levelNumber);
        console.log(`   🤖 Using ${agent.name}`);

        const queueEntry = await getOrCreateQueueEntry(lessonSeed?.skillId || null, moduleId, levelNumber, {
          mode,
          selectedLevels
        }, lessonSeed?.id || null);

        if (queueEntry) {
          await updateQueueStatus(queueEntry.id, 'processing');
        }

        if (selectedLevels.indexOf(levelNumber) > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const levelContent = await agent.generateLevel(
          lessonSeed?.skillId || null,
          syntheticSkillName,
          syntheticDescription,
          prerequisites,
          levelNumber,
          generationContext
        );

        const estimatedTokens = 500;
        const estimatedCost = (estimatedTokens / 1000) * 0.002;

        totalTokens += estimatedTokens;
        totalCost += estimatedCost;

        const lessonId = await saveLevelContent(lessonSeed?.skillId || null, moduleId, levelContent, existingLessonId, lessonTitle);
        if (!existingLessonId) existingLessonId = lessonId;

        if (queueEntry) {
          await updateQueueStatus(queueEntry.id, 'completed', {
            tokens_used: estimatedTokens,
            cost_usd: estimatedCost.toFixed(6)
          });
        }

        generatedLevels.push({
          level: levelNumber,
          type: levelContent.type,
          status: 'completed'
        });

        console.log(`   ✅ Level ${levelNumber} completed (${estimatedTokens} tokens, $${estimatedCost.toFixed(4)})`);
      } catch (error) {
        console.error(`   ❌ Level ${levelNumber} failed:`, error.message);
        generatedLevels.push({
          level: levelNumber,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      moduleId,
      lessonId: existingLessonId,
      lessonTitle,
      skillId: lessonSeed?.skillId || null,
      generatedLevels,
      totalTokens,
      totalCost
    };
  } catch (error) {
    console.error(`❌ Module-topic generation failed:`, error.message);
    throw error;
  }
}

/**
 * Batch generation: Generate multiple skills in skill-first or level-first mode
 */
export async function generateBatch(moduleId, skills, batchConfig = {}) {
  const {
    mode = 'skill_first',
    selectedLevels = [1, 2, 3, 4, 5],
    startIndex = 0
  } = batchConfig;

  console.log(`\n🚀 Starting batch generation for ${skills.length} skills (Module ${moduleId})`);
  console.log(`   Mode: ${mode} | Levels: ${selectedLevels.join(', ')}`);

  const results = [];
  let totalCost = 0;
  let totalTokens = 0;

  if (mode === 'skill_first') {
    // Each skill completes all its levels before next skill starts
    for (let i = startIndex; i < skills.length; i++) {
      const skillId = skills[i];
      console.log(`\n[${i + 1}/${skills.length}] Processing skill ${skillId}`);

      try {
        const result = await generateSkillMultiLevel(skillId, moduleId, {
          mode,
          selectedLevels
        });

        results.push(result);
        totalCost += result.totalCost;
        totalTokens += result.totalTokens;
      } catch (error) {
        console.error(`Failed to generate skill ${skillId}:`, error.message);
        results.push({
          skillId,
          moduleId,
          status: 'failed',
          error: error.message
        });
      }
    }
  } else if (mode === 'level_first') {
    // All level 1s, then all level 2s, etc.
    for (const levelNumber of selectedLevels) {
      console.log(`\n📌 Generating Level ${levelNumber} for all skills...`);

      for (let i = startIndex; i < skills.length; i++) {
        const skillId = skills[i];

        try {
          const result = await generateSkillMultiLevel(skillId, moduleId, {
            mode,
            selectedLevels: [levelNumber]
          });

          results.push(result);
          totalCost += result.totalCost;
          totalTokens += result.totalTokens;
        } catch (error) {
          console.error(`Failed to generate level ${levelNumber} for skill ${skillId}:`, error.message);
        }
      }
    }
  }

  console.log(`\n✅ Batch generation complete!`);
  console.log(`   Skills processed: ${results.filter(r => !r.error).length}/${skills.length}`);
  console.log(`   Total tokens: ${totalTokens}`);
  console.log(`   Total cost: $${totalCost.toFixed(4)}`);

  return {
    mode,
    moduleId,
    skillsCount: skills.length,
    completed: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    results,
    totalTokens,
    totalCost
  };
}

/**
 * Resume interrupted batch generation
 */
export async function resumeBatchGeneration(moduleId, batchConfig = {}) {
  try {
    // Get pending queue entries
    const { data: pending, error } = await supabase
      .from('generation_queue')
      .select('id, skill_id, level')
      .eq('module_id', moduleId)
      .eq('status', 'pending')
      .order('skill_id', { ascending: true })
      .order('level', { ascending: true });

    if (error) throw error;

    if (!pending || pending.length === 0) {
      console.log('✅ No pending generations to resume');
      return { resumed: 0 };
    }

    console.log(`🔄 Resuming ${pending.length} pending generations...`);

    // Group by skill
    const skillsMap = new Map();
    for (const entry of pending) {
      if (!skillsMap.has(entry.skill_id)) {
        skillsMap.set(entry.skill_id, []);
      }
      skillsMap.get(entry.skill_id).push(entry.level);
    }

    const results = [];
    for (const [skillId, levels] of skillsMap) {
      try {
        const result = await generateSkillMultiLevel(skillId, moduleId, {
          selectedLevels: levels
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to resume skill ${skillId}:`, error.message);
      }
    }

    console.log(`✅ Resumed ${results.length} skills`);
    return {
      resumed: results.length,
      results
    };
  } catch (error) {
    console.error(`❌ Resume generation failed:`, error.message);
    throw error;
  }
}
