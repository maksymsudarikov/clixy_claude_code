// Keep Supabase project active by pinging it periodically
// Run this on a cron job (GitHub Actions, Vercel Cron, etc.)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
  try {
    // Simple query to keep the database active
    const { data, error } = await supabase
      .from('shoots')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error pinging Supabase:', error);
      process.exit(1);
    }

    console.log('✅ Supabase project is active:', new Date().toISOString());
  } catch (err) {
    console.error('Failed to ping Supabase:', err);
    process.exit(1);
  }
}

keepAlive();
