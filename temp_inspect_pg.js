const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
(async () => {
  try {
    const { data, error } = await supabase.from('pg_proc').select('oid,proname').limit(5);
    console.log('error:', error);
    console.log('data:', data);
  } catch (e) {
    console.error(e.message || e);
  }
})();
