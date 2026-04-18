const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

(async () => {
  try {
    // Get users with gamification data
    const { data: usersWithXp, error: xpError } = await supabase
      .from('user_xp')
      .select('user_id, total_xp')
      .order('total_xp', { ascending: false })
      .limit(5);

    console.log('Users with XP:');
    usersWithXp?.forEach(u => console.log('  ' + u.user_id + ': ' + u.total_xp + ' XP'));

    // Get users with streaks
    const { data: usersWithStreaks, error: streakError } = await supabase
      .from('user_streaks')
      .select('user_id, current_streak, longest_streak')
      .order('current_streak', { ascending: false })
      .limit(5);

    console.log('Users with streaks:');
    usersWithStreaks?.forEach(u => console.log('  ' + u.user_id + ': current=' + u.current_streak + ', longest=' + u.longest_streak));

    // Get users with badges
    const { data: badgeData, error: badgeError } = await supabase
      .from('user_badges')
      .select('user_id');

    if (badgeData) {
      const counts = {};
      badgeData.forEach(row => {
        counts[row.user_id] = (counts[row.user_id] || 0) + 1;
      });
      const usersWithBadges = Object.entries(counts)
        .map(([user_id, count]) => ({ user_id, badge_count: count }))
        .sort((a, b) => b.badge_count - a.badge_count)
        .slice(0, 5);

      console.log('Users with badges:');
      usersWithBadges.forEach(u => console.log('  ' + u.user_id + ': ' + u.badge_count + ' badges'));
    }

    // Test badge awarding for a user with XP
    if (usersWithXp && usersWithXp.length > 0) {
      const testUserId = usersWithXp[0].user_id;
      console.log('\nTesting badge awarding for user: ' + testUserId);

      const { data: badgeResult, error: badgeTestError } = await supabase.rpc('check_and_award_badges', {
        p_user_id: testUserId
      });

      console.log('Badge awarding result:', badgeResult);
      if (badgeTestError) console.error('Badge test error:', badgeTestError);
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
})();