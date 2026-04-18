const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Try .env.local first, then .env
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkGamification() {
  try {
    console.log('Checking gamification tables...');

    // Check if tables exist
    const tables = ['user_xp', 'xp_history', 'user_streaks', 'badges', 'user_badges'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: exists`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Check if function exists
    try {
      const { data: funcData, error: funcError } = await supabase.rpc('check_and_award_badges', {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      });
      if (funcError && !funcError.message.includes('permission denied')) {
        console.log(`❌ Function check_and_award_badges: ${funcError.message}`);
      } else {
        console.log(`✅ Function check_and_award_badges: exists`);
      }
    } catch (err) {
      console.log(`❌ Function check_and_award_badges: ${err.message}`);
    }

    // Check update_streak function
    try {
      const { data: streakData, error: streakError } = await supabase.rpc('update_streak', {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      });
      if (streakError && !streakError.message.includes('permission denied')) {
        console.log(`❌ Function update_streak: ${streakError.message}`);
      } else {
        console.log(`✅ Function update_streak: exists`);
      }
    } catch (err) {
      console.log(`❌ Function update_streak: ${err.message}`);
    }

    // Check get_user_gamification_data function
    try {
      const { data: summaryData, error: summaryError } = await supabase.rpc('get_user_gamification_data', {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      });
      if (summaryError && !summaryError.message.includes('permission denied')) {
        console.log(`❌ Function get_user_gamification_data: ${summaryError.message}`);
      } else {
        console.log(`✅ Function get_user_gamification_data: exists`);
      }
    } catch (err) {
      console.log(`❌ Function get_user_gamification_data: ${err.message}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function checkQuizTables() {
  try {
    console.log('\n\nChecking quiz tables...');

    // Check if tables exist
    const tables = ['module_quizzes', 'quiz_questions', 'user_quiz_attempts', 'user_quiz_progress'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: exists`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Check if quiz RPC functions exist
    const quizFunctions = ['can_user_access_quiz', 'submit_quiz_attempt', 'get_user_best_quiz_score'];
    for (const func of quizFunctions) {
      try {
        const { data: funcData, error: funcError } = await supabase.rpc(func, {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_module_id: '00000000-0000-0000-0000-000000000000'
        });
        if (funcError && !funcError.message.includes('permission denied')) {
          console.log(`❌ Function ${func}: ${funcError.message}`);
        } else {
          console.log(`✅ Function ${func}: exists`);
        }
      } catch (err) {
        console.log(`⚠️  Function ${func}: ${err.message}`);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function runAllChecks() {
  await checkGamification();
  await checkQuizTables();
  process.exit(0);
}

runAllChecks();