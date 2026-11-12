import { getSupabase } from "@/lib/supabase";

/** Authorization header carrying the signed-in user's Supabase session, for the guarded API routes. */
export async function authHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}
