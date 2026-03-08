import React, { useState, useRef, useEffect, useCallback } from 'react';
import TutorialOverlay from './TutorialOverlay';

const GRADIENT_TUTORIAL = [
  {
    title: 'Pick a loss landscape',
    body: '"Simple Bowl" is perfectly convex — gradient descent always finds the global minimum. "Bumpy" is non-convex with local minima. "Saddle / Ravine" has tricky geometry. Each shows different optimizer behaviour.',
    highlight: '"Loss Function" dropdown — top-left of controls',
  },
  {
    title: 'Understand the visual',
    body: 'The blue curve is the loss surface L(w). The orange ball is the current weight position w. The purple dashed line is the gradient (tangent slope) at that point — it shows which direction is "downhill".',
    highlight: 'Main chart — blue curve with orange ball and purple tangent',
  },
  {
    title: 'Set the learning rate η',
    body: 'Drag the "Learning Rate" slider (0.01–0.5). Too small = convergence is very slow. Too large = ball overshoots the minimum and oscillates. Try 0.45 on the Bumpy surface to see it bounce between local minima!',
    highlight: '"Learning Rate" slider — watch step size change in real time',
  },
  {
    title: 'Take one manual step',
    body: 'Click "Step →" once. The ball moves one gradient update: w ← w − η · ∇L(w). Watch the stats bar update: w (weight), Loss (current loss value), and ∇ (gradient magnitude).',
    highlight: '"Step →" button + stats bar showing w, Loss, ∇',
  },
  {
    title: 'Watch the loss history chart',
    body: 'The mini chart below the main plot tracks loss over every step. A smooth downward curve = healthy descent. A spiky / rising curve = learning rate is too high and the optimizer is diverging.',
    highlight: '"Loss over steps" mini-chart at the bottom',
  },
  {
    title: 'Run to convergence',
    body: 'Click "▶ Run" to automate all steps at 120ms per step. Stops automatically when |∇L| < 0.001 (converged) or after 200 steps. "✓ Converged!" appears in green in the stats bar.',
    highlight: '"▶ Run" button — switches to ⏸ Pause while running',
  },
];

const W = 560;
const H = 320;
const PAD = { l: 50, r: 20, t: 20, b: 40 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

/* ── loss functions ────────────────────────────────────────── */
const FUNCTIONS = {
  bowl: {
    label: 'Simple Bowl (convex)',
    f:  w => 0.5 * w * w,
    df: w => w,
    min: -3, max: 3, optima: [0],
    desc: 'A perfectly convex loss. Gradient descent always finds the global minimum.',
  },
  bumpy: {
    label: 'Bumpy (non-convex)',
    f:  w => Math.sin(2 * w) + 0.3 * w * w,
    df: w => 2 * Math.cos(2 * w) + 0.6 * w,
    min: -3, max: 3, optima: [-1.05, 1.05],
    desc: 'Non-convex surface with local minima. Learning rate determines which minimum you find.',
  },
  ravine: {
    label: 'Saddle / Ravine',
    f:  w => w * w * w - 2 * w,
    df: w => 3 * w * w - 2,
    min: -2, max: 2, optima: [0.816],
    desc: 'Local min at w≈0.82, local max at w≈-0.82. High LR can oscillate past the minimum; low LR converges smoothly. Note that w=0 is NOT a stationary point here (gradient = -2 at w=0).',
  },
};

/* ── coordinate mappers ────────────────────────────────────── */
const mapX = (w, fn) => PAD.l + ((w - fn.min) / (fn.max - fn.min)) * PLOT_W;
const lossBounds = fn => {
  const samples = 200;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const w = fn.min + (i / samples) * (fn.max - fn.min);
    const v = fn.f(w);
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return { lo: lo - 0.1, hi: hi + 0.3 };
};
const mapY = (loss, lo, hi) =>
  PAD.t + ((hi - loss) / (hi - lo)) * PLOT_H;

/* ── build SVG path for loss curve ─────────────────────────── */
const buildPath = (fn, lo, hi) => {
  const pts = [];
  for (let i = 0; i <= 300; i++) {
    const w = fn.min + (i / 300) * (fn.max - fn.min);
    const x = mapX(w, fn);
    const y = mapY(fn.f(w), lo, hi);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
};

export default function GradientDescentVisualizer() {
  const [fnKey, setFnKey]         = useState('bowl');
  const [lr, setLr]               = useState(0.1);
  const lrRef                     = useRef(0.1); // always reflects current lr even mid-interval
  const [w, setW]                 = useState(2.5);
  const [history, setHistory]     = useState([]);
  const [running, setRunning]     = useState(false);
  const [steps, setSteps]         = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const intervalRef               = useRef(null);
  const stateRef                  = useRef({ w: 2.5, history: [], steps: 0 });

  const fn = FUNCTIONS[fnKey];
  const { lo, hi } = lossBounds(fn);
  const curvePath = buildPath(fn, lo, hi);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const initW = fn.max * 0.85;
    setW(initW);
    setHistory([{ w: initW, loss: fn.f(initW) }]);
    setSteps(0);
    stateRef.current = { w: initW, history: [{ w: initW, loss: fn.f(initW) }], steps: 0 };
    lrRef.current = lr;
  }, [fn, lr]);

  useEffect(() => { reset(); }, [reset]);

  const doStep = useCallback(() => {
    let { w: cw, history: ch, steps: cs } = stateRef.current;
    const currentLr = lrRef.current; // read live lr — safe inside setInterval
    const grad = fn.df(cw);
    let nw = cw - currentLr * grad;
    nw = Math.max(fn.min, Math.min(fn.max, nw));
    const newH = [...ch, { w: nw, loss: fn.f(nw) }].slice(-80);
    cs += 1;
    stateRef.current = { w: nw, history: newH, steps: cs };
    setW(nw);
    setHistory(newH);
    setSteps(cs);
    // stop if gradient tiny
    if (Math.abs(grad) < 0.001 || cs >= 200) {
      clearInterval(intervalRef.current);
      setRunning(false);
    }
  }, [fn]);

  const handleRunPause = () => {
    if (running) { clearInterval(intervalRef.current); setRunning(false); }
    else { setRunning(true); intervalRef.current = setInterval(doStep, 120); }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const loss     = fn.f(w);
  const grad     = fn.df(w);
  const ballX    = mapX(w, fn);
  const ballY    = mapY(loss, lo, hi);
  const tangentLen = 40;
  const tang     = Math.atan(grad * (PLOT_W / (fn.max - fn.min)) / PLOT_H);
  const tx1      = ballX - tangentLen * Math.cos(tang);
  const ty1      = ballY + tangentLen * Math.sin(tang);
  const tx2      = ballX + tangentLen * Math.cos(tang);
  const ty2      = ballY - tangentLen * Math.sin(tang);

  // loss history mini chart
  const LH = 80;
  const histMax = history.length > 1 ? Math.max(...history.map(h => h.loss)) : 1;
  const histMin = history.length > 1 ? Math.min(...history.map(h => h.loss)) : 0;
  const histRange = Math.max(histMax - histMin, 0.01);
  const histPath = history.map((h, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * (W - PAD.l - PAD.r) + PAD.l;
    const y = PAD.t + ((histMax - h.loss) / histRange) * (LH - PAD.t - 10);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="relative p-4 space-y-4">
      {/* controls */
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Loss Function</label>
          <select value={fnKey} onChange={e => { if (!running) setFnKey(e.target.value); }}
            className="bg-dark-lightest text-white text-sm rounded-lg px-3 py-1.5 border border-dark-lightest focus:border-primary outline-none">
            {Object.entries(FUNCTIONS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Learning Rate: <span className="text-primary font-bold">{lr}</span>
          </label>
          <input type="range" min={0.01} max={0.5} step={0.01} value={lr}
            onChange={e => { const v = +e.target.value; setLr(v); lrRef.current = v; }}
            className="w-36 accent-primary" />
        </div>
        <button onClick={reset} disabled={running}
          className="py-1.5 px-4 rounded-lg bg-dark-lightest text-gray-200 text-sm border border-dark-lightest hover:border-primary/40 transition-colors disabled:opacity-40">
          ↺ Reset
        </button>
        <button onClick={!running ? doStep : undefined} disabled={running}
          className="py-1.5 px-4 rounded-lg bg-dark-lightest text-gray-200 text-sm border border-dark-lightest hover:border-primary/40 transition-colors disabled:opacity-40">
          Step →
        </button>
        <button onClick={handleRunPause}
          className={`py-1.5 px-5 rounded-lg text-sm font-semibold transition-colors ${
            running ? 'bg-red-600/80 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary-dark text-white'
          }`}>
          {running ? '⏸ Pause' : '▶ Run'}
        </button>
        <button
          onClick={() => setShowTutorial(true)}
          title="How to use this visualizer"
          className="w-8 h-8 rounded-full bg-dark-lightest border border-primary/40 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center"
        >?</button>
      </div>

      {/* stats */}
      <div className="flex flex-wrap gap-6 text-sm">
        <span className="text-gray-400">Step: <span className="text-white font-bold">{steps}</span></span>
        <span className="text-gray-400">w = <span className="text-primary font-bold">{w.toFixed(4)}</span></span>
        <span className="text-gray-400">Loss = <span className="text-accent font-bold">{loss.toFixed(4)}</span></span>
        <span className="text-gray-400">∇ = <span className={`font-bold ${Math.abs(grad) < 0.01 ? 'text-green-400' : 'text-secondary'}`}>{grad.toFixed(4)}</span></span>
        {Math.abs(grad) < 0.001 && <span className="text-green-400 font-bold">✓ Converged!</span>}
      </div>

      {/* main chart */}
      <div className="rounded-xl overflow-hidden border border-dark-lightest bg-dark" style={{ lineHeight: 0 }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          <defs>
            <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.02" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + PLOT_H} stroke="#334155" strokeWidth={1} />
          <line x1={PAD.l} y1={PAD.t + PLOT_H} x2={PAD.l + PLOT_W} y2={PAD.t + PLOT_H} stroke="#334155" strokeWidth={1} />
          <text x={PAD.l + PLOT_W / 2} y={H - 5} textAnchor="middle" fontSize={10} fill="#64748b">w (weight)</text>
          <text x={12} y={PAD.t + PLOT_H / 2} textAnchor="middle" fontSize={10} fill="#64748b" transform={`rotate(-90, 12, ${PAD.t + PLOT_H / 2})`}>Loss</text>

          {/* filled area under curve */}
          <path d={`${curvePath} L${PAD.l + PLOT_W},${PAD.t + PLOT_H} L${PAD.l},${PAD.t + PLOT_H} Z`}
            fill="url(#lossGrad)" />

          {/* loss curve */}
          <path d={curvePath} fill="none" stroke="#0EA5E9" strokeWidth={2.5} />

          {/* history trail */}
          {history.slice(-30).map((h, i, arr) => {
            if (i === 0) return null;
            const prev = arr[i - 1];
            return (
              <line key={i}
                x1={mapX(prev.w, fn)} y1={mapY(prev.loss, lo, hi)}
                x2={mapX(h.w, fn)} y2={mapY(h.loss, lo, hi)}
                stroke="#F97316" strokeWidth={1.5} strokeOpacity={0.4 + 0.6 * (i / arr.length)} />
            );
          })}

          {/* tangent line (gradient) */}
          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2}
            stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4,3" />

          {/* ball */}
          <circle cx={ballX} cy={ballY} r={8} fill="#F97316" filter="url(#glow)" />
          <circle cx={ballX} cy={ballY} r={4} fill="white" />

          {/* step annotation */}
          <text x={ballX + 12} y={ballY - 10} fontSize={10} fill="#F97316">
            w={w.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* loss history mini chart */}
      {history.length > 2 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Loss over steps</p>
          <div className="rounded-xl border border-dark-lightest bg-dark overflow-hidden" style={{ lineHeight: 0 }}>
            <svg width="100%" viewBox={`0 0 ${W} ${LH}`} style={{ display: 'block' }}>
              <path d={histPath} fill="none" stroke="#F97316" strokeWidth={2} />
              <text x={PAD.l} y={LH - 4} fontSize={9} fill="#64748b">0</text>
              <text x={W - PAD.r} y={LH - 4} fontSize={9} fill="#64748b" textAnchor="end">step {steps}</text>
            </svg>
          </div>
        </div>
      )}

      {/* explainer */}
      <div className="bg-dark-lightest/50 rounded-xl p-4 border border-dark-lightest text-sm text-gray-400 leading-relaxed">
        <span className="text-white font-semibold">Gradient Descent: </span>
        At each step: <span className="text-secondary">w ← w − η · ∇L(w)</span>.
        The <span className="text-primary">blue curve</span> is the loss surface.
        The <span className="text-orange-400">orange ball</span> is the current weight position.
        The <span className="text-purple-400">purple line</span> shows the gradient (tangent slope).
        <br /><span className="text-white">{fn.desc}</span>
      </div>

      {showTutorial && (
        <TutorialOverlay
          steps={GRADIENT_TUTORIAL}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}
