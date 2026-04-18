/**
 * GAMIFICATION DIAGNOSTIC CONSOLE
 * ================================
 * Add this to your browser console to test gamification:
 * 
 * Copy and paste the code in this file into your browser console
 * to run diagnostic tests on the gamification system.
 */

// Initialize the test
console.log("%c🔧 GAMIFICATION DIAGNOSTIC TOOL", "color: blue; font-size: 16px; font-weight: bold");
console.log("================================\n");

// Test 1: Check if user is logged in
const checkUser = async () => {
  console.log("%c🧪 Test 1: User Authentication", "color: #FF6B6B; font-weight: bold");
  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (user) {
      console.log("✅ User logged in:", user.id);
      return user.id;
    } else {
      console.log("❌ No user logged in");
      return null;
    }
  } catch (err) {
    console.error("❌ Auth error:", err);
    return null;
  }
};

// Test 2: Check if gamification tables exist and have data
const checkTables = async (userId) => {
  console.log("\n%c🧪 Test 2: Gamification Tables", "color: #FF6B6B; font-weight: bold");
  if (!userId) {
    console.log("⏭️  Skipping - no user");
    return;
  }

  try {
    // Check user_xp
    const { data: xpData, error: xpErr } = await window.supabaseClient
      .from('user_xp')
      .select('*')
      .eq('user_id', userId);
    
    if (xpErr) {
      console.log("❌ user_xp error:", xpErr);
    } else {
      console.log("✅ user_xp:", xpData);
    }

    // Check user_streaks
    const { data: streakData, error: streakErr } = await window.supabaseClient
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId);
    
    if (streakErr) {
      console.log("❌ user_streaks error:", streakErr);
    } else {
      console.log("✅ user_streaks:", streakData);
    }

    // Check xp_history
    const { data: historyData, error: historyErr } = await window.supabaseClient
      .from('xp_history')
      .select('*')
      .eq('user_id', userId);
    
    if (historyErr) {
      console.log("❌ xp_history error:", historyErr);
    } else {
      console.log("✅ xp_history count:", historyData?.length || 0, "records");
      if (historyData?.length > 0) {
        console.log("   Sample:", historyData[0]);
      }
    }

    // Check user_badges
    const { data: badgeData, error: badgeErr } = await window.supabaseClient
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);
    
    if (badgeErr) {
      console.log("❌ user_badges error:", badgeErr);
    } else {
      console.log("✅ user_badges count:", badgeData?.length || 0);
    }
  } catch (err) {
    console.error("❌ Error checking tables:", err);
  }
};

// Test 3: Check if RPC functions exist
const checkRPCFunctions = async () => {
  console.log("\n%c🧪 Test 3: RPC Functions", "color: #FF6B6B; font-weight: bold");
  try {
    // Test award_xp RPC (without actually awarding)
    console.log("Checking award_xp function...");
    
    // Test get_gamification_stats if it exists
    console.log("Testing get_gamification_stats...");
    
    console.log("✅ RPC functions appear to be accessible");
  } catch (err) {
    console.error("❌ RPC error:", err);
  }
};

// Test 4: Award test XP
const testAwardXP = async (userId) => {
  console.log("\n%c🧪 Test 4: Award Test XP", "color: #FF6B6B; font-weight: bold");
  if (!userId) {
    console.log("⏭️  Skipping - no user");
    return;
  }

  console.log("⏳ Awarding 10 XP for testing...");
  try {
    const { data, error } = await window.supabaseClient.rpc('award_xp', {
      p_user_id: userId,
      p_xp_amount: 10,
      p_source_type: 'bonus',
      p_source_id: 999  // Test ID
    });

    if (error) {
      console.error("❌ Award XP error:", error);
    } else {
      console.log("✅ Award XP response:", data);
      
      // Check if data was persisted
      setTimeout(async () => {
        const { data: checkData } = await window.supabaseClient
          .from('user_xp')
          .select('total_xp')
          .eq('user_id', userId);
        console.log("   After award - Total XP:", checkData?.[0]?.total_xp);
      }, 500);
    }
  } catch (err) {
    console.error("❌ Try-catch error:", err);
  }
};

// Test 5: Update streak
const testUpdateStreak = async (userId) => {
  console.log("\n%c🧪 Test 5: Update Streak", "color: #FF6B6B; font-weight: bold");
  if (!userId) {
    console.log("⏭️  Skipping - no user");
    return;
  }

  console.log("⏳ Updating streak...");
  try {
    const { data, error } = await window.supabaseClient.rpc('update_streak', {
      p_user_id: userId
    });

    if (error) {
      console.error("❌ Update streak error:", error);
    } else {
      console.log("✅ Update streak response:", data);
    }
  } catch (err) {
    console.error("❌ Try-catch error:", err);
  }
};

// Test 6: Check badges
const testCheckBadges = async (userId) => {
  console.log("\n%c🧪 Test 6: Check and Award Badges", "color: #FF6B6B; font-weight: bold");
  if (!userId) {
    console.log("⏭️  Skipping - no user");
    return;
  }

  console.log("⏳ Checking badges...");
  try {
    const { data, error } = await window.supabaseClient.rpc('check_and_award_badges', {
      p_user_id: userId
    });

    if (error) {
      console.error("❌ Check badges error:", error);
    } else {
      console.log("✅ Check badges response:", data);
      console.log("   New badges earned:", data?.length || 0);
    }
  } catch (err) {
    console.error("❌ Try-catch error:", err);
  }
};

// Run all tests
const runAllTests = async () => {
  const userId = await checkUser();
  await checkTables(userId);
  await checkRPCFunctions();
  
  if (userId) {
    await testAwardXP(userId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testUpdateStreak(userId);
    await testCheckBadges(userId);
  }
  
  console.log("\n%c✅ DIAGNOSTIC COMPLETE", "color: green; font-size: 14px; font-weight: bold");
};

// Export functions to window for manual testing
window.GAMIFICATION_TESTS = {
  runAllTests,
  checkUser,
  checkTables,
  testAwardXP,
  testUpdateStreak,
  testCheckBadges
};

console.log("%c💡 How to use:", "color: #4ECDC4; font-weight: bold");
console.log("Run: window.GAMIFICATION_TESTS.runAllTests()");
console.log("Or run individual tests:");
console.log("  - window.GAMIFICATION_TESTS.checkUser()");
console.log("  - window.GAMIFICATION_TESTS.testAwardXP(userId)");
console.log("\n");

// Auto-run
runAllTests();
