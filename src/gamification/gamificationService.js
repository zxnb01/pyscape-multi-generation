import supabase from "../utils/supabaseClient";

// 🎯 Award XP
export const awardXP = async (userId, xpAmount, sourceType, sourceId) => {
  // 1. Insert into xp_history
  await supabase.from("xp_history").insert({
    user_id: userId,
    xp_earned: xpAmount,
    source_type: sourceType,
    source_id: sourceId
  });

  // 2. Update total XP
  const { data } = await supabase
    .from("user_xp")
    .select("total_xp")
    .eq("user_id", userId)
    .single();

  const newXP = (data?.total_xp || 0) + xpAmount;

  await supabase
    .from("user_xp")
    .upsert({
      user_id: userId,
      total_xp: newXP
    });
};

// 🔥 Update streak
export const updateStreak = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) {
    // first time
    await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      last_activity_date: today
    });
    return;
  }

  const lastDate = data.last_activity_date;

  const diffDays = Math.floor(
    (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24)
  );

  let newStreak = data.current_streak;

  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  await supabase.from("user_streaks").update({
    current_streak: newStreak,
    last_activity_date: today
  }).eq("user_id", userId);
};

// 🏆 Check badges
export const checkBadges = async (userId) => {
  await supabase.rpc("check_and_award_badges", {
    p_user_id: userId
  });
};