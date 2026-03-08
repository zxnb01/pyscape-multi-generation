import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Per-tab academic theory content ───────────────────────── */
const THEORY = {
  kmeans: {
    title: 'K-Means Clustering',
    badge: 'Unsupervised Learning',
    badgeColor: 'text-primary bg-primary/10 border-primary/20',
    what: 'An iterative partition-based algorithm that divides n data points into K non-overlapping clusters by minimising Within-Cluster Sum of Squares (WCSS).',
    steps: [
      'Initialise K centroids randomly (or via K-Means++)',
      'E-step: assign each point to its nearest centroid',
      'M-step: move each centroid to the mean of its cluster',
      'Repeat E → M until centroids converge (Δ < ε)',
    ],
    complexity: {
      time:  'O(n · K · I · d)',
      space: 'O(n + K)',
    },
    whenToUse: [
      'Customer segmentation',
      'Image colour quantisation',
      'Document topic grouping',
      'Pre-processing for anomaly detection',
    ],
    props: [
      { k: 'Convergence',      v: 'Guaranteed — to a local optimum' },
      { k: 'Init sensitivity', v: 'High — randomness affects result' },
      { k: 'K selection',      v: 'Use Elbow Method or Silhouette score' },
      { k: 'Objective',        v: 'Minimise WCSS = Σₖ Σ ‖xᵢ − μₖ‖²' },
    ],
  },

  gradient: {
    title: 'Gradient Descent',
    badge: 'Optimisation',
    badgeColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    what: 'A first-order iterative algorithm that follows the negative gradient of a differentiable loss function to approach a local (or global) minimum step by step.',
    steps: [
      'Start at an initial weight w₀',
      'Compute gradient ∇L(w) at the current position',
      'Update rule: w ← w − η · ∇L(w)',
      'Repeat until |∇L| < ε or step budget is exhausted',
    ],
    complexity: {
      time:  'O(I · n · d) per epoch',
      space: 'O(d)',
    },
    whenToUse: [
      'Training any ML / deep learning model',
      'Linear & logistic regression',
      'Neural network backpropagation',
      'Any differentiable loss minimisation',
    ],
    props: [
      { k: 'Learning rate η', v: 'Most critical hyperparameter' },
      { k: 'Convex surface',  v: 'Always converges to the global minimum' },
      { k: 'Non-convex',      v: 'May settle in a local minimum or saddle' },
      { k: 'Variants',        v: 'SGD · Mini-batch · Adam · RMSProp' },
    ],
  },

  neural: {
    title: 'Neural Network — Forward Pass',
    badge: 'Deep Learning',
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    what: 'A layered graph of artificial neurons that learns hierarchical representations. Each neuron computes a weighted sum of its inputs plus a bias, then applies a non-linear activation function.',
    steps: [
      'Input layer: raw features x₁ … xₙ are fed in',
      'Each neuron: z = Σ(wᵢ · xᵢ) + b',
      'Apply activation: a = f(z)   (ReLU, Sigmoid, Tanh…)',
      'Signal propagates forward layer by layer',
      'Output layer: final predictions or class scores',
    ],
    complexity: {
      time:  'O(L · N² · samples)',
      space: 'O(L · N² + N · samples)',
    },
    whenToUse: [
      'Image & speech recognition',
      'Natural language processing',
      'Complex regression & classification',
      'Feature learning on raw / unstructured data',
    ],
    props: [
      { k: 'Universal approx.', v: 'Can fit any continuous function' },
      { k: 'ReLU',    v: 'max(0, z) — sparse, fast, preferred' },
      { k: 'Sigmoid', v: '1/(1+e⁻ᶻ) → [0, 1], binary output' },
      { k: 'Depth',   v: 'More layers = more abstract features' },
    ],
  },

  sorting: {
    title: 'Comparison-Based Sorting',
    badge: 'CS Algorithms',
    badgeColor: 'text-gray-300 bg-dark-lightest border-dark-lightest',
    what: 'Algorithms that sort elements by comparing pairs. The information-theoretic lower bound proves any comparison-based sort requires Ω(n log n) comparisons in the worst case.',
    steps: [
      'Bubble: repeatedly swap adjacent out-of-order pairs',
      'Merge: recursively split → sort halves → merge them back',
      'Quick: pick a pivot → partition around it → recurse on each side',
    ],
    complexity: {
      time:  'Bubble O(n²)  ·  Merge O(n log n)  ·  Quick O(n log n) avg',
      space: 'Bubble O(1)  ·  Merge O(n)  ·  Quick O(log n)',
    },
    whenToUse: [
      'Merge: stability required, linked lists, external sort',
      'Quick: in-memory speed, cache-friendly access',
      'Bubble: educational only — never in production',
    ],
    props: [
      { k: 'Stability',   v: 'Bubble ✓  Merge ✓  Quick ✗' },
      { k: 'In-place',    v: 'Bubble ✓  Merge ✗  Quick ✓' },
      { k: 'Worst case',  v: 'Quick degrades to O(n²) — use random pivot' },
      { k: 'Lower bound', v: 'Any comparison sort is Ω(n log n)' },
    ],
  },

  pathfinding: {
    title: 'Graph Pathfinding',
    badge: 'Graph Algorithms',
    badgeColor: 'text-gray-300 bg-dark-lightest border-dark-lightest',
    what: 'Algorithms that find the shortest or lowest-cost path between two nodes in a graph — fundamental to navigation, networking, and game AI.',
    steps: [
      'BFS: explore nodes level-by-level using a queue',
      "Dijkstra's: always expand the cheapest-cost frontier node",
      "A*: Dijkstra's + admissible heuristic h(n) to guide search",
      'All use a visited set; backtrack from goal to reconstruct path',
    ],
    complexity: {
      time:  "Dijkstra O((V + E) log V)  ·  A* O(b^d)",
      space: 'O(V)',
    },
    whenToUse: [
      'GPS navigation & route planning',
      'Game character AI (NPC movement)',
      'Network packet routing',
      'Puzzle solving (mazes, 15-puzzle)',
    ],
    props: [
      { k: "Dijkstra's", v: 'Optimal for non-negative weighted graphs' },
      { k: 'A*',         v: 'Optimal + faster with admissible heuristic' },
      { k: 'BFS',        v: 'Optimal for unweighted (uniform-cost) graphs' },
      { k: 'Admissible', v: 'h(n) must never overestimate true distance' },
    ],
  },

  dataStructure: {
    title: 'Core Data Structures',
    badge: 'CS Fundamentals',
    badgeColor: 'text-gray-300 bg-dark-lightest border-dark-lightest',
    what: 'Data structures define how data is organised and accessed in memory. The right choice can reduce time complexity from O(n) to O(log n) or even O(1).',
    steps: [
      'Stack: LIFO — push / pop from one end only',
      'Queue: FIFO — enqueue at back, dequeue at front',
      'Binary Tree: each node has ≤ 2 children; BST enables O(log n) search',
      'Graph: nodes + edges — the most general structure',
    ],
    complexity: {
      time:  'Stack / Queue O(1) ops  ·  BST O(log n) avg',
      space: 'O(n) for n elements',
    },
    whenToUse: [
      'Stack: recursion, expression parsing, undo / redo',
      'Queue: BFS, scheduling, event buffering',
      'BST / Heap: sorted data, priority queues',
      'Graph: social networks, dependency resolution',
    ],
    props: [
      { k: 'Stack',  v: 'LIFO  ·  O(1) push / pop' },
      { k: 'Queue',  v: 'FIFO  ·  O(1) enqueue / dequeue' },
      { k: 'BST',    v: 'O(log n) search / insert / delete (balanced)' },
      { k: 'Heap',   v: 'O(log n) insert  ·  O(1) peek-min / max' },
    ],
  },
};

/* ── Section heading ────────────────────────────────────────── */
function SectionHead({ icon, label }) {
  return (
    <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
      <span>{icon}</span>{label}
    </h4>
  );
}

/* ── TheoryCard ─────────────────────────────────────────────── */
export default function TheoryCard({ activeTab }) {
  const data = THEORY[activeTab];
  if (!data) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.22 }}
        className="card p-5 space-y-5 sticky top-4 max-h-[88vh] overflow-y-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* ── header ───────────────────────────────────────── */}
        <div>
          <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${data.badgeColor}`}>
            {data.badge}
          </span>
          <h2 className="text-white font-bold text-sm mt-2 leading-snug">{data.title}</h2>
        </div>

        {/* ── what is it ───────────────────────────────────── */}
        <section>
          <SectionHead icon="📖" label="What is it?" />
          <p className="text-gray-300 text-xs leading-relaxed">{data.what}</p>
        </section>

        {/* ── how it works ─────────────────────────────────── */}
        <section>
          <SectionHead icon="⚙️" label="How it works" />
          <ol className="space-y-1.5">
            {data.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-300 leading-snug">
                <span className="text-primary font-bold shrink-0 w-4">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── complexity ───────────────────────────────────── */}
        <section>
          <SectionHead icon="⏱" label="Complexity" />
          <div className="bg-dark-lightest/60 rounded-lg p-3 space-y-1.5 border border-dark-lightest">
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-gray-400 shrink-0">Time</span>
              <span className="text-primary font-mono text-right">{data.complexity.time}</span>
            </div>
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-gray-400 shrink-0">Space</span>
              <span className="text-secondary font-mono text-right">{data.complexity.space}</span>
            </div>
          </div>
        </section>

        {/* ── when to use ──────────────────────────────────── */}
        <section>
          <SectionHead icon="🎯" label="When to use" />
          <ul className="space-y-1">
            {data.whenToUse.map((u, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-300 leading-snug">
                <span className="text-green-400 shrink-0 mt-px">◆</span>
                {u}
              </li>
            ))}
          </ul>
        </section>

        {/* ── key properties ───────────────────────────────── */}
        <section>
          <SectionHead icon="🔑" label="Key properties" />
          <div className="space-y-1.5">
            {data.props.map((p, i) => (
              <div key={i} className="bg-dark-lightest/40 rounded-lg px-3 py-2 border border-dark-lightest">
                <span className="text-[10px] text-gray-500 block">{p.k}</span>
                <span className="text-xs text-white leading-snug">{p.v}</span>
              </div>
            ))}
          </div>
        </section>

      </motion.div>
    </AnimatePresence>
  );
}
