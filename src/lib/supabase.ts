import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only admin client. Uses the service-role key, which bypasses RLS.
// NEVER import this into a client component.
// We don't generate Supabase types, so use a permissive client (any schema).
let cached: SupabaseClient<any, "public", any> | null = null;

export function supabaseAdmin(): SupabaseClient<any, "public", any> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  cached = createClient<any, "public", any>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
