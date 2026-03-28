import React, { useState, useEffect } from 'react';
import { generateAndSaveLessonForSkill, generateAllMissingLessons } from '../services/contentGenerationAgent';
import supabase from '../utils/supabaseClient';

export default function DebugContentGenerator() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingSkillId, setGeneratingSkillId] = useState(null);
  const [results, setResults] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('difficulty', { ascending: true })
        .order('weight', { ascending: false }); // Order by weight after difficulty

      if (error) throw error;
      setSkills(data || []);
      console.log('📚 Skills fetched and sorted by difficulty then weight');
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      alert('❌ Failed to load skills');
    }
  };

  const handleGenerateLessonForSkill = async (skillId, skillName) => {
    setGeneratingSkillId(skillId);
    try {
      const result = await generateAndSaveLessonForSkill(skillId);
      
      if (result.success) {
        setResults([
          {
            skill: skillName,
            status: '✅ SUCCESS',
            message: `Lesson generated and saved to database`,
            timestamp: new Date().toLocaleTimeString()
          },
          ...results
        ]);
        alert(`✅ Lesson generated for ${skillName}!`);
      } else {
        setResults([
          {
            skill: skillName,
            status: '❌ ERROR',
            message: result.error || 'Unknown error',
            timestamp: new Date().toLocaleTimeString()
          },
          ...results
        ]);
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setResults([
        {
          skill: skillName,
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

  const handleBatchGenerate = async () => {
    setBatchProcessing(true);
    try {
      const result = await generateAllMissingLessons();
      
      if (result.success) {
        setResults([
          {
            skill: 'BATCH PROCESS',
            status: '✅ COMPLETE',
            message: `Generated ${result.generated} lessons, skipped ${result.skipped}`,
            timestamp: new Date().toLocaleTimeString()
          },
          ...results
        ]);
        alert(`✅ Batch generation complete! Generated ${result.generated} lessons.`);
      } else {
        setResults([
          {
            skill: 'BATCH PROCESS',
            status: '❌ ERROR',
            message: result.error || 'Batch process failed',
            timestamp: new Date().toLocaleTimeString()
          },
          ...results
        ]);
        alert(`❌ Batch error: ${result.error}`);
      }
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🔧 Debug: Content Generator</h1>
        <p style={styles.subtitle}>Manually trigger AI lesson generation for skills</p>
        <p style={styles.warning}>⚠️ For development only - delete this page before production</p>
      </div>

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
          {batchProcessing ? '⏳ Processing All Skills...' : '🚀 Generate All Missing Lessons'}
        </button>
        
        <button
          onClick={clearResults}
          style={{...styles.button, ...styles.buttonSecondary}}
        >
          Clear Results
        </button>
      </div>

      <div style={styles.skillsGrid}>
        <h2>Skills ({skills.length}) - Ordered by Difficulty → Weight</h2>
        <div style={styles.grid}>
          {skills.map((skill, index) => (
            <div key={skill.id} style={styles.skillCard}>
              <div style={styles.skillHeader}>
                <div style={styles.skillOrder}>
                  <strong style={styles.orderNumber}>{index + 1}</strong>
                </div>
                <h3 style={styles.skillName}>{skill.name}</h3>
                <span style={styles.difficulty}>{skill.difficulty}</span>
              </div>
              <p style={styles.description}>{skill.description}</p>
              <div style={styles.skillMeta}>
                <span>⏱️ {skill.estimated_minutes || '~'} min</span>
                {skill.weight && <span>⚖️ Weight: {skill.weight}</span>}
              </div>
              <button
                onClick={() => handleGenerateLessonForSkill(skill.id, skill.name)}
                disabled={generatingSkillId === skill.id}
                style={{
                  ...styles.button,
                  ...styles.generateButton,
                  opacity: generatingSkillId === skill.id ? 0.6 : 1,
                  cursor: generatingSkillId === skill.id ? 'not-allowed' : 'pointer'
                }}
              >
                {generatingSkillId === skill.id ? '⏳ Generating...' : '✨ Generate Lesson'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.results}>
        <h2>Generation Results ({results.length})</h2>
        <div style={styles.resultsList}>
          {results.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No generation results yet</p>
              <p style={styles.hint}>Click "Generate Lesson" on a skill to start</p>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
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
    backgroundColor: '#fef3c7',
    padding: '8px 12px',
    borderRadius: '4px',
    marginTop: '12px',
    display: 'inline-block'
  },
  controls: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px'
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  buttonSecondary: {
    backgroundColor: '#e5e7eb',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginTop: '16px'
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
    fontSize: '18px',
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
