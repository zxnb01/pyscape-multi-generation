import { motion, AnimatePresence } from "framer-motion";

const XPToast = ({ xp, show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed top-20 right-6 z-50 bg-primary text-white px-6 py-3 rounded-xl shadow-xl font-bold"
        >
          +{xp} XP 🎉
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPToast;