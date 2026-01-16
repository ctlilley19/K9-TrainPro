import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton for Supabase admin client
// This prevents errors during build when env vars aren't available
let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }

    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}
