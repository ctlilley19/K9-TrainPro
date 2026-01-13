import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if we're in demo mode (no Supabase credentials)
export function isDemoMode(): boolean {
  return !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === '';
}

// Create the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Helper to get a typed Supabase client
export function getSupabase() {
  if (isDemoMode()) {
    console.warn('Running in demo mode - Supabase operations will be simulated');
  }
  return supabase;
}
