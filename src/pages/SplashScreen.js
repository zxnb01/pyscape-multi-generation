import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../images/logo.png';
import BgImage from '../images/bg.png';

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${BgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Animated glowing background */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-8 py-10 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-6 flex justify-center"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(34,211,238,0.3)',
                '0 0 40px rgba(59,130,246,0.5)',
                '0 0 20px rgba(34,211,238,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-4 rounded-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(6,182,212,0.6), rgba(59,130,246,0.6))',
            }}
          >
            <motion.img
              src={Logo}
              alt="PyScape Logo"
              className="w-20 h-20 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-cyan-300"
          style={{ textShadow: '0 0 20px rgba(59,130,246,0.4)' }}
        >
          PyScape
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-gray-200 italic"
        >
          Escape the Ordinary, Code the Extraordinary.
        </motion.p>

        {/* XP loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 w-64 mx-auto"
        >
          <div className="text-sm text-gray-300 mb-2 flex justify-between">
            <span>Loading...</span>
            <span>Level 1</span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-300 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 1.5, delay: 0.7 }}
            />
          </div>
        </motion.div>

        {/* Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth')}
          className="mt-8 px-10 py-3 rounded-lg bg-gradient-to-r from-cyan-300 to-blue-400 text-black font-bold shadow-lg"
        >
          Press Start
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-sm text-gray-300"
        >
          Learn • Build • Level Up
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;