import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useGamification from "../../gamification/useGamification";

const Header = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // 🔥 GAMIFICATION DATA (ADDED)
  const { xp, streak } = useGamification();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/auth');
    }
  };

  return (
    <header className="bg-dark-lighter p-4 border-b border-dark-lightest flex justify-between items-center">
      <div>
        <motion.h2 
          className="text-lg font-semibold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Dashboard
        </motion.h2>

        <motion.p 
          className="text-sm text-gray-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Welcome back, let's learn and build something awesome!
        </motion.p>
      </div>

      <div className="flex items-center">
        <motion.div 
          className="flex items-center mr-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* XP */}
          <div className="bg-primary-dark px-3 py-1 rounded-full flex items-center text-sm font-medium">
            <span className="mr-1">XP</span>
            <span>{xp}</span>
          </div>

          {/* STREAK */}
          <div className="ml-3 flex items-center text-sm font-medium">
            <span className="text-lg mr-1">🔥</span>
            <span>{streak}</span>
          </div>

          {/* BADGES */}
          {/*<div className="ml-3 flex items-center">
            <span className="text-sm">{badges} Badges</span>
          </div>*/}
        </motion.div>
        
        {/* SIGN OUT */}
        <motion.div 
          className="ml-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-full bg-dark-lightest hover:bg-dark-lighter text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9 0v14h3V3h-3zm-5 0v14h3V3H7z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;