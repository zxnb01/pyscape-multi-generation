import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import roadmapService from '../services/roadmapService';
import SkillLessonsModal from '../components/roadmap/SkillLessonsModal';

/**
 * RoadmapPage Component
 * Main page for adaptive skill graph visualization
 */
export default function RoadmapPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDomain] = useState('python');
  const [selectedSkillForLessons, setSelectedSkillForLessons] = useState(null);
  const [lessonsCache, setLessonsCache] = useState({});

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roadmapService.getRoadmap(user?.id || '00000000-0000-0000-0000-000000000001', selectedDomain);
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomain, user?.id]);

  // Pre-cache all unlocked skills as soon as roadmap loads
  useEffect(() => {
    if (!roadmap) return;
    const unlocked = roadmap.all.filter(s => s.status !== 'locked');
    unlocked.forEach(skill => {
      if (!lessonsCache[skill.id]) {
        roadmapService.getLessonsForSkill(skill.id, user?.id || '00000000-0000-0000-0000-000000000001')
          .then(data => setLessonsCache(prev => ({ ...prev, [skill.id]: data })))
          .catch(() => {});
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap]);

  const handleViewLessons = async (skill) => {
    console.log('View lessons clicked for:', skill.name);
    // Open modal immediately with skill data
    setSelectedSkillForLessons(skill);
    
    // Pre-fetch lessons if not in cache (for next time)
    if (!lessonsCache[skill.id]) {
      try {
        const lessonData = await roadmapService.getLessonsForSkill(skill.id, user?.id || '00000000-0000-0000-0000-000000000001');
        setLessonsCache(prev => ({ ...prev, [skill.id]: lessonData }));
      } catch (error) {
        console.error('Failed to pre-fetch lesson data:', error);
      }
    }
  };

  const handleSkillHover = async (skill) => {
    // Pre-fetch lesson data on hover for instant modal opens
    if (skill.status !== 'locked' && !lessonsCache[skill.id]) {
      try {
        const lessonData = await roadmapService.getLessonsForSkill(skill.id, user?.id || '00000000-0000-0000-0000-000000000001');
        setLessonsCache(prev => ({ ...prev, [skill.id]: lessonData }));
      } catch (error) {
        // Silently fail - data will load when modal opens
        console.debug('Pre-fetch on hover failed:', error);
      }
    }
  };

  const getFilteredSkills = () => {
    if (!roadmap) return [];
    return roadmap.all;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Unable to load roadmap.</p>
          {error && <p className="text-red-300 text-sm mt-2 max-w-md mx-auto">{error}</p>}
          <button onClick={loadRoadmap} className="mt-4 px-4 py-2 bg-primary rounded text-white hover:bg-primary/80">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-dark-lighter">
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-dark/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🗺️ Learning Path</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {roadmap.stats.mastered}/{roadmap.stats.total} skills mastered
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-400">{roadmap.stats.mastered}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-400">{roadmap.stats.inProgress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-gray-400">{roadmap.stats.eligible}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <span className="text-gray-400">{roadmap.stats.locked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Path Container */}
      <div className="max-w-4xl mx-auto px-6 py-12 overflow-y-auto">
        <div className="relative">
          {/* Skill Tree Path */}
          <div className="space-y-16 py-8">
            {getFilteredSkills().map((skill, index) => {
              // Create winding path: left, center, right, center pattern
              const pattern = index % 4;
              const position = 
                pattern === 0 ? 'left' : 
                pattern === 1 ? 'center' : 
                pattern === 2 ? 'right' : 'center';
              
              const positionClass = 
                position === 'left' ? 'justify-start pl-8' :
                position === 'right' ? 'justify-end pr-8' :
                'justify-center';

              // Get previous skill for connection line
              const prevSkill = index > 0 ? getFilteredSkills()[index - 1] : null;

              return (
                <div key={skill.id} className="relative">
                  {/* Connecting Line from Previous Node */}
                  {index > 0 && (
                    <div 
                      className={`absolute w-1 ${
                        prevSkill?.status === 'mastered' 
                          ? 'bg-gradient-to-b from-green-500/50 to-green-600/50'
                          : prevSkill?.status === 'in_progress'
                          ? 'bg-gradient-to-b from-yellow-500/50 to-yellow-600/50'
                          : prevSkill?.status === 'eligible'
                          ? 'bg-gradient-to-b from-blue-500/50 to-blue-600/50'
                          : 'bg-gradient-to-b from-gray-600/30 to-gray-700/30'
                      } rounded-full`}
                      style={{
                        height: '4rem',
                        top: '-4rem',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  )}

                  {/* Skill Node Container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: Math.min(index * 0.03, 0.3),
                      type: 'spring', 
                      stiffness: 300,
                      damping: 25
                    }}
                    className={`flex ${positionClass}`}
                  >
                    <div className="flex flex-col items-center max-w-sm">
                      {/* Circular Node */}
                      <motion.div
                        whileHover={skill.status !== 'locked' ? { 
                          scale: 1.1,
                          rotate: [0, -2, 2, -2, 0],
                          transition: { duration: 0.3 }
                        } : {}}
                        whileTap={skill.status !== 'locked' ? { scale: 0.95 } : {}}
                        onMouseEnter={() => handleSkillHover(skill)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (skill.status !== 'locked') {
                            handleViewLessons(skill);
                          }
                        }}
                        className={`
                          relative w-28 h-28 rounded-full flex items-center justify-center
                          border-4 shadow-2xl transition-all duration-300
                          ${skill.status === 'mastered' 
                            ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/60 cursor-pointer'
                            : skill.status === 'in_progress'
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/60 cursor-pointer'
                            : skill.status === 'eligible'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300 shadow-blue-500/60 cursor-pointer'
                            : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 shadow-gray-700/40 cursor-not-allowed'
                          }
                          ${skill.status === 'locked' ? 'opacity-50' : ''}
                        `}
                        title={skill.status !== 'locked' ? 'Click to view lessons' : 'Complete prerequisites first'}
                      >
                        {/* Skill Icon */}
                        <span className="text-5xl z-10">{skill.icon || '📘'}</span>

                        {/* Mastery Percentage Badge */}
                        {skill.status !== 'locked' && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Percentage badge clicked for:', skill.name);
                              handleViewLessons(skill);
                            }}
                            className="absolute -bottom-2 -right-2 bg-dark border-2 border-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold text-white shadow-lg hover:scale-110 transition-transform cursor-pointer z-20"
                            title="Click to view lessons"
                          >
                            {Math.round((skill.mastery || 0) * 100)}%
                          </div>
                        )}

                        {/* Completion Star */}
                        {skill.status === 'mastered' && (
                          <div className="absolute -top-3 -right-3 text-3xl animate-bounce">
                            ⭐
                          </div>
                        )}

                        {/* Lock Icon */}
                        {skill.status === 'locked' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                            <span className="text-4xl">🔒</span>
                          </div>
                        )}

                        {/* Progress Ring for In-Progress */}
                        {skill.status === 'in_progress' && (
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="46"
                              fill="none"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="46"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="3"
                              strokeDasharray={`${skill.mastery * 289} 289`}
                              className="transition-all duration-500"
                            />
                          </svg>
                        )}
                      </motion.div>

                      {/* Skill Info Card Below Node */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (skill.status !== 'locked') handleViewLessons(skill);
                        }}
                        className={`mt-4 bg-dark-lightest rounded-xl p-4 shadow-lg text-center w-56 border border-gray-700 ${
                          skill.status !== 'locked' ? 'cursor-pointer hover:border-primary/50 hover:bg-slate-800/80 transition-all' : ''
                        }`}
                      >
                        <h3 className="text-white font-bold text-sm mb-1">
                          {skill.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
                          <span>{'⭐'.repeat(skill.difficulty)}</span>
                          <span>•</span>
                          <span>{Math.floor(skill.estimatedMinutes / 60)}h {skill.estimatedMinutes % 60}m</span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          skill.status === 'mastered' ? 'bg-green-500/20 text-green-400'
                          : skill.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400'
                          : skill.status === 'eligible' ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {skill.status === 'mastered' ? '✓ Mastered'
                           : skill.status === 'in_progress' ? '🔥 In Progress'
                           : skill.status === 'eligible' ? '▶ Start Now'
                           : '🔒 Locked'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {getFilteredSkills().length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">No skills found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Lessons Modal */}
      {selectedSkillForLessons && (
        <SkillLessonsModal
          skill={selectedSkillForLessons}
          userId={user?.id || '00000000-0000-0000-0000-000000000001'}
          onClose={() => setSelectedSkillForLessons(null)}
          cachedLessons={lessonsCache[selectedSkillForLessons.id]}
        />
      )}
    </div>
  );
}
