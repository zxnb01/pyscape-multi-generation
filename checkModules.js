/**
 * Check modules in database
 */
require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

async function checkModules() {
  try {
    console.log('📚 Checking modules...\n');
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/skills`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const modules = await res.json();
    
    if (modules.length === 0) {
      console.log('❌ No modules found\n');
    } else {
      console.log(`✅ Found ${modules.length} modules:\n`);
      modules.forEach((m, i) => {
        console.log(`  ${i + 1}. ID: ${m.id}, Title: ${m.title || m.name}`);
      });
      console.log();
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkModules();