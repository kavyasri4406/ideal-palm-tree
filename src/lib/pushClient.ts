// Client-side helpers for this device's Web Push subscription

export interface DevicePushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

async function getDeviceSubscription(): Promise<PushSubscription | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    return (await registration?.pushManager.getSubscription()) ?? null;
  } catch {
    return null;
  }
}

export async function getDevicePushEndpoint(): Promise<string | null> {
  return (await getDeviceSubscription())?.endpoint ?? null;
}

/**
 * Sends a lockscreen notification to this device only (never to other subscribers).
 * Returns null when this device has not enabled push notifications.
 */
export async function sendPushToThisDevice(payload: DevicePushPayload): Promise<Response | null> {
  const subscription = await getDeviceSubscription();
  if (!subscription) return null;
  const send = () =>
    fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, endpoint: subscription.endpoint })
    });

  const res = await send();
  if (res.status !== 404) return res;

  // The server's subscription store is not durable (serverless instances / cold starts), so it
  // may have forgotten this device: register it again and retry once.
  const reRegistered = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), userAgent: navigator.userAgent })
  }).catch(() => null);
  return reRegistered?.ok ? send() : res;
}
