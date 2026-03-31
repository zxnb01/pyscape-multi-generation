// QueueProgressPanel.js - Reusable component for monitoring generation queue progress

import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export function QueueProgressPanel({ moduleId, isGenerating = false }) {
  const [queueEntries, setQueueEntries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    totalCost: 0,
    totalTokens: 0
  });
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'pending', 'completed', 'failed'

  // Polling interval for real-time updates
  useEffect(() => {
    if (!isGenerating && !moduleId) return;

    const loadQueueData = async () => {
      try {
        const { data, error } = await supabase
          .from('generation_queue')
          .select('*, skills(name), lessons(title)')
          .eq('module_id', moduleId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setQueueEntries(data || []);

        // Calculate stats
        const stats = {
          total: data?.length || 0,
          completed: data?.filter(e => e.status === 'completed').length || 0,
          failed: data?.filter(e => e.status === 'failed').length || 0,
          pending: data?.filter(e => e.status === 'pending').length || 0,
          totalCost: data?.reduce((sum, e) => sum + (e.cost_usd || 0), 0) || 0,
          totalTokens: data?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0
        };

        setStats(stats);
      } catch (error) {
        console.error('Failed to load queue data:', error);
      }
    };

    loadQueueData();

    // Poll every 2 seconds if generating
    const interval = isGenerating ? setInterval(loadQueueData, 2000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [moduleId, isGenerating]);

  // Filter entries based on selected status
  const filteredEntries = selectedStatus === 'all'
    ? queueEntries
    : queueEntries.filter(e => e.status === selectedStatus);

  // Progress percentages
  const completedPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Level distribution
  const levelStats = {};
  for (let i = 1; i <= 5; i++) {
    levelStats[i] = {
      total: queueEntries.filter(e => e.level === i).length,
      completed: queueEntries.filter(e => e.level === i && e.status === 'completed').length
    };
  }

  return (
    <div className="space-y-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Generation Queue</h3>
          <p className="text-slate-400 text-sm">Module {moduleId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isGenerating ? 'bg-blue-900 text-blue-100' : 'bg-slate-700 text-slate-300'
        }`}>
          {isGenerating ? '🔄 Generating...' : '⏸️ Paused'}
        </div>
      </div>

      {/* Main Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">Overall Progress</span>
          <span className="text-sm text-slate-300">
            {stats.completed}/{stats.total} ({completedPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${completedPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
          <p className="text-slate-400 text-xs uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-900/30 rounded p-3 border border-green-700/50">
          <p className="text-green-300 text-xs uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-red-900/30 rounded p-3 border border-red-700/50">
          <p className="text-red-300 text-xs uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
        </div>
        <div className="bg-yellow-900/30 rounded p-3 border border-yellow-700/50">
          <p className="text-yellow-300 text-xs uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
      </div>

      {/* Cost & Token Stats */}
      <div className="grid grid-cols-2 gap-3 bg-slate-700/30 rounded p-3 border border-slate-600">
        <div>
          <p className="text-slate-400 text-xs uppercase">Total Tokens</p>
          <p className="text-xl font-bold text-cyan-400">{stats.totalTokens.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase">Total Cost</p>
          <p className="text-xl font-bold text-amber-400">${stats.totalCost.toFixed(4)}</p>
        </div>
      </div>

      {/* Level-wise Breakdown */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">Level Distribution</p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(levelNum => {
            const levelData = levelStats[levelNum];
            const levelPercent = levelData.total > 0
              ? Math.round((levelData.completed / levelData.total) * 100)
              : 0;

            const LEVEL_NAMES = ['Intro', 'Practical', 'Advanced', 'Projects', 'Challenges'];

            return (
              <div key={levelNum} className="bg-slate-700/50 rounded p-2 border border-slate-600 text-center">
                <p className="text-xs font-semibold text-slate-300 mb-1">{LEVEL_NAMES[levelNum - 1]}</p>
                <p className="text-xs text-white font-bold mb-1">{levelData.completed}/{levelData.total}</p>
                <div className="w-full bg-slate-600 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${levelPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-600">
        {['all', 'pending', 'completed', 'failed'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedStatus === status
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && ` (${stats[status === 'all' ? 'total' : status]})`}
          </button>
        ))}
      </div>

      {/* Queue Entries List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No entries found</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <QueueEntryItem key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* Error Details Section */}
      {queueEntries.some(e => e.status === 'failed' && e.error_message) && (
        <details className="bg-red-900/20 border border-red-700/30 rounded p-3">
          <summary className="text-sm font-semibold text-red-300 cursor-pointer">
            ⚠️ Error Details ({queueEntries.filter(e => e.error_message).length})
          </summary>
          <div className="mt-3 space-y-2 text-xs text-red-200">
            {queueEntries
              .filter(e => e.error_message)
              .map(entry => (
                <div key={entry.id} className="pl-3 border-l border-red-700/50">
                  <p className="font-semibold">{entry.lessons?.title || entry.skills?.name || `Lesson ${entry.lesson_id || entry.id}`} - Level {entry.level}</p>
                  <p className="text-red-300/80">{entry.error_message}</p>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Individual queue entry item
 */
function QueueEntryItem({ entry }) {
  const LEVEL_NAMES = {
    1: '①  Intro',
    2: '② Practical',
    3: '③ Advanced',
    4: '④ Projects',
    5: '⑤ Challenges'
  };

  const STATUS_COLORS = {
    pending: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-300' },
    processing: { bg: 'bg-blue-900/30', border: 'border-blue-700/50', text: 'text-blue-300' },
    completed: { bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-300' },
    failed: { bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-300' },
    skipped: { bg: 'bg-slate-700/30', border: 'border-slate-600', text: 'text-slate-300' }
  };

  const statusColor = STATUS_COLORS[entry.status] || STATUS_COLORS.pending;
  const STATUS_ICONS = {
    pending: '⏳',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
    skipped: '⏭️'
  };

  return (
    <div className={`${statusColor.bg} border ${statusColor.border} rounded p-3 flex items-start justify-between`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{STATUS_ICONS[entry.status]}</span>
          <div>
            <p className="text-sm font-semibold text-white">{entry.lessons?.title || entry.skills?.name || `Lesson ${entry.lesson_id || entry.id}`}</p>
            <p className={`text-xs ${statusColor.text}`}>{LEVEL_NAMES[entry.level]}</p>
          </div>
        </div>
      </div>

      <div className="text-right">
        {entry.cost_usd > 0 && (
          <p className="text-xs text-amber-400 font-mono">${entry.cost_usd.toFixed(4)}</p>
        )}
        {entry.tokens_used > 0 && (
          <p className="text-xs text-cyan-400">{entry.tokens_used} tokens</p>
        )}
        {entry.error_message && (
          <p className="text-xs text-red-300 mt-1">{entry.error_message.substring(0, 40)}...</p>
        )}
      </div>
    </div>
  );
}

export default QueueProgressPanel;
