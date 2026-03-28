import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';

const Learn = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('id, title, description, difficulty, prerequisites, estimated_hours, order_index, tags, is_published')
          .eq('is_published', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        // Calculate lesson count per module
        const { data: lessonCounts, error: lcErr } = await supabase
          .from('lessons')
          .select('module_id');

        if (lcErr) throw lcErr;

        const countMap = {};
        (lessonCounts || []).forEach(l => {
          countMap[l.module_id] = (countMap[l.module_id] || 0) + 1;
        });

        const enriched = (data || []).map((mod, idx) => ({
          ...mod,
          lessons: countMap[mod.id] || 0,
          progress: 0, // TODO: compute from progress table
          status: idx === 0 ? 'available' : 'locked', // first module unlocked, rest locked by default
        }));

        setModules(enriched);
      } catch (err) {
        console.error('Error fetching modules:', err);
        // Fallback to hardcoded data if DB unavailable
        setModules([
          { id: 1, title: 'Python Fundamentals', description: 'Learn the basics of Python programming language.', lessons: 12, progress: 0, status: 'available' },
          { id: 2, title: 'Data Science with Pandas', description: 'Master data manipulation and analysis with Pandas.', lessons: 10, progress: 0, status: 'locked' },
          { id: 3, title: 'Machine Learning Basics', description: 'Introduction to machine learning concepts and algorithms.', lessons: 15, progress: 0, status: 'locked' },
          { id: 4, title: 'Neural Networks & Deep Learning', description: 'Build and train neural networks for various applications.', lessons: 18, progress: 0, status: 'locked' },
          { id: 5, title: 'Natural Language Processing', description: 'Process and analyze text data using NLP techniques.', lessons: 14, progress: 0, status: 'locked' },
          { id: 6, title: 'Computer Vision', description: 'Analyze and process images using computer vision.', lessons: 12, progress: 0, status: 'locked' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleStartLearning = (moduleId) => {
    navigate(`/learn/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-dark-lighter rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-dark-lighter rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-dark-lightest rounded mb-3" />
              <div className="h-4 w-full bg-dark-lightest rounded mb-4" />
              <div className="h-2 w-full bg-dark-lightest rounded mb-4" />
              <div className="h-10 w-full bg-dark-lightest rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-2">Learning Path</h1>
        <p className="text-gray-400">
          Your personalized curriculum based on your knowledge and goals.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Your Progress</h2>
            <button className="btn-secondary py-1 px-3 text-sm">Retake Quiz</button>
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-grow bg-dark-lightest h-2 rounded-full">
              <div className="bg-primary h-2 rounded-full w-[5%]"></div>
            </div>
            <span className="text-sm font-medium">5%</span>
          </div>
          
          <p className="text-sm text-gray-400">
            Complete the Python Fundamentals module to unlock Data Science with Pandas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`card p-6 ${module.status === 'locked' ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg">{module.title}</h3>
                {module.status === 'locked' && (
                  <div className="bg-dark text-gray-500 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{module.description}</p>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-400">{module.lessons} lessons</span>
                <span>{module.progress}% complete</span>
              </div>
              
              <div className="w-full bg-dark-lightest h-1.5 rounded-full mb-4">
                <div 
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${module.progress}%` }}
                ></div>
              </div>
              
              {module.status === 'available' ? (
                <button className="btn-primary w-full"
                onClick={() => handleStartLearning(module.id)}>Start Learning</button>
              ) : (
                <button className="w-full py-2 px-4 rounded-md bg-dark-lightest text-gray-500 cursor-not-allowed" disabled>
                  Locked
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Learn;
