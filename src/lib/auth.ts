import { getSupabase } from "@/lib/supabase";

// Two login modes:
// - Supabase configured: accounts live in Supabase Auth (passwords hashed server-side) and every
//   profile change is written to the `profiles` table (see supabase/schema.sql).
// - Supabase not configured: accounts are kept in this browser's localStorage (password stored
//   as a salted hash). They exist only on this device and are not checked by the server.
// Either way the signed-in profile is cached in localStorage so pages can read it synchronously.

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
// Browser-only accounts, used when Supabase isn't configured: email → account
const LOCAL_USERS_KEY = "agri_local_users";
const LOCAL_ID_PREFIX = "local_";

interface LocalAccount {
  salt: string;
  passwordHash: string;
  profile: SessionUser;
}

function readLocalAccounts(): Record<string, LocalAccount> {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}

function writeLocalAccounts(accounts: Record<string, LocalAccount>) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(accounts));
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const text = `${salt}:${password}`;
  // crypto.subtle only exists on https and localhost
  if (crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  }
  // Plain http on a LAN address: a non-cryptographic hash, still better than the password itself
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `fnv_${(h >>> 0).toString(16)}`;
}

async function createLocalAccount(name: string, email: string, password: string, state: string, district: string): Promise<SessionUser> {
  const salt = randomId();
  const profile: SessionUser = {
    id: LOCAL_ID_PREFIX + randomId(),
    name: name.trim() || email.split("@")[0],
    email,
    location: state && district ? `${district}, ${state}` : "",
    state,
    district,
    role: "Farmer",
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    portfolio: DEFAULT_PORTFOLIO,
    createdAt: new Date().toISOString(),
  };
  const accounts = readLocalAccounts();
  accounts[email] = { salt, passwordHash: await hashPassword(password, salt), profile };
  writeLocalAccounts(accounts);
  return profile;
}

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
  if (!supabase) {
    const key = email.trim().toLowerCase();
    if (readLocalAccounts()[key]) return { success: false, error: "Email already registered. Please sign in." };
    saveSession(await createLocalAccount(name, key, password, state, district));
    return { success: true };
  }
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
  if (!supabase) {
    const key = email.trim().toLowerCase();
    if (!key || !password) return { success: false, error: "Please enter your email and password." };
    const account = readLocalAccounts()[key];
    // First sign-in with a new email creates the account, so there is no separate sign-up step
    if (!account) {
      saveSession(await createLocalAccount("", key, password, "", ""));
      return { success: true };
    }
    if ((await hashPassword(password, account.salt)) !== account.passwordHash) {
      return { success: false, error: "Incorrect email or password. Please try again." };
    }
    saveSession(account.profile);
    return { success: true };
  }
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
    // Browser-only mode: keep local sessions, drop one left over from a Supabase login
    const current = getCurrentUser();
    if (current && !current.id.startsWith(LOCAL_ID_PREFIX)) { saveSession(null); onChange?.(); }
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
  const updated = { ...current, ...patch };
  saveSession(updated);
  const supabase = getSupabase();
  if (!supabase) {
    // Browser-only mode: keep the stored account in step so the change survives signing out
    const accounts = readLocalAccounts();
    if (accounts[current.email]) {
      accounts[current.email].profile = updated;
      writeLocalAccounts(accounts);
    }
    return;
  }
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
