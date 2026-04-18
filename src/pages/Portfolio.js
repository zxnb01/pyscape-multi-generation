import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import SentimentAnalyzerPDF from '../components/portfolio/SentimentAnalyzerPDF';
import useGamification from '../gamification/useGamification';
import { getBadgeImagePath } from '../utils/badgeImages';

/* ── Project data ──────────────────────────────────────────── */
const portfolioProjects = [
  {
    id: 1,
    title: 'Sentiment Analyzer',
    description: "A complete NLP pipeline that classifies text as positive, negative, or neutral using NLTK's Naive Bayes classifier trained on the movie_reviews corpus.",
    date: '2025-09-05',
    keywords: ['NLP', 'Python', 'NLTK'],
    category: 'NLP',
    difficulty: 'Easy',
    xp: 50,
    timeSpent: '45 min',
    metrics: { accuracy: '87%', f1Score: '0.85', trainDocs: '1,800', vocabSize: '2,000' },
    keyLearnings: [
      'Tokenization and stopword removal with NLTK punkt tokenizer',
      'Bag-of-Words feature representation over top-2000 vocabulary',
      'Naive Bayes probabilistic classification for text labels',
      'Evaluating with accuracy + most-informative-features analysis',
      'Wrapping model into a reusable classify_sentiment() function',
    ],
    pdfComponent: SentimentAnalyzerPDF,
  },
];

/* ── Difficulty colour map ──────────────────────────────────── */
const diffColor = {
  Easy:   'text-green-400 bg-green-700/20 border-green-700/30',
  Medium: 'text-yellow-400 bg-yellow-700/20 border-yellow-700/30',
  Hard:   'text-red-400 bg-red-700/20 border-red-700/30',
};

const Portfolio = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [exporting, setExporting] = useState(null);
  const { xp, currentStreak, longestStreak, badges, earnedBadges = [] } = useGamification();

  const getBadgeRequirementText = (badge) => {
    if (!badge) return 'unlock this badge';
    const amount = badge.requirement_value;
    switch (badge.badge_type) {
      case 'xp':
        return `${amount} XP required`;
      case 'streak':
        return `${amount} day streak required`;
      case 'lesson':
        return `${amount} lesson${amount === 1 ? '' : 's'} completed`;
      case 'project':
        return `${amount} project${amount === 1 ? '' : 's'} completed`;
      default:
        return amount != null ? `Reach ${amount}` : 'complete the requirement';
    }
  };

  const getDisplayDescription = (description, isEarned, badge) => {
    if (!description) {
      if (isEarned) {
        return `Earned ${badge?.title || 'this badge'}`;
      }
      return `Unlock by ${getBadgeRequirementText(badge)}`;
    }

    if (!isEarned) return description;

    const pastTenseMap = {
      'Complete': 'Completed',
      'Reach': 'Reached',
      'Earn': 'Earned',
      'Maintain': 'Maintained',
      'Submit': 'Submitted',
      'Build': 'Built'
    };

    let pastTense = description;
    for (const [present, past] of Object.entries(pastTenseMap)) {
      pastTense = pastTense.replace(new RegExp(`^${present}\\s`), `${past} `);
    }
    return pastTense;
  };

  const handleExportPDF = async (project) => {
    setExporting(project.id);
    try {
      const PDFDoc = project.pdfComponent;
      const blob = await pdf(
        <PDFDoc completedDate={new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
        <p className="text-gray-400">Showcase your completed projects — export professional documentation as PDF.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Projects ── */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {portfolioProjects.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-dark-lightest flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Projects</h2>
                <span className="text-sm text-gray-400">{portfolioProjects.length} completed</span>
              </div>
              <div className="divide-y divide-dark-lightest">
                {portfolioProjects.map((project, i) => (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-6">
                    {/* top row */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded border ${diffColor[project.difficulty]}`}>{project.difficulty}</span>
                          <span className="text-xs px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary">+{project.xp} XP</span>
                          <span className="text-xs px-2 py-1 rounded border border-dark-lightest text-gray-400">⏱ {project.timeSpent}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 mt-1">
                        {new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{project.description}</p>

                    {/* keywords */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.keywords.map((k) => (
                        <span key={k} className="text-xs bg-dark-lightest px-2 py-1 rounded text-gray-300">{k}</span>
                      ))}
                    </div>

                    {/* metrics */}
                    <div className="grid grid-cols-4 gap-3 bg-dark rounded-xl p-4 mb-4 border border-dark-lightest">
                      {[
                        { label: 'Accuracy',   value: project.metrics.accuracy,  color: 'text-green-400' },
                        { label: 'F1 Score',   value: project.metrics.f1Score,   color: 'text-primary' },
                        { label: 'Train Docs', value: project.metrics.trainDocs, color: 'text-purple-400' },
                        { label: 'Vocab Size', value: project.metrics.vocabSize, color: 'text-accent' },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* actions */}
                    <div className="flex gap-3 items-center flex-wrap">
                      <button
                        onClick={() => setActiveProject(project)}
                        className="flex items-center gap-2 py-2 px-4 rounded-md bg-dark-lightest hover:bg-dark text-gray-200 text-sm font-medium transition-colors border border-dark-lightest hover:border-primary/40"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                      <button
                        onClick={() => handleExportPDF(project)}
                        disabled={exporting === project.id}
                        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all border ${
                          exporting === project.id
                            ? 'bg-primary/10 border-primary/20 text-primary/60 cursor-wait'
                            : 'bg-primary/20 border-primary/30 text-primary hover:bg-primary/30 hover:border-primary/60'
                        }`}
                      >
                        {exporting === project.id ? (
                          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating…</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Export PDF</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📁</span>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-4">Complete projects in the Project Labs to add them to your portfolio.</p>
                <button className="btn-primary">Go to Project Labs</button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── RIGHT SIDEBAR ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="space-y-4">
          <div className="card p-5">
            <h2 className="text-base font-semibold mb-1">Portfolio PDF</h2>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">Export professional docs — steps, code and metrics included.</p>
            <button onClick={() => portfolioProjects[0] && handleExportPDF(portfolioProjects[0])} className="btn-primary w-full flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Latest Project PDF
            </button>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold mb-4">Your Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Projects Completed', value: portfolioProjects.length, color: 'text-primary' },
                { label: 'Total XP Earned',    value: `${xp} XP`, color: 'text-primary' },
                { label: 'Current Streak',     value: `${currentStreak} days`, color: 'text-accent' },
                { label: 'Best Streak',        value: `${longestStreak} days`, color: 'text-yellow-400' },
                { label: 'Badges Earned',      value: badges, color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold mb-4">Achievements</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {earnedBadges.length > 0 ? (
                earnedBadges.map((item) => {
                  const badge = item.badges || item;
                  return (
                    <div key={badge.id} className="flex items-center p-3 rounded-xl bg-dark-lightest">
                      <div className="w-9 h-9 flex items-center justify-center mr-3 bg-transparent">
                        <img
                          src={getBadgeImagePath(badge)}
                          alt={badge.title}
                          className="w-8 h-8 object-contain"
                          style={{ mixBlendMode: 'screen' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{badge.title}</p>
                        <p className="text-xs text-gray-400">
                          {getDisplayDescription(badge.description, true, badge)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-400">No achievements earned yet. Complete lessons to unlock badges.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════  VIEW DETAILS MODAL  ══════════════════ */}
      <AnimatePresence>
        {activeProject && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-dark-lighter z-50 overflow-y-auto shadow-2xl border-l border-dark-lightest"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              {/* sticky header */}
              <div className="sticky top-0 bg-dark-lighter/95 backdrop-blur-sm border-b border-dark-lightest z-10">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Project Documentation</p>
                    <h2 className="text-xl font-bold">{activeProject.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportPDF(activeProject)}
                      disabled={exporting === activeProject.id}
                      className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                    >
                      {exporting === activeProject.id ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating…</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Export PDF</>
                      )}
                    </button>
                    <button onClick={() => setActiveProject(null)} className="p-2 rounded-lg hover:bg-dark-lightest text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* panel body */}
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${diffColor[activeProject.difficulty]}`}>{activeProject.difficulty}</span>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-semibold">+{activeProject.xp} XP</span>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-dark-lightest text-gray-300">⏱ {activeProject.timeSpent}</span>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-dark-lightest text-gray-400">
                    {new Date(activeProject.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{activeProject.description}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Accuracy',   value: activeProject.metrics.accuracy,  color: 'text-green-400' },
                      { label: 'F1 Score',   value: activeProject.metrics.f1Score,   color: 'text-primary' },
                      { label: 'Train Docs', value: activeProject.metrics.trainDocs, color: 'text-purple-400' },
                      { label: 'Vocab Size', value: activeProject.metrics.vocabSize, color: 'text-accent' },
                    ].map(m => (
                      <div key={m.label} className="bg-dark rounded-xl p-4 border border-dark-lightest text-center">
                        <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What You Learned</h3>
                  <ul className="space-y-2">
                    {activeProject.keyLearnings.map((l, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="text-primary mt-0.5 flex-shrink-0">▸</span>{l}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.keywords.map(k => (
                      <span key={k} className="text-sm bg-dark-lightest px-3 py-1.5 rounded-full border border-dark-lightest text-gray-300">{k}</span>
                    ))}
                  </div>
                </div>

                {/* PDF hint card */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📄</span>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Full Documentation Available</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      The exported PDF includes a 3-page document with the complete step-by-step
                      implementation, all code snippets, performance results, and "What's Next"
                      recommendations.
                    </p>
                    <button onClick={() => handleExportPDF(activeProject)} className="mt-3 btn-primary py-1.5 px-4 text-sm">
                      Open PDF →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Portfolio;