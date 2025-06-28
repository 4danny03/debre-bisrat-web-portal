// Node.js script to test Supabase connection using process.env
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const { data, error } = await supabase.from('members').select('*').limit(1);
  if (error) {
    console.error('Supabase connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('Supabase connection successful. Example row:', data[0]);
    process.exit(0);
  }
}

testConnection();
