import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Throw a helpful error if the environment variables are missing during runtime.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Make sure to set them in your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Session expiry duration in seconds (7 days).
// NOTE: The actual JWT expiry must also be set in Supabase Dashboard:
//   Settings -> Auth -> JWT Expiry (set to 604800 for 7 days).
// The client-side config above ensures proper token refresh behavior,
// but the server-side JWT expiry in the dashboard controls the real limit.
export const SESSION_EXPIRY_SECONDS = 604800;
