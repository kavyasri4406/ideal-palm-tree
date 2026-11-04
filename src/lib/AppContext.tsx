"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { STATE_DISTRICTS, type District } from "@/lib/locationData";
import { getPriceAlerts, updateAlertTriggered, dispatchPriceNotification } from "@/lib/priceAlerts";
import { CROPS, getLivePrice } from "@/lib/cropData";

export type Language = "en" | "ta" | "te" | "kn" | "ml" | "hi";
const SUPPORTED_LANGUAGES: Language[] = ["en", "ta", "te", "kn", "ml", "hi"];

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "price" | "weather" | "system";
  time: Date;
  read: boolean;
}

export interface LocationInfo {
  state: string;
  district: string;
  lat: number;
  lon: number;
}

interface AppContextType {
  isDark: boolean;
  toggleDark: () => void;
  notifications: Notification[];
  toast: Toast | null;
  addNotification: (n: Omit<Notification, "id" | "time" | "read">) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
  location: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  detectLiveLocation: () => Promise<void>;
  isLocating: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_LOCATION: LocationInfo = {
  state: "Tamil Nadu",
  district: "Madurai",
  lat: 9.9252,
  lon: 78.1198,
};

type Toast = { id: string; title: string; message: string; type: string };

function nearestDistrict(districts: District[], lat: number, lon: number): District {
  const dist = (d: District) => (d.lat - lat) ** 2 + (d.lon - lon) ** 2;
  return districts.reduce((best, d) => (dist(d) < dist(best) ? d : best));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [location, setLocationState] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [language, setLanguageState] = useState<Language>("en");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const lastTriggeredTimeRef = useRef<Record<string, number>>({});

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => {
      setToast(current => current?.id === t.id ? null : current);
    }, 4000);
  }, []);

  const detectLiveLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Free reverse geocoding API
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
          const data = await res.json();

          const stateName: string = (data.principalSubdivision || "").toLowerCase();
          const districtName: string = (data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || "").toLowerCase();

          // Match the geocoded state by name; otherwise use the state of the nearest known district
          const nearestAnywhere = nearestDistrict(Object.values(STATE_DISTRICTS).flat(), latitude, longitude);
          const matchedState = (stateName && Object.keys(STATE_DISTRICTS).find(
            s => s.toLowerCase().includes(stateName) || stateName.includes(s.toLowerCase())
          )) || Object.keys(STATE_DISTRICTS).find(s => STATE_DISTRICTS[s].includes(nearestAnywhere)) || DEFAULT_LOCATION.state;

          // Match the district by name; otherwise use the geographically nearest district
          const districts = STATE_DISTRICTS[matchedState];
          const matchedDist = (districtName && districts.find(
            d => d.name.toLowerCase().includes(districtName) || districtName.includes(d.name.toLowerCase())
          )) || nearestDistrict(districts, latitude, longitude);

          const newLoc = {
            state: matchedState,
            district: matchedDist.name,
            lat: latitude,
            lon: longitude
          };

          setLocationState(newLoc);
          localStorage.setItem("agri_state", matchedState);
          localStorage.setItem("agri_district", matchedDist.name);

          showToast({
            id: String(Date.now()),
            title: "📍 Live Location Detected!",
            message: `Set to ${matchedDist.name}, ${matchedState}`,
            type: "system"
          });
        } catch (err) {
          console.error("Geocoding error:", err);
          showToast({
            id: String(Date.now()),
            title: "📍 Location Coordinates Saved",
            message: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`,
            type: "system"
          });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert("Unable to retrieve location. Please grant location permissions in your browser.");
      },
      { timeout: 10000 }
    );
  };

  // Restore saved preferences after mount: this provider is server-rendered, so reading
  // localStorage during render would cause a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const dark = localStorage.getItem("agri_dark") === "true";
    if (dark) { setIsDark(true); document.body.classList.add("dark-mode"); }
    const lang = localStorage.getItem("agri_lang");
    if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) setLanguageState(lang as Language);
    
    const storedState = localStorage.getItem("agri_state");
    const storedDistrict = localStorage.getItem("agri_district");
    if (storedState && storedDistrict) {
      const districts = STATE_DISTRICTS[storedState];
      const match = districts?.find(d => d.name === storedDistrict);
      if (match) {
        setLocationState({
          state: storedState,
          district: storedDistrict,
          lat: match.lat,
          lon: match.lon,
        });
      }
    }
    
    if (localStorage.getItem("agri_notif_cleaned_v2") !== "true") {
      localStorage.removeItem("agri_notifications");
      localStorage.setItem("agri_notif_cleaned_v2", "true");
      setNotifications([]);
    } else {
      const storedNotif = localStorage.getItem("agri_notifications");
      if (storedNotif) {
        try {
          const parsed = JSON.parse(storedNotif);
          const parsedWithDates = parsed.map((n: Notification) => ({
            ...n,
            time: new Date(n.time)
          }));
          setNotifications(parsedWithDates);
        } catch (err) {
          console.error("Failed to parse stored notifications:", err);
        }
      }
    }
    setHasLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hasLoaded && typeof window !== "undefined") {
      localStorage.setItem("agri_notifications", JSON.stringify(notifications));
    }
  }, [notifications, hasLoaded]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("agri_dark", String(next));
  };

  // Screen readers and the browser's speech engine pick a voice from <html lang>
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "time" | "read">) => {
    const now = Date.now();
    const alertKey = `${n.type}_${n.title}_${n.message}`;
    const lastTime = lastTriggeredTimeRef.current[alertKey] || 0;
    
    // Cooldown of 1 minute per unique alert to prevent repeating spam
    if (now - lastTime < 60000) {
      console.log(`Notification "${n.title}" throttled to prevent spam.`);
      return;
    }
    
    lastTriggeredTimeRef.current[alertKey] = now;
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [{ ...n, id, time: new Date(), read: false }, ...prev].slice(0, 25));
    showToast({ id, title: n.title, message: n.message, type: n.type });
  }, [showToast]);

  // Background monitor for Mandi Price Threshold Alerts
  useEffect(() => {
    if (!hasLoaded || typeof window === "undefined") return;

    const evaluatePriceAlerts = () => {
      try {
        const alerts = getPriceAlerts();
        const activeAlerts = alerts.filter(a => a.active);
        if (activeAlerts.length === 0) return;

        activeAlerts.forEach(alert => {
          const crop = CROPS.find(c => c.id === alert.cropId || c.name.toLowerCase() === alert.cropName.toLowerCase());
          if (!crop) return;
          const currentPrice = getLivePrice(crop);

          const isTriggered =
            (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
            (alert.condition === "below" && currentPrice <= alert.targetPrice);

          if (isTriggered) {
            const lastTriggered = alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).getTime() : 0;
            // Only trigger once every 10 minutes per alert to avoid repetitive notifications
            if (Date.now() - lastTriggered > 10 * 60 * 1000) {
              updateAlertTriggered(alert.id, currentPrice);
              const conditionSymbol = alert.condition === "above" ? "≥" : "≤";
              const title = `🚨 Mandi Price Alert: ${alert.cropName}`;
              const message = `${alert.cropName} at ${alert.mandiName} reached ₹${currentPrice.toLocaleString("en-IN")}/${alert.unit.replace("₹/", "")} (${conditionSymbol} target ₹${alert.targetPrice.toLocaleString("en-IN")})!`;
              
              addNotification({
                title,
                message,
                type: "price"
              });
              dispatchPriceNotification(title, message);
            }
          }
        });
      } catch (err) {
        console.error("Price alert evaluation error:", err);
      }
    };

    // Check 4s after mount, then every 60s
    const initTimer = setTimeout(evaluatePriceAlerts, 4000);
    const intervalTimer = setInterval(evaluatePriceAlerts, 60000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalTimer);
    };
  }, [hasLoaded, addNotification]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  const setLocation = (loc: LocationInfo) => {
    setLocationState(loc);
    localStorage.setItem("agri_state", loc.state);
    localStorage.setItem("agri_district", loc.district);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("agri_lang", lang);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{ isDark, toggleDark, notifications, toast, addNotification, markAllRead, markAsRead, clearNotifications, unreadCount, location, setLocation, detectLiveLocation, isLocating, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
