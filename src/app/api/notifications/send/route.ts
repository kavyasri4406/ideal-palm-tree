import { NextRequest, NextResponse } from "next/server";
import { getSubscription, isPushConfigured, sendPushNotification, type PushPayload } from "@/lib/pushSubscriptionStore";

// Only same-origin paths may be opened from a notification click (blocks phishing links).
function safeAppPath(url: unknown): string {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/crops";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as (PushPayload & { endpoint?: string }) | null;

    if (!body || typeof body !== "object" || !body.title || !body.body) {
      return NextResponse.json(
        { error: "Title and body are required for notification" },
        { status: 400 }
      );
    }

    if (!isPushConfigured()) {
      return NextResponse.json(
        { error: "Push notifications are not configured on this server (missing VAPID keys)." },
        { status: 503 }
      );
    }

    // A device may notify itself by proving it owns a registered subscription endpoint.
    // Broadcasting to every subscriber requires the server-side admin token.
    const targetEndpoint = typeof body.endpoint === "string" ? body.endpoint : undefined;
    if (targetEndpoint) {
      if (!(await getSubscription(targetEndpoint))) {
        return NextResponse.json({ error: "This device is not subscribed to push notifications." }, { status: 404 });
      }
    } else {
      const adminToken = process.env.PUSH_ADMIN_TOKEN;
      if (!adminToken || req.headers.get("authorization") !== `Bearer ${adminToken}`) {
        return NextResponse.json({ error: "Unauthorized broadcast" }, { status: 401 });
      }
    }

    const result = await sendPushNotification(
      {
        title: String(body.title).slice(0, 120),
        body: String(body.body).slice(0, 500),
        url: safeAppPath(body.url),
        tag: typeof body.tag === "string" ? body.tag.slice(0, 64) : "agripredict-push",
        icon: "/icon.png",
        badge: "/icon.png"
      },
      targetEndpoint
    );

    return NextResponse.json({
      success: true,
      deliveredTo: result.sent,
      totalSubscribers: result.totalSubscribers,
      failed: result.failed,
      message: `Push notification dispatched to ${result.sent} subscriber(s)!`
    });
  } catch (err) {
    console.error("Error sending push notification:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
