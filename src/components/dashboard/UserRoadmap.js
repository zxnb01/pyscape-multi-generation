import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import roadmapService from '../../services/roadmapService';

const UserRoadmap = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const data = await roadmapService.getRoadmap(user?.id || '00000000-0000-0000-0000-000000000001', 'python');
        setRoadmap(data);
      } catch (err) {
        console.error('Error loading roadmap preview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-dark-lighter rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-dark-lighter rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🗺️ Your Learning Roadmap</h2>
        <p className="text-gray-400">Unable to load roadmap. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-lighter rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">🗺️ Your Learning Roadmap</h2>
          <p className="text-gray-400">Track your personalized skill progression</p>
        </div>
        <Link
          to="/app/roadmap"
          className="px-4 py-2 bg-primary rounded-lg text-white font-medium hover:bg-primary-light transition-colors"
        >
          View Full Roadmap →
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{roadmap.stats.mastered}</div>
          <div className="text-xs text-gray-400 mt-1">Mastered</div>
        </div>
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{roadmap.stats.inProgress}</div>
          <div className="text-xs text-gray-400 mt-1">In Progress</div>
        </div>
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{roadmap.stats.eligible}</div>
          <div className="text-xs text-gray-400 mt-1">Available</div>
        </div>
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-400">{roadmap.stats.locked}</div>
          <div className="text-xs text-gray-400 mt-1">Locked</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-primary font-bold">{roadmap.stats.percentComplete}%</span>
        </div>
        <div className="w-full bg-dark rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${roadmap.stats.percentComplete}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-primary-light"
          />
        </div>
      </div>

      {/* Recommended Skills Preview */}
      {roadmap.recommended.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-300">🎯 Recommended Next</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roadmap.recommended.slice(0, 3).map((skill) => (
              <Link
                key={skill.id}
                to="/app/roadmap"
                className="bg-dark p-4 rounded-lg border border-gray-700 hover:border-primary transition-all hover:shadow-lg group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{skill.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-primary transition-colors">
                      {skill.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{'⭐'.repeat(skill.difficulty)}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{skill.estimatedMinutes}m</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${skill.mastery * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoadmap;