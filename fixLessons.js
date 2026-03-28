/**
 * Quick fix for lessons with missing parts data
 * This will find all lessons with NULL/undefined parts and delete them so they can be regenerated
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixBrokenLessons() {
  try {
    console.log('🔍 Finding lessons with missing parts...');

    // Find all lessons in module 1
    const { data: allLessons, error: fetchErr } = await supabase
      .from('lessons')
      .select('id, title, order_index, parts')
      .eq('module_id', 1)
      .order('order_index', { ascending: true });

    if (fetchErr) throw fetchErr;

    console.log(`\n📊 Module 1 has ${allLessons.length} lessons:`);

    const brokenLessons = [];
    const healthyLessons = [];

    for (const lesson of allLessons) {
      const hasParts = lesson.parts && Array.isArray(lesson.parts) && lesson.parts.length > 0;
      const status = hasParts ? '✅' : '❌';
      const partsCount = Array.isArray(lesson.parts) ? lesson.parts.length : 0;
      
      console.log(`${status} [${lesson.order_index}] ${lesson.title} (id=${lesson.id}, parts=${partsCount})`);

      if (!hasParts) {
        brokenLessons.push(lesson);
      } else {
        healthyLessons.push(lesson);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Healthy: ${healthyLessons.length}`);
    console.log(`   ❌ Broken: ${brokenLessons.length}`);

    if (brokenLessons.length > 0) {
      console.log('\n🗑️  Broken lessons to delete:');
      brokenLessons.forEach(l => console.log(`   - [${l.order_index}] ${l.title} (id=${l.id})`));

      console.log('\n⚠️  These lessons will be deleted and can be regenerated with valid parts data.');
      console.log('   To delete, run: node fixLessons.js --delete\n');
    } else {
      console.log('\n✨ All lessons have valid parts! No fixes needed.\n');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

async function deleteBrokenLessons() {
  try {
    console.log('🗑️  Deleting broken lessons...');

    // Find all lessons in module 1 with NULL or empty parts
    const { data: brokenLessons, error: fetchErr } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('module_id', 1)
      .or('parts.is.null,parts.eq.empty');

    if (fetchErr) throw fetchErr;

    if (brokenLessons.length === 0) {
      console.log('✅ No broken lessons found.');
      return;
    }

    console.log(`Found ${brokenLessons.length} broken lessons:`);
    brokenLessons.forEach(l => console.log(`   - ${l.title} (id=${l.id})`));

    // Note: Cascade delete will happen automatically due to FK constraints
    for (const lesson of brokenLessons) {
      const { error: delErr } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (delErr) {
        console.error(`❌ Failed to delete lesson ${lesson.id}:`, delErr.message);
      } else {
        console.log(`✅ Deleted lesson ${lesson.id}: ${lesson.title}`);
      }
    }

    console.log('\n✨ Cleanup complete! Regenerate lessons with the fixed code.\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
if (args.includes('--delete')) {
  deleteBrokenLessons();
} else {
  fixBrokenLessons();
}
