import React from 'react';
import { motion } from 'framer-motion';

/**
 * SkillNode Component
 * Visual representation of a single skill in the roadmap
 */
export default function SkillNode({ skill, onClick, onViewLessons, featured = false }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'mastered':
        return '✅';
      case 'in_progress':
        return '⚡';
      case 'eligible':
        return '🎯';
      case 'locked':
        return '🔒';
      default:
        return '📘';
    }
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className={`card h-full flex flex-col ${
        skill.status === 'locked' ? 'opacity-50' : 'cursor-pointer hover:shadow-lg transition-shadow'
      }`}
      onClick={() => skill.status !== 'locked' && onClick?.(skill)}
    >
      {/* Header with Icon & Status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{skill.icon || '📘'}</span>
          <div>
            <h3 className="font-medium text-lg">{skill.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{getDifficultyStars(skill.difficulty)}</span>
              <span className="text-xs text-gray-400">⏱️ {formatTime(skill.estimatedMinutes)}</span>
            </div>
          </div>
        </div>
        <span className="text-xl">{getStatusIcon(skill.status)}</span>
      </div>

      {/* Description */}
      {skill.description && (
        <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-2">
          {skill.description}
        </p>
      )}

      {/* Mastery Progress - Click to view lessons */}
      {skill.status !== 'locked' && (
        <div 
          className="mb-3 cursor-pointer hover:bg-white/5 rounded p-2 -m-2 transition-colors group"
          onClick={(e) => {
            e.stopPropagation();
            onViewLessons?.(skill);
          }}
          title="Click to view lessons"
        >
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="group-hover:text-white transition-colors">Mastery</span>
            <span className="group-hover:text-primary transition-colors font-semibold">
              {Math.round(skill.mastery * 100)}% 📚
            </span>
          </div>
          <div className="w-full bg-dark-lightest rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.mastery * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${
                skill.status === 'mastered'
                  ? 'bg-green-400'
                  : skill.status === 'in_progress'
                  ? 'bg-yellow-400'
                  : 'bg-blue-400'
              }`}
            />
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded ${
          skill.status === 'mastered'
            ? 'bg-green-700/30 text-green-400'
            : skill.status === 'in_progress'
            ? 'bg-yellow-700/30 text-yellow-400'
            : skill.status === 'eligible'
            ? 'bg-blue-700/30 text-blue-400'
            : 'bg-gray-700/30 text-gray-400'
        }`}>
          {skill.status.replace('_', ' ').toUpperCase()}
        </span>
        {skill.status !== 'locked' && (
          <span className="text-xs text-gray-400 hover:text-white transition-colors">
            View Details →
          </span>
        )}
      </div>

      {/* Prerequisites for locked skills */}
      {skill.status === 'locked' && skill.dependencies?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-xs text-gray-500">
            Requires {skill.dependencies.length} prerequisite{skill.dependencies.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
