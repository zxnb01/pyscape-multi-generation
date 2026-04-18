/**
 * Check if quizzes exist in database
 */
require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

async function checkQuizzes() {
  try {
    console.log('📊 Checking existing quizzes...\n');
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/module_quizzes`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const quizzes = await res.json();
    
    if (quizzes.length === 0) {
      console.log('❌ No quizzes found in database\n');
    } else {
      console.log(`✅ Found ${quizzes.length} quizzes:\n`);
      quizzes.forEach(q => {
        console.log(`  📚 Module ${q.module_id}: ${q.total_questions} questions`);
      });
      console.log();
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkQuizzes();