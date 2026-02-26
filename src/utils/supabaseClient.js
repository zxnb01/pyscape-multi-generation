import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Use real Supabase client for database queries.
// Auth is bypassed separately in AuthContext.js for development.
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase ANON Key exists:', Boolean(supabaseAnonKey));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
