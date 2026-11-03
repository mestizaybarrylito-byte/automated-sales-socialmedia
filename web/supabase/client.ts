/**
 * Supabase client stub (Step 1 scaffold).
 *
 * Real @supabase/supabase-js wiring lands in a later step with Edge Functions
 * and migrations under /supabase. This stub keeps server secrets out of the
 * client bundle: it only reads NEXT_PUBLIC_* env vars and throws a clear
 * error when they are missing, so no unverified client can silently succeed.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function getSupabaseConfig(): { url: string; anonKey: string } {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (ver web/.env.example)."
    );
  }
  return { url, anonKey };
}
