import { NextRequest, NextResponse } from "next/server";
import {
  saveSubscription,
  removeSubscription,
  countSubscriptions,
  getVapidPublicKey,
  type PushSubscriptionData
} from "@/lib/pushSubscriptionStore";

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json(
      { publicKey: null, status: "unconfigured", error: "Push notifications are not configured on this server." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    publicKey,
    activeSubscribers: await countSubscriptions(),
    status: "online"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { subscription, userAgent } = body && typeof body === "object" ? body : ({} as Record<string, never>);

    if (
      typeof subscription?.endpoint !== "string" ||
      !subscription.endpoint.startsWith("https://") ||
      typeof subscription.keys?.p256dh !== "string" ||
      typeof subscription.keys?.auth !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const subData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      expirationTime: typeof subscription.expirationTime === "number" ? subscription.expirationTime : null,
      userAgent: String(userAgent || req.headers.get("user-agent") || "").slice(0, 300)
    };

    const saved = await saveSubscription(subData);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to persist subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Push notification subscription registered successfully!"
    });
  } catch (err) {
    console.error("Error registering push subscription:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const endpoint: unknown = body && typeof body === "object" ? body.endpoint : undefined;
    if (typeof endpoint !== "string" || !endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    if (!(await removeSubscription(endpoint))) {
      return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Subscription removed" });
  } catch (err) {
    console.error("Error removing push subscription:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
