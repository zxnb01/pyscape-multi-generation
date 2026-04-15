import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectById } from '../data/projectsData';

/* ─── preview fallbacks ────────────────────────────────────── */
const PREVIEW_FALLBACKS = {
  'Sentiment Analyzer': {
    fileName: 'sentiment_analyzer.py',
    previewCode: `from analyzer import classify_sentiment

texts = [
    "This movie was absolutely fantastic! 🎬",
    "Terrible film, complete waste of time. 😤",
    "It was okay, nothing special.",
]

for text in texts:
    print(classify_sentiment(text))`,
    previewOutput: [
      {
        icon: '✓',
        iconClass: 'text-green-400',
        label: 'positive',
        labelClass: 'text-green-300',
        text: '"This movie was absolutely fantastic!"',
      },
      {
        icon: '✗',
        iconClass: 'text-red-400',
        label: 'negative',
        labelClass: 'text-red-300',
        text: '"Terrible film, complete waste of time."',
      },
      {
        icon: '~',
        iconClass: 'text-gray-400',
        label: 'neutral',
        labelClass: 'text-gray-300',
        text: '"It was okay, nothing special."',
      },
    ],
  },

  'Data Visualization Dashboard': {
    fileName: 'covid_dashboard.py',
    previewCode: `import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv("covid_data.csv")

print(data.head())

plt.figure(figsize=(8,4))
plt.plot(data["date"], data["cases"], color="blue")

plt.title("COVID-19 Cases Over Time")
plt.xlabel("Date")
plt.ylabel("Cases")

plt.xticks(rotation=45)
plt.tight_layout()
plt.show()`,
    previewOutput: [],
  },

  'Chatbot with Transformer': {
    fileName: 'chatbot_transformer.py',
    previewCode: `from transformers import pipeline

chatbot = pipeline("text-generation", model="gpt2")

prompt = "User: Hello, how are you?\\nBot:"
response = chatbot(prompt, max_length=50)

print(response[0]["generated_text"])`,
    previewOutput: [
      {
        icon: '💬',
        iconClass: 'text-primary',
        label: 'bot',
        labelClass: 'text-primary',
        text: '"Hello! I’m doing well. How can I help you today?"',
      },
    ],
  },
};

/* ─── tiny helpers ─────────────────────────────────────────── */

const difficultyColors = {
  Easy: 'bg-green-700/30 text-green-400 border-green-700/40',
  Medium: 'bg-yellow-700/30 text-yellow-400 border-yellow-700/40',
  Hard: 'bg-red-700/30 text-red-400 border-red-700/40',
};

const difficultyDot = {
  Easy: 'bg-green-400',
  Medium: 'bg-yellow-400',
  Hard: 'bg-red-400',
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

  const normalizedText = String(text).replace(/\\n/g, '\n');
  const parts = normalizedText.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3);
      const newline = inner.indexOf('\n');
      const code = newline !== -1 ? inner.slice(newline + 1) : inner;

      return (
        <pre
          key={i}
          className="my-3 bg-dark rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200 border border-dark-lightest"
        >
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
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const p = await getProjectById(id);
      if (!cancelled) {
        setProject(p || null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <div className="h-4 w-40 bg-dark-lighter rounded animate-pulse mb-6" />
        <div className="rounded-2xl bg-dark-lighter p-10 mb-8 animate-pulse">
          <div className="h-8 w-3/4 bg-dark-lightest rounded mb-4" />
          <div className="h-5 w-1/2 bg-dark-lightest rounded mb-6" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-dark-lightest rounded-full" />
            <div className="h-8 w-20 bg-dark-lightest rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Project not found</h1>
        <p className="text-gray-400 mb-6">
          This project doesn't exist yet — check back soon!
        </p>
        <Link to="/app/projects" className="btn-primary">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const {
    title,
    tagline,
    difficulty = 'Medium',
    difficultyLabel = 'Medium',
    xp = 0,
    completions = 0,
    timeEstimate = '',
    keywords = [],
    keyConcepts = [],
    series = [],
    summary = {},
    steps = {},
    status,
    modes = {},
  } = project;

  const isLocked = status === 'locked';
  const fallback = PREVIEW_FALLBACKS[title] || {};

  const previewFileName = summary?.fileName || fallback.fileName || 'script.py';

  const previewCode =
    summary?.previewCode?.replace(/\\n/g, '\n') ||
    fallback.previewCode ||
    'No preview available';

  const previewOutput =
    Array.isArray(summary?.previewOutput) && summary.previewOutput.length > 0
      ? summary.previewOutput
      : Array.isArray(fallback.previewOutput)
      ? fallback.previewOutput
      : [];

  const whatYoullLearn = Array.isArray(summary?.whatYoullLearn)
    ? summary.whatYoullLearn
    : [];

  const onYourOwnSteps = Array.isArray(steps?.onYourOwn) ? steps.onYourOwn : [];
  const someGuidanceSteps = Array.isArray(steps?.someGuidance) ? steps.someGuidance : [];
  const stepByStepSteps = Array.isArray(steps?.stepByStep) ? steps.stepByStep : [];

  const modeMeta = {
    onYourOwn: {
      title: modes?.onYourOwn?.title || 'On Your Own',
      description: modes?.onYourOwn?.description || 'No hints — go solo.',
    },
    someGuidance: {
      title: modes?.someGuidance?.title || 'Some Guidance',
      description: modes?.someGuidance?.description || 'Steps + hints for each.',
    },
    stepByStep: {
      title: modes?.stepByStep?.title || 'Step-by-Step',
      description: modes?.stepByStep?.description || 'Full walkthrough with code.',
    },
  };

  const currentSteps =
    selectedMode === 'onYourOwn'
      ? onYourOwnSteps
      : selectedMode === 'someGuidance'
      ? someGuidanceSteps
      : selectedMode === 'stepByStep'
      ? stepByStepSteps
      : [];

  const totalSteps = currentSteps.length;
  const completedCount = completedSteps.length;
  const earnedXP =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * xp) : 0;
  const progressPercent =
    totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isProjectCompleted = totalSteps > 0 && completedCount === totalSteps;

  const toggleCompletedStep = (stepId) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/app/projects')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Project Labs
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-dark-lighter via-dark-lighter to-dark border border-dark-lightest"
      >
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-semibold">
              {Number(completions).toLocaleString()}+
            </span>
            <span>users completed</span>

            {isLocked && (
              <span className="ml-auto flex items-center gap-1 text-yellow-400 text-xs border border-yellow-700/40 bg-yellow-700/20 px-2 py-1 rounded-full">
                🔒 Locked — complete earlier projects first
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">{title}</h1>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl">{tagline}</p>

          <div className="flex flex-wrap gap-3 items-center">
            <span
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium ${difficultyColors[difficulty] || difficultyColors.Medium}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${difficultyDot[difficulty] || difficultyDot.Medium}`}
              />
              {difficultyLabel}
            </span>

            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-primary/30 bg-primary/20 text-primary font-semibold">
              ⚡ +{xp} XP
            </span>

            <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-dark-lightest text-gray-300">
              ⏱ {timeEstimate}
            </span>

            {keywords.map((k) => (
              <span
                key={k}
                className="text-sm px-3 py-1.5 rounded-full bg-dark-lightest text-gray-300"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-8">
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

            <h3 className="text-primary font-semibold text-base mb-3">
              {summary?.headline || 'Project Overview'}
            </h3>

            <p className="text-gray-300 leading-relaxed mb-6">
              {summary?.intro || 'No summary available.'}
            </p>

            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              What you'll learn
            </p>

            <ul className="space-y-2">
              {whatYoullLearn.map((item, i) => (
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

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-xl overflow-hidden border border-dark-lightest bg-dark-lighter">
              <div className="bg-dark flex items-center gap-2 px-4 py-2 border-b border-dark-lightest">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-gray-500 font-mono">
                  {previewFileName}
                </span>
              </div>

              <div className="p-6 font-mono text-sm">
                <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed bg-dark rounded-lg p-4 border border-dark-lightest overflow-x-auto">
                  {previewCode}
                </pre>

                {previewOutput.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-lightest text-gray-400 space-y-1">
                    {previewOutput.map((item, i) => (
                      <p key={i}>
                        <span className={item.iconClass}>{item.icon}</span>{' '}
                        <span className={item.labelClass}>{item.label}</span>{' '}
                        — {item.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm mt-2 italic">
              {summary?.previewCaption || ''}
            </p>
          </motion.section>

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
                    onClick={() => {
                      setSelectedMode(mode.key);
                      setOpenStep(null);
                      setCompletedSteps([]);
                    }}
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
                    <span className="block font-semibold text-white mb-1">
                      {modeMeta[mode.key].title}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {modeMeta[mode.key].description}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {isLocked && (
              <div className="flex items-center gap-3 bg-yellow-700/10 border border-yellow-700/30 rounded-xl p-4 text-yellow-300 text-sm">
                🔒 Complete the earlier projects in this series to unlock this one.
              </div>
            )}

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
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-300">
                          Progress: {completedCount}/{totalSteps} steps
                        </span>
                        <span className="text-primary font-semibold">
                          Earned XP: {earnedXP}/{xp}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {selectedMode === 'onYourOwn' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          🧗 {modeMeta.onYourOwn.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {modeMeta.onYourOwn.description}
                        </p>

                        <ul className="space-y-3">
                          {onYourOwnSteps.map((step, i) => {
                            const isDone = completedSteps.includes(i);

                            return (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-3 group cursor-pointer"
                                onClick={() => toggleCompletedStep(i)}
                              >
                                <span
                                  className={`flex-shrink-0 w-6 h-6 rounded-full border text-xs flex items-center justify-center font-mono transition-colors ${
                                    isDone
                                      ? 'bg-primary text-white border-primary'
                                      : 'border-dark-lightest bg-dark text-gray-500 group-hover:border-primary group-hover:text-primary'
                                  }`}
                                >
                                  {isDone ? '✓' : i + 1}
                                </span>
                                <span className={`pt-0.5 ${isDone ? 'text-white' : 'text-gray-300'}`}>
                                  {step}
                                </span>
                              </motion.li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {selectedMode === 'someGuidance' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          🗺️ {modeMeta.someGuidance.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {modeMeta.someGuidance.description}
                        </p>

                        <div className="space-y-3">
                          {someGuidanceSteps.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border border-dark-lightest rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  setOpenStep(openStep === i ? null : i);
                                  if (!completedSteps.includes(i)) {
                                    setCompletedSteps((prev) => [...prev, i]);
                                  }
                                }}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-lightest/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                    {item.step}
                                  </span>
                                  <span className="font-medium text-white">{item.title}</span>
                                </div>

                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    openStep === i ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
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

                    {selectedMode === 'stepByStep' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          📖 {modeMeta.stepByStep.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {modeMeta.stepByStep.description}
                        </p>

                        <div className="space-y-4">
                          {stepByStepSteps.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="border border-dark-lightest rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  setOpenStep(openStep === i ? null : i);
                                  if (!completedSteps.includes(i)) {
                                    setCompletedSteps((prev) => [...prev, i]);
                                  }
                                }}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-lightest/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-full bg-secondary/20 text-secondary text-xs flex items-center justify-center font-bold">
                                    {item.step}
                                  </span>
                                  <span className="font-medium text-white">{item.title}</span>
                                </div>

                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    openStep === i ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
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

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4"
        >
          <div className="card space-y-4">
            <MetaRow
              icon="⚙️"
              label="DIFFICULTY"
              value={difficultyLabel}
              valueClass={`font-semibold ${
                (difficultyColors[difficulty] || difficultyColors.Medium).split(' ')[1]
              }`}
            />
            <MetaRow
              icon="⏱"
              label="TIME"
              value={timeEstimate}
              valueClass="text-white font-semibold"
            />
            <MetaRow
              icon="⚡"
              label="XP REWARD"
              value={isProjectCompleted ? `Claimed +${xp} XP` : `+${xp} XP`}
              valueClass={isProjectCompleted ? 'text-green-400 font-semibold' : 'text-primary font-semibold'}
            />
            <MetaRow
              icon="⭐"
              label="XP EARNED"
              value={`${earnedXP}/${xp} XP`}
              valueClass={isProjectCompleted ? 'text-green-400 font-semibold' : 'text-white font-semibold'}
            />
          </div>

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
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-primary text-sm font-medium truncate">
                          {s.title}
                        </span>
                        <span className="ml-auto text-xs text-primary/60 flex-shrink-0">
                          here
                        </span>
                      </div>
                    ) : (
                      <Link
                        to={`/app/projects/${s.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-lightest transition-colors group"
                      >
                        <span className="w-5 h-5 rounded-full border border-dark-lightest text-gray-500 text-xs flex items-center justify-center font-bold flex-shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
                          {i + 1}
                        </span>
                        <span className="text-gray-300 text-sm truncate group-hover:text-white transition-colors">
                          {s.title}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🧠</span> Key Concepts
            </p>

            <div className="flex flex-wrap gap-2">
              {keyConcepts.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-dark px-2.5 py-1 rounded-full border border-dark-lightest text-gray-300 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {!isLocked && !selectedMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-center"
            >
              <p className="text-sm text-gray-300 mb-3">Ready to build?</p>
              <button
                onClick={() => {
                  setSelectedMode('stepByStep');
                  setCompletedSteps([]);
                  document
                    .querySelector('.card:nth-child(3)')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
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
        <span>{icon}</span>
        {label}
      </span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}