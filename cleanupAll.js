const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

(async () => {
  try {
    console.log('🗑️  Deleting remaining broken lessons (old seed data)...\n');

    // Delete the old broken lessons
    const brokenIds = [2, 5, 6, 7, 8, 9, 38, 40, 41, 42, 43];

    const { error: delErr } = await supabase
      .from('lessons')
      .delete()
      .in('id', brokenIds);

    if (delErr) throw delErr;

    console.log(`✅ Deleted ${brokenIds.length} broken lessons\n`);

    console.log('✨ Database cleanup complete!\n');
    console.log('Remaining healthy lessons:');
    console.log('  ✅ ID 1:  Python Basics (order_index=1, parts=4)');
    console.log('  ✅ ID 39: Variables and Data Types (order_index=2, parts=3)');
    console.log('  ✅ ID 3:  Control Flow (order_index=3, parts=2)');
    console.log('  ✅ ID 4:  Lists and Collections/Strings (order_index=4, parts=5)');
    console.log('\nReady to generate new lessons starting at order_index=5!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
