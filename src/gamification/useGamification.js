import { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

const useGamification = () => {
  const { user } = useAuth();

  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        // XP
        const { data: xpData } = await supabase
          .from("user_xp")
          .select("total_xp")
          .eq("user_id", user.id)
          .single();

        setXp(xpData?.total_xp || 0);

        // STREAK
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("current_streak")
          .eq("user_id", user.id)
          .single();

        setStreak(streakData?.current_streak || 0);

        // BADGES COUNT
        const { data: badgeData } = await supabase
          .from("user_badges")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        setBadges(badgeData?.length || 0);

      } catch (err) {
        console.error("Gamification fetch error:", err);
      }
    };

    fetchData();
  }, [user]);

  return { xp, streak, badges };
};

export default useGamification;