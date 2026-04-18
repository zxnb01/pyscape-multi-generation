/**
 * Achievements Page
 * Displays user's XP, streaks, and earned badges
 * Production-ready with animated UI
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Target,
  Award,
  Calendar,
  TrendingUp,
  Lock
} from "lucide-react";
import useGamification from "../gamification/useGamification";
import { useAuth } from "../context/AuthContext";
import { getBadgeImagePath } from "../utils/badgeImages";

const Achievements = () => {
  const { user } = useAuth();
  const {
    xp,
    currentStreak,
    longestStreak,
    earnedBadges,
    allBadges,
    loading
  } = useGamification();

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeFilter, setBadgeFilter] = useState("all");

  const normalizeBadgeId = (badge) => {
    if (!badge) return null;
    const id = badge?.badges?.id ?? badge?.badge_id ?? badge?.id;
    return id != null ? String(id) : null;
  };

  const getBadgeRequirementText = (badge) => {
    if (!badge) return 'unlock this badge';
    const amount = badge.requirement_value;
    switch (badge.badge_type) {
      case 'xp':
        return `${amount} XP required`;
      case 'streak':
        return `${amount} day streak required`;
      case 'lesson':
        return `${amount} lesson${amount === 1 ? '' : 's'} completed`;
      case 'project':
        return `${amount} project${amount === 1 ? '' : 's'} completed`;
      default:
        return amount != null ? `Reach ${amount}` : 'complete the requirement';
    }
  };

  const getDisplayDescription = (description, isEarned, badge) => {
    if (!description) {
      if (isEarned) {
        return `Earned ${badge?.title || 'this badge'}`;
      }
      return `Unlock by ${getBadgeRequirementText(badge)}`;
    }

    if (!isEarned) return description;

    const pastTenseMap = {
      'Complete': 'Completed',
      'Reach': 'Reached',
      'Earn': 'Earned',
      'Maintain': 'Maintained',
      'Submit': 'Submitted',
      'Build': 'Built'
    };

    let pastTense = description;
    for (const [present, past] of Object.entries(pastTenseMap)) {
      pastTense = pastTense.replace(new RegExp(`^${present}\\s`), `${past} `);
    }
    return pastTense;
  };

  // Get earned badge IDs for filtering - normalize all badge IDs consistently
  const earnedBadgeIds = new Set(
    (earnedBadges || []).map(normalizeBadgeId).filter(Boolean)
  );

  console.log("🎮 DEBUG - Earned Badges:", earnedBadges);
  console.log("🎮 DEBUG - Earned Badge IDs:", Array.from(earnedBadgeIds));
  console.log("🎮 DEBUG - All Badges:", allBadges);

  // Filter badges based on selection
  const filteredBadges =
    badgeFilter === "earned"
      ? (allBadges || []).filter((b) => earnedBadgeIds.has(normalizeBadgeId(b)))
      : badgeFilter === "locked"
      ? (allBadges || []).filter((b) => !earnedBadgeIds.has(normalizeBadgeId(b)))
      : allBadges || [];

  const earnedCount = earnedBadges?.length || 0;
  const totalCount = allBadges?.length || 0;
  const completionPercentage =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Your Achievements
          </h1>
          <p className="text-slate-400">
            Track your progress and unlock badges as you learn
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* Total XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Total XP</p>
                <p className="text-4xl font-bold text-blue-100">{xp}</p>
              </div>
              <Star className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </motion.div>

          {/* Current Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-900/50 to-red-800/50 border border-red-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium mb-1">
                  Current Streak
                </p>
                <p className="text-4xl font-bold text-orange-100">
                  {currentStreak}
                </p>
                <p className="text-xs text-orange-300 mt-1">days</p>
              </div>
              <Flame className="w-12 h-12 text-orange-400 opacity-50" />
            </div>
          </motion.div>

          {/* Longest Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-900/50 to-indigo-800/50 border border-purple-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium mb-1">
                  Longest Streak
                </p>
                <p className="text-4xl font-bold text-purple-100">
                  {longestStreak}
                </p>
                <p className="text-xs text-purple-300 mt-1">days</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
          </motion.div>

          {/* Badges Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-900/50 to-yellow-800/50 border border-yellow-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm font-medium mb-1">
                  Badges Earned
                </p>
                <p className="text-4xl font-bold text-amber-100">
                  {earnedCount}/{totalCount}
                </p>
                <p className="text-xs text-amber-300 mt-1">{completionPercentage}%</p>
              </div>
              <Award className="w-12 h-12 text-amber-400 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-12"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Badge Collection Progress</h3>
            <span className="text-sm text-slate-400">
              {earnedCount} of {totalCount} badges
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {totalCount - earnedCount} badges remaining to unlock
          </p>
        </motion.div>

        {/* Badge Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "all", label: "All Badges" },
            { id: "earned", label: "Earned" },
            { id: "locked", label: "Locked" }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBadgeFilter(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                badgeFilter === tab.id
                  ? "bg-primary text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBadges.map((badge, index) => {
              const badgeId = normalizeBadgeId(badge);
              const isEarned = badgeId ? earnedBadgeIds.has(badgeId) : false;
              
              // Find the earned data for this badge
              const earnedData = earnedBadges?.find((b) => normalizeBadgeId(b) === badgeId);

              console.log(`🏆 Badge ${badge.id}: title=${badge.title}, description=${badge?.description}, isEarned=${isEarned}`);
              console.log(`📝 Display text: ${getDisplayDescription(badge?.description, isEarned, badge)}`);
              return (
                <motion.div
                  key={badge.id}
                  layoutId={`badge-${badge.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={isEarned ? { scale: 1.05, translateY: -5 } : {}}
                  onClick={() => isEarned && setSelectedBadge(badge)}
                  className={`relative rounded-xl p-4 cursor-pointer transition border ${
                    isEarned
                      ? "border-yellow-600/50 hover:border-yellow-400/80"
                      : "border-slate-700/50 opacity-60"
                  }`}
                >
                  {/* Badge Icon */}
                  <div className="flex justify-center mb-2">
                    <img
                      src={getBadgeImagePath(badge)}
                      alt={badge.title}
                      className={`w-12 h-12 object-contain ${
                        !isEarned && "grayscale opacity-50"
                      }`}
                      style={{ mixBlendMode: 'screen' }}
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div
                      className={`text-5xl text-center ${
                        !isEarned && "grayscale opacity-50"
                      }`}
                      style={{ display: 'none' }}
                    >
                      {badge.icon}
                    </div>
                  </div>

                  {/* Badge Title */}
                  <h3 className="font-semibold text-sm text-center mb-1">
                    {badge.title}
                  </h3>

                  {/* Badge Type */}
                  <p className="text-xs text-slate-400 text-center mb-2 capitalize">
                    {badge.badge_type}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-300 text-center mb-3">
                    {getDisplayDescription(badge?.description, isEarned, badge)}
                  </p>

                  {/* Status */}
                  {isEarned ? (
                    <div className="flex items-center justify-center gap-1 text-xs text-green-400 font-medium">
                      <span>✓ Earned</span>
                      {earnedData?.earned_at && (
                        <span className="text-slate-500">
                          {new Date(earnedData.earned_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {(filteredBadges?.length || 0) === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-400 text-lg">
              No badges found for this filter.
            </p>
          </motion.div>
        )}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4"
            >
              <img
                src={getBadgeImagePath(selectedBadge)}
                alt={selectedBadge.title}
                className="mx-auto mb-4 w-24 h-24 object-contain"
                style={{ mixBlendMode: 'screen' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="text-6xl text-center mb-4" style={{ display: 'none' }}>
                {selectedBadge.icon}
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">
                {selectedBadge.title}
              </h2>
              <p className="text-slate-300 text-center mb-6">
                {selectedBadge.description}
              </p>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-400 mb-2">Badge Type</p>
                <p className="text-lg font-semibold text-primary capitalize">
                  {selectedBadge.badge_type}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-400 mb-2">Requirement</p>
                <p className="text-lg font-semibold text-primary">
                  {selectedBadge.badge_type === "xp"
                    ? `${selectedBadge.requirement_value} XP`
                    : selectedBadge.badge_type === "streak"
                    ? `${selectedBadge.requirement_value} Day Streak`
                    : selectedBadge.badge_type === "lesson"
                    ? `${selectedBadge.requirement_value} Lesson${
                        selectedBadge.requirement_value > 1 ? "s" : ""
                      } Completed`
                    : `${selectedBadge.requirement_value} Project${
                        selectedBadge.requirement_value > 1 ? "s" : ""
                      } Completed`}
                </p>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Achievements;