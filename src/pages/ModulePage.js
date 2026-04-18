// src/pages/ModulePage.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import ModuleQuiz from "../components/ModuleQuiz";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [lessonFilter, setLessonFilter] = useState('all');

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        // Convert moduleId to integer for database queries
        const modId = parseInt(moduleId);
        console.log(`📚 Fetching module: ${modId}`);

        // Fetch module
        const { data: mod, error: modErr } = await supabase
          .from('modules')
          .select('id, title, description, difficulty')
          .eq('id', modId)
          .single();

        console.log(`Module query result:`, { mod, modErr });
        if (modErr) {
          console.error(`❌ Module fetch error:`, modErr);
          throw modErr;
        }

        // Fetch lessons with parts (sublevels) from database
        const { data: lessonData, error: lessonErr } = await supabase
          .from('lessons')
          .select('id, skill_id, title, type, order_index, estimated_minutes, parts')
          .eq('module_id', modId)
          .order('order_index', { ascending: true });

        console.log(`Lessons query result:`, { lessonCount: lessonData?.length, lessonErr });
        if (lessonErr) {
          console.error(`❌ Lessons fetch error:`, lessonErr);
          throw lessonErr;
        }

        // Fetch lesson and level completion state for the signed-in user
        let progressMap = {};
        let levelProgressMap = {};
        if (user?.id && lessonData?.length) {
          const lessonIds = lessonData.map(l => l.id);

          const [progressResult, levelProgressResult] = await Promise.all([
            supabase
              .from('progress')
              .select('lesson_id, state')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds),
            supabase
              .from('lesson_part_progress')
              .select('lesson_id, part_level, state')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds)
          ]);

          if (progressResult.error) {
            console.error('⚠️ Progress fetch error:', progressResult.error);
          } else {
            progressMap = (progressResult.data || []).reduce((acc, row) => {
              acc[row.lesson_id] = row.state;
              return acc;
            }, {});
          }

          if (levelProgressResult.error) {
            console.error('⚠️ Lesson part progress fetch error:', levelProgressResult.error);
          } else {
            levelProgressMap = (levelProgressResult.data || []).reduce((acc, row) => {
              const lessonId = row.lesson_id;
              const levelKey = row.part_level;
              acc[lessonId] = acc[lessonId] || {};
              acc[lessonId][levelKey] = row.state;
              return acc;
            }, {});
          }
        }

        // Transform lessons: convert parts array to levels with proper IDs
        const enrichedLessons = (lessonData || []).map((lesson, index) => {
          let levels = [];
          
          // If lesson has parts from database, use them
          if (lesson.parts && Array.isArray(lesson.parts) && lesson.parts.length > 0) {
            // Map parts preserving original index for level numbers
            // This handles arrays with nulls: [part1, null, part3] → levels 1,3
            levels = lesson.parts
              .map((part, originalIndex) => {
                if (part == null) return null;
                const levelNum = part?.level ?? originalIndex + 1;
                return {
                  id: levelNum,
                  level: levelNum,
                  title: part.title || `Level ${levelNum}`,
                  description: part.description || ''
                };
              })
              .filter(level => level != null); // Remove nulls after mapping
            console.log(`✅ Loaded ${levels.length} parts for lesson "${lesson.title}": ${levels.map(l => l.level).join(', ')}`)
          } else {
            // Fallback: create a single level with lesson title if no parts exist
            levels = [{
              id: 1,
              level: 1,
              title: lesson.title, 
              description: 'Content coming soon' 
            }];
            console.warn(`⚠️ No parts found for lesson "${lesson.title}" - showing placeholder`)
          }

          const lessonLevelProgress = levelProgressMap[lesson.id] || {};
          const totalLevels = levels.length;
          const completedCount = Object.values(lessonLevelProgress).filter((state) => state === 'completed').length;
          const allLevelsCompleted = totalLevels > 0 && completedCount === totalLevels;
          const lessonCompleted = progressMap[lesson.id] === 'completed' || allLevelsCompleted;
          const lessonInProgress = !lessonCompleted && (Object.keys(lessonLevelProgress).length > 0 || progressMap[lesson.id] === 'in_progress');
          const progressState = lessonCompleted ? 'completed' : lessonInProgress ? 'in_progress' : 'not_started';

          return {
            ...lesson,
            lessonNumber: lesson.order_index ?? index + 1,
            description: lesson.type === 'read' ? 'Read through the content' : 'Practice with code',
            levels: levels,
            progressState,
            isCompleted: lessonCompleted,
            levelProgress: lessonLevelProgress
          };
        });

        setModule(mod);
        setLessons(enrichedLessons);
      } catch (err) {
        console.error('❌ Error fetching module:', err.message || err);
        console.error('Full error:', err);
        setModule(null);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId, user]);

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-4 w-16 bg-dark-lighter rounded animate-pulse mb-6" />
        <div className="h-8 w-64 bg-dark-lighter rounded animate-pulse mb-6" />
        <div className="flex flex-col gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-5 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!module) return <h2 className="text-center text-red-500">Module not found</h2>;

  // Filter lessons based on selected filter
  const filteredLessons = lessons.filter((lesson) => {
    if (lessonFilter === 'completed') return lesson.isCompleted;
    if (lessonFilter === 'not_completed') return !lesson.isCompleted;
    return true; // 'all'
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">{module.title}</h1>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setLessonFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            lessonFilter === 'all'
              ? 'bg-primary text-white shadow-lg shadow-primary/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Lessons
        </button>
        <button
          onClick={() => setLessonFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            lessonFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setLessonFilter('not_completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            lessonFilter === 'not_completed'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Not Completed
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {lessonFilter === 'completed' && "No completed lessons yet. Start learning! 🚀"}
              {lessonFilter === 'not_completed' && "No remaining lessons. You're all caught up! ✨"}
            </p>
          </div>
        ) : null}
        <AnimatePresence initial={false} mode="popLayout">
          {filteredLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              onClick={() => toggleLesson(lesson.id)}
              className={`bg-dark border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-300 ${
                lesson.isCompleted
                  ? 'border-emerald-500/50 hover:border-emerald-400/80 shadow-emerald-500/10'
                  : 'border-gray-700 hover:border-primary/70 hover:shadow-primary/10'
              }`}
              role="button"
              aria-expanded={!!expandedLessons[lesson.id]}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ y: -2, scale: 1.005 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Lesson {lesson.lessonNumber}: {lesson.title}
                </h4>
                <p className="text-gray-400 text-sm">{lesson.description}</p>
                <div className="mt-2">
                  {lesson.isCompleted ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                      ✓ Completed
                    </span>
                  ) : lesson.progressState === 'in_progress' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/40">
                      In Progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-700/50 text-gray-300 border border-gray-600/40">
                      Not Started
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLesson(lesson.id);
                }}
                className="text-blue-400 text-sm font-medium hover:underline focus:outline-none"
              >
                {expandedLessons[lesson.id]
                  ? "Hide Levels ▲"
                  : lesson.isCompleted
                    ? "Review Levels ▼"
                    : "View Levels ▼"}
              </button>
            </div>

            {/* Collapsible Levels Section */}
            {expandedLessons[lesson.id] && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-2 mt-4"
              >
                {lesson.levels.map((level) => {
                  const isLevelComplete = lesson.levelProgress?.[level.id] === 'completed' || lesson.isCompleted;
                  return (
                    <Link
                      key={level.id}
                      to={`/learn/${moduleId}/lesson/${lesson.id}/level/${level.id}`}
                      className={`text-sm font-medium py-3 px-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                        isLevelComplete
                          ? 'border-emerald-500/40 text-emerald-200 bg-emerald-900/10 hover:border-emerald-300'
                          : 'border-gray-700 text-gray-200 bg-transparent hover:border-primary/60 hover:bg-white/5'
                      }`}
                    >
                      {isLevelComplete ? '✓ ' : ''}Level {level.level}: {level.title} →
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

      {/* MODULE QUIZ SECTION */}
      <div className="mt-12 pt-8 border-t border-gray-700 flex justify-center">
        <div className="w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-6 text-yellow-400">📖 Module Assessment</h3>
          <p className="text-gray-400 text-sm mb-6">
            Complete all lessons above to unlock the module quiz and test your mastery!
          </p>
          <ModuleQuiz moduleId={parseInt(moduleId)} moduleName={module.title} />
        </div>
      </div>
    </div>
  );
};

export default ModulePage;