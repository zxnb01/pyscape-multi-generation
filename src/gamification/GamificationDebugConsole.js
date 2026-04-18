/**
 * Gamification Debug Console
 * Helps identify issues with XP, streak, and badge systems
 * Add to your dashboard temporarily to diagnose problems
 */

import React, { useState, useEffect } from "react";
import useGamification from "./useGamification";
import {
  checkAndAwardBadges,
  getUserGamificationData,
  getXPHistory
} from "./gamificationService";
import { useAuth } from "../context/AuthContext";

const GamificationDebugConsole = () => {
  const { user } = useAuth();
  const {
    xp,
    currentStreak,
    longestStreak,
    badgeCount,
    earnedBadges,
    allBadges,
    loading
  } = useGamification();

  const [debugInfo, setDebugInfo] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    xp: true,
    streak: true,
    badges: true,
    rawData: false
  });

  useEffect(() => {
    const runDebugCheck = async () => {
      if (!user?.id) {
        setDebugInfo("❌ No user logged in");
        return;
      }

      let output = `=== GAMIFICATION DEBUG ===\nUser ID: ${user.id}\n\n`;

      try {
        // Check 1: XP Data
        output += `📊 XP CHECK:\n`;
        output += `  ✓ Hook XP value: ${xp}\n`;

        const xpHistory = await getXPHistory(user.id, 5);
        output += `  ✓ XP history records: ${xpHistory?.length || 0}\n`;
        if (xpHistory?.length > 0) {
          xpHistory.forEach((h) => {
            output += `    - ${h.source_type}(${h.source_id}): +${h.xp_earned}\n`;
          });
        }

        // Check 2: Streak Data
        output += `\n🔥 STREAK CHECK:\n`;
        output += `  ✓ Current streak from hook: ${currentStreak}\n`;
        output += `  ✓ Longest streak from hook: ${longestStreak}\n`;

        // Check 3: Badge Data
        output += `\n🏆 BADGE CHECK:\n`;
        output += `  ✓ Badge count from hook: ${badgeCount}\n`;
        output += `  ✓ Earned badges array length: ${earnedBadges?.length || 0}\n`;
        output += `  ✓ All badges available: ${allBadges?.length || 0}\n`;

        if (earnedBadges && earnedBadges.length > 0) {
          output += `\n  Earned Badges:\n`;
          earnedBadges.forEach((b) => {
            const badgeTitle = b.badges?.title || "Unknown";
            const badgeIcon = b.badges?.icon || "?";
            output += `    ${badgeIcon} ${badgeTitle}\n`;
          });
        } else {
          output += `\n  ⚠️ No earned badges found\n`;
        }

        // Check 4: Manual Badge Check
        output += `\n🔍 MANUAL BADGE AWARD CHECK:\n`;
        const newBadges = await checkAndAwardBadges(user.id);
        output += `  ✓ Check returned: ${newBadges?.length || 0} new badges\n`;
        if (newBadges && newBadges.length > 0) {
          newBadges.forEach((b) => {
            output += `    - ${b.title}\n`;
          });
        }

        // Check 5: Full gamification data
        output += `\n📋 FULL GAMIFICATION DATA:\n`;
        const fullData = await getUserGamificationData(user.id);
        output += `  XP: ${fullData?.xp || 0}\n`;
        output += `  Current Streak: ${fullData?.currentStreak || 0}\n`;
        output += `  Longest Streak: ${fullData?.longestStreak || 0}\n`;
        output += `  Badge Count: ${fullData?.badgeCount || 0}\n`;
        output += `  Earned Badges: ${fullData?.earnedBadges?.length || 0}\n`;

        output += `\n✅ DEBUG CHECK COMPLETE\n`;
        setDebugInfo(output);
      } catch (err) {
        output += `\n❌ ERROR: ${err.message}`;
        setDebugInfo(output);
      }
    };

    runDebugCheck();
  }, [user?.id]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 font-mono text-xs mt-8">
      <h3 className="text-lg font-bold text-white mb-4">🔧 Gamification Debug Console</h3>

      {loading ? (
        <p className="text-slate-400">Loading debug data...</p>
      ) : (
        <div className="space-y-3">
          {/* XP Section */}
          <div className="bg-slate-800 rounded p-3">
            <button
              onClick={() => toggleSection("xp")}
              className="text-blue-400 hover:text-blue-300 font-bold"
            >
              {expandedSections.xp ? "▼" : "▶"} 📊 XP Status
            </button>
            {expandedSections.xp && (
              <div className="mt-2 text-slate-300 ml-4 space-y-1">
                <p>✓ Total XP: {xp}</p>
                <p>✓ XP History Records: {getXPHistory.length || "Loading..."}</p>
              </div>
            )}
          </div>

          {/* Streak Section */}
          <div className="bg-slate-800 rounded p-3">
            <button
              onClick={() => toggleSection("streak")}
              className="text-orange-400 hover:text-orange-300 font-bold"
            >
              {expandedSections.streak ? "▼" : "▶"} 🔥 Streak Status
            </button>
            {expandedSections.streak && (
              <div className="mt-2 text-slate-300 ml-4 space-y-1">
                <p>✓ Current Streak: {currentStreak}</p>
                <p>✓ Longest Streak: {longestStreak}</p>
                {currentStreak > 0 ? (
                  <p className="text-green-400">✅ Streak is working!</p>
                ) : (
                  <p className="text-yellow-400">
                    ⚠️ No streak yet. Complete a lesson first.
                  </p>
                )}
              </div>
            )}
          </div>\n\n          {/* Badge Section */}
          <div className="bg-slate-800 rounded p-3">
            <button
              onClick={() => toggleSection("badges")}
              className="text-yellow-400 hover:text-yellow-300 font-bold"
            >
              {expandedSections.badges ? "▼" : "▶"} 🏆 Badge Status
            </button>
            {expandedSections.badges && (
              <div className="mt-2 text-slate-300 ml-4 space-y-1">
                <p>✓ Total Badges Earned: {badgeCount}</p>
                <p>✓ All Badges Available: {allBadges?.length || 0}</p>
                <p>✓ Earned Badges Array Length: {earnedBadges?.length || 0}</p>
                {badgeCount > 0 ? (
                  <p className="text-green-400">✅ Badges are being awarded!</p>
                ) : (
                  <p className="text-yellow-400">
                    ⚠️ No badges earned yet. Earn XP or maintain a streak.
                  </p>
                )}
              </div>
            )}
          </div>\n\n          {/* Raw Debug Info */}
          <div className="bg-slate-800 rounded p-3">
            <button
              onClick={() => toggleSection("rawData")}
              className="text-slate-400 hover:text-slate-300 font-bold"
            >
              {expandedSections.rawData ? "▼" : "▶"} 📝 Raw Debug Output
            </button>
            {expandedSections.rawData && (
              <div className="mt-2 bg-black rounded p-3 text-slate-300 overflow-auto max-h-96">
                <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}
          </div>\n\n          {/* Quick Fixes */}
          <div className="bg-slate-800 border border-green-700/30 rounded p-3 mt-4">
            <p className="text-green-400 font-bold mb-2">💡 What To Check:</p>
            <ul className="text-slate-300 space-y-1 ml-4 text-xs">
              <li>✓ XP working but streak/badges not? Check user_streaks table for your user_id</li>
              <li>✓ Badges not showing? Ensure badges table has data and RLS policies are correct</li>
              <li>✓ Check browser console for any API errors</li>
              <li>✓ Verify Supabase RPC functions exist: award_xp, update_streak, check_and_award_badges</li>
              <li>✓ Check Supabase database for null values in streak/badge tables</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDebugConsole;