"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, syncSession } from "@/lib/auth";
import { useApp } from "@/lib/AppContext";

import NotificationManager from "@/components/NotificationManager";

const PUBLIC = ["/login"];

const noopSubscribe = () => () => {};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useApp();
  // false during SSR and hydration, true afterwards — keeps the server loading screen hydration-safe.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const isPublic = PUBLIC.includes(pathname);
  // Re-checked on every render so a logged-out user never sees protected content (e.g. Back after logout).
  const hasUser = isClient && !!getCurrentUser();
  const ready = isPublic || hasUser;
  const [mobileOpen, setMobileOpen] = useState(false);
  // Bumped when the Supabase session changes (expired, signed out elsewhere, profile refreshed)
  const [, setSessionVersion] = useState(0);

  useEffect(() => syncSession(() => setSessionVersion(v => v + 1)), []);

  useEffect(() => {
    if (isClient && !isPublic && !hasUser) router.replace("/login");
  }, [isClient, isPublic, hasUser, pathname, router]);

  if (isPublic) return <>{children}</>;
  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading AgriPredict...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Mobile Top Header */}
      <div className="mobile-header" style={{
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--sidebar-border)",
        position: "sticky",
        top: 0,
        zIndex: 180,
      }}>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--sidebar-text)" }}
        >
          ☰
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--sidebar-text)" }}>AgriPredict</span>
        </div>
        <NotificationManager />
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 190,
              backdropFilter: "blur(2px)",
              animation: "fadeIn 0.2s ease-out"
            }}
          />
        )}
        <div className={`main-layout ${pathname === "/chatbot" ? "is-chatbot-layout" : ""}`} style={{ flex: 1 }}>{children}</div>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fade-in" role="status" aria-live="polite" style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 320,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          borderRadius: 16,
          padding: 16,
          zIndex: 9999,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          <div style={{ fontSize: 24 }}>
            {toast.type === "price" ? "💰" : toast.type === "weather" ? "🌦️" : "🔔"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "var(--primary)" }}>{toast.title}</div>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 4, lineHeight: 1.4 }}>{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
