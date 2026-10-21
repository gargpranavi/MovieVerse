/*
   MovieVerse – supabaseClient.js
   Member 2 | Single Supabase client instance for the whole app.

   SECURITY NOTES:
   ─────────────────────────────────────────────────────────────────
   • VITE_SUPABASE_URL        – your project URL (safe in browser)
   • VITE_SUPABASE_ANON_KEY   – your publishable anon key (safe in browser)
   • NEVER add the service-role key here. It must only live server-side.
   • Both values are read from .env at build time; see .env.example for format.
   ─────────────────────────────────────────────────────────────────
*/

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (import.meta.env.DEV && (!supabaseUrl || !supabaseKey)) {
  console.warn(
    '[MovieVerse] Supabase is not configured.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
    'Auth features will not work until credentials are provided.\n' +
    'See .env.example for the required format.'
  )
}

/**
 * Pre-configured Supabase client.
 * Import this wherever you need auth or database access.
 *
 * @example
 * import { supabase } from '../services/supabaseClient'
 * const { data, error } = await supabase.auth.signInWithPassword({ email, password })
 */
export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseKey  ?? 'placeholder-anon-key',
  {
    auth: {
      // Persist session across page refreshes (uses localStorage by default)
      persistSession: true,
      // Automatically refresh the JWT before it expires
      autoRefreshToken: true,
      // Detect OAuth callback hash on the redirect page
      detectSessionInUrl: true,
    },
  }
)
