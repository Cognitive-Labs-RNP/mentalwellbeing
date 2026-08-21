import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/db';

// ---------------------------------------------------------------------------
// Environment variable validation
// Vite exposes VITE_* variables on import.meta.env at build time.
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
  console.warn(
    '[supabase] VITE_SUPABASE_URL is not set. ' +
      'Copy .env.example → .env.local and fill in your project values.'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-public-key-here') {
  console.warn(
    '[supabase] VITE_SUPABASE_ANON_KEY is not set. ' +
      'Copy .env.example → .env.local and fill in your project values.'
  );
}

// ---------------------------------------------------------------------------
// Supabase client
//
// Only the anon/public key is used here.
// The service-role key must NEVER be placed in frontend code.
// Row Level Security (RLS) policies enforce data isolation on the database.
// ---------------------------------------------------------------------------

export const supabase: any = createClient(
  supabaseUrl ?? 'http://localhost:54321', // safe fallback keeps TS happy; warns above
  supabaseAnonKey ?? 'missing-key',
  {
    auth: {
      // Persist the session in localStorage so users stay logged in across page refreshes.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
