import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !googleMapsKey) {
    throw new Error("CRITICAL: Missing Environment Variables (Supabase or Google Maps). Please check Vercel settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
