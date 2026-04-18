const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

(async () => {
  try {
    const testUserId = 'cec94623-63f3-47fb-80e9-b9d1ff68e368';
    console.log('Testing update_streak for user:', testUserId);

    const { data: streaks, error: streaksError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', testUserId);
    console.log('user_streaks row:', streaks, streaksError);

    const { data, error } = await supabase.rpc('update_streak', { p_user_id: testUserId });
    console.log('RPC update_streak returned:', data, error);

    const { data: after, error: afterErr } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', testUserId);
    console.log('user_streaks after:', after, afterErr);
  } catch (e) {
    console.error('Error:', e.message || e);
  }
})();