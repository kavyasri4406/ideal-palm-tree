import fs from "fs";
import os from "os";
import path from "path";
import webpush from "web-push";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
  userAgent?: string;
  createdAt?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

// Durable storage: when NEXT_PUBLIC_SUPABASE_URL and the server-only SUPABASE_SECRET_KEY are set,
// subscriptions live in the `public.push_subscriptions` table (see supabase/schema.sql). RLS is on
// with no policies, so only the secret key can access it — never import this module client-side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const TABLE = "push_subscriptions";
let supabaseClient: SupabaseClient | null = null;

function db(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseSecretKey) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return supabaseClient;
}

interface SubscriptionRow {
  endpoint: string;
  keys: PushSubscriptionData["keys"];
  expiration_time: number | null;
  user_agent: string | null;
  created_at: string;
}

function fromRow(row: SubscriptionRow): PushSubscriptionData {
  return {
    endpoint: row.endpoint,
    keys: row.keys,
    expirationTime: row.expiration_time,
    userAgent: row.user_agent ?? undefined,
    createdAt: row.created_at
  };
}

// Fallback without Supabase: serverless hosts (e.g. Vercel) have a read-only filesystem except the
// OS temp dir, which is per-instance and wiped on cold starts. Subscriptions are also kept in memory
// so a failed write never breaks a request.
const PROJECT_DATA_DIR = path.join(process.cwd(), "data");
const TMP_DATA_DIR = path.join(os.tmpdir(), "agripredict");
let dataDir = process.env.VERCEL ? TMP_DATA_DIR : PROJECT_DATA_DIR;
let memorySubs: PushSubscriptionData[] | null = null;

function subscriptionsFile(): string {
  return path.join(dataDir, "push_subscriptions.json");
}

// VAPID keys must come from the environment (generate them with `node scripts/gen_vapid.cjs`).
// Never hardcode a fallback: anyone holding the private key can push to every subscriber.
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@agripredict.in";

let vapidReady = false;
if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
    vapidReady = true;
  } catch (e) {
    console.warn("Failed to set VAPID details:", e);
  }
}

export function getVapidPublicKey(): string | null {
  return vapidReady && publicVapidKey ? publicVapidKey : null;
}

export function isPushConfigured(): boolean {
  return vapidReady;
}

function writeSubscriptions(subs: PushSubscriptionData[]): void {
  memorySubs = subs;
  const data = JSON.stringify(subs, null, 2);
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(subscriptionsFile(), data, "utf-8");
  } catch (err) {
    if (dataDir === TMP_DATA_DIR) {
      console.warn("Could not persist push subscriptions (kept in memory only):", err);
      return;
    }
    // Read-only project directory: fall back to the writable temp dir
    dataDir = TMP_DATA_DIR;
    writeSubscriptions(subs);
  }
}

function readLocalSubscriptions(): PushSubscriptionData[] {
  if (memorySubs) return memorySubs;
  try {
    const parsed = JSON.parse(fs.readFileSync(subscriptionsFile(), "utf-8"));
    memorySubs = Array.isArray(parsed) ? parsed : [];
  } catch {
    memorySubs = [];
  }
  return memorySubs;
}

export async function getAllSubscriptions(): Promise<PushSubscriptionData[]> {
  const client = db();
  if (!client) return readLocalSubscriptions();
  const { data, error } = await client.from(TABLE).select("*");
  if (error) {
    console.error("Error loading push subscriptions:", error.message);
    return [];
  }
  return (data as SubscriptionRow[]).map(fromRow);
}

export async function getSubscription(endpoint: string): Promise<PushSubscriptionData | null> {
  const client = db();
  if (!client) return readLocalSubscriptions().find((s) => s.endpoint === endpoint) ?? null;
  const { data, error } = await client.from(TABLE).select("*").eq("endpoint", endpoint).maybeSingle();
  if (error) {
    console.error("Error loading push subscription:", error.message);
    return null;
  }
  return data ? fromRow(data as SubscriptionRow) : null;
}

export async function countSubscriptions(): Promise<number> {
  const client = db();
  if (!client) return readLocalSubscriptions().length;
  const { count, error } = await client.from(TABLE).select("endpoint", { count: "exact", head: true });
  if (error) {
    console.error("Error counting push subscriptions:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function saveSubscription(sub: PushSubscriptionData): Promise<boolean> {
  const client = db();
  if (client) {
    const { error } = await client.from(TABLE).upsert(
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
        expiration_time: sub.expirationTime ?? null,
        user_agent: sub.userAgent ?? null,
        created_at: new Date().toISOString()
      },
      { onConflict: "endpoint" }
    );
    if (error) {
      console.error("Error saving subscription:", error.message);
      return false;
    }
    return true;
  }

  try {
    const subs = [...readLocalSubscriptions()];
    // Check if endpoint already exists
    const index = subs.findIndex((s) => s.endpoint === sub.endpoint);
    if (index >= 0) {
      subs[index] = { ...subs[index], ...sub, createdAt: new Date().toISOString() };
    } else {
      subs.push({ ...sub, createdAt: new Date().toISOString() });
    }
    writeSubscriptions(subs);
    return true;
  } catch (err) {
    console.error("Error saving subscription:", err);
    return false;
  }
}

/** Removes one or more subscriptions by endpoint (used for unsubscribe and pruning dead endpoints). */
export async function removeSubscription(endpoint: string | string[]): Promise<boolean> {
  const endpoints = Array.isArray(endpoint) ? endpoint : [endpoint];
  if (endpoints.length === 0) return true;
  const client = db();
  if (client) {
    const { error } = await client.from(TABLE).delete().in("endpoint", endpoints);
    if (error) {
      console.error("Error removing subscription:", error.message);
      return false;
    }
    return true;
  }

  try {
    writeSubscriptions(readLocalSubscriptions().filter((s) => !endpoints.includes(s.endpoint)));
    return true;
  } catch (err) {
    console.error("Error removing subscription:", err);
    return false;
  }
}

/**
 * Sends a push notification. With `targetEndpoint`, only that one subscription is
 * notified (used for a device's own price alerts); without it, every subscriber is.
 */
export async function sendPushNotification(payload: PushPayload, targetEndpoint?: string): Promise<{
  success: boolean;
  totalSubscribers: number;
  sent: number;
  failed: number;
}> {
  let subs: PushSubscriptionData[];
  if (targetEndpoint) {
    const target = await getSubscription(targetEndpoint);
    subs = target ? [target] : [];
  } else {
    subs = await getAllSubscriptions();
  }
  if (subs.length === 0 || !vapidReady) {
    return { success: vapidReady, totalSubscribers: subs.length, sent: 0, failed: 0 };
  }

  const jsonPayload = JSON.stringify({
    title: payload.title || "🌾 AgriPredict Alert",
    body: payload.body || "Mandi rates and agricultural advisories have been updated.",
    url: payload.url || "/crops",
    tag: payload.tag || "agripredict-update",
    icon: payload.icon || "/icon.png",
    badge: payload.badge || "/icon.png",
    timestamp: Date.now()
  });

  let sent = 0;
  let failed = 0;
  const deadEndpoints: string[] = [];

  const promises = subs.map(async (subscription) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        jsonPayload
      );
      sent++;
    } catch (err) {
      failed++;
      const statusCode = err instanceof webpush.WebPushError ? err.statusCode : undefined;
      // If subscription expired or was unsubscribed by user (404/410), prune it
      if (statusCode === 404 || statusCode === 410) {
        deadEndpoints.push(subscription.endpoint);
      } else {
        console.warn("Failed to deliver push to subscription:", err instanceof Error ? err.message : err);
      }
    }
  });

  await Promise.allSettled(promises);

  // Clean up any dead subscriptions
  if (deadEndpoints.length > 0) await removeSubscription(deadEndpoints);

  return {
    success: true,
    totalSubscribers: subs.length,
    sent,
    failed
  };
}
