#!/usr/bin/env node
/**
 * Execute gamification fix migrations against Supabase
 * Usage: node runGamificationMigrations.js
 *
 * This script runs migrations 022 and 023 to fix gamification issues
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

async function runMigration(migrationFile) {
  try {
    console.log(`🔍 Reading migration: ${migrationFile}`);

    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log(`🚀 Executing ${migrationFile}...`);

    // Split SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.error(`❌ Error in statement:`, error);
          console.error(`Statement was:`, statement);
          throw error;
        }
      }
    }

    console.log(`✅ ${migrationFile} completed successfully`);
  } catch (err) {
    console.error(`❌ Failed to run ${migrationFile}:`, err.message);
    throw err;
  }
}

async function main() {
  try {
    console.log('🎮 Starting gamification migration fixes...\n');

    // Run migration 022 first
    await runMigration('022_fix_gamification_permissions.sql');

    // Then run migration 023
    await runMigration('023_verify_gamification_functions.sql');

    console.log('\n🎉 All gamification migrations completed successfully!');
    console.log('🔄 You may need to refresh your app to see the changes.');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.log('\n💡 Alternative: Run the SQL files directly in your Supabase SQL Editor');
    console.log('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.log('   2. Copy and paste the contents of:');
    console.log('      - migrations/022_fix_gamification_permissions.sql');
    console.log('      - migrations/023_verify_gamification_functions.sql');
    console.log('   3. Run them in order');
    process.exit(1);
  }
}

main();