import React, { useState, useEffect, useCallback } from 'react';
import TutorialOverlay from './TutorialOverlay';

const NEURAL_TUTORIAL = [
  {
    title: 'Choose a network architecture',
    body: 'Select a preset like "2-3-1" which means: 2 input neurons → 3 hidden neurons → 1 output neuron. Deeper / wider architectures can represent more complex functions but are harder to interpret.',
    highlight: 'Architecture buttons — e.g. 2-3-1, 3-4-4-2, 4-6-4-2',
  },
  {
    title: 'Pick an activation function',
    body: 'Activation functions introduce non-linearity. ReLU: max(0, z) — sparse and fast, most common in deep learning. Sigmoid: maps to [0,1]. Tanh: maps to [-1,1], zero-centred. Linear: no squashing (output/regression layers).',
    highlight: 'Activation buttons — colour-coded, applies to all neurons',
  },
  {
    title: 'Drag the input sliders',
    body: 'Adjust x₁, x₂ (etc.) from -1 to +1. The full forward pass recomputes instantly — watch activation values inside every neuron change in real time as you slide. This shows how input signals propagate.',
    highlight: 'Input sliders — each xᵢ maps directly to one input-layer neuron',
  },
  {
    title: 'Randomise the weights',
    body: 'Click "↺ New Weights" to reinitialise all edge weights and biases with fresh random values. This simulates a newly untrained network — activations will completely change. Try the forward pass before and after!',
    highlight: '"↺ New Weights" button',
  },
  {
    title: 'Animate the forward pass',
    body: 'Click "▶ Forward Pass" to watch the signal travel left-to-right, lighting up each layer in sequence. Each layer activates after the previous one — this is exactly what happens inside a real neural network at inference time.',
    highlight: '"▶ Forward Pass" button — watch layers pulse one by one',
  },
  {
    title: 'Read edges and output nodes',
    body: 'Blue edges = positive weights, red = negative. Thicker edge = larger weight magnitude. The rightmost output nodes show final computed values with a colour bar — brighter / warmer = higher activation.',
    highlight: 'Network edges (blue/red) + Output readout panel below the chart',
  },
];

/* ── activation functions ───────────────────────────────────── */
const ACT = {
  relu:    { fn: x => Math.max(0, x),               label: 'ReLU',    color: '#0EA5E9' },
  sigmoid: { fn: x => 1 / (1 + Math.exp(-x)),       label: 'Sigmoid', color: '#8B5CF6' },
  tanh:    { fn: x => Math.tanh(x),                 label: 'Tanh',    color: '#F97316' },
  linear:  { fn: x => x,                            label: 'Linear',  color: '#22C55E' },
};

const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ── build network geometry ─────────────────────────────────── */
const buildNet = (arch) => {
  const W = 560, H = 340;
  const padX = 48, padY = 28;
  const layerX = arch.map((_, li) =>
    padX + (li / (arch.length - 1)) * (W - padX * 2)
  );
  const nodes = arch.map((count, li) =>
    Array.from({ length: count }, (_, ni) => {
      const usable = H - padY * 2;
      const gap = count > 1 ? usable / (count - 1) : 0;
      return {
        li, ni,
        x: layerX[li],
        y: count === 1 ? H / 2 : padY + ni * gap,
        activation: 0,
      };
    })
  );
  // weights: random init
  const weights = arch.slice(1).map((toCount, li) =>
    Array.from({ length: toCount }, () =>
      Array.from({ length: arch[li] }, () => rand(-1, 1))
    )
  );
  const biases = arch.slice(1).map(count =>
    Array.from({ length: count }, () => rand(-0.3, 0.3))
  );
  return { nodes, weights, biases, W, H };
};

const forwardPass = (net, inputs, actFn) => {
  const newNodes = net.nodes.map(layer => layer.map(n => ({ ...n })));
  // set inputs
  inputs.forEach((v, i) => { if (newNodes[0][i]) newNodes[0][i].activation = v; });
  // propagate
  for (let li = 1; li < newNodes.length; li++) {
    newNodes[li].forEach((node, ni) => {
      const z = newNodes[li - 1].reduce((sum, prev, pi) =>
        sum + prev.activation * net.weights[li - 1][ni][pi], 0
      ) + net.biases[li - 1][ni];
      node.activation = actFn(clamp(z, -5, 5));
    });
  }
  return newNodes;
};

/* ── colour by activation ─────────────────────────────────────
   maps [-1..1] → red..blue, [0..1] → dark..bright */
const nodeColor = (v) => {
  const clamped = clamp(v, -1, 1);
  if (clamped >= 0) {
    const t = clamped;
    const r = Math.round(14  + t * (34  - 14));
    const g = Math.round(165 + t * (197 - 165));
    const b = Math.round(233 + t * (94  - 233));
    return `rgb(${r},${g},${b})`;
  }
  const t = -clamped;
  return `rgb(${Math.round(244 * t)},${Math.round(63 * t)},${Math.round(94 * t)})`;
};

const edgeOpacity = (w) => 0.08 + Math.abs(w) * 0.4;
const edgeColor   = (w) => w > 0 ? '#0EA5E9' : '#F43F5E';

const PRESETS = {
  '2-3-1': [2, 3, 1],
  '3-4-4-2': [3, 4, 4, 2],
  '2-4-4-3': [2, 4, 4, 3],
  '4-6-4-2': [4, 6, 4, 2],
};

export default function NeuralNetworkVisualizer() {
  const [archKey, setArchKey]     = useState('2-3-1');
  const [actKey, setActKey]       = useState('relu');
  const [net, setNet]             = useState(null);
  const [nodes, setNodes]         = useState(null);
  const [activeLayer, setActiveLayer] = useState(-1);
  const [animating, setAnimating] = useState(false);
  const [inputs, setInputs]       = useState([0.8, -0.5, 0.3, 0.6]);
  const [showTutorial, setShowTutorial] = useState(false);

  const arch = PRESETS[archKey];
  const actFn = ACT[actKey].fn;

  const init = useCallback(() => {
    const n = buildNet(arch);
    const inp = inputs.slice(0, arch[0]);
    const propagated = forwardPass(n, inp, actFn);
    setNet(n);
    setNodes(propagated);
    setActiveLayer(-1);
  }, [arch, actFn, inputs]);

  useEffect(() => { init(); }, [init]);

  const runAnimation = async () => {
    if (animating) return;
    setAnimating(true);
    setActiveLayer(0);
    for (let li = 0; li <= arch.length - 1; li++) {
      setActiveLayer(li);
      await new Promise(r => setTimeout(r, 600));
    }
    setActiveLayer(-1);
    setAnimating(false);
  };

  const handleInputChange = (i, v) => {
    const newIns = [...inputs];
    newIns[i] = v;
    setInputs(newIns);
    if (net) {
      const propagated = forwardPass(net, newIns.slice(0, arch[0]), actFn);
      setNodes(propagated);
    }
  };

  const randomiseWeights = () => {
    init();
  };

  if (!net || !nodes) return null;

  const { W, H, weights } = net;
  const LAYER_LABELS = ['Input', ...arch.slice(1, -1).map((_, i) => `Hidden ${i + 1}`), 'Output'];

  return (
    <div className="relative p-4 space-y-4">
      {/* controls */
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Architecture</label>
          <div className="flex gap-1 flex-wrap">
            {Object.keys(PRESETS).map(k => (
              <button key={k} onClick={() => { if (!animating) setArchKey(k); }}
                className={`py-1 px-3 rounded text-xs font-mono transition-colors ${
                  archKey === k ? 'bg-primary text-white' : 'bg-dark-lightest text-gray-300 hover:bg-dark'
                }`}>{k}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Activation</label>
          <div className="flex gap-1">
            {Object.entries(ACT).map(([k, v]) => (
              <button key={k} onClick={() => { if (!animating) setActKey(k); }}
                className={`py-1 px-3 rounded text-xs transition-colors ${
                  actKey === k ? 'text-white font-bold' : 'bg-dark-lightest text-gray-300 hover:bg-dark'
                }`}
                style={actKey === k ? { backgroundColor: v.color } : {}}
              >{v.label}</button>
            ))}
          </div>
        </div>
        <button onClick={randomiseWeights} disabled={animating}
          className="py-1.5 px-4 rounded-lg bg-dark-lightest text-gray-200 text-sm border border-dark-lightest hover:border-primary/40 transition-colors disabled:opacity-40">
          ↺ New Weights
        </button>
        <button onClick={runAnimation} disabled={animating}
          className="py-1.5 px-5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50">
          {animating ? '▶ Running…' : '▶ Forward Pass'}
        </button>
        <button
          onClick={() => setShowTutorial(true)}
          title="How to use this visualizer"
          className="w-8 h-8 rounded-full bg-dark-lightest border border-primary/40 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center"
        >?</button>
      </div>

      {/* input sliders */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: Math.min(arch[0], 4) }, (_, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-primary font-mono w-10">x{i + 1}={inputs[i]?.toFixed(1)}</span>
            <input type="range" min={-1} max={1} step={0.1} value={inputs[i] ?? 0}
              onChange={e => handleInputChange(i, +e.target.value)}
              className="w-24 accent-primary" />
          </div>
        ))}
      </div>

      {/* network SVG */}
      <div className="rounded-xl overflow-hidden border border-dark-lightest bg-dark" style={{ lineHeight: 0 }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          <defs>
            <filter id="nglow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* edges */}
          {nodes.slice(0, -1).map((layer, li) =>
            layer.map((from) =>
              nodes[li + 1].map((to, ti) => {
                const w = weights[li][ti][from.ni];
                const isActive = activeLayer > li;
                return (
                  <line key={`${li}-${from.ni}-${ti}`}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={edgeColor(w)}
                    strokeWidth={isActive ? Math.abs(w) * 2 + 0.5 : 0.6}
                    strokeOpacity={isActive ? edgeOpacity(w) + 0.2 : edgeOpacity(w)}
                    style={{ transition: 'stroke-width 0.3s, stroke-opacity 0.3s' }}
                  />
                );
              })
            )
          )}

          {/* nodes */}
          {nodes.map((layer, li) => {
            const isActive = activeLayer >= li;
            return layer.map((node) => {
              const col = isActive ? nodeColor(node.activation) : '#1E293B';
              const r = li === 0 ? 12 : li === nodes.length - 1 ? 14 : 11;
              return (
                <g key={`${li}-${node.ni}`}>
                  {isActive && (
                    <circle cx={node.x} cy={node.y} r={r + 6} fill={col} fillOpacity={0.15}
                      filter="url(#nglow)" />
                  )}
                  <circle cx={node.x} cy={node.y} r={r}
                    fill={col} stroke={isActive ? col : '#334155'} strokeWidth={1.5}
                    style={{ transition: 'fill 0.3s' }} />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={8.5}
                    fill={isActive ? '#fff' : '#64748b'} fontFamily="monospace">
                    {node.activation.toFixed(2)}
                  </text>
                </g>
              );
            });
          })}

          {/* layer labels */}
          {nodes.map((layer, li) => (
            <text key={li} x={layer[0].x} y={H - 6} textAnchor="middle" fontSize={9}
              fill={activeLayer === li ? ACT[actKey].color : '#475569'}
              style={{ transition: 'fill 0.3s' }}>
              {LAYER_LABELS[li]}
            </text>
          ))}

          {/* active layer pulse ring */}
          {activeLayer >= 0 && nodes[activeLayer] && (
            nodes[activeLayer].map((node) => (
              <circle key={`pulse-${node.ni}`} cx={node.x} cy={node.y} r={20}
                fill="none" stroke={ACT[actKey].color} strokeWidth={1.5} strokeOpacity={0.4}
                style={{ animation: 'none' }} />
            ))
          )}
        </svg>
      </div>

      {/* output readout */}
      <div className="flex flex-wrap gap-3">
        {nodes[nodes.length - 1].map((n, i) => (
          <div key={i} className="flex items-center gap-2 bg-dark-lightest rounded-xl px-4 py-2 border border-dark-lightest">
            <span className="text-xs text-gray-400">Output {i + 1}:</span>
            <span className="text-base font-bold" style={{ color: nodeColor(n.activation) }}>
              {n.activation.toFixed(4)}
            </span>
            <div className="w-16 h-2 bg-dark rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.abs(n.activation) * 100}%`,
                  backgroundColor: nodeColor(n.activation),
                }} />
            </div>
          </div>
        ))}
      </div>

      {/* explainer */}
      <div className="bg-dark-lightest/50 rounded-xl p-4 border border-dark-lightest text-sm text-gray-400 leading-relaxed">
        <span className="text-white font-semibold">Forward Pass: </span>
        At each node: <span className="text-secondary">z = Σ(wᵢ · xᵢ) + b</span>,
        then apply <span style={{ color: ACT[actKey].color }}>{ACT[actKey].label}</span> activation:
        <span className="text-primary"> a = {actKey}(z)</span>.
        <span className="text-white"> Brighter nodes = higher activations.</span> Edge thickness = weight magnitude.
        <span className="text-blue-400"> Blue edges</span> = positive weights,
        <span className="text-red-400"> red edges</span> = negative weights.
      </div>

      {showTutorial && (
        <TutorialOverlay
          steps={NEURAL_TUTORIAL}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}
