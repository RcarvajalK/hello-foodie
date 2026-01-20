import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("CRITICAL: Missing Supabase Environment Variables. Please check Vercel/Netlify settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
