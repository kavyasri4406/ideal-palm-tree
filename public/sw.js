// AgriPredict Service Worker for Native Web Push Notifications
// Works on Android, Windows, macOS, iOS (PWA), Linux

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: "AgriPredict Alert", body: event.data.text() };
    }
  }

  const title = data.title || "🌾 AgriPredict Alert";
  const options = {
    body: data.body || "Real-time Mandi price & weather advisory update.",
    icon: data.icon || "/icon.png",
    badge: data.badge || "/icon.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/crops",
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    tag: data.tag || "agripredict-alert",
    renotify: true,
    actions: [
      {
        action: "explore",
        title: "📊 View Details"
      },
      {
        action: "close",
        title: "✖ Close"
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Only ever open pages of this app, never an arbitrary URL from the push payload
  let targetUrl = new URL("/", self.location.origin).href;
  try {
    const candidate = new URL(event.notification.data?.url || "/", self.location.origin);
    if (candidate.origin === self.location.origin) targetUrl = candidate.href;
  } catch {
    // keep the home page
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      const existing = windowClients.find((client) => client.url.startsWith(self.location.origin) && "focus" in client);
      if (existing) {
        // navigate() rejects for windows this worker doesn't control; fall back to a new window
        return existing.focus()
          .then((client) => client.navigate(targetUrl))
          .catch(() => clients.openWindow(targetUrl));
      }
      // Otherwise open a new tab/window
      return clients.openWindow(targetUrl);
    })
  );
});
