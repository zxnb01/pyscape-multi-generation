import { motion, AnimatePresence } from "framer-motion";
import { getBadgeImagePath } from "../utils/badgeImages";

const XPToast = ({ xp, show, badges = [] }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed top-20 right-6 z-50 space-y-3"
        >
          {/* XP Notification */}
          {xp > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary text-white px-6 py-3 rounded-xl shadow-xl font-bold"
            >
              +{xp} XP 🎉
            </motion.div>
          )}

          {/* Badge Notifications */}
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-accent text-white px-6 py-3 rounded-xl shadow-xl font-bold flex items-center gap-2"
            >
              <img
                src={getBadgeImagePath(badge)}
                alt={badge.title}
                className="w-6 h-6 object-contain"
                style={{ mixBlendMode: 'screen' }}
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span
                className="text-lg"
                style={{ display: 'none' }}
              >
                {badge.icon}
              </span>
              <span>{badge.title} Unlocked! 🏆</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPToast;