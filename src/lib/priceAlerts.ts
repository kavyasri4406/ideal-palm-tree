// Smart Mandi Price Threshold Alerts Manager
// Stores, checks, and manages farmer price alerts with Web Push integration
import { sendPushToThisDevice } from "@/lib/pushClient";

export interface PriceAlert {
  id: string;
  cropId: string;
  cropName: string;
  mandiName: string;
  district: string;
  state: string;
  condition: "above" | "below";
  targetPrice: number;
  unit: string; // e.g. "₹/qtl" or "₹/kg"
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  lastCheckedPrice?: number;
}

const STORAGE_KEY = "agri_price_alerts";

// Ids of sample alerts that older versions seeded automatically. The user never created
// them (one fired on first load), so they are dropped when alerts are read.
const LEGACY_SEEDED_ALERT_IDS = ["alert_default_1", "alert_default_2"];

export function getPriceAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const alerts = (parsed as PriceAlert[]).filter(a => !LEGACY_SEEDED_ALERT_IDS.includes(a.id));
    if (alerts.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    }
    return alerts;
  } catch (err) {
    console.error("Failed to load price alerts:", err);
    return [];
  }
}

export function savePriceAlert(newAlertData: Omit<PriceAlert, "id" | "createdAt" | "active">): PriceAlert {
  const alerts = getPriceAlerts();
  const alert: PriceAlert = {
    ...newAlertData,
    id: "alert_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    active: true
  };

  const updated = [alert, ...alerts];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return alert;
}

export function deletePriceAlert(id: string): void {
  const alerts = getPriceAlerts();
  const updated = alerts.filter(a => a.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export function togglePriceAlert(id: string): boolean {
  const alerts = getPriceAlerts();
  let newState = true;
  const updated = alerts.map(a => {
    if (a.id === id) {
      newState = !a.active;
      return { ...a, active: newState };
    }
    return a;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newState;
}

export function updateAlertTriggered(id: string, currentPrice: number): void {
  const alerts = getPriceAlerts();
  const updated = alerts.map(a => {
    if (a.id === id) {
      return {
        ...a,
        lastTriggeredAt: new Date().toISOString(),
        lastCheckedPrice: currentPrice
      };
    }
    return a;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

/**
 * Sends the alert as a native Web Push to this device's lockscreen (if push is enabled here)
 */
export async function dispatchPriceNotification(title: string, body: string): Promise<void> {
  try {
    await sendPushToThisDevice({ title, body, url: "/my-crops", tag: "mandi-price-alert" });
  } catch (err) {
    console.warn("Could not send Web Push notification:", err);
  }
}
