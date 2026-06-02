import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdcykazqmowkmkhykepb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkY3lrYXpxbW93a21raHlrZXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjQwNzEsImV4cCI6MjA3NTQ0MDA3MX0.lDeWRNri-hPV6JMH2tRiwvYrN64hOKYuGUhre6rQeaA';

console.log('[supabase] Initializing client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: localStorage,
    storageKey: 'atelier-auth',
  },
  global: {
    headers: {
      'x-application-name': 'atelier-lasik',
    },
  },
  db: {
    schema: 'public',
  },
});
