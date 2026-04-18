import { useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";
import {
  getUserGamificationData,
  getXPHistory,
  getAllBadges,
  awardXP,
  updateStreak,
  checkAndAwardBadges,
  processDailyLogin
} from "./gamificationService";

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [gamificationData, setGamificationData] = useState({
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    badgeCount: 0,
    earnedBadges: [],
    lastActivityDate: null
  });
  const [xpHistory, setXpHistory] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // XP notification state
  const [xpNotification, setXpNotification] = useState({
    show: false,
    xp: 0,
    badges: []
  });

  // Fetch gamification data when user changes
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError(null);
      setGamificationData({
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        badgeCount: 0,
        earnedBadges: [],
        lastActivityDate: null
      });
      setXpHistory([]);
      setAllBadges([]);
      return;
    }

    const ensureGamificationRecord = async (table, rowData) => {
      try {
        const { data: existing, error: existingError } = await supabase
          .from(table)
          .select('user_id')
          .eq('user_id', rowData.user_id)
          .maybeSingle();

        if (existingError) {
          console.warn(`⚠️ ${table} existence check failed:`, existingError.message);
          return;
        }

        if (!existing) {
          const { error: insertError } = await supabase.from(table).insert(rowData);
          if (insertError) {
            console.warn(`⚠️ ${table} insert failed:`, insertError.message);
          } else {
            console.log(`✓ ${table} record created`);
          }
        } else {
          console.log(`✓ ${table} record exists`);
        }
      } catch (err) {
        console.warn(`⚠️ ${table} record initialization failed:`, err.message);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🎮 Initializing gamification for user: ${user.id}`);

        // Initialize gamification tables first, but never overwrite existing totals or streaks
        try {
          console.log(`📝 Verifying user_xp record...`);
          await ensureGamificationRecord('user_xp', {
            user_id: user.id,
            total_xp: 0
          });

          console.log(`📝 Verifying user_streaks record...`);
          await ensureGamificationRecord('user_streaks', {
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null
          });
        } catch (initErr) {
          console.warn('⚠️ Risk: Gamification tables may not exist yet:', initErr.message);
        }

        // NOTE: Do not update streak on login alone.
        // Streak should only advance when the user completes a lesson, project, quiz, or other real action.
        console.log(`🌅 Skipping daily login streak maintenance on startup`);

        // Fetch all data in parallel for performance
        console.log(`📊 Fetching gamification data...`);
        const [data, history, badges] = await Promise.all([
          getUserGamificationData(user.id),
          getXPHistory(user.id),
          getAllBadges()
        ]);

        console.log(`✅ Gamification loaded: XP=${data.xp}, Streak=${data.currentStreak}, Badges=${data.badgeCount}`);
        setGamificationData(data);
        setXpHistory(history);
        setAllBadges(badges);
      } catch (err) {
        console.error("❌ Gamification fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  /**
   * Show XP notification toast
   * @param {number} xp - XP amount to show
   * @param {Array} badges - Array of badges earned
   */
  const showXPNotification = (xp, badges = []) => {
    setXpNotification({ show: true, xp, badges });
    setTimeout(() => {
      setXpNotification({ show: false, xp: 0, badges: [] });
    }, 3000);
  };

  /**
   * Award XP with notification
   * @param {number} xpAmount - XP to award
   * @param {string} sourceType - Source type (lesson, project, quiz, etc.)
   * @param {string|number} sourceId - Source ID
   * @param {boolean} showNotification - Whether to show notification (default: true)
   */
  const awardXPWithNotification = async (xpAmount, sourceType, sourceId, showNotification = true) => {
    try {
      const result = await awardXP(user?.id, xpAmount, sourceType, sourceId);

      if (showNotification && result.xpAwarded > 0) {
        // Check for any new badges earned after awarding XP
        const newBadges = await checkAndAwardBadges(user?.id);
        showXPNotification(result.xpAwarded, newBadges);
      }

      return result;
    } catch (error) {
      console.error('Failed to award XP with notification:', error);
      throw error;
    }
  };

  /**
   * Refresh gamification data from server
   * Call this after completing a lesson/project to update XP, streak, badges
   */
  const refreshData = async () => {
    if (!user?.id) return;

    try {
      console.log(`🔄 Refreshing gamification data...`);
      
      const data = await getUserGamificationData(user.id);
      setGamificationData(data);

      const history = await getXPHistory(user.id);
      setXpHistory(history);

      console.log(`✅ Gamification refreshed: XP=${data.xp}, Streak=${data.currentStreak}`);
    } catch (err) {
      console.error("❌ Gamification refresh error:", err);
      setError(err.message);
    }
  };

  // Context value with all gamification data and functions
  const value = {
    // Raw data
    xp: gamificationData.xp,
    currentStreak: gamificationData.currentStreak,
    longestStreak: gamificationData.longestStreak,
    badgeCount: gamificationData.badgeCount,
    earnedBadges: gamificationData.earnedBadges,
    lastActivityDate: gamificationData.lastActivityDate,

    // Additional data
    xpHistory,
    allBadges,

    // XP notification state
    xpNotification,

    // State
    loading,
    error,

    // Functions
    refreshData,
    awardXP: (xpAmount, sourceType, sourceId) => awardXP(user?.id, xpAmount, sourceType, sourceId),
    awardXPWithNotification,
    showXPNotification,
    updateStreak: () => updateStreak(user?.id),
    checkAndAwardBadges: () => checkAndAwardBadges(user?.id),
    processDailyLogin: () => processDailyLogin(user?.id),

    // Aliases for backwards compatibility
    streak: gamificationData.currentStreak,
    badges: gamificationData.badgeCount
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

/**
 * Hook to use gamification data
 * Must be used within GamificationProvider
 * @returns {Object} Gamification data including xp, streak, badges, etc
 */
const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};

export default useGamification;