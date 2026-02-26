import React, { useState, useRef, useCallback } from 'react';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const DEFAULT = '#0EA5E9';
const COMPARE = '#F97316';
const SWAP    = '#8B5CF6';
const PIVOT   = '#F43F5E';
const SORTED  = '#22C55E';

const randomArray = (n) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 75) + 5);

export default function SortingVisualizer() {
  const [array,     setArray]     = useState(() => randomArray(40));
  const [colors,    setColors]    = useState(() => new Array(40).fill(DEFAULT));
  const [sorting,   setSorting]   = useState(false);
  const [completed, setCompleted] = useState(false);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [size,      setSize]      = useState(40);
  const [speed,     setSpeed]     = useState(50);
  const stopRef  = useRef(false);
  const speedRef = useRef(50);

  const delay = () => Math.max(4, 550 - speedRef.current * 5);

  /* ── generate new array ─────────────────────────────────── */
  const reset = useCallback(() => {
    stopRef.current = true;
    setSorting(false);
    setCompleted(false);
    const arr = randomArray(size);
    setArray(arr);
    setColors(new Array(size).fill(DEFAULT));
  }, [size]);

  /* ── shared visual helpers ──────────────────────────────── */
  const flash = async (arr, cols, i, j) => {
    cols[i] = COMPARE; cols[j] = COMPARE;
    setArray([...arr]); setColors([...cols]);
    await sleep(delay());
  };

  const swapBars = async (arr, cols, i, j) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    cols[i] = SWAP; cols[j] = SWAP;
    setArray([...arr]); setColors([...cols]);
    await sleep(delay());
  };

  const place = async (arr, cols, k, val) => {
    arr[k] = val;
    cols[k] = SWAP;
    setArray([...arr]); setColors([...cols]);
    await sleep(delay() * 0.6);
    cols[k] = DEFAULT;
  };

  const markRange = (cols, lo, hi, color) => {
    for (let x = lo; x <= hi; x++) cols[x] = color;
  };

  /* ── Bubble Sort ────────────────────────────────────────── */
  const runBubble = async () => {
    const arr  = [...array];
    const cols = new Array(arr.length).fill(DEFAULT);
    const n    = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopRef.current) return;
        await flash(arr, cols, j, j + 1);
        if (arr[j] > arr[j + 1]) {
          await swapBars(arr, cols, j, j + 1);
        }
        cols[j] = DEFAULT; cols[j + 1] = DEFAULT;
      }
      cols[n - 1 - i] = SORTED;
      setColors([...cols]);
    }
    cols[0] = SORTED;
    setColors([...cols]);
  };

  /* ── Merge Sort ─────────────────────────────────────────── */
  const runMerge = async () => {
    const arr  = [...array];
    const cols = new Array(arr.length).fill(DEFAULT);

    const merge = async (lo, mid, hi) => {
      const left  = arr.slice(lo, mid + 1);
      const right = arr.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;

      while (i < left.length && j < right.length) {
        if (stopRef.current) return;
        cols[k] = COMPARE;
        setArray([...arr]); setColors([...cols]);
        await sleep(delay());
        if (left[i] <= right[j]) {
          await place(arr, cols, k, left[i++]);
        } else {
          await place(arr, cols, k, right[j++]);
        }
        k++;
      }
      while (i < left.length) {
        if (stopRef.current) return;
        await place(arr, cols, k++, left[i++]);
      }
      while (j < right.length) {
        if (stopRef.current) return;
        await place(arr, cols, k++, right[j++]);
      }
      markRange(cols, lo, hi, SORTED);
      setArray([...arr]); setColors([...cols]);
    };

    const helper = async (lo, hi) => {
      if (lo >= hi || stopRef.current) return;
      const mid = Math.floor((lo + hi) / 2);
      await helper(lo, mid);
      await helper(mid + 1, hi);
      await merge(lo, mid, hi);
    };

    await helper(0, arr.length - 1);
  };

  /* ── Quick Sort ─────────────────────────────────────────── */
  const runQuick = async () => {
    const arr  = [...array];
    const cols = new Array(arr.length).fill(DEFAULT);

    const partition = async (lo, hi) => {
      const pivotVal = arr[hi];
      cols[hi] = PIVOT;
      setColors([...cols]);
      let i = lo - 1;

      for (let j = lo; j < hi; j++) {
        if (stopRef.current) return lo;
        cols[j] = COMPARE;
        setArray([...arr]); setColors([...cols]);
        await sleep(delay());
        if (arr[j] <= pivotVal) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            cols[i] = SWAP; cols[j] = SWAP;
            setArray([...arr]); setColors([...cols]);
            await sleep(delay());
            cols[i] = DEFAULT;
          }
        }
        cols[j] = DEFAULT;
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      cols[i + 1] = SORTED; cols[hi] = DEFAULT;
      setArray([...arr]); setColors([...cols]);
      return i + 1;
    };

    const helper = async (lo, hi) => {
      if (lo >= hi || stopRef.current) return;
      const pi = await partition(lo, hi);
      await helper(lo, pi - 1);
      await helper(pi + 1, hi);
    };

    await helper(0, arr.length - 1);
    if (!stopRef.current) {
      setColors(new Array(arr.length).fill(SORTED));
      setArray([...arr]);
    }
  };

  /* ── start ──────────────────────────────────────────────── */
  const sortArray = async () => {
    if (sorting || completed) return;
    stopRef.current = false;
    setSorting(true);

    if      (algorithm === 'bubble') await runBubble();
    else if (algorithm === 'merge')  await runMerge();
    else if (algorithm === 'quick')  await runQuick();

    if (!stopRef.current) {
      setSorting(false);
      setCompleted(true);
    }
  };

  /* ── info ───────────────────────────────────────────────── */
  const INFO = {
    bubble: {
      title: 'Bubble Sort',
      desc: 'Repeatedly compares adjacent elements (orange) and swaps them (purple) if out of order. The largest unsorted element bubbles to its correct position each pass.',
      time: 'O(n²)', space: 'O(1)', stable: 'Yes',
    },
    merge: {
      title: 'Merge Sort',
      desc: 'Recursively splits the array in half, then merges sorted halves back together. Orange = being compared, purple = being placed into the merged result.',
      time: 'O(n log n)', space: 'O(n)', stable: 'Yes',
    },
    quick: {
      title: 'Quick Sort',
      desc: 'Picks a pivot element (red), partitions everything smaller to its left and larger to its right (orange = compare, purple = swap), then recurses on each side.',
      time: 'O(n log n) avg', space: 'O(log n)', stable: 'No',
    },
  };
  const info = INFO[algorithm];

  return (
    <div className="p-4 space-y-4">
      {/* controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Algorithm</label>
          <select value={algorithm}
            onChange={e => { if (!sorting) setAlgorithm(e.target.value); }}
            disabled={sorting}
            className="bg-dark-lightest text-white text-sm rounded-lg px-3 py-1.5 border border-dark-lightest focus:border-primary outline-none">
            <option value="bubble">Bubble Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Size: {size}</label>
          <input type="range" min={10} max={80} value={size}
            onChange={e => { if (!sorting) setSize(+e.target.value); }}
            disabled={sorting}
            className="w-32 accent-primary" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Speed: {speed}</label>
          <input type="range" min={1} max={100} value={speed}
            onChange={e => { const v = +e.target.value; setSpeed(v); speedRef.current = v; }}
            className="w-32 accent-primary" />
        </div>
        <button onClick={reset} disabled={sorting}
          className="py-1.5 px-4 rounded-lg bg-dark-lightest text-gray-200 text-sm border border-dark-lightest hover:border-primary/40 transition-colors disabled:opacity-40">
          ↺ New Array
        </button>
        <button onClick={sortArray} disabled={sorting || completed}
          className={`py-1.5 px-5 rounded-lg text-sm font-semibold transition-colors ${
            completed ? 'bg-green-600 text-white cursor-default'
            : sorting  ? 'bg-accent text-white opacity-80 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark text-white'
          }`}>
          {completed ? '✓ Sorted!' : sorting ? 'Sorting…' : '▶ Sort'}
        </button>
      </div>

      {/* colour legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        {[
          [DEFAULT, 'Default'],
          [COMPARE, 'Comparing'],
          [SWAP,    'Swapping'],
          [PIVOT,   'Pivot (Quick)'],
          [SORTED,  'Sorted'],
        ].map(([col, lbl]) => (
          <span key={lbl} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
            {lbl}
          </span>
        ))}
      </div>

      {/* bar chart */}
      <div className="relative h-64 w-full bg-dark rounded-xl border border-dark-lightest overflow-hidden flex items-end px-1 gap-px">
        {array.map((value, idx) => (
          <div key={idx}
            style={{
              height: `${value}%`,
              backgroundColor: colors[idx],
              flex: '1 1 0%',
              minWidth: 0,
              borderRadius: '2px 2px 0 0',
              transition: 'background-color 0.08s ease',
            }}
          />
        ))}
      </div>

      {/* algorithm info */}
      <div className="bg-dark-lightest/50 rounded-xl p-4 border border-dark-lightest text-sm text-gray-400 leading-relaxed">
        <span className="text-white font-semibold">{info.title}: </span>
        {info.desc}
        <div className="flex gap-6 mt-2 text-xs">
          <span>Time: <span className="text-primary font-mono">{info.time}</span></span>
          <span>Space: <span className="text-secondary font-mono">{info.space}</span></span>
          <span>Stable: <span className={info.stable === 'Yes' ? 'text-green-400' : 'text-red-400'}>{info.stable}</span></span>
        </div>
      </div>
    </div>
  );
}

// keep named export alias for any legacy import
export { SortingVisualizer };
