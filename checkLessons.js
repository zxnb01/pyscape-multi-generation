const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

(async () => {
  try {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, order_index, parts, skill_id')
      .eq('module_id', 1);

    console.log('\n📊 Module 1 Lessons Status:\n');
    console.log('Total lessons:', lessons?.length || 0);
    console.log('');

    lessons?.forEach(l => {
      const hasParts = l.parts && Array.isArray(l.parts);
      const count = hasParts ? l.parts.length : 0;
      const status = hasParts && count > 0 ? '✅' : '❌';
      console.log(`${status} [${String(l.order_index).padStart(2)}] ${l.title.padEnd(50)} | Parts: ${count} | ID: ${l.id}`);
    });

    const broken = lessons?.filter(l => !l.parts || !Array.isArray(l.parts) || l.parts.length === 0) || [];
    console.log(`\n⚠️  Broken lessons (no parts): ${broken.length}`);
    if (broken.length > 0) {
      broken.forEach(l => {
        console.log(`   - ID ${l.id}: ${l.title}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
