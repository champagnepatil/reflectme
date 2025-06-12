import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Check if environment variables are still placeholder values
if (supabaseUrl === 'your_supabase_url' || supabaseUrl.includes('your_supabase_url')) {
  throw new Error('VITE_SUPABASE_URL is not configured. Please set your actual Supabase project URL in the .env file.');
}

if (supabaseAnonKey === 'your_supabase_anon_key' || supabaseAnonKey.includes('your_supabase_anon_key')) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not configured. Please set your actual Supabase anon key in the .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Please ensure it's a valid URL (e.g., https://your-project.supabase.co)`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);