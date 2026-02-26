import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import roadmapService from '../../services/roadmapService';

/**
 * SkillLessonsModal - Duolingo-style lesson path for a skill
 * Shows all lessons in a vertical path with status indicators
 */
export default function SkillLessonsModal({ skill, userId, onClose, cachedLessons }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!cachedLessons); // Skip loading if we have cached data
  const [lessonData, setLessonData] = useState(cachedLessons || null);

  useEffect(() => {
    const loadLessons = async () => {
      // Use cached data if available
      if (cachedLessons) {
        setLessonData(cachedLessons);
        setLoading(false);
        return;
      }

      // Otherwise fetch from service
      try {
        setLoading(true);
        const data = await roadmapService.getLessonsForSkill(skill.id, userId);
        setLessonData(data);
      } catch (error) {
        console.error('Failed to load lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    if (skill) {
      loadLessons();
    }
  }, [skill, userId, cachedLessons]);

  const handleLessonClick = (lesson) => {
    console.log('Lesson clicked:', lesson);
    
    if (lesson.status === 'locked') {
      console.log('Lesson is locked, not navigating');
      return;
    }
    
    // Navigate to project labs if it's a project
    if (lesson.isProject && lesson.projectId) {
      console.log('Navigating to projects');
      navigate(`/app/projects`);
      onClose();
    }
    // Navigate to the actual module lesson page
    else if (lesson.moduleId && lesson.id) {
      console.log(`Navigating to /app/learn/${lesson.moduleId}/lesson/${lesson.id}`);
      navigate(`/app/learn/${lesson.moduleId}/lesson/${lesson.id}`);
      onClose();
    } else {
      console.warn('Lesson missing moduleId/projectId or id:', lesson);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-lighter rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 p-6 border-b border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{skill.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{skill.name}</h2>
                  <p className="text-gray-300 text-sm mt-1">{skill.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            {lessonData && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">
                    {lessonData.completedLessons} of {lessonData.totalLessons} lessons completed
                  </span>
                  <span className="text-primary font-semibold">
                    {Math.round((lessonData.completedLessons / lessonData.totalLessons) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(lessonData.completedLessons / lessonData.totalLessons) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lessons Path - Duolingo/Candy Crush Style */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-b from-dark-lighter to-dark">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
              </div>
            ) : (
              <div className="relative py-8">
                {/* Winding Path with Circular Nodes */}
                <div className="space-y-12">
                  {lessonData?.lessons.map((lesson, index) => {
                    // Create winding path effect: left, center, right, center, left...
                    const pattern = index % 4;
                    const position = pattern === 0 ? 'left' : pattern === 1 ? 'center' : pattern === 2 ? 'right' : 'center';
                    
                    const positionClass = 
                      position === 'left' ? 'justify-start' :
                      position === 'right' ? 'justify-end' :
                      'justify-center';

                    return (
                      <div key={lesson.id} className="relative">
                        {/* Connecting Line */}
                        {index > 0 && (
                          <div 
                            className={`absolute w-1 bg-gradient-to-b ${
                              lessonData.lessons[index - 1].status === 'completed' 
                                ? 'from-green-500 to-green-600'
                                : lessonData.lessons[index - 1].status === 'in_progress'
                                ? 'from-yellow-500 to-yellow-600'
                                : 'from-gray-600 to-gray-700'
                            }`}
                            style={{
                              height: '3rem',
                              top: '-3rem',
                              left: '50%',
                              transform: 'translateX(-50%)'
                            }}
                          />
                        )}

                        {/* Lesson Node Container */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                          className={`flex ${positionClass}`}
                        >
                          <div className="flex flex-col items-center max-w-xs">
                            {/* Circular Node */}
                            <motion.div
                              whileHover={lesson.status !== 'locked' ? { scale: 1.1 } : {}}
                              whileTap={lesson.status !== 'locked' ? { scale: 0.95 } : {}}
                              onClick={() => handleLessonClick(lesson)}
                              className={`
                                relative w-24 h-24 rounded-full flex items-center justify-center
                                border-4 shadow-lg transition-all duration-300
                                ${lesson.isProject 
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 border-purple-300 shadow-purple-500/60'
                                  : lesson.status === 'completed' 
                                  ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/50'
                                  : lesson.status === 'in_progress'
                                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/50'
                                  : lesson.status === 'eligible'
                                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/50'
                                  : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 shadow-gray-700/50'
                                }
                                ${lesson.status === 'locked' 
                                  ? 'opacity-60 cursor-not-allowed' 
                                  : 'cursor-pointer hover:shadow-xl'
                                }
                              `}
                            >
                              {/* Status Icon/Emoji */}
                              <span className="text-4xl z-10">
                                {lesson.isProject ? '🎯' :
                                 lesson.status === 'completed' ? '⭐' :
                                 lesson.status === 'in_progress' ? '🔥' :
                                 lesson.status === 'eligible' ? '▶️' :
                                 '🔒'}
                              </span>

                              {/* Score Badge for Completed */}
                              {lesson.status === 'completed' && lesson.score && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                                  {Math.round(lesson.score * 100)}
                                </div>
                              )}

                              {/* Progress Ring for In Progress */}
                              {lesson.status === 'in_progress' && lesson.score && (
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="4"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="4"
                                    strokeDasharray={`${lesson.score * 283} 283`}
                                    className="transition-all duration-500"
                                  />
                                </svg>
                              )}
                            </motion.div>

                            {/* Lesson Info Card */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.03 + 0.1 }}
                              className="mt-4 bg-dark-lightest rounded-lg p-3 shadow-md text-center min-w-[200px]"
                            >
                              {/* Module/Project Badge */}
                              {lesson.isProject ? (
                                <div className="mb-2 inline-block px-2 py-0.5 bg-purple-500/30 text-purple-400 rounded text-xs font-semibold">
                                  🎯 PROJECT
                                </div>
                              ) : lesson.moduleId ? (
                                <div className="mb-2 inline-block px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-semibold">
                                  Module {lesson.moduleId}
                                </div>
                              ) : null}
                              
                              <h3 className="text-white font-semibold text-sm mb-1">
                                {lesson.title}
                              </h3>
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                {lesson.description}
                              </p>
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <span>⏱️ {lesson.estimated_minutes}m</span>
                                <span>•</span>
                                <span className="capitalize">{lesson.difficulty}</span>
                              </div>
                              
                              {lesson.status !== 'locked' && (
                                <div className="mt-2 text-xs font-semibold text-primary cursor-pointer hover:underline">
                                  {lesson.status === 'completed' ? 'Completed ✓' :
                                   lesson.status === 'in_progress' ? 'Continue →' :
                                   'Start →'}
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}

                  {lessonData?.lessons.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-lg">No lessons available yet</p>
                      <p className="text-sm mt-2">Check back soon!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-dark flex gap-3">
            {lessonData?.lessons.length > 0 && lessonData.lessons[0].moduleId && (
              <button
                onClick={() => {
                  const moduleId = lessonData.lessons[0].moduleId;
                  navigate(`/app/learn/${moduleId}`);
                }}
                className="flex-1 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
              >
                📚 View Full Module
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
