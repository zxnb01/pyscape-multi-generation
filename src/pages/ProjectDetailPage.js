import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectById } from '../data/projectsData';

/* ─── tiny helpers ─────────────────────────────────────────── */

const difficultyColors = {
  Easy:   'bg-green-700/30  text-green-400  border-green-700/40',
  Medium: 'bg-yellow-700/30 text-yellow-400 border-yellow-700/40',
  Hard:   'bg-red-700/30    text-red-400    border-red-700/40',
};

const difficultyDot = {
  Easy:   'bg-green-400',
  Medium: 'bg-yellow-400',
  Hard:   'bg-red-400',
};

const MODES = [
  {
    key: 'onYourOwn',
    icon: '🧗',
    label: 'On Your Own',
    subtitle: 'No hints — go solo.',
    accent: 'from-accent/20 to-accent/5 border-accent/30 hover:border-accent/60',
    activeAccent: 'from-accent/30 to-accent/10 border-accent ring-1 ring-accent/40',
  },
  {
    key: 'someGuidance',
    icon: '🗺️',
    label: 'Some Guidance',
    subtitle: 'Steps + hints for each.',
    accent: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/60',
    activeAccent: 'from-primary/30 to-primary/10 border-primary ring-1 ring-primary/40',
  },
  {
    key: 'stepByStep',
    icon: '📖',
    label: 'Step-by-Step',
    subtitle: 'Full walkthrough with code.',
    accent: 'from-secondary/20 to-secondary/5 border-secondary/30 hover:border-secondary/60',
    activeAccent: 'from-secondary/30 to-secondary/10 border-secondary ring-1 ring-secondary/40',
  },
];

/* ─── inline "code block" renderer ─────────────────────────── */
function renderContent(text) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3);
      const newline = inner.indexOf('\n');
      const code = newline !== -1 ? inner.slice(newline + 1) : inner;
      return (
        <pre key={i} className="my-3 bg-dark rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200 border border-dark-lightest">
          <code>{code}</code>
        </pre>
      );
    }
    return (
      <p key={i} className="mb-2 text-gray-300 leading-relaxed whitespace-pre-wrap">
        {part}
      </p>
    );
  });
}

/* ─── main component ────────────────────────────────────────── */
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  const [openStep, setOpenStep] = useState(null);

  const project = getProjectById(id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Project not found</h1>
        <p className="text-gray-400 mb-6">This project doesn't exist yet — check back soon!</p>
        <Link to="/app/projects" className="btn-primary">← Back to Projects</Link>
      </div>
    );
  }

  const {
    title, tagline, difficulty, difficultyLabel, xp, completions,
    timeEstimate, keywords, keyConcepts, series, summary, steps, status,
  } = project;

  const isLocked = status === 'locked';

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto pb-20">

      {/* ── BACK NAV ── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/app/projects')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project Labs
        </button>
      </motion.div>

      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-dark-lighter via-dark-lighter to-dark border border-dark-lightest"
      >
        {/* decorative glow */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative p-8 md:p-10">
          {/* completions badge */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-white font-semibold">{completions.toLocaleString()}+</span>
            <span>completed</span>
            {isLocked && (
              <span className="ml-auto flex items-center gap-1 text-yellow-400 text-xs border border-yellow-700/40 bg-yellow-700/20 px-2 py-1 rounded-full">
                🔒 Locked — complete earlier projects first
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">{title}</h1>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl">{tagline}</p>

          {/* badges row */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium ${difficultyColors[difficulty]}`}>
              <span className={`w-2 h-2 rounded-full ${difficultyDot[difficulty]}`}/>
              {difficultyLabel}
            </span>
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-primary/30 bg-primary/20 text-primary font-semibold">
              ⚡ +{xp} XP
            </span>
            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-dark-lightest text-gray-300">
              ⏱ {timeEstimate}
            </span>
            {keywords.map(k => (
              <span key={k} className="text-sm px-3 py-1.5 rounded-full bg-dark-lightest text-gray-300">
                {k}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── LEFT: CONTENT ── */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* 30-second summary */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h2 className="text-lg font-bold text-white">30-second Summary</h2>
            </div>
            <h3 className="text-primary font-semibold text-base mb-3">{summary.headline}</h3>
            <p className="text-gray-300 leading-relaxed mb-6">{summary.intro}</p>

            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              What you'll learn
            </p>
            <ul className="space-y-2">
              {summary.whatYoullLearn.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="text-lg leading-none mt-0.5">{item.emoji}</span>
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* Preview "image" */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-xl overflow-hidden border border-dark-lightest bg-dark-lighter">
              {/* mock terminal / preview */}
              <div className="bg-dark flex items-center gap-2 px-4 py-2 border-b border-dark-lightest">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-gray-500 font-mono">sentiment_analyzer.py</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-1">
                <p><span className="text-purple-400">from</span> <span className="text-primary">analyzer</span> <span className="text-purple-400">import</span> classify_sentiment</p>
                <p className="text-gray-600">{'  '}</p>
                <p><span className="text-yellow-400">texts</span> = [</p>
                <p className="ml-6 text-green-400">"This movie was absolutely fantastic! 🎬",</p>
                <p className="ml-6 text-red-400">"Terrible film, complete waste of time. 😤",</p>
                <p className="ml-6 text-gray-300">"It was okay, nothing special.",</p>
                <p>]</p>
                <p className="text-gray-600">{'  '}</p>
                <p><span className="text-purple-400">for</span> <span className="text-yellow-400">text</span> <span className="text-purple-400">in</span> texts:</p>
                <p className="ml-6"><span className="text-blue-400">print</span>(<span className="text-gray-300">classify_sentiment(text)</span>)</p>
                <div className="mt-4 pt-4 border-t border-dark-lightest text-gray-400 space-y-1">
                  <p><span className="text-green-400">✓</span> <span className="text-green-300">positive</span> — "This movie was absolutely fantastic!"</p>
                  <p><span className="text-red-400">✗</span> <span className="text-red-300">negative</span> — "Terrible film, complete waste of time."</p>
                  <p><span className="text-gray-400">~</span> <span className="text-gray-300">neutral</span>  — "It was okay, nothing special."</p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-2 italic">{summary.previewCaption}</p>
          </motion.section>

          {/* ── CHOOSE YOUR MODE ── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎮</span>
              <h2 className="text-lg font-bold text-white">Choose Your Mode</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Everyone learns differently — pick the style that fits you best.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {MODES.map((mode) => {
                const isActive = selectedMode === mode.key;
                return (
                  <motion.button
                    key={mode.key}
                    onClick={() => { setSelectedMode(mode.key); setOpenStep(null); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative text-left p-5 rounded-xl border bg-gradient-to-br transition-all duration-200
                      ${isActive ? mode.activeAccent : mode.accent}
                    `}
                    disabled={isLocked}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                    <span className="block text-2xl mb-2">{mode.icon}</span>
                    <span className="block font-semibold text-white mb-1">{mode.label}</span>
                    <span className="block text-xs text-gray-400">{mode.subtitle}</span>
                  </motion.button>
                );
              })}
            </div>

            {isLocked && (
              <div className="flex items-center gap-3 bg-yellow-700/10 border border-yellow-700/30 rounded-xl p-4 text-yellow-300 text-sm">
                🔒 Complete the earlier projects in this series to unlock this one.
              </div>
            )}

            {/* ── MODE CONTENT ── */}
            <AnimatePresence mode="wait">
              {selectedMode && !isLocked && (
                <motion.div
                  key={selectedMode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  <div className="border-t border-dark-lightest pt-6">

                    {/* ON YOUR OWN */}
                    {selectedMode === 'onYourOwn' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          🧗 Your Checklist
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          No hints here — these are the core steps. Tackle them in any order you like.
                        </p>
                        <ul className="space-y-3">
                          {steps.onYourOwn.map((step, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 group"
                            >
                              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-dark-lightest bg-dark text-gray-500 text-xs flex items-center justify-center font-mono group-hover:border-primary group-hover:text-primary transition-colors">
                                {i + 1}
                              </span>
                              <span className="text-gray-300 pt-0.5">{step}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* SOME GUIDANCE */}
                    {selectedMode === 'someGuidance' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          🗺️ Guided Steps
                        </h3>
                        <div className="space-y-3">
                          {steps.someGuidance.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border border-dark-lightest rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() => setOpenStep(openStep === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-lightest/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                    {item.step}
                                  </span>
                                  <span className="font-medium text-white">{item.title}</span>
                                </div>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${openStep === i ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <AnimatePresence>
                                {openStep === i && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 pt-1 border-t border-dark-lightest">
                                      <p className="text-gray-300 text-sm bg-dark/60 rounded-lg p-3 border-l-2 border-primary/40">
                                        💡 {item.hint}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP BY STEP */}
                    {selectedMode === 'stepByStep' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          📖 Full Walkthrough
                        </h3>
                        <div className="space-y-4">
                          {steps.stepByStep.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="border border-dark-lightest rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() => setOpenStep(openStep === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-lightest/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">
                                    {item.step}
                                  </span>
                                  <span className="font-medium text-white">{item.title}</span>
                                </div>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${openStep === i ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <AnimatePresence>
                                {openStep === i && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 pt-1 border-t border-dark-lightest">
                                      {renderContent(item.content)}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4"
        >

          {/* Meta card */}
          <div className="card space-y-4">
            <MetaRow icon="⚙️" label="DIFFICULTY" value={difficultyLabel} valueClass={`font-semibold ${difficultyColors[difficulty].split(' ')[1]}`} />
            <MetaRow icon="⏱" label="TIME"       value={timeEstimate}   valueClass="text-white font-semibold" />
            <MetaRow icon="⚡" label="XP REWARD"  value={`+${xp} XP`}   valueClass="text-primary font-semibold" />
          </div>

          {/* Series */}
          {series.length > 1 && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>🔗</span> Related Projects
              </p>
              <ul className="space-y-2">
                {series.map((s, i) => (
                  <li key={s.id}>
                    {s.current ? (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                        <span className="text-primary text-sm font-medium truncate">{s.title}</span>
                        <span className="ml-auto text-xs text-primary/60 flex-shrink-0">here</span>
                      </div>
                    ) : (
                      <Link
                        to={`/app/projects/${s.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-lightest transition-colors group"
                      >
                        <span className="w-5 h-5 rounded-full border border-dark-lightest text-gray-500 text-xs flex items-center justify-center font-bold flex-shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
                          {i + 1}
                        </span>
                        <span className="text-gray-300 text-sm truncate group-hover:text-white transition-colors">{s.title}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key concepts */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🧠</span> Key Concepts
            </p>
            <div className="flex flex-wrap gap-2">
              {keyConcepts.map(c => (
                <span key={c} className="text-xs bg-dark px-2.5 py-1 rounded-full border border-dark-lightest text-gray-300 hover:border-primary/40 hover:text-primary transition-colors">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isLocked && !selectedMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-center"
            >
              <p className="text-sm text-gray-300 mb-3">Ready to build?</p>
              <button
                onClick={() => { setSelectedMode('stepByStep'); document.querySelector('.card:nth-child(3)')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn-primary w-full"
              >
                Start Project →
              </button>
            </motion.div>
          )}

        </motion.aside>

      </div>
    </div>
  );
}

/* ─── MetaRow component ─────────────────────────────────────── */
function MetaRow({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
        <span>{icon}</span>{label}
      </span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}
