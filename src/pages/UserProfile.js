import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaBriefcase, FaVenusMars, FaBuilding, FaPencilAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useGamification from '../gamification/useGamification';
import { getBadgeImagePath } from '../utils/badgeImages';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { xp = 0, currentStreak = 0, earnedBadges = [] } = useGamification();
  const [showAllBadges, setShowAllBadges] = useState(false);

  if (!user) return <p className="text-center mt-10 text-gray-400">No user data found.</p>;

  const recentBadgeCards = earnedBadges.map((item) => item?.badges || item);
  const badgePreview = recentBadgeCards.slice(0, 4);
  const badgesToShow = showAllBadges ? recentBadgeCards : badgePreview;
  const hasMoreBadges = recentBadgeCards.length > 4;

  const profileItems = [
    { icon: <FaEnvelope />, value: user.email || 'Not available' },
    { icon: <FaBriefcase />, value: user.role || 'Not set' },
    { icon: <FaVenusMars />, value: user.gender || 'Not set' },
    { icon: <FaBuilding />, value: user.organization || 'Not set' },
    { icon: <FaPencilAlt />, value: user.bio || 'No bio yet' },
  ];

  const badgeSparkles = [
    [
      { position: 'top-0 left-0', size: 'h-2 w-2', color: 'bg-amber-300/90 shadow-[0_0_8px_rgba(250,204,21,0.7)]', rotate: 'rotate(45deg)' },
      { position: 'bottom-1 right-0', size: 'h-1 w-1.5', color: 'bg-sky-300/90 shadow-[0_0_8px_rgba(56,189,248,0.7)]', rotate: 'rotate(20deg)' },
    ],
    [
      { position: 'top-1 right-0', size: 'h-1.5 w-1.5', color: 'bg-fuchsia-300/90 shadow-[0_0_8px_rgba(236,72,153,0.7)]', rotate: 'rotate(45deg)' },
      { position: 'bottom-0 left-1', size: 'h-1 w-1', color: 'bg-lime-300/90 shadow-[0_0_8px_rgba(132,204,22,0.7)]', rotate: 'rotate(315deg)' },
    ],
    [
      { position: 'top-0 right-2', size: 'h-1 w-2', color: 'bg-cyan-300/90 shadow-[0_0_8px_rgba(56,189,248,0.7)]', rotate: 'rotate(30deg)' },
      { position: 'bottom-1 left-0', size: 'h-1.5 w-1', color: 'bg-rose-300/90 shadow-[0_0_8px_rgba(244,63,94,0.7)]', rotate: 'rotate(60deg)' },
    ],
    [
      { position: 'top-1 left-2', size: 'h-1 w-1.5', color: 'bg-violet-300/90 shadow-[0_0_8px_rgba(168,85,247,0.7)]', rotate: 'rotate(45deg)' },
      { position: 'bottom-0 right-1', size: 'h-1 w-1', color: 'bg-emerald-300/90 shadow-[0_0_8px_rgba(34,197,94,0.7)]', rotate: 'rotate(30deg)' },
    ],
  ];

  return (
    <div className="min-h-screen bg-[#050816] py-10 text-white flex justify-center">
      <div className="w-full max-w-3xl px-4">
        <div className="rounded-[2rem] bg-[#020617] border border-slate-700/30 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl p-6">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-start gap-3">
                <div className="relative h-28 w-28 rounded-full border-4 border-purple-500 overflow-visible">
                  <img
                    src={user.avatar_url || '/default-avatar.png'}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                  <button
                    onClick={() => navigate('/profile-build')}
                    title="Edit profile"
                    className="absolute -right-2 -bottom-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 bg-purple-600 text-white shadow-lg shadow-purple-500/40 hover:bg-purple-700 transition-colors text-sm"
                  >
                    <FaPencilAlt />
                  </button>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-white">{user.full_name || user.email}</h1>
                <p className="mt-3 text-base text-slate-300">Keep learning, keep growing! 🌿</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <motion.div
              whileHover={{ y: -4 }}
              className="flex h-full flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-[#8B4513] to-[#A0522D] p-5 shadow-lg shadow-[#A0522D]/20"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl text-3xl shadow-[0_0_18px_rgba(249,115,22,0.25)]">
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-300/90 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
                  <span className="absolute bottom-2 left-1 h-1 w-1 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                  <motion.span
                    className="relative"
                    animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >🔥</motion.span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-100/80">Current Streak</p>
                  <p className="mt-2 text-3xl font-bold text-white">{currentStreak}</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-amber-100/90">Don't break the chain</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="flex h-full flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-[#4C1095] to-[#7C3AED] p-5 shadow-lg shadow-[#7C3AED]/20"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl text-3xl shadow-[0_0_18px_rgba(168,85,247,0.25)]">
                  <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                  <span className="absolute bottom-2 right-1 h-1 w-1 rounded-full bg-amber-200/90 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse" />
                  <motion.span
                    className="relative"
                    animate={{ y: [0, -3, 0], rotate: [0, 5, 0], scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >🏆</motion.span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-200/90">Badges Earned</p>
                  <p className="mt-2 text-3xl font-bold text-white">{earnedBadges.length}</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-200/90">Keep it up!</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="flex h-full flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-[#1E3A8A] to-[#3730A3] p-5 shadow-lg shadow-[#3730A3]/20"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl text-3xl shadow-[0_0_18px_rgba(56,189,248,0.25)]">
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                  <span className="absolute bottom-2 left-1 h-1 w-1 rounded-full bg-sky-300/90 shadow-[0_0_6px_rgba(56,189,248,0.8)] animate-pulse" />
                  <motion.span
                    className="relative"
                    animate={{ y: [0, -4, 0], scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >⭐</motion.span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-200/90">XP Earned</p>
                  <p className="mt-2 text-3xl font-bold text-white">{xp}</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-200/80">Keep leveling up</p>
            </motion.div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="rounded-[1.75rem] bg-[#020617] border border-slate-700/70 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Badges</h2>
                  <p className="mt-1 text-sm text-slate-400">Your latest achievements</p>
                </div>
                {hasMoreBadges && (
                  <button
                    type="button"
                    onClick={() => setShowAllBadges((prev) => !prev)}
                    className="text-sm font-semibold text-sky-400 hover:text-sky-300"
                  >
                    {showAllBadges ? 'Show less ←' : 'View all →'}
                  </button>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {badgesToShow.length > 0 ? (
                  badgesToShow.map((badge, idx) => (
                    <div
                      key={badge?.id || idx}
                      className="text-center"
                    >
                      <div className="relative mx-auto mb-4 h-24 w-24">
                        {badge?.icon ? (
                          <img
                            src={getBadgeImagePath(badge)}
                            alt={badge.title}
                            className="h-full w-full object-contain"
                            style={{ mixBlendMode: 'screen' }}
                          />
                        ) : (
                          <span className="inline-flex h-full w-full items-center justify-center text-4xl">🏅</span>
                        )}
                        {badgeSparkles[idx % badgeSparkles.length].map((spark, sIdx) => (
                          <span
                            key={sIdx}
                            className={`absolute ${spark.position} ${spark.size} ${spark.color} rounded-none`}
                            style={{ transform: spark.rotate }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-white">{badge.title || 'Badge'}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-[1.75rem] bg-slate-950/80 p-6 text-center text-slate-400">
                    No badges earned yet
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[#020617] border border-slate-700/70 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
              <div className="grid gap-4 lg:grid-cols-1 items-end">
                <div>
                  <h3 className="text-lg font-semibold text-white">Profile Info</h3>
                  <p className="mt-2 text-sm text-slate-400">Your generated profile details from the builder.</p>
                  <div className="mt-2 space-y-1.5">
                    {profileItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 py-1.5 ${idx < profileItems.length - 1 ? 'border-b border-slate-800' : ''}`}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 via-violet-500/15 to-slate-900/70 text-sky-200 shadow-[0_0_18px_rgba(96,165,250,0.18)]">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;