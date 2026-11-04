import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client (login + per-user data). Uses only the public publishable key;
// row level security in supabase/schema.sql keeps each user's data private.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!url && !!key;
}

export function getSupabase(): SupabaseClient | null {
  if (!url || !key || typeof window === "undefined") return null;
  if (!client) client = createClient(url, key);
  return client;
}
