import React, { useState, useEffect, useCallback } from 'react';
import { generateSkillMultiLevel, generateModuleLessonMultiLevel } from '../services/generationOrchestrator';
import { QueueProgressPanel } from '../components/QueueProgressPanel';
import supabase from '../utils/supabaseClient';

export default function DebugContentGenerator() {
  const [modules, setModules] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingSkillId, setGeneratingSkillId] = useState(null);
  const [results, setResults] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  
  // Multi-level configuration
  const [batchMode, setBatchMode] = useState('skill_first'); // 'skill_first' or 'level_first' or 'single'
  const [selectedLevels, setSelectedLevels] = useState([1, 2, 3, 4, 5]);
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const [moduleId, setModuleId] = useState(1);

  const inferSkillsForModule = useCallback(async (allSkills, selectedModule) => {
    try {
      // 1) First preference: explicit mapping from lessons in this module
      const { data: moduleLessons, error: moduleLessonsError } = await supabase
        .from('lessons')
        .select('skill_id')
        .eq('module_id', selectedModule.id)
        .not('skill_id', 'is', null);

      if (moduleLessonsError) throw moduleLessonsError;

      const mappedSkillIds = new Set((moduleLessons || []).map(l => l.skill_id).filter(Boolean));
      if (mappedSkillIds.size > 0) {
        const mappedSkills = allSkills.filter(skill => mappedSkillIds.has(skill.id));
        console.log(`📚 Skills fetched from lesson mapping for module ${selectedModule.id}: ${mappedSkills.length}`);
        return mappedSkills;
      }

      // 2) Fallback: infer relevant skills from module metadata + dependency closure
      const moduleText = [
        selectedModule?.title || '',
        selectedModule?.description || '',
        ...(Array.isArray(selectedModule?.tags) ? selectedModule.tags : [])
      ]
        .join(' ')
        .toLowerCase();

      const stopWords = new Set([
        'with', 'and', 'for', 'the', 'this', 'that', 'from', 'into', 'your',
        'learn', 'master', 'introduction', 'fundamentals', 'basics', 'data',
        'python', 'using', 'powerful', 'working'
      ]);

      const tokens = moduleText
        .split(/[^a-z0-9]+/)
        .filter(token => token.length >= 3 && !stopWords.has(token));

      const keywordSet = new Set(tokens);
      if ((selectedModule?.title || '').toLowerCase().includes('pandas')) keywordSet.add('pandas');
      if ((selectedModule?.description || '').toLowerCase().includes('numpy')) keywordSet.add('numpy');

      const scored = allSkills
        .map(skill => {
          const haystack = `${skill.name || ''} ${skill.description || ''}`.toLowerCase();
          let score = 0;

          for (const keyword of keywordSet) {
            if (haystack.includes(keyword)) score += 1;
          }

          return { skill, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.skill.difficulty - b.skill.difficulty);

      if (scored.length === 0) {
        console.warn(`⚠️ No inferred skill matches for module ${selectedModule.id}. Returning no fallback targets.`);
        return [];
      }

      const { data: deps, error: depsError } = await supabase
        .from('skill_dependencies')
        .select('skill_id, depends_on');

      if (depsError) throw depsError;

      const depMap = new Map();
      (deps || []).forEach(dep => {
        if (!depMap.has(dep.skill_id)) depMap.set(dep.skill_id, []);
        depMap.get(dep.skill_id).push(dep.depends_on);
      });

      const selectedIds = new Set(scored.map(item => item.skill.id));
      const stack = [...selectedIds];

      while (stack.length > 0) {
        const current = stack.pop();
        const prereqs = depMap.get(current) || [];
        prereqs.forEach(prereqId => {
          if (!selectedIds.has(prereqId)) {
            selectedIds.add(prereqId);
            stack.push(prereqId);
          }
        });
      }

      const inferredSkills = allSkills.filter(skill => selectedIds.has(skill.id));
      console.log(`📚 Skills inferred for module ${selectedModule.id}: ${inferredSkills.length}`);
      return inferredSkills;
    } catch (error) {
      console.error('Failed to infer module skills:', error);
      return [];
    }
  }, []);

  const fetchModulesAndSkills = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all published modules in order (same as Learn page)
      const { data: modsData, error: modsError } = await supabase
        .from('modules')
        .select('id, title, description, difficulty, prerequisites, estimated_hours, order_index, tags, is_published')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (modsError) throw modsError;
      setModules(modsData || []);
      
      // Set to first module if not set
      if (!moduleId || !modsData?.find(m => m.id === moduleId)) {
        if (modsData && modsData.length > 0) {
          setModuleId(modsData[0].id);
        }
      }

      // Fetch all published skills, then scope to selected module
      const { data: allSkills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('domain', 'python')
        .eq('is_published', true)
        .order('difficulty', { ascending: true })
        .order('name', { ascending: true });

      if (skillsError) throw skillsError;

      const selectedModule = (modsData || []).find(m => m.id === moduleId) || (modsData || [])[0];
      const { data: moduleLessons, error: moduleLessonsError } = await supabase
        .from('lessons')
        .select('id, skill_id, title, estimated_minutes, order_index, type')
        .eq('module_id', selectedModule?.id)
        .order('order_index', { ascending: true });

      if (moduleLessonsError) throw moduleLessonsError;

      if ((moduleLessons || []).length > 0) {
        const lessonTargets = (moduleLessons || []).map(lesson => ({
          id: lesson.id,
          skillId: lesson.skill_id,
          title: lesson.title,
          name: lesson.title,
          description: `${selectedModule?.title || 'Module lesson'} (${lesson.type || 'read'})`,
          estimated_minutes: lesson.estimated_minutes,
          difficulty: selectedModule?.difficulty || 'module',
          order_index: lesson.order_index,
          sourceType: 'module_lesson'
        }));

        setSkills(lessonTargets);
        console.log(`📚 Module lesson targets loaded for module ${selectedModule?.id}: ${lessonTargets.length}`);
      } else {
        const moduleScopedSkills = await inferSkillsForModule(allSkills || [], selectedModule || {});
        const fallbackTargets = (moduleScopedSkills || []).map(skill => ({
          id: skill.id,
          skillId: skill.id,
          title: skill.name,
          name: skill.name,
          description: skill.description,
          estimated_minutes: skill.estimated_minutes,
          difficulty: skill.difficulty,
          sourceType: 'skill_fallback'
        }));

        setSkills(fallbackTargets);
        console.log(`📚 Skill fallback targets loaded for module ${selectedModule?.id}: ${fallbackTargets.length}`);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [moduleId, inferSkillsForModule]);

  useEffect(() => {
    fetchModulesAndSkills();
  }, [fetchModulesAndSkills]);

  // Handle level selection
  const toggleLevel = (levelNum) => {
    setSelectedLevels(prev =>
      prev.includes(levelNum)
        ? prev.filter(l => l !== levelNum)
        : [...prev, levelNum].sort((a, b) => a - b)
    );
  };

  const runTargetGeneration = async (target, levelsToGenerate = selectedLevels) => {
    const selectedModule = modules.find(m => m.id === moduleId);

    if (target.sourceType === 'module_lesson') {
      return generateModuleLessonMultiLevel(moduleId, target, {
        mode: 'module_topic_first',
        selectedLevels: levelsToGenerate
      });
    }

    return generateSkillMultiLevel(target.skillId || target.id, moduleId, {
      mode: 'skill_first',
      selectedLevels: levelsToGenerate,
      generationContext: {
        source: 'skill-fallback',
        moduleId,
        moduleTitle: selectedModule?.title,
        moduleDescription: selectedModule?.description,
        moduleTags: selectedModule?.tags || [],
        lessonTitle: target.name
      }
    });
  };

  // Single target multi-level generation
  const handleGenerateMultiLevel = async (target) => {
    setGeneratingSkillId(target.id);
    try {
      const result = await runTargetGeneration(target, selectedLevels);

      setResults([
        {
          skill: target.name,
          status: '✅ SUCCESS',
          message: `Generated ${result.generatedLevels.filter(l => l.status === 'completed').length}/${selectedLevels.length} levels`,
          levels: result.generatedLevels,
          timestamp: new Date().toLocaleTimeString()
        },
        ...results
      ]);
      alert(`✅ Multi-level generation complete for ${target.name}!`);
    } catch (err) {
      console.error('Generation error:', err);
      setResults([
        {
          skill: target.name,
          status: '❌ ERROR',
          message: err.message,
          timestamp: new Date().toLocaleTimeString()
        },
        ...results
      ]);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setGeneratingSkillId(null);
    }
  };

  // Single-level generation (module-topic-first)
  const handleGenerateSingleLevel = async (target) => {
    setGeneratingSkillId(target.id);
    try {
      await runTargetGeneration(target, [1]);

      setResults([
        {
          skill: target.name,
          status: '✅ SUCCESS',
          message: `Single-level lesson generated and saved`,
          timestamp: new Date().toLocaleTimeString()
        },
        ...results
      ]);
      alert(`✅ Lesson generated for ${target.name}!`);
    } catch (err) {
      console.error('Generation error:', err);
      setResults([
        {
          skill: target.name,
          status: '❌ ERROR',
          message: err.message,
          timestamp: new Date().toLocaleTimeString()
        },
        ...results
      ]);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setGeneratingSkillId(null);
    }
  };

  // Batch generation
  const handleBatchGenerate = async () => {
    setBatchProcessing(true);
    setShowQueuePanel(true);

    try {
      let completed = 0;
      let failed = 0;

      if (batchMode === 'level_first') {
        for (const level of selectedLevels) {
          for (const target of skills) {
            try {
              await runTargetGeneration(target, [level]);
              completed += 1;
            } catch (error) {
              console.error(`Batch level-first failure for ${target.name} L${level}:`, error.message);
              failed += 1;
            }
          }
        }
      } else {
        const levelsForRun = batchMode === 'single' ? [1] : selectedLevels;
        for (const target of skills) {
          try {
            await runTargetGeneration(target, levelsForRun);
            completed += 1;
          } catch (error) {
            console.error(`Batch failure for ${target.name}:`, error.message);
            failed += 1;
          }
        }
      }

      setResults([
        {
          skill: 'BATCH PROCESS',
          status: failed > 0 ? '⚠️ PARTIAL' : '✅ COMPLETE',
          message: `Completed ${completed}/${skills.length} targets`,
          timestamp: new Date().toLocaleTimeString()
        },
        ...results
      ]);

      alert(`✅ Batch generation complete! ${completed} targets processed.`);
    } catch (err) {
      console.error('Batch error:', err);
      setResults([
        {
          skill: 'BATCH PROCESS',
          status: '❌ ERROR',
          message: err.message,
          timestamp: new Date().toLocaleTimeString()
        },
        ...results
      ]);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setBatchProcessing(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  // Calculate cost estimate
  const estimatedCostPerSkill = selectedLevels.length * 0.02; // ~$0.02 per level
  const estimatedTotalCost = (estimatedCostPerSkill * skills.length).toFixed(2);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🔧 Debug: Content Generator (Multi-Level)</h1>
        <p style={styles.subtitle}>AI-powered module-topic-first multi-level lesson generation</p>
        <p style={styles.warning}>⚠️ For development only - delete this page before production</p>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <p>Loading modules and generation targets...</p>
        </div>
      ) : modules.length === 0 ? (
        <div style={styles.errorContainer}>
          <p>❌ No modules found. Please check your database.</p>
        </div>
      ) : (
        <>
      {/* Configuration Section */}
      <div style={styles.configSection}>
        <h2>⚙️ Generation Configuration</h2>
        {modules.find(m => m.id === moduleId) && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#23232a', borderRadius: '6px' }}>
            <p style={{ margin: 0, color: '#00d4ff' }}>
              <strong>Selected:</strong> {modules.find(m => m.id === moduleId)?.title}
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.9em' }}>
              {modules.find(m => m.id === moduleId)?.description}
            </p>
          </div>
        )}

        {/* Module & Batch Mode Selection */}
        <div style={styles.configGrid}>
          <div style={styles.configField}>
            <label style={styles.label}>Module (Same as Learn)</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(parseInt(e.target.value))}
              style={styles.select}
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} (Module {m.order_index})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.configField}>
            <label style={styles.label}>Batch Mode</label>
            <div style={styles.radioGroup}>
              {[
                { value: 'single', label: 'Single-Level (Original)' },
                { value: 'skill_first', label: 'Skill-First (All levels per skill)' },
                { value: 'level_first', label: 'Level-First (All skills per level)' }
              ].map(option => (
                <label key={option.value} style={styles.radioLabel}>
                  <input
                    type="radio"
                    value={option.value}
                    checked={batchMode === option.value}
                    onChange={(e) => setBatchMode(e.target.value)}
                    style={styles.radioInput}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Level Selection */}
        {batchMode !== 'single' && (
          <div style={styles.configField}>
            <label style={styles.label}>Levels to Generate</label>
            <div style={styles.levelCheckboxes}>
              {[
                { num: 1, name: '① Intro' },
                { num: 2, name: '② Practical' },
                { num: 3, name: '③ Advanced' },
                { num: 4, name: '④ Projects' },
                { num: 5, name: '⑤ Challenges' }
              ].map(level => (
                <label key={level.num} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level.num)}
                    onChange={() => toggleLevel(level.num)}
                    style={styles.checkbox}
                  />
                  {level.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Cost Estimate */}
        <div style={styles.estimateBox}>
          <span>💰 Estimated Cost:</span>
          <strong>${estimatedTotalCost}</strong>
          <span style={styles.estimateDetail}>
            ({selectedLevels.length} levels × {skills.length} targets × ~$0.02/level)
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={styles.controls}>
        <button
          onClick={handleBatchGenerate}
          disabled={batchProcessing}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            opacity: batchProcessing ? 0.6 : 1,
            cursor: batchProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {batchProcessing ? '⏳ Processing...' : `🚀 Generate All (${batchMode})`}
        </button>

        <button
          onClick={() => setShowQueuePanel(!showQueuePanel)}
          style={{...styles.button, ...styles.buttonSecondary}}
        >
          {showQueuePanel ? '📊 Hide Queue' : '📊 Show Queue'}
        </button>

        <button
          onClick={clearResults}
          style={{...styles.button, ...styles.buttonSecondary}}
        >
          Clear Results
        </button>
      </div>

      {/* Queue Progress Panel */}
      {showQueuePanel && (
        <div style={{ marginBottom: '32px' }}>
          <QueueProgressPanel moduleId={moduleId} isGenerating={batchProcessing} />
        </div>
      )}

      {/* Skills Grid */}
      <div style={styles.skillsGrid}>
        <div style={styles.gridHeader}>
          <h2>Lesson Targets ({skills.length}) - Ordered by Module Sequence</h2>
          <div style={styles.gridInfo}>
            <span>🎯 Mode: {batchMode}</span>
            <span>📊 Levels: {selectedLevels.join(', ')}</span>
          </div>
        </div>
        <div style={styles.grid}>
          {skills.map((skill, index) => (
            <div key={skill.id} style={styles.skillCard}>
              <div style={styles.skillHeader}>
                <div style={styles.skillOrder}>
                  <strong style={styles.orderNumber}>{String.fromCharCode(9312 + index % 10)}</strong>
                </div>
                <h3 style={styles.skillName}>{skill.name}</h3>
                <span style={styles.difficulty}>{skill.sourceType === 'module_lesson' ? `M${moduleId}` : skill.difficulty}</span>
              </div>
              <p style={styles.description}>{skill.description}</p>
              <div style={styles.skillMeta}>
                <span>⏱️ {skill.estimated_minutes || '~'} min</span>
                {skill.weight && <span>⚖️ Weight: {skill.weight}</span>}
              </div>
              <button
                onClick={() =>
                  batchMode === 'single'
                    ? handleGenerateSingleLevel(skill)
                    : handleGenerateMultiLevel(skill)
                }
                disabled={generatingSkillId === skill.id}
                style={{
                  ...styles.button,
                  ...styles.generateButton,
                  opacity: generatingSkillId === skill.id ? 0.6 : 1,
                  cursor: generatingSkillId === skill.id ? 'not-allowed' : 'pointer'
                }}
              >
                {generatingSkillId === skill.id
                  ? `⏳ ${batchMode === 'single' ? 'Generating' : `Generating (${selectedLevels.length} lvls)`}...`
                  : `✨ Generate ${batchMode === 'single' ? 'Lesson' : `(${selectedLevels.length} Levels)`}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div style={styles.results}>
        <h2>Generation Results ({results.length})</h2>
        <div style={styles.resultsList}>
          {results.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No generation results yet</p>
              <p style={styles.hint}>Click "Generate" on a lesson target or run batch generation</p>
            </div>
          ) : (
            results.map((result, idx) => (
              <div key={idx} style={styles.resultItem}>
                <div style={styles.resultHeader}>
                  <strong style={styles.resultSkill}>{result.skill}</strong>
                  <span style={styles.resultStatus}>{result.status}</span>
                  <span style={styles.resultTime}>{result.timestamp}</span>
                </div>
                <p style={styles.resultMessage}>{result.message}</p>
                {result.levels && (
                  <div style={styles.levelsList}>
                    {result.levels.map((level, i) => (
                      <span key={i} style={{
                        ...styles.levelBadge,
                        ...(level.status === 'completed' ? styles.levelBadgeSuccess : styles.levelBadgeFailed)
                      }}>
                        Level {level.level}: {level.status}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: {
    padding: '24px',
    backgroundColor: '#252547',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#6b7280'
  },
  errorContainer: {
    padding: '24px',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
    color: '#dc2626'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#000000',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    marginBottom: '32px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '16px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px'
  },
  warning: {
    fontSize: '12px',
    color: '#d97706',
    backgroundColor: '#23232a',
    padding: '8px 12px',
    borderRadius: '4px',
    marginTop: '12px',
    display: 'inline-block'
  },
  configSection: {
    backgroundColor: '#23232a',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  configField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#23232a',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  radioInput: {
    cursor: 'pointer',
    width: '16px',
    height: '16px'
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px'
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor:'#18181b',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  levelCheckboxes: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  estimateBox: {
    padding: '12px 16px',
    backgroundColor: 'black',
    border: '1px solid #fcd34d',
    borderRadius: '6px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    fontSize: '14px',
    color: '#92400e',
    fontWeight: '500'
  },
  estimateDetail: {
    fontSize: '12px',
    color: '#b45309',
    opacity: 0.8
  },
  controls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap'
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  buttonSecondary: {
    backgroundColor: '#010101',
    color: '#374151'
  },
  generateButton: {
    backgroundColor: '#10b981',
    color: 'white',
    width: '100%',
    padding: '8px',
    fontSize: '13px'
  },
  skillsGrid: {
    marginBottom: '32px'
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  gridInfo: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#666'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  skillCard: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s'
  },
  skillHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px'
  },
  skillOrder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orderNumber: {
    fontSize: '16px',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  skillName: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111',
    flex: 1
  },
  difficulty: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '4px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap'
  },
  description: {
    margin: '0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.4'
  },
  skillMeta: {
    fontSize: '12px',
    color: '#999',
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between',
    padding: '4px 0'
  },
  results: {
    marginBottom: '32px'
  },
  resultsList: {
    marginTop: '16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  resultItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '13px'
  },
  resultHeader: {
    display: 'flex',
    gap: '12px',
    marginBottom: '4px',
    alignItems: 'center'
  },
  resultSkill: {
    color: '#111',
    flex: '1'
  },
  resultStatus: {
    fontWeight: '600',
    minWidth: '100px'
  },
  resultTime: {
    color: '#999',
    fontSize: '12px'
  },
  resultMessage: {
    margin: '0',
    color: '#666'
  },
  levelsList: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap'
  },
  levelBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '500'
  },
  levelBadgeSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  levelBadgeFailed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: '#999'
  },
  hint: {
    fontSize: '12px',
    marginTop: '8px'
  }
};
