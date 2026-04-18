import supabase from "../utils/supabaseClient";

/**
 * GAMIFICATION SERVICE
 * Handles all XP, streak, and badge operations
 * Production-ready with complete error handling
 */

// ============================================================================
// 🎯 AWARD XP
// ============================================================================
/**
 * Ensure user gamification records exist
 */
const ensureUserGamificationRecords = async (userId) => {
  if (!userId) return;

  try {
    // Ensure user_xp exists
    const xpResponse = await supabase
      .from('user_xp')
      .select('id')
      .eq('user_id', userId)
      .single();
    const xpData = xpResponse?.data;
    const xpError = xpResponse?.error;

    if (!xpData || xpError) {
      console.log(`📝 Creating user_xp record for ${userId}`);
      const { error: insertError } = await supabase
        .from('user_xp')
        .insert({ user_id: userId, total_xp: 0 });
      if (insertError) console.warn('⚠️ Could not create user_xp:', insertError.message);
    }

    // Ensure user_streaks exists
    const streakResponse = await supabase
      .from('user_streaks')
      .select('id')
      .eq('user_id', userId)
      .single();
    const streakData = streakResponse?.data;
    const streakError = streakResponse?.error;

    if (!streakData || streakError) {
      console.log(`📝 Creating user_streaks record for ${userId}`);
      const { error: insertError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null
        });
      if (insertError) console.warn('⚠️ Could not create user_streaks:', insertError.message);
    }
  } catch (err) {
    console.warn('⚠️ Error ensuring gamification records:', err.message);
  }
};

// ============================================================================
// 🎯 AWARD XP
// ============================================================================
/**
 * Award XP for a lesson/project completion
 * @param {string} userId - User UUID
 * @param {number} xpAmount - Amount of XP to award
 * @param {string} sourceType - 'lesson', 'project', 'quiz', 'bonus'
 * @param {number} sourceId - Source ID (lesson_id, project_id, etc)
 * @returns {Promise<{xpAwarded: number, totalXP: number}>}
 */
export const awardXP = async (userId, xpAmount, sourceType, sourceId) => {
  const isValidUserId = typeof userId === "string" && userId.trim() !== "";
  const isValidXpAmount = Number.isFinite(xpAmount) && xpAmount > 0;

  if (!isValidUserId || !isValidXpAmount || !sourceType) {
    console.error(
      "❌ Invalid parameters to awardXP",
      { userId, xpAmount, sourceType, sourceId }
    );
    return { xpAwarded: 0, totalXP: 0 };
  }

  console.log(
    `🎯 Awarding XP: user=${userId}, amount=${xpAmount}, type=${sourceType}, id=${sourceId}`
  );

  try {
    // Ensure records exist first
    await ensureUserGamificationRecords(userId);

    // Use the stored procedure to award XP
    const { data, error } = await supabase.rpc("award_xp", {
      p_user_id: userId,
      p_xp_amount: xpAmount,
      p_source_type: sourceType,
      p_source_id: sourceId
    });

    if (error) {
      console.error("❌ XP award RPC error:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      return { xpAwarded: 0, totalXP: 0 };
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No data returned from award_xp function");
      return { xpAwarded: 0, totalXP: 0 };
    }

    const result = data[0];
    const xpAwarded = result.xp_awarded || 0;
    const totalXP = result.total_xp || 0;

    console.log(`✅ XP awarded: ${xpAwarded}, Total XP: ${totalXP}`);
    return { xpAwarded, totalXP };
  } catch (err) {
    console.error("❌ Award XP failed:", err.message);
    return { xpAwarded: 0, totalXP: 0 };
  }
};
// ============================================================================
/**
 * Update user's streak
 * @param {string} userId - User UUID
 * @returns {Promise<{currentStreak: number, longestStreak: number}>}
 */
export const updateStreak = async (userId) => {
  if (!userId) {
    console.error("❌ Invalid user ID for updateStreak");
    return { currentStreak: 0, longestStreak: 0 };
  }

  console.log(`� Updating streak for user: ${userId}`);

  try {
    // First ensure user_streaks record exists
    const { data: streakCheck, error: checkError } = await supabase
      .from('user_streaks')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError || !streakCheck) {
      console.log(`📝 Creating initial streak record for user: ${userId}`);
      const { error: insertError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString()
        });
      
      if (insertError) {
        console.warn('⚠️ Could not create initial streak:', insertError.message);
      } else {
        console.log('✅ Initial streak record created');
      }
    }

    // Now call the RPC function
    const { data, error } = await supabase.rpc("update_streak", {
      p_user_id: userId
    });

    if (error) {
      console.error("❌ Streak update RPC error:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      return { currentStreak: 0, longestStreak: 0 };
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No data returned from update_streak function");
      // Fetch from table directly as fallback
      const { data: fallbackData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .single();
      
      return {
        currentStreak: fallbackData?.current_streak || 0,
        longestStreak: fallbackData?.longest_streak || 0
      };
    }

    const result = data[0];
    const currentStreak = result.current_streak || 0;
    const longestStreak = result.longest_streak || 0;
    const debugMsg = result.debug_message || '';

    console.log(`✅ Streak updated: current=${currentStreak}, longest=${longestStreak}`);
    if (debugMsg) {
      console.log(`   Debug: ${debugMsg}`);
    }
    return { currentStreak, longestStreak };
  } catch (err) {
    console.error("❌ Streak update failed:", err.message);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

// ============================================================================
// 🏆 CHECK AND AWARD BADGES
// ============================================================================
/**
 * Check eligibility and award badges to user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of newly earned badges with {id, title, icon}
 */
export const checkAndAwardBadges = async (userId) => {
  if (!userId) {
    console.error("❌ Invalid user ID for checkAndAwardBadges");
    return [];
  }

  console.log(`🏆 Checking badges for user: ${userId}`);

  try {
    // Ensure basic gamification records exist before badge evaluation
    await ensureUserGamificationRecords(userId);

    // Call the RPC function to check and award badges
    const { data, error } = await supabase.rpc("check_and_award_badges", {
      p_user_id: userId
    });

    if (error) {
      console.error("❌ Badge check RPC error:", error.message, error.details, error.hint);
      return [];
    }

    const newBadges = data || [];
    console.log(`✅ Badge check result: ${newBadges.length} new badges earned`);
    
    if (newBadges.length > 0) {
      newBadges.forEach((b) => {
        console.log(`  🏅 ${b.title || b.id} - ${b.icon || '?'}`);
      });
    }
    
    return newBadges;
  } catch (err) {
    console.error("❌ Check badges failed:", err.message);
    return [];
  }
};

// Alias for backwards compatibility
export const checkBadges = checkAndAwardBadges;

// ============================================================================
// 📊 GET USER GAMIFICATION DATA
// ============================================================================
/**
 * Get all gamification data for a user
 * @param {string} userId - User UUID
 * @returns {Promise<{xp, currentStreak, longestStreak, badgeCount, earnedBadges, lastActivityDate}>}
 */
export const getUserGamificationData = async (userId) => {
  if (!userId) {
    console.warn("⚠️ Invalid user ID for getUserGamificationData");
    return {
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      badgeCount: 0,
      earnedBadges: [],
      lastActivityDate: null
    };
  }

  try {
    console.log(`📊 Fetching gamification data for user: ${userId}`);
    
    // Fetch all data in parallel
    const [xpResult, streakResult, achievementsResult] = await Promise.all([
      supabase
        .from("user_xp")
        .select("total_xp")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("user_id", userId)
        .maybeSingle(),
      getUserAchievements(userId)
    ]);

    // Log if any query returned an error
    if (xpResult?.error) {
      console.warn('⚠️ user_xp query error:', xpResult.error);
    }
    if (streakResult?.error) {
      console.warn('⚠️ user_streaks query error:', streakResult.error);
    }

    // Extract XP data
    const xp = xpResult?.data?.total_xp || 0;
    const historyXp = await getTotalXpFromHistory(userId);
    const normalizedXp = Math.max(xp, historyXp);

    if (historyXp > xp) {
      console.log(`⚠️ user_xp appears stale. Recalculating from xp_history: ${historyXp}`);
      await supabase.from('user_xp').upsert(
        { user_id: userId, total_xp: historyXp },
        { onConflict: 'user_id' }
      );
    }

    console.log(`💰 XP: ${normalizedXp}`);

    // Extract streak data (handle if user_streaks doesn't exist or is empty)
    let currentStreak = 0;
    let longestStreak = 0;
    let lastActivityDate = null;
    
    if (streakResult.data) {
      currentStreak = streakResult.data.current_streak || 0;
      longestStreak = streakResult.data.longest_streak || 0;
      lastActivityDate = streakResult.data.last_activity_date || null;
      console.log(`🔥 Streaks found: current=${currentStreak}, longest=${longestStreak}`);
    } else if (streakResult.error) {
      console.warn(`⚠️ Streak data not found, initializing...`);
      currentStreak = 0;
      longestStreak = 0;
    }

    // Extract badge data
    const earnedBadges = achievementsResult || [];
    const badgeCount = earnedBadges.length;
    console.log(`🏆 Badges earned: ${badgeCount}`);

    return {
      xp: normalizedXp,
      currentStreak,
      longestStreak,
      badgeCount,
      earnedBadges,
      lastActivityDate
    };
  } catch (err) {
    console.error("❌ Get gamification data failed:", err.message);
    return {
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      badgeCount: 0,
      earnedBadges: [],
      lastActivityDate: null
    };
  }
};

// ============================================================================
// 📊 GET XP TOTAL FROM HISTORY
// ============================================================================
/**
 * Get total XP from xp_history records for a user
 * @param {string} userId - User UUID
 * @returns {Promise<number>} Total XP earned from history
 */
async function getTotalXpFromHistory(userId) {
  if (!userId) {
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('xp_history')
      .select('xp_earned')
      .eq('user_id', userId);

    if (error) {
      console.warn('⚠️ xp_history total fetch error:', error.message || error);
      return 0;
    }

    return (data || []).reduce((sum, item) => sum + (item?.xp_earned || 0), 0);
  } catch (err) {
    console.warn('⚠️ getTotalXpFromHistory failed:', err.message || err);
    return 0;
  }
}

// ============================================================================
// 🏅 GET USER ACHIEVEMENTS (EARNED BADGES)
// ============================================================================
/**
 * Get all badges earned by a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of badges with {id, earned_at, badges}
 */
export const getUserAchievements = async (userId) => {
  if (!userId) {
    console.warn("⚠️ No user ID provided to getUserAchievements");
    return [];
  }

  try {
    console.log(`🏅 Fetching achievements for user: ${userId}`);
    
    // Query user_badges with badge details
    const { data, error } = await supabase
      .from("user_badges")
      .select(
        `
        id,
        earned_at,
        badge_id,
        badges ( id, title, description, icon, badge_type, requirement_value )
      `
      )
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.warn("⚠️ Achievements fetch error:", JSON.stringify(error));
      const fallback = await supabase
        .from('user_badges')
        .select(
          `id, earned_at, badge_id, badges(id, title, description, icon, badge_type, requirement_value)`
        )
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (fallback.error) {
        console.warn('⚠️ user_badges fallback error:', fallback.error.message || fallback.error);
        return [];
      }

      return (fallback.data || []).map((row) => ({
        ...row,
        badges: row.badges || {
          id: row.badge_id,
          title: null,
          description: null,
          icon: null,
          badge_type: null,
          requirement_value: null
        }
      }));
    }

    if (!data) {
      console.log("ℹ️ No achievements found for user");
      return [];
    }

    console.log(`✅ Found ${data.length} achievements`);
    return data || [];
  } catch (err) {
    console.error("❌ Get achievements failed:", err.message);
    return [];
  }
};

// Alias for backwards compatibility
export const getUserBadges = getUserAchievements;

// ============================================================================
// 📈 GET XP HISTORY
// ============================================================================
/**
 * Get XP earning history for a user
 * @param {string} userId - User UUID
 * @param {number} limit - Max number of records to return
 * @returns {Promise<Array>}
 */
export const getXPHistory = async (userId, limit = 20) => {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("xp_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("⚠️ XP history fetch error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn("⚠️ Get XP history failed:", err.message);
    return [];
  }
};

// ============================================================================
// 🏅 GET ALL AVAILABLE BADGES
// ============================================================================
/**
 * Get all badge definitions
 * @returns {Promise<Array>} Array of all badges
 */
export const getAllBadges = async () => {
  try {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("badge_type")
      .order("requirement_value");

    if (error) {
      console.warn("⚠️ Get all badges error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn("⚠️ Get badges failed:", err.message);
    return [];
  }
};

// ============================================================================
// 🎯 CONVENIENCE FUNCTIONS FOR LESSON/PROJECT COMPLETION
// ============================================================================
/**
 * Award XP and update gamification for lesson completion
 * @param {string} userId - User UUID
 * @param {number} lessonId - Lesson ID
 * @param {number} xpAmount - XP to award (default 50)
 * @param {string} lessonType - Type of lesson: 'read', 'quiz', 'code', 'labTrigger' (default: 'read')
 * @returns {Promise<{xpAwarded, totalXP, newBadges}>}
 */
export const awardLessonXP = async (userId, lessonId, xpAmount = 50, lessonType = 'read') => {
  if (!userId || !lessonId) {
    console.error("❌ Invalid parameters to awardLessonXP");
    return { xpAwarded: 0, totalXP: 0, newBadges: [] };
  }

  try {
    // Track source type based on lesson type
    const sourceType = lessonType === 'labTrigger' ? 'project_lesson' : 'lesson';
    
    // Step 1: Award XP
    const xpResult = await awardXP(userId, xpAmount, sourceType, lessonId);

    // Step 2: Update streak
    const streakResult = await updateStreak(userId);

    // Step 3: Check and award badges
    const newBadges = await checkAndAwardBadges(userId);

    if (xpResult.xpAwarded === 0) {
      console.warn("⚠️ No XP awarded (possibly duplicate), but streak and badge checks still ran", { userId, lessonId, xpAmount, lessonType });
      return { ...xpResult, newBadges, streakResult };
    }

    const logPrefix = lessonType === 'labTrigger' ? '📊 Project Lesson' : '✅ Lesson';
    console.log(
      `${logPrefix} XP awarded: xp=${xpResult.xpAwarded}, total=${xpResult.totalXP}, currentStreak=${streakResult.currentStreak}, longestStreak=${streakResult.longestStreak}, badges=${newBadges.length}`
    );

    return {
      xpAwarded: xpResult.xpAwarded,
      totalXP: xpResult.totalXP,
      newBadges,
      streakResult
    };
  } catch (err) {
    console.error("❌ Award lesson XP failed:", err);
    return { xpAwarded: 0, totalXP: 0, newBadges: [], streakResult: { currentStreak: 0, longestStreak: 0 } };
  }
};

/**
 * Award XP and update gamification for a specific lesson level
 * @param {string} userId - User UUID
 * @param {number} lessonId - Lesson ID
 * @param {number} levelNumber - Level within the lesson
 * @param {number} xpAmount - XP to award (default 10)
 * @param {string} lessonType - Type of lesson: 'read', 'quiz', 'code', 'labTrigger' (default: 'read')
 * @returns {Promise<{xpAwarded, totalXP, newBadges}>}
 */
export const awardLevelXP = async (userId, lessonId, levelNumber, xpAmount = 10, lessonType = 'read') => {
  if (!userId || !lessonId || !levelNumber) {
    console.error("❌ Invalid parameters to awardLevelXP", { userId, lessonId, levelNumber, xpAmount, lessonType });
    return { xpAwarded: 0, totalXP: 0, newBadges: [] };
  }

  try {
    // Track source type based on lesson type for proper categorization
    const sourceType = lessonType === 'labTrigger' 
      ? `project_lesson_level_${levelNumber}`
      : `lesson_level_${levelNumber}`;
    
    const xpResult = await awardXP(userId, xpAmount, sourceType, lessonId);
    const streakResult = await updateStreak(userId);
    const newBadges = await checkAndAwardBadges(userId);

    if (xpResult.xpAwarded === 0) {
      console.warn("⚠️ No XP awarded for level (possibly duplicate), but streak and badge checks still ran", { userId, lessonId, levelNumber, xpAmount, lessonType });
      return { ...xpResult, newBadges, streakResult };
    }

    const logPrefix = lessonType === 'labTrigger' ? '📊 Project Lesson' : '✅ Regular Lesson';
    console.log(
      `${logPrefix} XP awarded: lesson=${lessonId}, level=${levelNumber}, xp=${xpResult.xpAwarded}, total=${xpResult.totalXP}, currentStreak=${streakResult.currentStreak}, longestStreak=${streakResult.longestStreak}, badges=${newBadges.length}`
    );

    return {
      xpAwarded: xpResult.xpAwarded,
      totalXP: xpResult.totalXP,
      newBadges,
      streakResult
    };
  } catch (err) {
    console.error("❌ Award level XP failed:", err);
    return { xpAwarded: 0, totalXP: 0, newBadges: [], streakResult: { currentStreak: 0, longestStreak: 0 } };
  }
};

/**
 * Award XP and update gamification for project completion
 * @param {string} userId - User UUID
 * @param {number} projectId - Project ID
 * @param {number} xpAmount - XP to award (default 100)
 * @returns {Promise<{xpAwarded, totalXP, newBadges}>}
 */
export const awardProjectXP = async (userId, projectId, xpAmount = 100) => {
  if (!userId || !projectId) {
    console.error("❌ Invalid parameters to awardProjectXP");
    return { xpAwarded: 0, totalXP: 0, newBadges: [] };
  }

  try {
    // Step 1: Award XP
    const xpResult = await awardXP(userId, xpAmount, "project", projectId);

    // Step 2: Update streak
    const streakResult = await updateStreak(userId);

    // Step 3: Check and award badges
    const newBadges = await checkAndAwardBadges(userId);

    if (xpResult.xpAwarded === 0) {
      console.warn("⚠️ No XP awarded (possibly duplicate), but streak and badge checks still ran", { userId, projectId, xpAmount });
      return { ...xpResult, newBadges, streakResult };
    }

    console.log(
      `✅ Project XP awarded: xp=${xpResult.xpAwarded}, total=${xpResult.totalXP}, currentStreak=${streakResult.currentStreak}, longestStreak=${streakResult.longestStreak}, badges=${newBadges.length}`
    );

    return {
      xpAwarded: xpResult.xpAwarded,
      totalXP: xpResult.totalXP,
      newBadges,
      streakResult
    };
  } catch (err) {
    console.error("❌ Award project XP failed:", err);
    return { xpAwarded: 0, totalXP: 0, newBadges: [], streakResult: { currentStreak: 0, longestStreak: 0 } };
  }
};

/**
 * Award XP and update gamification for quiz completion
 * @param {string} userId - User UUID
 * @param {number} quizId - Quiz ID
 * @param {number} xpAmount - XP to award (default 25)
 * @returns {Promise<{xpAwarded, totalXP, newBadges}>}
 */
export const awardQuizXP = async (userId, quizId, xpAmount = 25) => {
  if (!userId || !quizId) {
    console.error("❌ Invalid parameters to awardQuizXP");
    return { xpAwarded: 0, totalXP: 0, newBadges: [] };
  }

  try {
    // Step 1: Award XP
    const xpResult = await awardXP(userId, xpAmount, "quiz", quizId);

    // Step 2: Update streak
    const streakResult = await updateStreak(userId);

    // Step 3: Check and award badges
    const newBadges = await checkAndAwardBadges(userId);

    if (xpResult.xpAwarded === 0) {
      console.warn("⚠️ No XP awarded (possibly duplicate), but streak and badge checks still ran", { userId, quizId, xpAmount });
      return { ...xpResult, newBadges, streakResult };
    }

    console.log(
      `✅ Quiz XP awarded: xp=${xpResult.xpAwarded}, total=${xpResult.totalXP}, currentStreak=${streakResult.currentStreak}, longestStreak=${streakResult.longestStreak}, badges=${newBadges.length}`
    );

    return {
      xpAwarded: xpResult.xpAwarded,
      totalXP: xpResult.totalXP,
      newBadges,
      streakResult
    };
  } catch (err) {
    console.error("❌ Award quiz XP failed:", err);
    return { xpAwarded: 0, totalXP: 0, newBadges: [], streakResult: { currentStreak: 0, longestStreak: 0 } };
  }
};

/**
 * Award XP and update gamification for project lesson part completion
 * @param {string} userId - User UUID
 * @param {number} projectLessonId - Project lesson ID
 * @param {number} partLevel - Part level within the project lesson
 * @param {number} xpAmount - XP to award (default 15 for project parts)
 * @returns {Promise<{xpAwarded, totalXP, newBadges}>}
 */
export const awardProjectLessonPartXP = async (userId, projectLessonId, partLevel, xpAmount = 15) => {
  if (!userId || !projectLessonId || !partLevel) {
    console.error("❌ Invalid parameters to awardProjectLessonPartXP", { userId, projectLessonId, partLevel, xpAmount });
    return { xpAwarded: 0, totalXP: 0, newBadges: [] };
  }

  try {
    // Track as "project_lesson_part" to distinguish from regular lesson parts
    const sourceType = `project_lesson_part_${partLevel}`;
    const xpResult = await awardXP(userId, xpAmount, sourceType, projectLessonId);
    const streakResult = await updateStreak(userId);
    const newBadges = await checkAndAwardBadges(userId);

    if (xpResult.xpAwarded === 0) {
      console.warn("⚠️ No XP awarded for project lesson part (possibly duplicate), but streak and badge checks still ran", { userId, projectLessonId, partLevel, xpAmount });
      return { ...xpResult, newBadges, streakResult };
    }

    console.log(
      `✅ Project lesson part XP awarded: projectLesson=${projectLessonId}, part=${partLevel}, xp=${xpResult.xpAwarded}, total=${xpResult.totalXP}, currentStreak=${streakResult.currentStreak}, longestStreak=${streakResult.longestStreak}, badges=${newBadges.length}`
    );

    return {
      xpAwarded: xpResult.xpAwarded,
      totalXP: xpResult.totalXP,
      newBadges,
      streakResult
    };
  } catch (err) {
    console.error("❌ Award project lesson part XP failed:", err);
    return { xpAwarded: 0, totalXP: 0, newBadges: [], streakResult: { currentStreak: 0, longestStreak: 0 } };
  }
};

/**
 * Process daily login rewards and streak maintenance
 * @param {string} userId - User UUID
 * @returns {Promise<{xpAwarded: number, streakMaintained: boolean, currentStreak: number, longestStreak: number}>}
 */
export const processDailyLogin = async (userId) => {
  if (!userId) {
    console.error("❌ Invalid user ID for processDailyLogin");
    return { xpAwarded: 0, streakMaintained: false, currentStreak: 0, longestStreak: 0 };
  }

  console.log(`🌅 Processing daily login for user: ${userId}`);

  try {
    // Call the database function
    const { data, error } = await supabase.rpc("process_daily_login", {
      p_user_id: userId
    });

    if (error) {
      console.error("❌ Daily login RPC error:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.warn("⚠️ process_daily_login unavailable or failed; preserving streak state without updating it.");

      const { data: streakRow, error: streakError } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle();

      if (streakError) {
        console.error("❌ Failed to read user_streaks fallback:", streakError.message);
        return { xpAwarded: 0, streakMaintained: false, currentStreak: 0, longestStreak: 0 };
      }

      return {
        xpAwarded: 0,
        streakMaintained: false,
        currentStreak: streakRow?.current_streak || 0,
        longestStreak: streakRow?.longest_streak || 0
      };
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No data returned from process_daily_login function; preserving streak state without updating it.");

      const { data: streakRow, error: streakError } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle();

      if (streakError) {
        console.error("❌ Failed to read user_streaks fallback:", streakError.message);
        return { xpAwarded: 0, streakMaintained: false, currentStreak: 0, longestStreak: 0 };
      }

      return {
        xpAwarded: 0,
        streakMaintained: false,
        currentStreak: streakRow?.current_streak || 0,
        longestStreak: streakRow?.longest_streak || 0
      };
    }

    const result = data[0];
    const xpAwarded = result.xp_awarded || 0;
    const streakMaintained = result.streak_maintained || false;
    const currentStreak = result.current_streak || 0;
    const longestStreak = result.longest_streak || 0;

    console.log(`✅ Daily login processed: XP=${xpAwarded}, streakMaintained=${streakMaintained}, currentStreak=${currentStreak}, longestStreak=${longestStreak}`);

    return { xpAwarded, streakMaintained, currentStreak, longestStreak };
  } catch (err) {
    console.error("❌ Process daily login failed:", err.message);
    console.warn("⚠️ processDailyLogin failed; preserving streak state without updating it.");

    const { data: streakRow, error: streakError } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .maybeSingle();

    if (streakError) {
      console.error("❌ Failed to read user_streaks fallback:", streakError.message);
      return { xpAwarded: 0, streakMaintained: false, currentStreak: 0, longestStreak: 0 };
    }

    return {
      xpAwarded: 0,
      streakMaintained: false,
      currentStreak: streakRow?.current_streak || 0,
      longestStreak: streakRow?.longest_streak || 0
    };
  }
};