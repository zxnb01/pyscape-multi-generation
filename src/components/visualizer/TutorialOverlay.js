import React, { useState } from 'react';

/**
 * Reusable step-by-step tutorial overlay.
 * Renders absolutely inside the nearest `relative` positioned parent.
 *
 * Props:
 *   steps  – Array<{ title: string, body: string, highlight?: string }>
 *   onClose – () => void
 */
export default function TutorialOverlay({ steps, onClose }) {
  const [current, setCurrent] = useState(0);
  const step    = steps[current];
  const isFirst = current === 0;
  const isLast  = current === steps.length - 1;

  return (
    /* margin:0 overrides any space-y-* margin applied by parent flex/grid */
    <div
      className="absolute z-50 flex items-center justify-center bg-black/80 rounded-xl"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div className="bg-[#0F172A] border border-primary/40 rounded-2xl p-6 max-w-xs w-full mx-4 shadow-2xl shadow-black/60">

        {/* ── step badge + close ──────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            Step {current + 1} / {steps.length}
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl leading-none"
          >×</button>
        </div>

        {/* ── title ───────────────────────────────────────── */}
        <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>

        {/* ── body ────────────────────────────────────────── */}
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{step.body}</p>

        {/* ── highlight badge ──────────────────────────────── */}
        {step.highlight && (
          <div className="flex items-start gap-2 bg-primary/10 border border-primary/25 rounded-lg px-3 py-2 text-xs text-primary mb-4">
            <span className="mt-0.5 shrink-0">👆</span>
            <span>{step.highlight}</span>
          </div>
        )}

        {/* ── progress dots ───────────────────────────────── */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-5 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-dark-lightest hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* ── navigation ──────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrent(c => c - 1)}
            disabled={isFirst}
            className="flex-1 py-2 rounded-lg bg-dark-lightest text-gray-300 text-sm disabled:opacity-30 hover:bg-dark transition-colors disabled:cursor-not-allowed"
          >← Prev</button>

          {isLast ? (
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
            >Got it!</button>
          ) : (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
            >Next →</button>
          )}
        </div>

      </div>
    </div>
  );
}
