import React, { useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-screen bg-[#07101d] text-white overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        <Header />

        <main className="flex-1 overflow-auto relative px-6 py-6">
          {/* background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 right-10 w-80 h-80 rounded-full bg-cyan-400/12 blur-3xl"
              animate={{
                x: [0, 18, 0],
                y: [0, 14, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"
              animate={{
                x: [0, -18, 0],
                y: [0, -14, 0],
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{
                clipPath: 'circle(0% at 50% 50%)',
                opacity: 0.65,
                scale: 0.98,
              }}
              animate={{
                clipPath: 'circle(140% at 50% 50%)',
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.985,
                y: -8,
              }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-10 min-h-full"
            >
              <div className="relative overflow-hidden rounded-[28px] bg-transparent shadow-none">
                {/* beam sweep */}
                <motion.div
                  key={location.pathname + '-beam'}
                  initial={{ x: '-140%', opacity: 0 }}
                  animate={{ x: '140%', opacity: [0, 0.85, 0] }}
                  transition={{ duration: 0.95, ease: 'easeOut' }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 z-20"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 18%, rgba(103,232,249,0.38) 50%, rgba(255,255,255,0.04) 82%, transparent 100%)',
                    transform: 'skewX(-20deg)',
                    filter: 'blur(7px)',
                  }}
                />

                {/* soft glow flash */}
                <motion.div
                  key={location.pathname + '-glow'}
                  initial={{ opacity: 0.18 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-cyan-300/10 via-transparent to-blue-400/10 blur-2xl"
                />

                <div className="relative z-0">
                  {outlet}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;