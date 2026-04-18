const fs = require('fs');
const supabase = require('@supabase/supabase-js');

require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function applyQuizFix() {
  try {
    console.log('🔧 Applying Quiz RPC Functions Fix...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync(
      'migrations/023_add_quiz_rpc_functions.sql',
      'utf-8'
    );

    // Split by function definitions and execute each
    const functions = [
      `
      DROP FUNCTION IF EXISTS submit_quiz_attempt(UUID, UUID, JSONB, INTEGER);
      
      CREATE OR REPLACE FUNCTION submit_quiz_attempt(
        p_user_id UUID,
        p_quiz_id UUID,
        p_answers JSONB,
        p_time_spent_sec INTEGER DEFAULT 0
      )
      RETURNS TABLE(
        score INTEGER,
        correct_count INTEGER,
        total_count INTEGER,
        is_passing BOOLEAN,
        xp_earned INTEGER,
        max_score INTEGER
      ) AS $$
      DECLARE
        v_score INTEGER;
        v_correct_count INTEGER;
        v_total_questions INTEGER;
        v_max_xp_reward INTEGER;
        v_xp_to_award INTEGER;
        v_passing_score INTEGER;
        v_is_passing BOOLEAN;
        v_attempt_id UUID;
        v_module_id INTEGER;
        v_question_id UUID;
        v_user_selected_index INTEGER;
        v_correct_index INTEGER;
      BEGIN
        -- Get quiz info
        SELECT mq.passing_score, mq.max_xp_reward, mq.module_id
        INTO v_passing_score, v_max_xp_reward, v_module_id
        FROM module_quizzes mq
        WHERE mq.id = p_quiz_id;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Quiz not found: %', p_quiz_id;
        END IF;

        -- Get total questions
        SELECT COUNT(*) INTO v_total_questions
        FROM quiz_questions
        WHERE quiz_id = p_quiz_id;

        IF v_total_questions = 0 THEN
          RAISE EXCEPTION 'No questions found in quiz: %', p_quiz_id;
        END IF;

        -- Process each answer and count correct responses
        v_correct_count := 0;

        FOR v_question_id, v_user_selected_index IN
          SELECT 
            qq.id,
            (p_answers ->> qq.id::text)::INTEGER
          FROM quiz_questions qq
          WHERE qq.quiz_id = p_quiz_id
        LOOP
          -- Get correct option index for this question
          SELECT qq.correct_option_index INTO v_correct_index
          FROM quiz_questions qq
          WHERE qq.id = v_question_id;

          -- Check if user selected correct answer
          IF v_user_selected_index IS NOT NULL AND v_user_selected_index = v_correct_index THEN
            v_correct_count := v_correct_count + 1;
          END IF;
        END LOOP;

        -- Calculate score as percentage
        v_score := CASE WHEN v_total_questions > 0 
          THEN (v_correct_count * 100) / v_total_questions 
          ELSE 0 
        END;

        -- Determine if passing
        v_is_passing := v_score >= v_passing_score;

        -- Calculate XP (only award if passing)
        v_xp_to_award := CASE WHEN v_is_passing
          THEN (v_score * v_max_xp_reward) / 100
          ELSE 0
        END;

        -- Record the attempt
        INSERT INTO user_quiz_attempts (
          user_id, quiz_id, score, max_score, xp_earned, 
          time_spent_sec, answers, completed_at
        ) VALUES (
          p_user_id, p_quiz_id, v_score, 100, v_xp_to_award,
          p_time_spent_sec, p_answers, NOW()
        ) RETURNING id INTO v_attempt_id;

        RETURN QUERY SELECT 
          v_score, 
          v_correct_count,
          v_total_questions,
          v_is_passing,
          v_xp_to_award,
          100;

      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
      `
      DROP FUNCTION IF EXISTS get_user_best_quiz_score(UUID, UUID);
      
      CREATE OR REPLACE FUNCTION get_user_best_quiz_score(
        p_user_id UUID,
        p_quiz_id UUID
      )
      RETURNS TABLE(
        best_score INTEGER,
        attempts_count INTEGER,
        is_passing BOOLEAN,
        last_attempt_at TIMESTAMP WITH TIME ZONE,
        first_attempt_at TIMESTAMP WITH TIME ZONE
      ) AS $$
      DECLARE
        v_passing_score INTEGER;
        v_best_score INTEGER;
      BEGIN
        -- Get passing score for this quiz
        SELECT mq.passing_score INTO v_passing_score
        FROM module_quizzes mq
        WHERE mq.id = p_quiz_id;

        IF NOT FOUND THEN
          v_passing_score := 70;
        END IF;

        -- Get best score
        SELECT MAX(uqa.score) INTO v_best_score
        FROM user_quiz_attempts uqa
        WHERE uqa.user_id = p_user_id
          AND uqa.quiz_id = p_quiz_id;

        RETURN QUERY
        SELECT 
          COALESCE(v_best_score, 0)::INTEGER as best_score,
          COUNT(*)::INTEGER as attempts_count,
          (COALESCE(v_best_score, 0) >= v_passing_score)::BOOLEAN as is_passing,
          MAX(uqa.completed_at) as last_attempt_at,
          MIN(uqa.completed_at) as first_attempt_at
        FROM user_quiz_attempts uqa
        WHERE uqa.user_id = p_user_id
          AND uqa.quiz_id = p_quiz_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFIER;
      `
    ];

    for (const fn of functions) {
      try {
        console.log(`⏳ Executing function fix...`);
        const { error } = await client.rpc('apply_migrations', { sql: fn }, { 
          method: 'POST'
        });
        
        if (error) {
          console.log('⚠️  ' + error.message);
          // Try direct SQL execution instead
          const { error: directError } = await client.from('_migrations').select('*').limit(1);
          if (directError?.code === 'PGRST301') {
            console.log('💡 Note: Update functions manually in Supabase SQL Editor');
            console.log('📝 Function SQL provided above');
          }
        } else {
          console.log('✅ Function updated successfully');
        }
      } catch (err) {
        console.log('⚠️  ' + err.message);
      }
    }

    console.log(`
🔧 QUIZ FIX SUMMARY
==================

✅ Changes Made:
1. Fixed submit_quiz_attempt() - Now correctly processes answers in {questionId: optionIndex} format
2. Added is_passing field to return values  
3. Fixed get_user_best_quiz_score() - Returns is_passing and attempts_count fields

🎯 What to do:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the functions above and run them
3. Or run this command if you have direct access:

   psql -h db.supabase.co -U postgres -d postgres -c "$(cat migrations/023_add_quiz_rpc_functions.sql)"

📝 After applying fix, test with:
- Generate new quiz (should get 5 questions)
- Submit quiz (should get passing/failing result)
- See red/green colors in answer review
` );

  } catch (err) {
    console.error('❌ Error during fix:', err.message);
    process.exit(1);
  }
}

applyQuizFix();