// src/pages/LevelPage.js
/**
 * LevelPage Component
 * Displays lesson content fetched from Supabase database
 * No hardcoded content - fully database-driven
 */

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, BookOpen, Code, Lightbulb, Target } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import UniversalCodePlayground from "../components/sandbox/UniversalCodePlayground";
import lessonContentService from '../services/lessonContentService';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { checkAndAwardBadges, updateStreak } from "../gamification/gamificationService";
import useGamification from "../gamification/useGamification";

const LevelPage = () => {
  const { moduleId, lessonId, levelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshData, awardXPWithNotification, showXPNotification } = useGamification();
  const [level, setLevel] = useState(null);
  const [lessonDbId, setLessonDbId] = useState(null);
  const [lessonOrder, setLessonOrder] = useState(null);
  const [lessonType, setLessonType] = useState('read');
  const [lessonTotalLevels, setLessonTotalLevels] = useState(1);
  const [lessonXpReward, setLessonXpReward] = useState(10);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('learn');
  const [currentExample, setCurrentExample] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [progressState, setProgressState] = useState('not_started');
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  // Fetch level content from Supabase
  useEffect(() => {
    const fetchLevelContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const modId = parseInt(moduleId);
        const lessonNum = parseInt(lessonId);
        const levelNum = parseInt(levelId);
        const partLevelZeroBased = Math.max(levelNum - 1, 0);
        
        console.log(`📚 Fetching level content...`);
        console.log(`   Module: ${modId}, Lesson: ${lessonNum}, Level: ${levelNum} (1-based)`);
        console.log(`   Internal lookup level index: ${partLevelZeroBased}`);
        
        const content = await lessonContentService.getLevelContent(modId, lessonNum, partLevelZeroBased);

        if (!content) {
          console.error('❌ Content is null - level not found in database');
          setError('Level content not found. Please check the URL.');
          setLevel(null);
        } else {
          console.log('✅ Content loaded successfully:', content.title);
          setLevel(content);
          setLessonDbId(Number(content.lessonDbId || lessonId));
          setLessonOrder(content.lessonOrder ?? null);
          
          // Fetch lesson metadata for proper XP tracking and navigation
          try {
            const { data: lessonData } = await supabase
              .from('lessons')
              .select('type, parts, xp_reward')
              .eq('id', content.lessonDbId)
              .single();

            if (lessonData) {
              setLessonType(lessonData.type || 'read');
              const totalParts = Array.isArray(lessonData.parts)
                ? lessonData.parts.filter(Boolean).length
                : 1;
              setLessonTotalLevels(totalParts || 1);
              setLessonXpReward(lessonData.xp_reward ?? 10);
              setLessonOrder(lessonData.order_index ?? lessonOrder ?? null);
              setLessonDbId(lessonData.id ?? Number(lessonId));
              console.log(`📖 Lesson type: ${lessonData.type}, totalLevels: ${totalParts}, xpReward: ${lessonData.xp_reward}, orderIndex: ${lessonData.order_index}`);
            }
          } catch (err) {
            console.warn('⚠️ Could not fetch lesson metadata:', err);
          }

          // Load module lesson listing for next/previous navigation
          try {
            const lessonsForModule = await lessonContentService.getLessonsForModule(modId);
            setModuleLessons(lessonsForModule || []);
          } catch (err) {
            console.warn('⚠️ Could not fetch module lessons for navigation:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching level content:', err);
        setError(err.message || 'Failed to load lesson. Please try again later.');
        setLevel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLevelContent();
  }, [moduleId, lessonId, levelId]);

  // Reset solution visibility when switching examples or tabs
  useEffect(() => {
    setShowSolution(false);
  }, [currentExample, activeTab]);

  const currentLevel = parseInt(levelId, 10) || 1;
  const previousLevelId = currentLevel > 1 ? currentLevel - 1 : null;
  const nextLevelId = lessonTotalLevels && currentLevel < lessonTotalLevels ? currentLevel + 1 : null;

  const currentLessonIndex = moduleLessons.findIndex((lesson) => Number(lesson.id) === Number(lessonDbId));
  const currentModuleLesson = currentLessonIndex >= 0 ? moduleLessons[currentLessonIndex] : null;
  const effectiveLessonOrder = currentModuleLesson
    ? (currentModuleLesson.order_index ?? currentLessonIndex + 1)
    : lessonOrder || level?.lessonOrder || lessonId;

  const previousRoute = previousLevelId
    ? `/learn/${moduleId}/lesson/${lessonId}/level/${previousLevelId}`
    : null;

  const nextRoute = nextLevelId
    ? `/learn/${moduleId}/lesson/${lessonId}/level/${nextLevelId}`
    : null;

  const previousLabel = 'Previous Level';
  const nextLabel = 'Next Level';

  // Fetch lesson progress for current user
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id || !lessonDbId) {
        setProgressState('not_started');
        setLessonCompleted(false);
        return;
      }

      const parsedLevelId = parseInt(levelId, 10);

      try {
        const { data: partProgress, error: partError } = await supabase
          .from('lesson_part_progress')
          .select('state')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonDbId)
          .eq('part_level', parsedLevelId)
          .maybeSingle();

        if (partError) {
          console.warn('⚠️ lesson_part_progress fetch error:', partError);
        }

        const { data: completedLevels, error: completedError } = await supabase
          .from('lesson_part_progress')
          .select('part_level')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonDbId)
          .eq('state', 'completed');

        if (completedError) {
          console.warn('⚠️ lesson completion fetch error:', completedError);
        }

        const completedCount = (completedLevels || []).length;
        const isLessonComplete = completedCount >= lessonTotalLevels;
        setLessonCompleted(isLessonComplete);

        if (partProgress?.state) {
          setProgressState(partProgress.state);
          return;
        }

        const { data: lessonProgress, error: lessonError } = await supabase
          .from('progress')
          .select('state')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonDbId)
          .maybeSingle();

        if (lessonError) {
          console.warn('⚠️ legacy progress fetch error:', lessonError);
        }

        const fallbackState = lessonProgress?.state === 'completed' && isLessonComplete ? 'completed' : 'not_started';
        setProgressState(fallbackState);
      } catch (err) {
        console.error('Failed to fetch lesson progress:', err);
      }
    };

    fetchProgress();
  }, [user, lessonDbId, levelId, lessonTotalLevels]);

  const updateProgressState = async (nextState) => {
  if (!user?.id) {
    setProgressMessage('Please sign in to save lesson progress.');
    return;
  }

  setProgressSaving(true);
  setProgressMessage('');

  try {
    const userId = user.id;
    const parsedLessonId = parseInt(lessonId, 10);
    const parsedLevelId = parseInt(levelId, 10);
    const currentLessonId = lessonDbId || level?.lessonDbId;
    const score = nextState === 'completed' ? 100 : 0;

    if (!currentLessonId) {
      throw new Error('Lesson DB ID is not available yet. Please wait for the lesson to finish loading before saving progress.');
    }

    console.log(`📝 Starting progress update: state=${nextState}, user=${user.id}, lesson=${parsedLessonId}, level=${levelId}`);
    console.log(`📤 Updating progress for lesson level: user=${userId}, lesson=${currentLessonId}, level=${parsedLevelId}, state=${nextState}, score=${score}`);

    const { error: progressError } = await supabase
      .from('lesson_part_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: currentLessonId,
          part_level: parsedLevelId,
          state: nextState,
          score,
          updated_at: new Date().toISOString()
        },
        { onConflict: ['user_id', 'lesson_id', 'part_level'] }
      );

    if (progressError) {
      console.error('❌ lesson_part_progress upsert error:', progressError);
      throw progressError;
    }

    console.log(`✅ Level progress saved successfully: ${nextState}`);

    const xpAmount = level?.xp_reward ?? lessonXpReward ?? 10;
    let currentEarnedXP = 0;
    let badgeList = [];

    if (nextState === 'completed' && progressState !== 'completed') {
      console.log(`🎯 Completing level: user=${userId}, lessonId=${lessonDbId}, level=${parsedLevelId}, xp=${xpAmount}, currentState=${progressState}`);

      try {
        // 🎯 Award XP for level completion (no badge checking here - badges check at FULL lesson completion)
        const sourceType = lessonType === 'labTrigger' 
          ? `project_lesson_level_${parsedLevelId}`
          : `lesson_level_${parsedLevelId}`;
        
        const xpResult = await awardXPWithNotification(xpAmount, sourceType, lessonDbId);
        
        console.log(`✅ Level XP awarded:`, xpResult);

        currentEarnedXP = xpResult.xpAwarded || 0;

        if (currentEarnedXP === 0) {
          console.warn(`⚠️ Level XP did not award (possibly duplicate). Verify xp_history source_type support:`, {
            userId,
            lessonDbId,
            level: parsedLevelId,
            xpAmount,
            lessonType
          });
        }

        await refreshData();
        console.log(`🔄 Gamification data refreshed`);
      } catch (err) {
        console.error("❌ Gamification error:", err);
      }
    }

    try {
      const { data: lessonProgressRow, error: lessonProgressError } = await supabase
        .from('progress')
        .select('state')
        .eq('user_id', userId)
        .eq('lesson_id', currentLessonId)
        .maybeSingle();

      if (lessonProgressError) {
        console.warn('⚠️ legacy progress read error:', lessonProgressError);
      }

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('parts')
        .eq('id', currentLessonId)
        .maybeSingle();

      const totalLevels = Array.isArray(lessonData?.parts)
        ? lessonData.parts.filter(Boolean).length || 1
        : 1;

      const { data: completedLevels } = await supabase
        .from('lesson_part_progress')
        .select('part_level')
        .eq('user_id', userId)
        .eq('lesson_id', currentLessonId)
        .eq('state', 'completed');

      const completedCount = (completedLevels || []).length;
      const lessonState = completedCount >= totalLevels ? 'completed' : 'in_progress';
      const isLessonNowComplete = lessonState === 'completed';
      const shouldAwardLessonCompletion = isLessonNowComplete && lessonProgressRow?.state !== 'completed';

      // FIX: Update progress table BEFORE checking badges (critical ordering fix)
      const shouldUpdateLegacyProgress = lessonProgressRow?.state !== lessonState;
      if (shouldUpdateLegacyProgress) {
        const { error: legacyUpdateError } = await supabase.from('progress').upsert(
          {
            user_id: userId,
            lesson_id: currentLessonId,
            state: lessonState,
            score: lessonState === 'completed' ? 100 : 0,
            updated_at: new Date().toISOString()
          },
          { onConflict: ['user_id', 'lesson_id'] }
        );

        if (legacyUpdateError) {
          console.warn('⚠️ legacy progress upsert error:', legacyUpdateError);
        } else {
          console.log(`✅ Progress table updated to ${lessonState} BEFORE badge check`);
        }
      }

      // NOW check and award badges (after progress is updated)
      if (shouldAwardLessonCompletion) {
        try {
          // Award lesson badges only (no XP for lesson completion)
          const newBadges = await checkAndAwardBadges(userId);
          console.log('✅ Lesson completion badges awarded:', newBadges);

          // Show badge notifications
          if (newBadges?.length > 0) {
            showXPNotification(0, newBadges);
          }
          
          await refreshData();
        } catch (lessonErr) {
          console.error('❌ Lesson completion badge error:', lessonErr);
        }
      }

      setLessonCompleted(isLessonNowComplete);
    } catch (legacyErr) {
      console.warn('⚠️ Error updating legacy lesson progress summary:', legacyErr);
    }

    setProgressState(nextState);

    setProgressMessage(
      nextState === 'completed'
        ? 'Level completed! 🎉'
        : 'Progress saved.'
    );

  } catch (err) {
    console.error('❌ Failed to save lesson progress:', err);
    setProgressMessage(`Could not save progress: ${err.message || 'Please try again.'}`);
  } finally {
    setProgressSaving(false);
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading lesson from Supabase...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !level) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Lesson Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'The requested lesson does not exist.'}</p>
          <Link to="/learn" className="text-primary hover:text-primary/70 font-semibold">
            ← Back to Learn
          </Link>
        </div>
      </div>
    );
  }

  // Check if we have examples and exercise
  const hasExamples = level.examples && level.examples.length > 0;
  const hasExercise = level.exercise;

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-dark-lighter/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={`/learn/${moduleId}`}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Module</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">
                Module {moduleId} • Lesson {effectiveLessonOrder} • Level {parseInt(levelId)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => previousRoute && navigate(previousRoute)}
                disabled={!previousRoute}
                className="py-2 px-3 rounded-md border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← {previousLabel}
              </button>
              <button
                onClick={() => nextRoute && navigate(nextRoute)}
                disabled={!nextRoute}
                className="py-2 px-3 rounded-md bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nextLabel} →
              </button>
            </div>
            <div className="text-sm text-slate-400">
              Level {currentLevel} of {lessonTotalLevels}
            </div>
          </div>
        </div>
          
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {level.title}
              </h1>
              {progressState === 'completed' && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                    ✓ Level Completed
                  </span>
                </div>
              )}
              {level.description && (
                <p className="text-xl text-slate-300">
                  {level.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg border border-white/10 flex-wrap"
        >
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'learn'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn</span>
          </button>
          {hasExamples && (
            <button
              onClick={() => setActiveTab('examples')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'examples'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Examples</span>
            </button>
          )}
          {hasExercise && (
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'practice'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Practice</span>
            </button>
          )}
        </motion.div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Learn Tab */}
                {activeTab === 'learn' && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
                    <div className="prose prose-invert prose-lg max-w-none
                        prose-headings:text-white 
                        prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 prose-h3:mt-6
                        prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-strong:text-primary prose-strong:font-semibold
                        prose-code:text-primary prose-code:bg-slate-900/50 prose-code:px-2 prose-code:py-1 prose-code:rounded
                        prose-ul:text-slate-300 prose-li:my-1
                        prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {level.content || 'No content available'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Examples Tab */}
                {activeTab === 'examples' && hasExamples && (
                  <div className="space-y-6">
                    {/* Example Selector */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                      <label className="text-slate-300 text-sm font-medium mb-3 block">
                        Choose an Example:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {level.examples.map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentExample(idx)}
                            className={`p-4 rounded-lg text-left transition-all ${
                              currentExample === idx
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-slate-900/50 text-slate-300 hover:bg-slate-900 border border-white/10'
                            }`}
                          >
                            <div className="font-semibold mb-1">{example.title}</div>
                            <div className="text-sm opacity-80 line-clamp-2">
                              {example.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current Example Display */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-white/10">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {level.examples[currentExample]?.title}
                            </h3>
                            <p className="text-slate-300">
                              {level.examples[currentExample]?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <UniversalCodePlayground
                          key={currentExample}
                          defaultLanguage="python"
                          initialCode={level.examples[currentExample]?.code || '# Write your code here'}
                          testCases={level.examples[currentExample]?.testCases || []}
                          height="400px"
                          showThemeToggle={false}
                        />
                      </div>
                    </div>

                    {/* Solution/Explanation Section */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-semibold flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                          {showSolution ? 'Hide' : 'Show'} Code Explanation
                        </span>
                        <motion.div
                          animate={{ rotate: showSolution ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {showSolution && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-4 bg-slate-900/30">
                              <div className="flex items-center gap-2 mb-3">
                                <Code className="w-4 h-4 text-primary" />
                                <span className="text-sm text-slate-300 font-medium">Code Breakdown</span>
                              </div>
                              <div className="rounded-lg overflow-hidden border border-white/10">
                                <SyntaxHighlighter
                                  language="python"
                                  style={oneDark}
                                  customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                  }}
                                  showLineNumbers={true}
                                >
                                  {level.examples[currentExample]?.code || ''}
                                </SyntaxHighlighter>
                              </div>
                              <div className="mt-4 p-4 bg-dark-lighter rounded-lg">
                                <p className="text-slate-300 text-sm leading-relaxed">
                                  {level.examples[currentExample]?.description}
                                </p>
                                <p className="mt-3 text-sm text-primary font-medium">
                                  💡 Try running the code above to see it in action!
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Practice Tab */}
                {activeTab === 'practice' && hasExercise && (
                  <div className="space-y-6">
                    {/* Exercise Instructions */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Target className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {level.exercise?.title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            {level.exercise?.instructions}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/10 bg-slate-900/30">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold">Your Solution:</h4>
                          <span className="text-xs text-slate-400">Write your code and test it!</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <UniversalCodePlayground
                          defaultLanguage="python"
                          initialCode={level.exercise?.starterCode || '# Write your code here\n'}
                          testCases={level.testCases || []}
                          height="400px"
                          showThemeToggle={false}
                        />
                      </div>
                    </div>

                    {/* Hints Section */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">Challenge Tips</h4>
                          <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Think about the problem step by step</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Test your code with the play button</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>Don't be afraid to experiment and make mistakes!</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Content States */}
                {activeTab === 'examples' && !hasExamples && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                    <Code className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">No examples available for this lesson yet.</p>
                  </div>
                )}

                {activeTab === 'practice' && !hasExercise && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                    <Target className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">No practice exercises available for this lesson yet.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-24 space-y-6"
            >
              {/* Key Points */}
              {level.keyPoints && level.keyPoints.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Key Takeaways
                  </h3>
                  <ul className="space-y-3">
                    {level.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="bg-dark-lighter border border-primary/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-white font-bold text-lg mb-3">Your Progress</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Current Level:</span>
                    <span className="text-white font-semibold">{parseInt(levelId)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lesson:</span>
                    <span className="text-white font-semibold">{effectiveLessonOrder}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Module:</span>
                    <span className="text-white font-semibold">{moduleId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 mt-3 pt-3 border-t border-white/10">
                    <span>XP Reward:</span>
                    <span className="text-primary font-semibold">+{level.xp_reward || 10}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Status:</span>
                    <span className="text-white font-semibold capitalize">{progressState.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => updateProgressState('in_progress')}
                    disabled={progressSaving || !lessonDbId}
                    className="w-full py-2 px-3 rounded-md bg-slate-700 text-slate-100 hover:bg-slate-600 transition disabled:opacity-60"
                  >
                    {lessonDbId ? 'Mark In Progress' : 'Loading...'}
                  </button>
                  <button
                    onClick={() => updateProgressState('completed')}
                    disabled={progressSaving || !lessonDbId}
                    className="w-full py-2 px-3 rounded-md bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    {progressState === 'completed' ? 'Completed ✓' : lessonDbId ? 'Mark Complete' : 'Loading...'}
                  </button>
                  {progressMessage && (
                    <p className="text-xs text-slate-300 mt-1">{progressMessage}</p>
                  )}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Pro Tips
                </h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Run the examples to see how they work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Try modifying the code to experiment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Complete the practice exercise to reinforce learning</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelPage;