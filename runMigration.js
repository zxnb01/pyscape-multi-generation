#!/usr/bin/env node
/**
 * Execute migration 014 against Supabase - Module 1 Lesson Parts Population
 * Usage: npm run migrate
 * 
 * This script populates the lessons.parts column for Module 1 lessons
 * with their complete level data (previously hardcoded in LevelPage.js)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file:');
  console.error('  - REACT_APP_SUPABASE_URL');
  console.error('  - REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importMigrationData() {
  try {
    console.log('🔍 Reading migration data from 014_populate_lesson_parts.sql...');
    
    const migrationPath = path.join(__dirname, 'migrations', '014_populate_lesson_parts.sql');
    let sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments and extra whitespace
    sqlContent = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Extract UPDATE statements - handle multi-line JSON
    // Pattern: UPDATE lessons SET parts = '[...]'::jsonb WHERE module_id = 1 AND order_index = N;
    const updatePattern = /UPDATE\s+lessons\s+SET\s+parts\s*=\s*'(\[[\s\S]*?\])'::jsonb\s+WHERE\s+module_id\s*=\s*1\s+AND\s+order_index\s*=\s*(\d+);/gi;
    
    let match;
    let updates = [];

    while ((match = updatePattern.exec(sqlContent)) !== null) {
      const jsonStr = match[1];
      const orderIndex = parseInt(match[2]);
      
      try {
        // Unescape quotes within the JSON string
        const unescaped = jsonStr.replace(/\\'/g, "'");
        const partsArray = JSON.parse(unescaped);
        updates.push({ orderIndex, partsArray });
      } catch (e) {
        console.warn(`⚠️  Failed to parse JSON for lesson with order_index=${orderIndex}:`, e.message);
      }
    }

    if (updates.length === 0) {
      console.error('❌ No UPDATE statements found in migration file');
      console.error('Expected format: UPDATE lessons SET parts = \'[...]\' WHERE module_id = 1 AND order_index = N;');
      process.exit(1);
    }

    console.log(`\n📤 Found ${updates.length} lesson updates to apply...\n`);

    // Fetch Module 1 lessons to get their IDs
    const { data: lessons, error: fetchErr } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('module_id', 1)
      .order('order_index', { ascending: true });

    if (fetchErr) {
      console.error('❌ Failed to fetch Module 1 lessons:', fetchErr.message);
      process.exit(1);
    }

    console.log(`✅ Found ${lessons.length} Module 1 lessons in database\n`);

    // Apply updates
    let successCount = 0;
    for (const update of updates) {
      const lesson = lessons.find(l => l.order_index === update.orderIndex);
      
      if (!lesson) {
        console.warn(`⚠️  No lesson found with order_index=${update.orderIndex}`);
        continue;
      }

      const { error } = await supabase
        .from('lessons')
        .update({ parts: update.partsArray })
        .eq('id', lesson.id);

      if (error) {
        console.error(`❌ Failed to update lesson ID ${lesson.id}:`, error.message);
        continue;
      }

      const levelCount = update.partsArray.length;
      const firstPartTitle = update.partsArray[0]?.title || 'Unknown';
      console.log(`✅ Lesson ${update.orderIndex} (${lesson.title}): Updated with ${levelCount} parts`);
      console.log(`   First part: "${firstPartTitle}"\n`);
      
      successCount++;
    }

    console.log(`\n📊 Summary: ${successCount}/${updates.length} lessons successfully updated`);

    // Verify the results
    console.log('\n🔍 Verification - Module 1 Lessons with Parts:\n');
    const { data: verifyLessons, error: verifyErr } = await supabase
      .from('lessons')
      .select('id, title, order_index, parts')
      .eq('module_id', 1)
      .order('order_index', { ascending: true });

    if (verifyErr) {
      console.error('❌ Verification failed:', verifyErr.message);
      process.exit(1);
    }

    for (const lesson of verifyLessons) {
      if (lesson.parts && Array.isArray(lesson.parts) && lesson.parts.length > 0) {
        console.log(`✅ Lesson ${lesson.order_index}: ${lesson.title}`);
        console.log(`   📚 Contains ${lesson.parts.length} parts:`);
        lesson.parts.forEach((part, idx) => {
          const indicator = idx === lesson.parts.length - 1 ? '└─' : '├─';
          console.log(`   ${indicator} [${idx + 1}] ${part.title}`);
        });
      } else {
        console.log(`⚠️  Lesson ${lesson.order_index}: ${lesson.title} (no parts)`);
      }
      console.log('');
    }

    console.log('✅ Migration complete!');
    console.log('🎉 Module 1 lessons are now populated with lesson parts.');
    console.log('💡 The Learn feature should now display all levels from the database.\n');
    
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during migration:', err.message);
    console.error(err);
    process.exit(1);
  }
}

// Run the migration
importMigrationData();
