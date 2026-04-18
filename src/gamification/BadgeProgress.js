/**
 * Badge Progress Component
 * Shows users what badges they're close to earning
 * Displays progress toward each badge requirement
 */

import React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import useGamification from "../gamification/useGamification";
import { getBadgeImagePath } from "../utils/badgeImages";

const BadgeProgress = () => {
  const { xp, currentStreak, earnedBadges, allBadges, loading } = useGamification();

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get earned badge IDs
  const earnedBadgeIds = new Set(
    earnedBadges?.map((b) => b.badges?.id || b.badge_id) || []
  );

  // Filter unearned badges and sort by how close user is to earning
  const unearnedBadges = (allBadges || [])
    .filter((b) => !earnedBadgeIds.has(b.id))
    .map((badge) => {
      let progress = 0;
      let progressPercentage = 0;

      if (badge.badge_type === "xp") {
        progress = xp;
        progressPercentage = Math.min((xp / badge.requirement_value) * 100, 100);
      } else if (badge.badge_type === "streak") {
        progress = currentStreak;
        progressPercentage = Math.min(
          (currentStreak / badge.requirement_value) * 100,
          100
        );
      }

      return {
        ...badge,
        progress,
        progressPercentage
      };
    })
    .sort((a, b) => b.progressPercentage - a.progressPercentage); // Sort by closest first

  // Get closest badges to earn (top 3)
  const closestBadges = unearnedBadges.slice(0, 3);

  // Get already earned badges (top 3 most recent)
  const recentBadges = (earnedBadges || []).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Recently Earned */}
      {recentBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Recently Earned
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentBadges?.map((item) => {
              const badge = item?.badges || item;
              return (
                <motion.div
                  key={badge?.id}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-lg border border-white/10 p-3 text-center"
                >
                  <img
                    src={getBadgeImagePath(badge)}
                    alt={badge?.title || 'Badge'}
                    className="mx-auto mb-2 w-12 h-12 object-contain"
                    style={{ mixBlendMode: 'screen' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p className="text-sm font-semibold text-white">
                    {badge?.title || 'Badge'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {badge?.earned_at ? new Date(badge.earned_at).toLocaleDateString() : 'Recently'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Next Badges to Earn */}
      {closestBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Badges You're Close To
          </h3>
          <div className="space-y-4">
            {closestBadges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-start gap-4">
                  {/* Badge Icon */}
                  <img
                    src={getBadgeImagePath(badge)}
                    alt={badge.title}
                    className="w-10 h-10 flex-shrink-0 mt-1 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white">{badge.title}</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      {badge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 capitalize">
                          {badge.badge_type}
                        </span>
                        <span className="text-primary font-semibold">
                          {badge.progress} / {badge.requirement_value}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${badge.progressPercentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        {Math.max(
                          0,
                          badge.requirement_value - badge.progress
                        )} {badge.badge_type === "xp" ? "XP" : "days"} remaining
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Locked Badges */}
      {unearnedBadges.length > closestBadges.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            Locked Badges ({unearnedBadges.length - closestBadges.length})
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Keep learning to unlock more badges!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {unearnedBadges.slice(closestBadges.length).map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className="rounded-lg border border-white/10 p-3 text-center opacity-50"
              >
                <img
                  src={getBadgeImagePath(badge)}
                  alt={badge.title}
                  className="mx-auto mb-2 w-10 h-10 object-contain"
                  style={{ mixBlendMode: 'screen' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <p className="text-xs font-semibold text-slate-400 truncate">
                  {badge.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BadgeProgress;