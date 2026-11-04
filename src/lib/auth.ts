import { getSupabase } from "@/lib/supabase";

// Accounts live in Supabase Auth (passwords are hashed server-side, never stored in the browser).
// The signed-in user's profile is cached in localStorage so pages can read it synchronously;
// every change is written to the `profiles` table (see supabase/schema.sql).

export interface FarmProfile {
  landSize: number; // in Acres
  soilType: string;
  irrigationType: string;
  primaryCrops: string[];
}

export interface User {
  name: string;
  email: string;
  location: string; // state + district combination
  state: string;
  district: string;
  role: string;
  avatar: string;
  portfolio: string[];
  farmProfile?: FarmProfile;
  createdAt: string;
}

/** The signed-in user as cached for this session. */
export type SessionUser = User & { id: string };

type AuthResult = { success: boolean; error?: string; needsConfirmation?: boolean };

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  state: string;
  district: string;
  role: string;
  avatar: string;
  portfolio: string[];
  farm_profile: FarmProfile | null;
  created_at: string;
}

const CURRENT_KEY = "agri_current_user";
// Accounts from the old browser-only login; removed on first load
const LEGACY_USERS_KEY = "agri_users";
const DEFAULT_PORTFOLIO = ["rice", "wheat", "tomato", "mustard"];
const AVATARS = ["🌾", "🌱", "🚜", "🌻", "🥕", "🌿", "🍃", "🫘"];
const NOT_CONFIGURED = "Login service is not configured. Please try again later.";

function rowToSession(row: ProfileRow): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    location: `${row.district}, ${row.state}`,
    state: row.state,
    district: row.district,
    role: row.role,
    avatar: row.avatar,
    portfolio: row.portfolio ?? DEFAULT_PORTFOLIO,
    farmProfile: row.farm_profile ?? undefined,
    createdAt: row.created_at,
  };
}

function saveSession(session: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (session) localStorage.setItem(CURRENT_KEY, JSON.stringify(session));
  else localStorage.removeItem(CURRENT_KEY);
}

// Turn Supabase's error messages into the friendly ones the login page showed before
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password. Please try again.";
  if (m.includes("already registered") || m.includes("already exists")) return "Email already registered. Please sign in.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox for the link.";
  if (m.includes("password")) return message;
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  return message || "Something went wrong. Please try again.";
}

// Loads the profile row for the signed-in user, creating it from sign-up details if missing
async function loadProfile(): Promise<SessionUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing) return rowToSession(existing as ProfileRow);

  const meta = (user.user_metadata || {}) as { name?: string; state?: string; district?: string };
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: (user.email || "").toLowerCase(),
      name: meta.name || "",
      state: meta.state || "",
      district: meta.district || "",
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      portfolio: DEFAULT_PORTFOLIO,
    })
    .select("*")
    .single();
  if (error || !created) {
    console.error("Could not create profile:", error?.message);
    return null;
  }
  return rowToSession(created as ProfileRow);
}

export async function register(
  name: string,
  email: string,
  password: string,
  state: string,
  district: string
): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: NOT_CONFIGURED };
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    // Kept on the auth user so the profile can be created after email confirmation
    options: { data: { name: name.trim(), state, district } },
  });
  if (error) return { success: false, error: friendlyError(error.message) };
  // Supabase returns a user with no identities when the email is already taken
  if (data.user && data.user.identities?.length === 0) {
    return { success: false, error: "Email already registered. Please sign in." };
  }
  // Email confirmation is on: no session until the user clicks the link
  if (!data.session) return { success: true, needsConfirmation: true };

  const profile = await loadProfile();
  if (!profile) return { success: false, error: "Account created, but your profile could not be saved. Please sign in." };
  saveSession(profile);
  return { success: true };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: NOT_CONFIGURED };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) return { success: false, error: friendlyError(error.message) };
  const profile = await loadProfile();
  if (!profile) return { success: false, error: "Could not load your profile. Please try again." };
  saveSession(profile);
  return { success: true };
}

export async function logout() {
  saveSession(null);
  await getSupabase()?.auth.signOut();
}

/**
 * Reconciles the cached profile with the real Supabase session: signs out stale caches,
 * refreshes the profile from the database, and keeps them in sync on future auth changes.
 * Returns an unsubscribe function.
 */
export function syncSession(onChange?: () => void): () => void {
  const supabase = getSupabase();
  if (typeof window !== "undefined") localStorage.removeItem(LEGACY_USERS_KEY);
  if (!supabase) {
    // Old browser-only sessions are no longer valid
    if (getCurrentUser()) { saveSession(null); onChange?.(); }
    return () => {};
  }

  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) {
      if (getCurrentUser()) { saveSession(null); onChange?.(); }
      return;
    }
    const profile = await loadProfile();
    if (profile) { saveSession(profile); onChange?.(); }
  }).catch(err => console.error("Could not refresh session:", err));

  const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
    if (event === "SIGNED_OUT" && getCurrentUser()) { saveSession(null); onChange?.(); }
  });
  return () => subscription.unsubscribe();
}

export function getCurrentUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(CURRENT_KEY) || "null") as SessionUser | null;
    // Sessions from the old browser-only login have no Supabase id
    if (!parsed || typeof parsed !== "object" || typeof parsed.email !== "string" || typeof parsed.id !== "string") return null;
    return parsed;
  } catch { return null; }
}

// Updates the cached profile immediately, then saves the change to Supabase in the background
function updateProfile(email: string, patch: Partial<SessionUser>, row: Partial<ProfileRow>) {
  const current = getCurrentUser();
  if (!current || current.email !== email) return;
  saveSession({ ...current, ...patch });
  const supabase = getSupabase();
  if (!supabase) return;
  supabase.from("profiles").update(row).eq("id", current.id).then(({ error }) => {
    if (error) console.error("Could not save profile:", error.message);
  });
}

export function updatePortfolio(email: string, portfolio: string[]) {
  updateProfile(email, { portfolio }, { portfolio });
}

export function updateUserLocation(email: string, state: string, district: string) {
  updateProfile(email, { state, district, location: `${district}, ${state}` }, { state, district });
}

export function updateUserProfile(email: string, name: string, role: string, avatar: string) {
  updateProfile(email, { name: name.trim(), role, avatar }, { name: name.trim(), role, avatar });
}

export function updateFarmProfile(email: string, farmProfile: FarmProfile) {
  updateProfile(email, { farmProfile }, { farm_profile: farmProfile });
}
