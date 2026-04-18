import React, { useEffect, useState } from 'react';
import useGamification from './useGamification';
import { useAuth } from '../context/AuthContext';

/**
 * Quick Debug Widget
 * Shows real-time gamification state
 * Add to Dashboard: <QuickDebugWidget />
 */
const QuickDebugWidget = () => {
  const { user } = useAuth();
  const {
    xp,
    currentStreak,
    longestStreak,
    badgeCount,
    earnedBadges,
    loading,
    error
  } = useGamification();

  const [renderCount, setRenderCount] = useState(0);

  // Track how many times this component renders (for detecting infinite loops)
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('🔄 QuickDebugWidget rendered', renderCount + 1);
  }, []);

  if (!user) {
    return (
      <div className="bg-red-900/30 p-3 rounded mt-4">
        <p className="text-red-300 text-sm">❌ Not logged in</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mt-4 text-xs font-mono">
      <div className="text-slate-400 mb-3">
        <span className="font-bold text-white">Quick Gamification Status</span>
        <span className="ml-2 text-slate-500">(renders: {renderCount})</span>
      </div>

      {error && (
        <div className="bg-red-900/50 p-2 rounded mb-2 text-red-300">
          ❌ Error: {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-1">
          <div>
            <span className="text-blue-400">XP:</span>{' '}
            <span className={xp > 0 ? 'text-green-400 font-bold' : 'text-slate-400'}>
              {xp || 0}
            </span>
          </div>
          <div>
            <span className="text-orange-400">Streak:</span>{' '}
            <span className={currentStreak > 0 ? 'text-green-400 font-bold' : 'text-slate-400'}>
              {currentStreak || 0}
            </span>{' '}
            <span className="text-slate-500">(longest: {longestStreak || 0})</span>
          </div>
          <div>
            <span className="text-yellow-400">Badges:</span>{' '}
            <span className={badgeCount > 0 ? 'text-green-400 font-bold' : 'text-slate-400'}>
              {badgeCount || 0}
            </span>{' '}
            {earnedBadges?.length > 0 && (
              <span className="text-slate-500">
                ({earnedBadges.map(b => b.badges?.icon || '?').join('')})
              </span>
            )}
          </div>
          <div className="text-slate-500 mt-2 pt-2 border-t border-slate-700">
            User: {user.email || user.id}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        ℹ️ If render count keeps increasing, there's an infinite loop
      </div>
    </div>
  );
};

export default QuickDebugWidget;