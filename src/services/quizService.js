import supabase from '../utils/supabaseClient';

/**
 * QUIZ SERVICE (Frontend)
 * Handles all quiz-related operations including auto-generation with LLM
 * - Check quiz access
 * - Load quiz content (auto-generate if not exists)
 * - Submit answers
 * - Track progress
 * - Get results
 */

// ============================================================================
// HELPER: Validate and fix code output question answers
// ============================================================================
/**
 * Detects code output questions and validates their answers.
 * If correct answer doesn't look like code output, reassigns to best-matching option.
 * Used both during generation AND when loading from database (retroactive fix)
 */
function validateCodeOutputAnswers(options, questionText) {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return options;
  }

  const isCodeOutputQuestion = 
    questionText.toLowerCase().includes('output') || 
    questionText.toLowerCase().includes('print') || 
    questionText.toLowerCase().includes('what does') ||
    questionText.toLowerCase().includes('what is the result');

  if (!isCodeOutputQuestion) {
    return options; // Not a code output question, no validation needed
  }

  const correctOption = options.find(o => o.isCorrect);
  if (!correctOption) {
    return options; // No correct answer marked
  }

  const correctText = correctOption.text || '';
  
  // Check if correct answer looks like actual code output
  const hasActualOutput = /[\[\{\(]|^[0-9]|^None$|^True$|^False$|^-?[0-9]+\.[0-9]|^['"]/.test(correctText);
  
  if (hasActualOutput) {
    return options; // Already looks like code output, no fix needed
  }

  // Correct answer doesn't look like output - find the best looking one
  console.warn(`⚠️  CODE OUTPUT VALIDATION: Q: "${questionText.substring(0, 50)}..." - Current answer "${correctText}" doesn't look like output. Finding best match...`);
  
  let bestOption = options[0];
  let bestScore = 0;
  
  options.forEach((opt) => {
    let score = 0;
    const text = opt.text || '';
    if (/[\[\{\(]/.test(text)) score += 5;  // Has brackets/braces
    if (/[\]\}\)]/.test(text)) score += 5;  // Has closing brackets
    if (/^[0-9-]/.test(text)) score += 3;   // Starts with number
    if (/^None$|^True$|^False$/.test(text)) score += 4;  // Python keywords
    if (/^['"]/.test(text)) score += 2;     // Has quotes
    if (!/^[a-z_]+\([a-z_]+\)$/.test(text)) score += 1;  // Not a function call description
    
    if (score > bestScore) {
      bestScore = score;
      bestOption = opt;
    }
  });
  
  // Mark best option as correct, unmark others
  const fixedOptions = options.map(o => ({
    ...o,
    isCorrect: o === bestOption
  }));
  
  console.log(`✓ FIXED: Changed correct answer to: "${bestOption.text}"`);
  return fixedOptions;
}
function sanitizeOptionText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
}

const PLACEHOLDER_OPTION_PATTERNS = [
  /^option\s*[a-d]$/i,
  /^choice\s*[a-d]$/i,
  /^answer\s*[a-d]$/i,
  /^i\s*don't\s*know/i,
  /^dont\s*know/i,
  /^not\s*sure/i,
  /^please\s*select/i,
  /^none\s*of\s*the\s*above$/i,
  /^all\s*of\s*the\s*above$/i,
  /^this\s*is\s*option\s*[a-d]$/i,
  /^option\s*\d+$/i,
  /^[a-d]$/i,
  /^what\s*is\s*(option|answer|choice)\s*[a-d]/i,
  /^[a-d]\s*-\s*[a-z_]+\([a-z_]*\)$/i,
  /^the\s*(first|second|third|fourth)\s*option$/i,
  /^other$/i,
  /^skip$/i,
  /^cannot\s*determine$/i,
  /^none$/i
];

function isInvalidOptionText(text) {
  if (!text || typeof text !== 'string') return true;
  const sanitized = sanitizeOptionText(text);
  if (sanitized.length < 3) return true;
  return PLACEHOLDER_OPTION_PATTERNS.some((pattern) => pattern.test(sanitized));
}

function validateQuizQuestion(question) {
  if (!question) return false;
  const text = (question.question || question.question_text || '').trim();
  if (!text || text.length < 10) return false;
  if (!Array.isArray(question.options) || question.options.length !== 4) return false;

  const options = question.options.map((o) => ({
    text: sanitizeOptionText(o.text || o.option || o.label || o.value || ''),
    isCorrect: o.isCorrect === true || o.is_correct === true
  }));

  if (options.some((o) => isInvalidOptionText(o.text))) return false;
  if (options.filter((o) => o.isCorrect).length !== 1) return false;
  return true;
}

async function generateQuizQuestionsWithLLM(moduleName, moduleDesc = '', topics = [], moduleId = null) {
  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  console.log("🔑 OpenRouter API Key configured:", !!OPENROUTER_API_KEY);
  if (!OPENROUTER_API_KEY) {
    console.error('❌ OpenRouter API key missing. Set REACT_APP_OPENROUTER_API_KEY in your .env file and restart the app.');
    throw new Error('OpenRouter API key missing. Set REACT_APP_OPENROUTER_API_KEY in .env');
  }

  // Fetch actual lesson content for better questions
  let lessonTopics = topics || [];
  if (moduleId && lessonTopics.length === 0) {
    try {
      const lessons = await supabase
        .from('lessons')
        .select('id, title, description')
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .limit(10);
      
      if (lessons.data) {
        lessonTopics = lessons.data.map(l => l.title).filter(Boolean);
        console.log(`📚 Fetched ${lessonTopics.length} lesson topics for context`);
      }
    } catch (err) {
      console.warn('⚠️  Could not fetch lesson topics:', err.message);
    }
  }

  // Try LLM generation first
  try {
    const result = await generateWithOpenRouter(moduleName, moduleDesc, lessonTopics);
    if (result && result.length === 5 && result.every(validateQuizQuestion)) {
      console.log('✅ OpenRouter generated quiz questions');
      console.log(`📋 Generated ${result.length} questions with correct answers:`);
      result.forEach((q, idx) => {
        const correctOption = q.options.find(o => o.isCorrect);
        console.log(`   Q${idx + 1}: Correct = "${correctOption?.text}"`);
      });
      return result;
    }

    throw new Error('Generated quiz failed validation, retrying generation');
  } catch (firstErr) {
    console.warn('⚠️  First generation attempt failed:', firstErr.message);
    try {
      const retryResult = await generateWithOpenRouter(moduleName, moduleDesc, lessonTopics);
      if (retryResult && retryResult.length === 5 && retryResult.every(validateQuizQuestion)) {
        console.log('✅ OpenRouter generated quiz questions on retry');
        return retryResult;
      }
      throw new Error('Retry also failed validation');
    } catch (retryErr) {
      console.error('❌ OpenRouter retry failed:', retryErr.message);
      throw new Error('OpenRouter quiz generation failed after retry: ' + retryErr.message);
    }
  }

  throw new Error('OpenRouter quiz generation did not return valid data.');
}

/**
 * Generate questions using OpenRouter API
 */
async function generateWithOpenRouter(moduleName, moduleDesc, topics = []) {
  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key missing. Set REACT_APP_OPENROUTER_API_KEY in .env');
  }
  
  const topicsText = topics.length > 0 ? `\nCovered topics: ${topics.join(', ')}` : '';
  const descText = moduleDesc ? `\nModule description: ${moduleDesc}` : '';
  
  const prompt = `You are a Python instructor creating PRACTICAL quiz questions for students learning to code.

Module: "${moduleName}"${descText}${topicsText}

Generate exactly 5 DIVERSE multiple choice questions that test REAL PROGRAMMING KNOWLEDGE.

❌ FORBIDDEN QUESTION TYPES (DO NOT USE):
- "What is a fundamental characteristic of...?"
- "Which learning strategy is most effective for...?"
- "When solving problems in..., what should you prioritize?"
- "What does the module teach about...?"
- Meta/vague questions about the course itself
- Generic psychology/pedagogy questions
- Any question not about actual Python code or concepts

✅ GOOD QUESTION TYPES (MUST USE):
1. CODE OUTPUT - "What is the output of print(type([1,2,3]))?" → Answer shows actual execution
   CRITICAL FOR CODE OUTPUT: One option MUST be the EXACT ACTUAL OUTPUT when the code runs
   Example: print([1,2,3]) outputs [1, 2, 3] → option MUST include [1, 2, 3], NOT just "list"
   
2. METHOD COMPARISON - "What's the difference between append() and extend()?" → Specific behavior
3. BEHAVIOR PREDICTION - "What does this code do? x = [1,2,3]; y = x; y.append(4); print(x)" → Requires understanding
   CRITICAL: If asking what prints, one option MUST be the actual output like [1, 2, 3, 4]
   
4. PRACTICAL USAGE - "When would you use a dictionary instead of a list?" → Real programming decision
5. SYNTAX/FEATURE - "How do you create a dictionary? dict(...), {...}, dict([...])" → Exact Python syntax

REQUIREMENTS:
- EVERY question must test actual Python code or behavior
- At least 3 questions must include code snippets or code-like examples
- Questions must be specific to the module (not generic Python)
- For CODE OUTPUT questions: THE CORRECT ANSWER OPTION MUST SHOW THE ACTUAL OUTPUT
- All options must be plausible but clearly different (avoid nitpicky distinctions)
- Mix difficulty: 2 beginner, 2 medium, 1 hard

Each question MUST have:
- "question": string (include code snippets in actual questions, not explanations)
- "difficulty": "beginner", "medium", or "hard"
- "options": array of exactly 4 objects with "text" and "isCorrect" (only ONE true)
- "explanation": WHY this is correct and what concept it teaches (be specific)
- "learningPoint": 2-3 word skill being tested

🚨 CRITICAL:
1. Return ONLY valid JSON - no markdown, no extra text
2. Generate exactly 5 questions - no more, no less
3. Each question has exactly 4 options
4. Exactly ONE option per question must have "isCorrect": true
5. NO trailing commas anywhere
6. All strings in double quotes
7. Complete every field - no null, no empty strings, no incomplete arrays
8. Verify each question is SPECIFIC to module content, not generic

WRONG EXAMPLE - Don't do this:
{"question":"What is the output of x = [1,2,3]; print(x)?","options":[{"text":"list","isCorrect":true},{"text":"array","isCorrect":false},{"text":"type:list","isCorrect":false},{"text":"Option D","isCorrect":false}]}
❌ WRONG because the actual output is [1, 2, 3] but the correct option says "list"

RIGHT EXAMPLE - Do this:
{"question":"What is the output of x = [1,2,3]; print(x)?","options":[{"text":"[1, 2, 3]","isCorrect":true},{"text":"list","isCorrect":false},{"text":"<class 'list'>","isCorrect":false},{"text":"type: list","isCorrect":false}]}
✓ RIGHT because one option shows the ACTUAL OUTPUT [1, 2, 3]

Format (complete working example):
{"questions":[{"question":"What is the output of print(type([1,2,3]))?","difficulty":"beginner","options":[{"text":"<class 'list'>","isCorrect":true},{"text":"list","isCorrect":false},{"text":"array","isCorrect":false},{"text":"type: list","isCorrect":false}],"explanation":"type() returns the class of an object. For lists, it returns <class 'list'>. This is the actual Python output, not just 'list'.","learningPoint":"Type inspection"}]}

Now generate exactly 5 PRACTICAL questions for "${moduleName}":

Only return JSON. Nothing else. Start with { and end with }.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PyScape Quiz Generator'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    const data = await response.json();
    console.log("📦 OpenRouter Response:", data);

    if (!response.ok) {
      const errorMsg = data.error?.message || `API failed: ${response.status}`;
      console.error("❌ API ERROR:", errorMsg);
      throw new Error(errorMsg);
    }

    let content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from API');
    }

    return parseJSONResponse(content);
  } catch (err) {
    console.error("❌ OpenRouter Error:", err.message);
    throw err;
  }
}

/**
 * Parse JSON response from LLM
 */
function parseJSONResponse(content) {
  console.log("🔍 Raw LLM response (first 300 chars):", content.substring(0, 300));

  // Extract JSON from response
  let cleaned = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/<class [^>]*>/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  if (start === -1 || end === -1) {
    throw new Error("No JSON found in response");
  }

  let jsonString = cleaned.substring(start, end + 1);
  
  // Cleanup whitespace and formatting
  jsonString = jsonString
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/,\s+/g, ',')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/{\s+/g, '{')
    .replace(/\s+}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();

  // Normalize property names to lowercase (fix LLM capitalization issues)
  jsonString = jsonString
    .replace(/"IsCorrect"/g, '"isCorrect"')
    .replace(/"is_correct"/g, '"isCorrect"')
    .replace(/"Question"/g, '"question"')
    .replace(/"question_text"/g, '"question"')
    .replace(/"Options"/g, '"options"')
    .replace(/"Difficulty"/g, '"difficulty"')
    .replace(/"Explanation"/g, '"explanation"')
    .replace(/"LearningPoint"/g, '"learningPoint"')
    .replace(/"learning_point"/g, '"learningPoint"')
    .replace(/"Text"/g, '"text"')
    .replace(/"text_value"/g, '"text"')
    .replace(/"Option"/g, '"text"');

  // Fix unquoted property names (e.g., ngPoint: becomes "ngPoint":)
  jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    console.error("❌ First parse attempt failed:", e.message);
    
    // More aggressive JSON repair
    let fixed = jsonString;
    
    // Fix unquoted strings that might be property values
    fixed = fixed.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, word) => {
      // Check if it's a known keyword that should stay unquoted
      if (['true', 'false', 'null', 'beginner', 'medium', 'hard'].includes(word.toLowerCase())) {
        return match;
      }
      return ': "' + word + '"';
    });
    
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    
    console.log(`📊 Bracket count - Open: ${openBraces}/${openBrackets}, Close: ${closeBraces}/${closeBrackets}`);
    
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixed += ']';
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixed += '}';
    }
    
    fixed = fixed
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .trim();
    
    console.log("🔧 Attempting to parse fixed JSON...");
    try {
      parsed = JSON.parse(fixed);
    } catch (e2) {
      console.error("❌ Second parse also failed, attempting fallback extraction...");
      
      // Fallback: Try to extract individual question objects
      const questionMatches = fixed.match(/\{"question"[^}]*"options":\s*\[[^\]]*\][^}]*\}/g) || [];
      console.log(`🆘 Fallback: Found ${questionMatches.length} potential question objects`);
      
      if (questionMatches.length >= 1) {
        const extractedQuestions = [];
        for (const qStr of questionMatches) {
          try {
            let fixedQ = qStr
              .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
              .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, word) => {
                if (['true', 'false', 'null', 'beginner', 'medium', 'hard'].includes(word.toLowerCase())) {
                  return match;
                }
                return ': "' + word + '"';
              });
            
            const q = JSON.parse(fixedQ);
            if (q.question && q.options && Array.isArray(q.options)) {
              extractedQuestions.push(q);
            }
          } catch (qErr) {
            console.warn(`⚠️  Could not parse individual question: ${qErr.message}`);
          }
        }
        
        if (extractedQuestions.length >= 1) {
          console.log(`✅ Fallback success: Extracted ${extractedQuestions.length} questions`);
          parsed = { questions: extractedQuestions };
        } else {
          throw new Error(`JSON parse failed: ${e2.message}`);
        }
      } else {
        throw new Error(`JSON parse failed: ${e2.message}`);
      }
    }
  }

  if (!parsed || !parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response structure');
  }

  // Validate and fix questions
  let questions = parsed.questions
    .filter(q => q && (q.question || q.question_text) && q.options && Array.isArray(q.options) && q.options.length >= 4)
    .map(q => {
      const questionText = (q.question || q.question_text || '').trim();
      if (!questionText || questionText.length < 10) {
        throw new Error(`Invalid question text detected: "${questionText}"`);
      }

      let optionsArray = (q.options || []).slice(0, 4);
      optionsArray = optionsArray.map((o, idx) => {
        const text = sanitizeOptionText(o.text || o.option || o.label || o.value || `Option ${String.fromCharCode(65 + idx)}`);
        return {
          text,
          isCorrect: o.isCorrect === true || o.is_correct === true
        };
      });

      if (optionsArray.some((o) => isInvalidOptionText(o.text))) {
        throw new Error(`Invalid quiz options detected for question: "${questionText}"`);
      }

      const correctCount = optionsArray.filter(o => o.isCorrect).length;
      if (correctCount !== 1) {
        console.warn(`⚠️  Question "${questionText}" has ${correctCount} correct answers. Forcing first option as correct.`);
        optionsArray.forEach(o => o.isCorrect = false);
        optionsArray[0].isCorrect = true;
      }

      optionsArray = validateCodeOutputAnswers(optionsArray, questionText);
      
      if (optionsArray.some((o) => isInvalidOptionText(o.text))) {
        throw new Error(`Invalid code-output option text detected for question: "${questionText}"`);
      }

      return {
        question: questionText,
        difficulty: (q.difficulty || 'medium').toLowerCase(),
        options: optionsArray,
        explanation: q.explanation || 'Review the module content to understand this concept better.',
        learningPoint: q.learningPoint || q.learning_point || 'Key concept'
      };
    });

  if (questions.length < 5) {
    throw new Error(`Not enough questions: ${questions.length}/5`);
  }

  console.log(`✅ Successfully parsed ${questions.length} questions`);
  console.log(`📋 Final questions with validated answers:`);
  questions.forEach((q, idx) => {
    const correctOpt = q.options.find(o => o.isCorrect);
    console.log(`   Q${idx + 1}: "${q.question.substring(0, 60)}..."`);
    console.log(`         ✓ Correct: "${correctOpt?.text}"`);
  });
  
  return questions.slice(0, 5);
}

// ============================================================================

/**
 * Save generated quiz to Supabase using UPSERT to avoid unique constraint violations
 */
async function saveGeneratedQuizToDatabase(moduleId, moduleName, questions) {
  try {
    if (!questions || questions.length === 0) {
      throw new Error('No questions to save');
    }

    // Ensure exactly 5 questions
    const questionsToSave = questions.slice(0, 5);
    console.log(`💾 Saving quiz for module ${moduleId} with ${questionsToSave.length} questions...`);

    // Step 1: Create or update quiz using UPSERT (avoids unique constraint violations)
    console.log(`🔄 Upserting quiz for module ${moduleId}...`);
    
    const { data: quizData, error: quizError } = await supabase
      .from('module_quizzes')
      .upsert({
        module_id: moduleId,
        quiz_title: moduleName,
        description: `Quiz for ${moduleName} - Auto-generated`,
        num_questions: questionsToSave.length,
        passing_score: 70,
        max_xp_reward: 100,
        is_published: true
      }, {
        onConflict: 'module_id'
      })
      .select('id')
      .single();

    if (quizError) {
      console.error('❌ Upsert failed:', quizError.message);
      throw new Error(`Upsert quiz failed: ${quizError.message}`);
    }

    const quizId = quizData.id;
    console.log('✅ Quiz upserted (created or updated)');
    console.log("🆔 Quiz ID:", quizId);

    // Step 2: Delete old questions for this quiz (if any)
    console.log(`🗑️  Cleaning old questions for quiz ${quizId}...`);
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);
    
    if (deleteError) {
      console.warn('⚠️  Warning deleting old questions:', deleteError.message);
    } else {
      console.log('✅ Old questions deleted');
    }

    // Step 3: Insert new questions (exactly 5)
    console.log(`📚 Inserting exactly ${questionsToSave.length} new questions...`);
    
    const questionRows = questionsToSave.map((q, idx) => {
      const correctIndex = q.options ? q.options.findIndex(o => o.isCorrect) : 0;
      
      // DEBUG: Log which option is marked as correct
      console.log(`   Q${idx + 1}: Correct option index = ${correctIndex}`);
      if (q.options && q.options[correctIndex]) {
        console.log(`         ✓ Correct answer: "${q.options[correctIndex].text}"`);
      }
      console.log(`         All options: ${q.options?.map(o => `"${o.text}" (${o.isCorrect ? '✓' : '✗'})`).join(' | ')}`);
      
      return {
        quiz_id: quizId,
        question_order: idx + 1,
        question_text: q.question || q.question_text || '',
        difficulty: (q.difficulty || 'medium').toLowerCase(),
        correct_option_index: correctIndex,
        options: JSON.stringify(q.options || []),
        explanation: q.explanation || 'Review the module content to understand this concept better.',
        learning_point: q.learningPoint || q.learning_point || ''
      };
    });

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionRows);

    if (questionsError) {
      console.error('❌ Questions insert failed:', questionsError.message);
      throw new Error(`Save questions failed: ${questionsError.message}`);
    }

    console.log(`✅ Quiz successfully saved with exactly ${questionsToSave.length} questions (ID: ${quizId})`);
    return quizId;

  } catch (err) {
    console.error('❌ Error saving generated quiz:', err.message);
    return null;
  }
}

// ============================================================================
// GET MODULE INFO
// ============================================================================
/**
 * Fetch module details for context during quiz generation
 */
async function getModuleInfo(moduleId) {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('id, title, description')
      .eq('id', moduleId)
      .single();

    if (error) {
      console.error('Error fetching module:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching module:', err);
    return null;
  }
}

// ============================================================================
// CHECK QUIZ ACCESS
// ============================================================================
/**
 * Check if user has completed all lessons in a module and can take the quiz
 */
export const canUserAccessQuiz = async (userId, moduleId) => {
  try {
    const { data, error } = await supabase.rpc('can_user_access_quiz', {
      p_user_id: userId,
      p_module_id: moduleId
    });

    if (error) {
      console.error('❌ Error checking quiz access:', error);
      return { can_access: false, reason: 'Unable to verify access', error };
    }

    return data?.[0] || { can_access: false, reason: 'Unknown error' };
  } catch (err) {
    console.error('❌ Exception checking quiz access:', err);
    return { can_access: false, reason: 'Unable to verify access', error: err };
  }
};

// ============================================================================
// GET MODULE QUIZ (WITH AUTO-GENERATION IF NOT EXISTS)
// ============================================================================
/**
 * Fetch quiz for a module
 * If quiz doesn't exist, auto-generate using LLM API
 */
export const getModuleQuiz = async (moduleId) => {
  try {
    console.log(`📚 Fetching quiz for module ${moduleId}...`);

    // First, try to fetch existing quiz
    const { data: quizzes, error: fetchError } = await supabase
      .from('module_quizzes')
      .select('id, quiz_title, description, num_questions, passing_score, max_xp_reward')
      .eq('module_id', moduleId);

    if (!fetchError && quizzes && quizzes.length > 0) {
      const existingQuiz = quizzes[0];
      console.log(`✅ Quiz found in database with ${existingQuiz.num_questions} questions`);
      
      // Check if quiz has fewer than 5 questions - if so, regenerate it
      if (existingQuiz.num_questions < 5) {
        console.log(`⚠️  Quiz has only ${existingQuiz.num_questions} questions. Regenerating with 5 questions...`);
        
        // Delete questions first (explicit cascade)
        const { error: deleteQuestionsError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', existingQuiz.id);
        
        if (deleteQuestionsError) {
          console.warn('⚠️  Warning deleting questions:', deleteQuestionsError.message);
        }
        
        // Then delete the quiz record
        const { error: deleteError } = await supabase
          .from('module_quizzes')
          .delete()
          .eq('id', existingQuiz.id);
        
        if (deleteError) {
          console.warn('⚠️  Warning deleting quiz:', deleteError.message);
          // Continue anyway - we'll try to regenerate
        } else {
          console.log('✅ Deleted old quiz, proceeding with regeneration');
        }
      } else {
        // Quiz has 5+ questions, use it
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('id, question_order, question_text, difficulty, options, explanation, learning_point')
          .eq('quiz_id', existingQuiz.id)
          .order('question_order', { ascending: true });

        if (!questionsError && questions && questions.length > 0) {
          // Ensure exactly 5 questions
          const questionsToUse = questions.slice(0, 5);
          
          // APPLY RETROACTIVE VALIDATION: Check for placeholder/invalid options
          console.log(`🔍 Validating ${questionsToUse.length} questions for correct answers and placeholder options...`);
          
          let hasInvalidOptions = false;
          const validatedQuestions = questionsToUse.map(q => {
            const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            
            // Check for placeholder/invalid options in this question
            if (parsedOptions.some((o) => isInvalidOptionText(o.text))) {
              console.warn(`⚠️  Question "${q.question_text}" has invalid placeholder options. Quiz needs regeneration.`);
              hasInvalidOptions = true;
            }
            
            // RETROACTIVE FIX: Validate and fix code output answers
            const validatedOptions = validateCodeOutputAnswers(parsedOptions, q.question_text);
            
            return {
              id: q.id,
              question_order: q.question_order,
              question_text: q.question_text,
              difficulty: q.difficulty,
              options: validatedOptions,
              explanation: q.explanation,
              learningPoint: q.learning_point
            };
          });
          
          // If any questions have invalid options, regenerate the entire quiz
          if (hasInvalidOptions) {
            console.warn(`❌ Quiz has placeholder options. Regenerating entire quiz...`);
            
            // Delete old questions
            const { error: deleteQuestionsError } = await supabase
              .from('quiz_questions')
              .delete()
              .eq('quiz_id', existingQuiz.id);
            
            if (deleteQuestionsError) {
              console.warn('⚠️  Warning deleting questions:', deleteQuestionsError.message);
            }
            
            // Delete old quiz
            const { error: deleteError } = await supabase
              .from('module_quizzes')
              .delete()
              .eq('id', existingQuiz.id);
            
            if (deleteError) {
              console.warn('⚠️  Warning deleting quiz:', deleteError.message);
            }
            
            // Regenerate fresh quiz
            return await regenerateAndSaveQuiz(moduleId);
          }
          
          return {
            quiz_id: existingQuiz.id,
            module_id: moduleId,
            title: existingQuiz.quiz_title,
            description: existingQuiz.description,
            num_questions: validatedQuestions.length,
            passing_score: existingQuiz.passing_score,
            max_xp_reward: existingQuiz.max_xp_reward,
            questions: validatedQuestions
          };
        }
      }
    }

    // Quiz doesn't exist or needs regeneration - AUTO-GENERATE IT
    console.log(`⚠️  No valid quiz found. Auto-generating with LLM...`);
    return await regenerateAndSaveQuiz(moduleId);
  } catch (err) {
    console.error('❌ Error in getModuleQuiz:', err.message);
    return null;
  }
};

/**
 * DEPRECATED: Regenerate quiz for a module - FEATURE REMOVED
 * Users should retake the existing quiz instead of generating different questions
 * This function has been disabled to simplify the quiz experience
 */
/*
export const regenerateModuleQuiz = async (moduleId) => {
  try {
    console.log(`🔄 Regenerating quiz for module ${moduleId}...`);
    
    // Delete existing quiz (cascade to questions)
    const { data: existingQuizzes, error: fetchError } = await supabase
      .from('module_quizzes')
      .select('id')
      .eq('module_id', moduleId);
    
    if (!fetchError && existingQuizzes && existingQuizzes.length > 0) {
      for (const quiz of existingQuizzes) {
        // Delete questions first
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quiz.id);
        
        // Delete quiz
        await supabase
          .from('module_quizzes')
          .delete()
          .eq('id', quiz.id);
      }
      console.log('✅ Deleted old quiz');
    }
    
    // Generate new quiz from scratch
    return await regenerateAndSaveQuiz(moduleId);
  } catch (err) {
    console.error('❌ Error regenerating quiz:', err);
    throw err;
  }
};
*/

/**
 * Internal helper: Generate and save new quiz
 */
async function regenerateAndSaveQuiz(moduleId) {
  // Get module info
    const moduleInfo = await getModuleInfo(moduleId);
    if (!moduleInfo) {
      throw new Error('Module not found');
    }

    // Generate questions using LLM (now with lesson topics)
    const questions = await generateQuizQuestionsWithLLM(
      moduleInfo.title,
      moduleInfo.description || '',
      [],
      moduleId
    );

    if (!questions || questions.length === 0) {
      throw new Error('Failed to generate quiz questions with LLM');
    }

    // Save generated quiz to database
    const newQuizId = await saveGeneratedQuizToDatabase(
      moduleId,
      moduleInfo.title,
      questions
    );

    if (!newQuizId) {
      throw new Error('Failed to save generated quiz');
    }

    console.log(`✅ Quiz auto-generated and saved!`);

    // Fetch the saved questions to get their actual IDs
    const { data: savedQuestions, error: fetchQuestionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', newQuizId)
      .order('question_order', { ascending: true });

    if (fetchQuestionsError) {
      console.warn('Warning: Could not fetch saved questions:', fetchQuestionsError);
    }

    // Ensure exactly 5 questions in final result
    const questionsToReturn = savedQuestions ? savedQuestions.slice(0, 5).map(q => ({
      id: q.id,  // Use actual database ID
      question_order: q.question_order,
      question_text: q.question_text,
      difficulty: q.difficulty,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      explanation: q.explanation,
      learningPoint: q.learning_point
    })) : questions.slice(0, 5).map((q, idx) => ({
      id: `q_${idx}`,
      question_order: idx + 1,
      question_text: q.question,
      difficulty: q.difficulty,
      options: q.options,
      explanation: q.explanation,
      learningPoint: q.learningPoint
    }));

    // Return the newly created quiz with exactly 5 questions
    return {
      quiz_id: newQuizId,
      module_id: moduleId,
      title: moduleInfo.title,
      description: `Quiz for ${moduleInfo.title} - Auto-generated`,
      num_questions: questionsToReturn.length,
      passing_score: 70,
      max_xp_reward: 100,
      questions: questionsToReturn
    };
}

// ============================================================================
// GET QUIZ QUESTIONS
// ============================================================================
/**
 * Get all questions for a quiz without answers (for display)
 */
export const getQuizQuestions = async (quizId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, question_order, question_text, difficulty, options')
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching quiz questions:', error);
      return [];
    }

    return (data || []).map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  } catch (err) {
    console.error('❌ Exception fetching quiz questions:', err);
    return [];
  }
};

// ============================================================================
// SUBMIT QUIZ
// ============================================================================
/**
 * Submit quiz answers and calculate score
 */
export const submitQuiz = async (userId, quizId, answers, timeSpentSec = 0) => {
  try {
    console.log(`🎯 Submitting quiz ${quizId} for user ${userId}`);
    console.log("📊 Quiz ID Type:", typeof quizId, "Value:", quizId);
    console.log("📊 Answers object:", answers);
    console.log("📊 Answers JSON:", JSON.stringify(answers));
    console.log("📊 Number of answers:", Object.keys(answers).length);
    
    // Ensure quizId is treated as UUID (string)
    const quizIdString = String(quizId);
    
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_user_id: userId,
      p_quiz_id: quizIdString,
      p_answers: answers,
      p_time_spent_sec: timeSpentSec
    });

    if (error) {
      console.error('❌ Error submitting quiz:', error);
      console.error('   Quiz ID sent:', quizIdString, "Type:", typeof quizIdString);
      return { success: false, error };
    }

    const result = data?.[0];
    if (result) {
      console.log(`✅ Quiz submitted! Score: ${result.score}%, XP Earned: ${result.xp_earned}`);
    }

    return { success: true, result };
  } catch (err) {
    console.error('❌ Exception submitting quiz:', err);
    return { success: false, error: err };
  }
};

// ============================================================================
// GET USER'S BEST QUIZ SCORE
// ============================================================================
/**
 * Get the best score the user achieved on a quiz
 */
export const getUserBestQuizScore = async (userId, quizId) => {
  try {
    const { data, error } = await supabase.rpc('get_user_best_quiz_score', {
      p_user_id: userId,
      p_quiz_id: quizId
    });

    if (error) {
      console.error('❌ Error fetching best score:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Exception fetching best score:', err);
    return null;
  }
};

// ============================================================================
// GET QUIZ ATTEMPTS
// ============================================================================
/**
 * Get all quiz attempts for a user
 */
export const getQuizAttempts = async (userId, quizId = null) => {
  try {
    let query = supabase
      .from('user_quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching attempt history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching attempt history:', err);
    return [];
  }
};

// ============================================================================
// GET ATTEMPT DETAILS
// ============================================================================
/**
 * Get detailed information about a specific quiz attempt
 */
export const getAttemptDetails = async (attemptId) => {
  try {
    const { data: attempt, error: attemptError } = await supabase
      .from('user_quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (attemptError) {
      console.error('❌ Error fetching attempt details:', attemptError);
      return null;
    }

    return attempt;
  } catch (err) {
    console.error('❌ Exception fetching attempt details:', err);
    return null;
  }
};

// ============================================================================
// SAVE QUIZ PROGRESS (Auto-save)
// ============================================================================
/**
 * Save user's current progress while taking a quiz (for resume functionality)
 */
export const saveQuizProgress = async (userId, quizId, currentQuestionIndex, answers) => {
  try {
    const { error } = await supabase
      .from('user_quiz_progress')
      .upsert({
        user_id: userId,
        quiz_id: quizId,
        current_question_index: currentQuestionIndex,
        answered_questions: answers,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,quiz_id'
      });

    if (error) {
      console.error('⚠️  Error saving progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('⚠️  Exception saving progress:', err);
    return false;
  }
};

// ============================================================================
// GET SAVED QUIZ PROGRESS (Resume)
// ============================================================================
/**
 * Get user's saved progress for a quiz (to resume from where they left off)
 */
export const getQuizProgress = async (userId, quizId) => {
  try {
    const { data, error } = await supabase
      .from('user_quiz_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId);

    if (error) {
      console.warn('⚠️  Error fetching progress:', error.message);
      return null;
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      console.log('ℹ️  No saved progress found for this quiz');
      return null;
    }

    return data[0];
  } catch (err) {
    console.warn('⚠️  Exception fetching progress:', err);
    return null;
  }
};

// ============================================================================
// CLEAR QUIZ PROGRESS
// ============================================================================
/**
 * Clear saved progress for a quiz (when starting a new attempt or resetting)
 */
export const clearQuizProgress = async (userId, quizId) => {
  try {
    const { error } = await supabase
      .from('user_quiz_progress')
      .delete()
      .eq('user_id', userId)
      .eq('quiz_id', quizId);

    if (error) {
      console.error('⚠️  Error clearing progress:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('⚠️  Exception clearing progress:', err);
    return false;
  }
};

// ============================================================================
// GET QUIZ STATISTICS
// ============================================================================
/**
 * Get statistics about user's quiz performance
 */
export const getQuizStatistics = async (userId, quizId) => {
  try {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select('score, completed_at')
      .eq('user_id', userId)
      .eq('quiz_id', quizId);

    if (error) {
      console.error('❌ Error fetching statistics:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        lastAttemptDate: null
      };
    }

    const scores = data.map(d => d.score);
    return {
      totalAttempts: data.length,
      bestScore: Math.max(...scores),
      averageScore: Math.round(scores.reduce((a, b) => a + b) / scores.length),
      lastAttemptDate: data[0]?.completed_at
    };
  } catch (err) {
    console.error('❌ Exception fetching statistics:', err);
    return null;
  }
};