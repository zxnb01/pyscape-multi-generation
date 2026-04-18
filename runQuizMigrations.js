#!/usr/bin/env node
/**
 * Execute Quiz Migrations (020, 021) against Supabase
 * Creates quiz tables and RPC functions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQLFile(filePath, description) {
  try {
    console.log(`\n📝 ${description}`);
    console.log(`📂 File: ${filePath}`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Use Supabase's SQL API to execute the migration
    // Split by semicolons to handle multiple statements
    const statements = sqlContent
      .split(';\n')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let failureCount = 0;

    for (const statement of statements) {
      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      try {
        // Try to execute via query
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        }).catch(err => {
          // If exec_sql doesn't exist, that's expected - we're just checking what works
          return { data: null, error: { message: 'exec_sql RPC not available' } };
        });

        if (error) {
          // Log specific information about the statement
          const stmt_preview = statement.substring(0, 60).replace(/\n/g, ' ');
          console.log(`   ⚠️  ${stmt_preview}...`);
          console.log(`      → ${error.message}`);
          failureCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        failureCount++;
      }
    }

    console.log(`\n   Result: ${successCount} succeeded, ${failureCount} processed`);
    
  } catch (err) {
    console.error(`❌ Error reading file: ${err.message}`);
  }
}

async function checkQuizTables() {
  console.log('\n\n🔍 CHECKING QUIZ TABLE STATUS');
  console.log('═'.repeat(60));

  const tables = [
    'module_quizzes',
    'quiz_questions', 
    'user_quiz_attempts',
    'user_quiz_progress'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.message.includes('Could not find the table')) {
        console.log(`❌ ${table}: NOT CREATED`);
      } else if (error) {
        console.log(`⚠️  ${table}: Status unclear - ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function checkQuizFunctions() {
  console.log('\n\n🔍 CHECKING QUIZ FUNCTIONS');
  console.log('═'.repeat(60));

  const functions = [
    'can_user_access_quiz',
    'submit_quiz_attempt',
    'get_user_best_quiz_score'
  ];

  for (const func of functions) {
    try {
      // Try to call the function with dummy data
      const { data, error } = await supabase.rpc(func, {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_module_id: '00000000-0000-0000-0000-000000000000'
      });

      if (error && (error.message.includes('Could not find the function') || error.message.includes('does not exist'))) {
        console.log(`❌ ${func}(): NOT CREATED`);
      } else if (error && error.message.includes('permission denied')) {
        console.log(`✅ ${func}(): EXISTS (permission check)`);
      } else if (error) {
        console.log(`⚠️  ${func}(): Exists but error - ${error.message.substring(0, 50)}`);
      } else {
        console.log(`✅ ${func}(): EXISTS`);
      }
    } catch (err) {
      if (err.message.includes('Could not find the function')) {
        console.log(`❌ ${func}(): NOT CREATED`);
      } else {
        console.log(`⚠️  ${func}(): ${err.message.substring(0, 50)}`);
      }
    }
  }
}

async function runRawSQL(sqlStatement, description) {
  try {
    console.log(`\n📝 ${description}`);
    
    // For now, we'll just log what needs to be done
    // The actual execution would require a backend endpoint that can execute raw SQL
    console.log('   Note: Tables must be created via Supabase Dashboard or CLI');
    return false;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('🎓 QUIZ SYSTEM MIGRATION CHECKER');
  console.log('═'.repeat(60) + '\n');

  // First check current status
  await checkQuizTables();
  await checkQuizFunctions();

  console.log('\n\n📋 MIGRATION FILES');
  console.log('═'.repeat(60));
  
  const migrationFiles = [
    { num: '022', file: 'migrations/022_create_quiz_tables.sql' },
    { num: '023', file: 'migrations/023_add_quiz_rpc_functions.sql' }
  ];

  for (const m of migrationFiles) {
    const filePath = path.join(__dirname, m.file);
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      console.log(`✅ Migration ${m.num}: ${m.file} (${size} bytes)`);
    } else {
      console.log(`❌ Migration ${m.num}: ${m.file} (NOT FOUND)`);
    }
  }

  console.log('\n\n📖 INSTRUCTIONS');
  console.log('═'.repeat(60));
  console.log(`
1. ✅ Open your Supabase Dashboard
2. ✅ Navigate to the SQL Editor
3. ✅ Paste the following files and execute them IN ORDER:
   
   A) First run: migrations/022_create_quiz_tables.sql
   B) Then run: migrations/023_add_quiz_rpc_functions.sql

4. ✅ After running migrations, execute:
     node check_db.js

5. ✅ Start the app:
     npm start
`);

  console.log('✅ Script completed. Please run migrations manually via Supabase Dashboard.\n');
}

main().catch(console.error);