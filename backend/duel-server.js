/**
 * Real-time Code Duel WebSocket Server
 * Handles matchmaking, live duel sessions, and score updates
 */
require('dotenv').config();
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.RAPIDAPI_KEY;

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

// Active duels and matchmaking queue
const activeDuels = new Map(); // duelId -> duel session data
const matchmakingQueue = []; // players waiting for match
const connectedClients = new Map(); // userId -> WebSocket connection
const disconnectTimers = new Map(); // userId -> timeout for forfeit grace period (30 seconds)

console.log('🚀 Code Duel WebSocket Server running on ws://localhost:8080');

wss.on('connection', (ws) => {
  let userId = null;
  let currentDuelId = null;

  console.log('New WebSocket connection established');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'AUTHENTICATE':
          await handleAuthentication(ws, data);
          break;
        
        case 'JOIN_QUEUE':
          await handleJoinQueue(ws, data);
          break;
        
        case 'LEAVE_QUEUE':
          handleLeaveQueue(ws, data);
          break;
        
        case 'SUBMIT_CODE':
          await handleCodeSubmission(ws, data);
          break;
        
        case 'DUEL_COMPLETE':
          await handleDuelComplete(ws, data);
          break;
        
        case 'LEAVE_DUEL':
          await handleLeaveDuel(ws, data);
          break;
        
        case 'CHAT_MESSAGE':
          handleChatMessage(ws, data);
          break;
        
        default:
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ 
        type: 'ERROR', 
        message: 'Failed to process message',
        details: error.message 
      }));
    }
  });

  ws.on('close', () => {
    console.log(`User ${userId} disconnected`);
    if (userId) {
      connectedClients.delete(userId);
      removeFromQueue(userId);
      
      const duelId = ws._currentDuelId || currentDuelId;
      if (duelId) {
        // Set a 30-second grace period before forfeiting
        console.log(`⏰ Setting 30-second reconnection grace period for user ${userId} in duel ${duelId}`);
        
        const timer = setTimeout(() => {
          console.log(`⏱️ Grace period expired for user ${userId}, forfeiting duel ${duelId}`);
          handleDisconnectFromDuel(duelId, userId);
          disconnectTimers.delete(userId);
        }, 30000); // 30 seconds
        
        disconnectTimers.set(userId, timer);
        
        // Notify opponent about disconnect (but not forfeit yet)
        broadcastToDuel(duelId, {
          type: 'OPPONENT_DISCONNECTED',
          userId: userId,
          message: 'Opponent disconnected, waiting for reconnection...'
        }, userId);
      }
    }
  });

  // Authentication handler
  async function handleAuthentication(ws, data) {
    try {
      const { token } = data;
      
      // Verify JWT token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Invalid token' }));
        ws.close();
        return;
      }

      userId = user.id;
      connectedClients.set(userId, ws);
      
      // Check if user has a pending forfeit timer (reconnecting)
      let reconnectedToDuel = null;
      if (disconnectTimers.has(userId)) {
        const timer = disconnectTimers.get(userId);
        clearTimeout(timer);
        disconnectTimers.delete(userId);
        console.log(`✅ User ${userId} reconnected within grace period, forfeit cancelled`);
        
        // Find the duel they were in
        const duel = Array.from(activeDuels.values()).find(d => 
          d.participants.some(p => p.userId === userId)
        );
        
        if (duel) {
          reconnectedToDuel = duel;
          // Restore the duel ID on the new WebSocket connection
          ws._currentDuelId = duel.id;
          
          // Notify opponent about reconnection
          broadcastToDuel(duel.id, {
            type: 'OPPONENT_RECONNECTED',
            userId: userId,
            message: 'Opponent reconnected'
          }, userId);
        }
      }
      
      ws.send(JSON.stringify({ 
        type: 'AUTH_SUCCESS', 
        userId: user.id,
        message: 'Connected to Code Duel server' 
      }));

      // If they reconnected to an active duel, send them the duel state
      if (reconnectedToDuel) {
        const opponent = reconnectedToDuel.participants.find(p => p.userId !== userId);
        ws.send(JSON.stringify({
          type: 'DUEL_START',
          duel: {
            id: reconnectedToDuel.id,
            problem: reconnectedToDuel.problem,
            opponent: {
              userId: opponent.userId,
              nickname: opponent.nickname
            },
            startedAt: reconnectedToDuel.startedAt
          }
        }));
        console.log(`📡 Sent duel state to reconnected user ${userId}`);
      }

      console.log(`User ${userId} authenticated`);
    } catch (error) {
      console.error('Authentication error:', error);
      ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: error.message }));
    }
  }

  // Join matchmaking queue
  async function handleJoinQueue(ws, data) {
    if (!userId) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }));
      return;
    }

    const { difficulty, language } = data;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .single();

    const player = {
      userId,
      ws,
      difficulty: difficulty || 'beginner',
      language: language || 'python',
      nickname: profile?.full_name || 'Anonymous',
      avatar: profile?.avatar_url,
      joinedAt: Date.now()
    };

    // Check if already in queue
    if (matchmakingQueue.some(p => p.userId === userId)) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Already in queue' }));
      return;
    }

    matchmakingQueue.push(player);
    
    ws.send(JSON.stringify({ 
      type: 'QUEUE_JOINED', 
      position: matchmakingQueue.length,
      estimatedWait: matchmakingQueue.length * 5 // rough estimate in seconds
    }));

    console.log(`User ${userId} joined queue. Queue size: ${matchmakingQueue.length}`);

    // Try to find a match
    await tryMatchmaking();
  }

  // Leave matchmaking queue
  function handleLeaveQueue(ws, data) {
    removeFromQueue(userId);
    ws.send(JSON.stringify({ type: 'QUEUE_LEFT' }));
  }

  // Submit code during duel
  async function handleCodeSubmission(ws, data) {
    let duelId = ws._currentDuelId || currentDuelId;
    
    // Fallback: Search for user's active duel if not tracked on ws object
    if (!duelId && userId) {
      const duel = Array.from(activeDuels.values()).find(d => 
        d.participants.some(p => p.userId === userId)
      );
      if (duel) {
        duelId = duel.id;
        ws._currentDuelId = duelId; // Store it for next time
        console.log(`🔧 Recovered duel ID ${duelId} for user ${userId}`);
      }
    }
    
    if (!duelId) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Not in a duel' }));
      return;
    }

    const duel = activeDuels.get(duelId);
    if (!duel) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Duel not found' }));
      return;
    }

    const { code, language } = data;

    try {
      // Submit to Judge0 and wait for result
      const result = await executeCodeWithJudge0(code, language, duel.problem);

      // Update duel state
      const participant = duel.participants.find(p => p.userId === userId);
      if (participant) {
        participant.submissions.push({
          timestamp: Date.now(),
          status: result.status,
          runtime: result.time,
          memory: result.memory,
          passed: result.passed,
          score: result.score
        });

        // Check if this completes the problem
        if (result.passed) {
          participant.completedAt = Date.now();
          participant.finalScore = result.score;

          // Check if duel is complete
          const allComplete = duel.participants.every(p => p.completedAt);
          if (allComplete) {
            await completeDuel(duelId);
          } else {
            // Notify other participant
            broadcastToDuel(duelId, {
              type: 'OPPONENT_COMPLETED',
              userId,
              nickname: participant.nickname,
              time: participant.completedAt - duel.startedAt
            });
          }
        }
      }

      // Send result to submitter
      ws.send(JSON.stringify({
        type: 'SUBMISSION_RESULT',
        result: {
          status: result.status,
          passed: result.passed,
          score: result.score,
          runtime: result.time,
          memory: result.memory,
          testResults: result.testResults,
          stdout: result.stdout,
          stderr: result.stderr
        }
      }));

      // Broadcast updated duel state
      broadcastDuelState(duelId);

    } catch (error) {
      console.error('Code execution error:', error);
      ws.send(JSON.stringify({
        type: 'SUBMISSION_ERROR',
        message: 'Failed to execute code',
        details: error.message
      }));
    }
  }

  // Handle duel completion from frontend (client-side Judge0 execution)
  async function handleDuelComplete(ws, data) {
    let duelId = ws._currentDuelId || currentDuelId;
    
    // Fallback: Search for user's active duel if not tracked on ws object
    if (!duelId && userId) {
      const duel = Array.from(activeDuels.values()).find(d => 
        d.participants.some(p => p.userId === userId)
      );
      if (duel) {
        duelId = duel.id;
        ws._currentDuelId = duelId; // Store it for next time
        console.log(`🔧 Recovered duel ID ${duelId} for user ${userId}`);
      }
    }
    
    if (!duelId) {
      console.log(`❌ handleDuelComplete: User ${userId} not in a duel (no currentDuelId)`);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Not in a duel' }));
      return;
    }

    const duel = activeDuels.get(duelId);
    if (!duel) {
      console.log(`❌ handleDuelComplete: Duel ${duelId} not found in activeDuels`);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Duel not found' }));
      return;
    }

    const { score, completedAt } = data;

    try {
      // Update participant completion status
      const participant = duel.participants.find(p => p.userId === userId);
      if (participant && !participant.completedAt) {
        participant.completedAt = completedAt || Date.now();
        participant.finalScore = score || 0;

        console.log(`✅ User ${userId} (${participant.nickname}) completed duel with score ${score}`);
        console.log('Participants status:', duel.participants.map(p => ({
          userId: p.userId,
          nickname: p.nickname,
          completed: !!p.completedAt,
          score: p.finalScore || 0
        })));

        // Check if both participants have completed
        const allComplete = duel.participants.every(p => p.completedAt);
        console.log(`All complete check: ${allComplete} (${duel.participants.filter(p => p.completedAt).length}/${duel.participants.length})`);
        
        if (allComplete) {
          console.log('🎉 Both participants completed. Ending duel...');
          await completeDuel(duelId);
        } else {
          // Notify opponent that this user completed
          console.log('📢 Notifying opponent of completion...');
          broadcastToDuel(duelId, {
            type: 'OPPONENT_COMPLETED',
            userId,
            nickname: participant.nickname,
            time: participant.completedAt - duel.startedAt,
            score: participant.finalScore
          }, userId); // Exclude sender
        }
      } else if (participant && participant.completedAt) {
        console.log(`⚠️ User ${userId} already completed. Ignoring duplicate completion.`);
      } else {
        console.log(`❌ Participant not found for userId: ${userId}`);
      }

    } catch (error) {
      console.error('Error handling duel completion:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Failed to process completion',
        details: error.message
      }));
    }
  }

  // Leave active duel
  async function handleLeaveDuel(ws, data) {
    let duelId = ws._currentDuelId || currentDuelId;
    
    // Fallback: Search for user's active duel if not tracked on ws object
    if (!duelId && userId) {
      const duel = Array.from(activeDuels.values()).find(d => 
        d.participants.some(p => p.userId === userId)
      );
      if (duel) {
        duelId = duel.id;
        console.log(`🔧 Recovered duel ID ${duelId} for user ${userId}`);
      }
    }
    
    if (duelId) {
      await forfeitDuel(duelId, userId);
      currentDuelId = null;
      ws._currentDuelId = null;
    }
  }

  // Chat message
  function handleChatMessage(ws, data) {
    let duelId = ws._currentDuelId || currentDuelId;
    
    // Fallback: Search for user's active duel if not tracked on ws object
    if (!duelId && userId) {
      const duel = Array.from(activeDuels.values()).find(d => 
        d.participants.some(p => p.userId === userId)
      );
      if (duel) {
        duelId = duel.id;
        ws._currentDuelId = duelId; // Store it for next time
        console.log(`🔧 Recovered duel ID ${duelId} for user ${userId}`);
      }
    }
    
    if (!duelId) return;

    const { message } = data;
    const duel = activeDuels.get(duelId);
    
    if (duel) {
      // Broadcast to opponent only (sender shows message immediately on frontend)
      broadcastToDuel(duelId, {
        type: 'CHAT_MESSAGE',
        userId,
        nickname: duel.participants.find(p => p.userId === userId)?.nickname,
        message,
        timestamp: Date.now()
      }, userId); // Exclude sender since they already added it locally
    }
  }
});

// Matchmaking logic
async function tryMatchmaking() {
  while (matchmakingQueue.length >= 2) {
    // Simple matchmaking: pair first two players with same difficulty/language preference
    const player1 = matchmakingQueue[0];
    const matchIndex = matchmakingQueue.findIndex((p, idx) => 
      idx > 0 && 
      p.difficulty === player1.difficulty && 
      p.language === player1.language
    );

    if (matchIndex === -1) {
      // No exact match, check if queue is getting too long
      if (matchmakingQueue.length >= 4) {
        // Match first two anyway
        const player2 = matchmakingQueue[1];
        await createDuel(player1, player2);
      } else {
        // Wait for better match
        break;
      }
    } else {
      const player2 = matchmakingQueue[matchIndex];
      await createDuel(player1, player2);
    }
  }
}

// Create a new duel session
async function createDuel(player1, player2) {
  // Remove from queue
  removeFromQueue(player1.userId);
  removeFromQueue(player2.userId);

  const duelId = `duel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get a random problem from database
  const problem = await getRandomProblem(player1.difficulty, player1.language);

  if (!problem) {
    // No problems available, notify players and return to queue
    player1.ws.send(JSON.stringify({ 
      type: 'ERROR', 
      message: 'No problems available for this difficulty/language' 
    }));
    player2.ws.send(JSON.stringify({ 
      type: 'ERROR', 
      message: 'No problems available for this difficulty/language' 
    }));
    return;
  }

  const duel = {
    id: duelId,
    problem: {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      starterCode: problem.starter_code,
      language: problem.language,
      timeLimit: problem.time_limit_ms,
      memoryLimit: problem.memory_limit_mb,
      publicTests: problem.tests_public,
      tests_public: problem.tests_public,
      tests_hidden: problem.tests_hidden,
      testsPublic: problem.tests_public,
      testsHidden: problem.tests_hidden
    },
    participants: [
      {
        userId: player1.userId,
        nickname: player1.nickname,
        avatar: player1.avatar,
        submissions: [],
        completedAt: null,
        finalScore: 0
      },
      {
        userId: player2.userId,
        nickname: player2.nickname,
        avatar: player2.avatar,
        submissions: [],
        completedAt: null,
        finalScore: 0
      }
    ],
    startedAt: Date.now(),
    endedAt: null,
    winner: null,
    duration: 15 * 60 * 1000 // 15 minutes max
  };

  activeDuels.set(duelId, duel);

  // Save duel to database
  await supabase.from('duels').insert({
    id: duelId,
    problem_id: problem.id,
    player1_id: player1.userId,
    player2_id: player2.userId,
    status: 'active',
    started_at: new Date(duel.startedAt).toISOString()
  });

  // Notify both players
  const duelStartMessage = {
    type: 'DUEL_START',
    duelId,
    problem: {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      starterCode: problem.starter_code,
      language: problem.language,
      publicTests: problem.tests_public,
      tests_public: problem.tests_public,
      tests_hidden: problem.tests_hidden,
      testsPublic: problem.tests_public,
      testsHidden: problem.tests_hidden
    },
    opponent: null, // will be set per player
    timeLimit: duel.duration
  };

  const msg1 = { ...duelStartMessage, opponent: { nickname: player2.nickname, avatar: player2.avatar } };
  const msg2 = { ...duelStartMessage, opponent: { nickname: player1.nickname, avatar: player1.avatar } };

  player1.ws.send(JSON.stringify(msg1));
  player2.ws.send(JSON.stringify(msg2));

  // Set currentDuelId for both players' WebSocket connections
  // This needs to be done through a Map since we can't access the closure variables directly
  // We'll store it in a way that can be accessed by the message handlers
  player1.ws._currentDuelId = duelId;
  player2.ws._currentDuelId = duelId;

  console.log(`Duel created: ${duelId} between ${player1.nickname} and ${player2.nickname}`);

  // Set timer to auto-complete duel
  setTimeout(() => {
    if (activeDuels.has(duelId)) {
      completeDuel(duelId);
    }
  }, duel.duration);
}

// Execute code with Judge0 API
async function executeCodeWithJudge0(code, language, problem) {
  const languageIds = {
    'python': 71,  // Python 3
    'javascript': 63, // JavaScript (Node.js)
    'java': 62,    // Java
    'cpp': 54,     // C++ (GCC)
    'c': 50        // C (GCC)
  };

  const languageId = languageIds[language] || 71;

  try {
    // Create submission
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: '',
        expected_output: '',
        cpu_time_limit: problem.timeLimit / 1000,
        memory_limit: problem.memoryLimit * 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    const submission = submissionResponse.data;

    // Run hidden tests if code compiled successfully
    let testResults = [];
    let passed = false;
    let score = 0;

    if (submission.status.id <= 3) { // Accepted or running
      // Run against hidden test cases
      const hiddenTests = problem.tests_hidden || [];
      testResults = await runTestCases(code, languageId, hiddenTests);
      
      const passedTests = testResults.filter(t => t.passed).length;
      passed = passedTests === testResults.length;
      score = Math.round((passedTests / testResults.length) * 100);
    }

    return {
      status: submission.status.description,
      passed,
      score,
      time: submission.time,
      memory: submission.memory,
      stdout: submission.stdout,
      stderr: submission.stderr,
      testResults
    };

  } catch (error) {
    console.error('Judge0 API error:', error.response?.data || error.message);
    throw new Error('Code execution failed');
  }
}

// Run multiple test cases
async function runTestCases(code, languageId, testCases) {
  const results = [];

  for (const test of testCases) {
    try {
      const response = await axios.post(
        `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: languageId,
          stdin: test.input,
          expected_output: test.output
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      const submission = response.data;
      
      results.push({
        input: test.input,
        expectedOutput: test.output,
        actualOutput: submission.stdout?.trim(),
        passed: submission.status.id === 3, // Status 3 = Accepted
        status: submission.status.description
      });
    } catch (error) {
      results.push({
        input: test.input,
        passed: false,
        error: error.message
      });
    }
  }

  return results;
}

// Get random problem from database
async function getRandomProblem(difficulty, language) {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('language', language)
    .limit(10);

  if (error || !data || data.length === 0) {
    return null;
  }

  // Return random problem from the set
  return data[Math.floor(Math.random() * data.length)];
}

// Complete a duel and calculate results
async function completeDuel(duelId) {
  const duel = activeDuels.get(duelId);
  if (!duel) {
    console.log(`❌ completeDuel: Duel ${duelId} not found`);
    return;
  }

  console.log(`🏁 Completing duel ${duelId}...`);
  duel.endedAt = Date.now();

  // Determine winner
  const [p1, p2] = duel.participants;
  console.log(`Participants: P1(${p1.nickname}, score: ${p1.finalScore}, completed: ${!!p1.completedAt}), P2(${p2.nickname}, score: ${p2.finalScore}, completed: ${!!p2.completedAt})`);
  
  let winner = null;
  if (p1.completedAt && p2.completedAt) {
    // Both completed - faster wins, or higher score if tied
    if (p1.completedAt < p2.completedAt) {
      winner = p1.userId;
    } else if (p2.completedAt < p1.completedAt) {
      winner = p2.userId;
    } else {
      winner = p1.finalScore >= p2.finalScore ? p1.userId : p2.userId;
    }
  } else if (p1.completedAt) {
    winner = p1.userId;
  } else if (p2.completedAt) {
    winner = p2.userId;
  } else {
    // Neither completed - highest score wins
    winner = p1.finalScore >= p2.finalScore ? p1.userId : p2.userId;
  }

  duel.winner = winner;

  // Update database
  await supabase.from('duels').update({
    status: 'completed',
    winner_id: winner,
    ended_at: new Date(duel.endedAt).toISOString(),
    player1_score: p1.finalScore,
    player2_score: p2.finalScore
  }).eq('id', duelId);

  // Award XP
  const winnerXP = 200;
  const loserXP = 50;

  for (const participant of duel.participants) {
    const xp = participant.userId === winner ? winnerXP : loserXP;
    await awardXP(participant.userId, xp, 'code_duel');

    // Track event
    await supabase.from('events').insert({
      user_id: participant.userId,
      type: 'duel_completed',
      meta: {
        duel_id: duelId,
        result: participant.userId === winner ? 'won' : 'lost',
        xp_earned: xp,
        score: participant.finalScore
      }
    });
  }

  // Broadcast results
  console.log(`📡 Broadcasting DUEL_END. Winner: ${winner}`);
  broadcastToDuel(duelId, {
    type: 'DUEL_END',
    winner,
    results: {
      player1: {
        userId: p1.userId,
        nickname: p1.nickname,
        score: p1.finalScore,
        completedAt: p1.completedAt,
        xpEarned: p1.userId === winner ? winnerXP : loserXP
      },
      player2: {
        userId: p2.userId,
        nickname: p2.nickname,
        score: p2.finalScore,
        completedAt: p2.completedAt,
        xpEarned: p2.userId === winner ? winnerXP : loserXP
      }
    }
  });

  // Clean up
  setTimeout(() => {
    activeDuels.delete(duelId);
  }, 5000); // Keep for 5 seconds to allow message delivery
}

// Forfeit a duel
async function forfeitDuel(duelId, userId) {
  const duel = activeDuels.get(duelId);
  if (!duel) return;

  const opponent = duel.participants.find(p => p.userId !== userId);
  
  duel.endedAt = Date.now();
  duel.winner = opponent.userId;

  // Update database
  await supabase.from('duels').update({
    status: 'forfeited',
    winner_id: opponent.userId,
    ended_at: new Date(duel.endedAt).toISOString()
  }).eq('id', duelId);

  // Award XP to winner only
  await awardXP(opponent.userId, 150, 'code_duel_forfeit');

  // Notify opponent
  broadcastToDuel(duelId, {
    type: 'DUEL_FORFEITED',
    forfeitedBy: userId,
    winner: opponent.userId
  });

  activeDuels.delete(duelId);
}

// Handle disconnect from duel
function handleDisconnectFromDuel(duelId, userId) {
  // Treat as forfeit
  forfeitDuel(duelId, userId);
}

// Award XP to user
async function awardXP(userId, xp, source) {
  const { data: gamification } = await supabase
    .from('gamification')
    .select('points, level')
    .eq('user_id', userId)
    .single();

  const newPoints = (gamification?.points || 0) + xp;
  const newLevel = Math.floor(Math.sqrt(newPoints) / 10);

  await supabase.from('gamification').upsert({
    user_id: userId,
    points: newPoints,
    level: newLevel
  });
}

// Broadcast message to all participants in a duel
function broadcastToDuel(duelId, message, excludeUserId = null) {
  const duel = activeDuels.get(duelId);
  if (!duel) {
    console.log(`⚠️ broadcastToDuel: Duel ${duelId} not found`);
    return;
  }

  console.log(`📡 Broadcasting ${message.type} to duel ${duelId}`, excludeUserId ? `(excluding ${excludeUserId})` : '');

  for (const participant of duel.participants) {
    if (excludeUserId && participant.userId === excludeUserId) {
      console.log(`  ⏭️ Skipping ${participant.userId} (excluded)`);
      continue;
    }
    
    const ws = connectedClients.get(participant.userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log(`  ✅ Sent to ${participant.userId} (${participant.nickname})`);
      ws.send(JSON.stringify(message));
    } else {
      console.log(`  ❌ Failed to send to ${participant.userId} (${participant.nickname}) - WebSocket not open`);
    }
  }
}

// Broadcast current duel state
function broadcastDuelState(duelId) {
  const duel = activeDuels.get(duelId);
  if (!duel) return;

  const state = {
    type: 'DUEL_STATE',
    participants: duel.participants.map(p => ({
      userId: p.userId,
      nickname: p.nickname,
      submissionCount: p.submissions.length,
      completed: !!p.completedAt,
      score: p.finalScore
    })),
    timeRemaining: Math.max(0, duel.duration - (Date.now() - duel.startedAt))
  };

  broadcastToDuel(duelId, state);
}

// Helper: Remove player from queue
function removeFromQueue(userId) {
  const index = matchmakingQueue.findIndex(p => p.userId === userId);
  if (index !== -1) {
    matchmakingQueue.splice(index, 1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  wss.close(() => {
    process.exit(0);
  });
});
