import React, { useState, useEffect, useRef, useCallback } from 'react';

const WIDTH = 560;
const HEIGHT = 400;
const K_COLORS = ['#0EA5E9', '#8B5CF6', '#F97316', '#22C55E', '#F43F5E'];

const rand = (min, max) => Math.random() * (max - min) + min;
const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const generatePoints = (count, k) => {
  const seeds = Array.from({ length: k }, () => ({
    x: rand(80, WIDTH - 80),
    y: rand(80, HEIGHT - 80),
  }));
  return Array.from({ length: count }, () => {
    const seed = seeds[Math.floor(Math.random() * k)];
    return {
      x: seed.x + rand(-70, 70),
      y: seed.y + rand(-70, 70),
      cluster: -1,
    };
  });
};

const initCentroids = (points, k) => {
  const shuffled = [...points].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, k).map((p, i) => ({ x: p.x, y: p.y, id: i }));
};

const assignClusters = (points, centroids) =>
  points.map(p => ({
    ...p,
    cluster: centroids.reduce(
      (best, c, i) => (dist(p, c) < dist(p, centroids[best]) ? i : best),
      0
    ),
  }));

const moveCentroids = (points, centroids) =>
  centroids.map((c, i) => {
    const members = points.filter(p => p.cluster === i);
    if (members.length === 0) return c;
    return {
      ...c,
      x: members.reduce((s, p) => s + p.x, 0) / members.length,
      y: members.reduce((s, p) => s + p.y, 0) / members.length,
    };
  });

const converged = (a, b) => a.every((c, i) => dist(c, b[i]) < 0.5);

export default function KMeansVisualizer() {
  const [k, setK] = useState(3);
  const [numPoints, setNumPoints] = useState(120);
  const [points, setPoints] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [iteration, setIteration] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState('assign'); // 'assign' | 'move'
  const intervalRef = useRef(null);
  const stateRef = useRef({});

  const init = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setIteration(0);
    setPhase('assign');
    const pts = generatePoints(numPoints, k);
    const cents = initCentroids(pts, k);
    setPoints(pts);
    setCentroids(cents);
    stateRef.current = { pts, cents, iter: 0, phase: 'assign' };
  }, [k, numPoints]);

  useEffect(() => { init(); }, [init]);

  // Half-step: each call either assigns points OR moves centroids (not both)
  // This lets the visualizer clearly show each phase of the algorithm.
  const step = useCallback(() => {
    let { pts, cents, iter, phase: curPhase } = stateRef.current;
    if (curPhase === 'assign') {
      // Phase 1: assign every point to its nearest centroid
      pts = assignClusters(pts, cents);
      stateRef.current = { pts, cents, iter, phase: 'move' };
      setPoints([...pts]);
      setPhase('move');
    } else {
      // Phase 2: move each centroid to the mean of its members
      const newCents = moveCentroids(pts, cents);
      const isDone = converged(cents, newCents);
      cents = newCents;
      iter += 1;
      stateRef.current = { pts, cents, iter, phase: 'assign' };
      setCentroids([...cents]);
      setIteration(iter);
      setPhase('assign');
      if (isDone || iter >= 30) {
        setDone(true);
        setRunning(false);
        clearInterval(intervalRef.current);
      }
    }
  }, []);

  const handleRunPause = () => {
    if (done) { init(); return; }
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(step, 600);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // inertia (WCSS)
  const inertia = points.length
    ? Math.round(
        points.reduce((s, p) => {
          const c = centroids[p.cluster >= 0 ? p.cluster : 0];
          return c ? s + dist(p, c) ** 2 : s;
        }, 0)
      )
    : 0;

  return (
    <div className="p-4 space-y-4">
      {/* controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Clusters (K)</label>
          <div className="flex gap-1">
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => { if (!running) setK(n); }}
                className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                  k === n ? 'bg-primary text-white' : 'bg-dark-lightest text-gray-300 hover:bg-dark'
                }`}
              >{n}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Data Points: {numPoints}</label>
          <input type="range" min={40} max={200} step={10} value={numPoints}
            onChange={e => { if (!running) setNumPoints(+e.target.value); }}
            className="w-32 accent-primary" />
        </div>
        <button onClick={init} disabled={running}
          className="py-1.5 px-4 rounded-lg bg-dark-lightest hover:bg-dark text-gray-200 text-sm border border-dark-lightest hover:border-primary/40 transition-colors disabled:opacity-40">
          ↺ Reset
        </button>
        <button onClick={!running ? step : undefined}
          disabled={running || done}
          className="py-1.5 px-4 rounded-lg bg-dark-lightest hover:bg-dark text-gray-200 text-sm border border-dark-lightest hover:border-primary/40 transition-colors disabled:opacity-40">
          Step →
        </button>
        <button onClick={handleRunPause}
          className={`py-1.5 px-5 rounded-lg text-sm font-semibold transition-colors ${
            done ? 'bg-green-600 hover:bg-green-700 text-white'
              : running ? 'bg-red-600/80 hover:bg-red-700 text-white'
              : 'bg-primary hover:bg-primary-dark text-white'
          }`}>
          {done ? '✓ Done — Reset' : running ? '⏸ Pause' : '▶ Run'}
        </button>
      </div>

      {/* stats bar */}
      <div className="flex gap-6 text-sm">
        <span className="text-gray-400">Iteration: <span className="text-white font-bold">{iteration}</span></span>
        <span className="text-gray-400">Phase: <span className={phase === 'assign' ? 'text-primary font-bold' : 'text-secondary font-bold'}>
          {phase === 'assign' ? 'Assigning points' : 'Moving centroids'}
        </span></span>
        <span className="text-gray-400">WCSS: <span className="text-accent font-bold">{inertia.toLocaleString()}</span></span>
        {done && <span className="text-green-400 font-bold">✓ Converged!</span>}
      </div>

      {/* canvas */}
      <div className="rounded-xl overflow-hidden border border-dark-lightest bg-dark" style={{ lineHeight: 0 }}>
        <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ display: 'block' }}>
          {/* voronoi-ish background cells — simple distance fill */}
          {centroids.map((c, ci) => null /* skip — too expensive without a lib */)}

          {/* points */}
          {points.map((p, i) => {
            const col = p.cluster >= 0 ? K_COLORS[p.cluster % K_COLORS.length] : '#475569';
            return (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill={col} fillOpacity={0.75}
                style={{ transition: 'cx 0.5s, cy 0.5s, fill 0.3s' }} />
            );
          })}

          {/* centroid lines to members (only when small k for readability) */}

          {/* centroids */}
          {centroids.map((c, ci) => (
            <g key={ci} style={{ transition: 'transform 0.5s' }}>
              <circle cx={c.x} cy={c.y} r={14} fill={K_COLORS[ci % K_COLORS.length]} fillOpacity={0.2}
                stroke={K_COLORS[ci % K_COLORS.length]} strokeWidth={2} />
              <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize={11}
                fill={K_COLORS[ci % K_COLORS.length]} fontWeight="bold">C{ci + 1}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-3">
        {centroids.map((_, ci) => {
          const count = points.filter(p => p.cluster === ci).length;
          return (
            <div key={ci} className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: K_COLORS[ci] }} />
              Cluster {ci + 1}: <span className="text-white font-semibold">{count} pts</span>
            </div>
          );
        })}
      </div>

      {/* explanation */}
      <div className="bg-dark-lightest/50 rounded-xl p-4 border border-dark-lightest text-sm text-gray-400 leading-relaxed">
        <span className="text-white font-semibold">How K-Means works: </span>
        Place <span className="text-primary">K centroids</span> randomly →
        assign each point to its nearest centroid →
        move each centroid to the <span className="text-secondary">mean</span> of its members →
        repeat until centroids stop moving.
        The algorithm minimises <span className="text-accent">Within-Cluster Sum of Squares (WCSS)</span>.
      </div>
    </div>
  );
}
