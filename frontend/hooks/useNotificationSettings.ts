import { useState, useEffect, useCallback } from "react";

const KEY = "neurosnap-notifications-enabled";

export function useNotificationSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(raw === "true");
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    if (next) {
      const granted = await requestPermission();
      if (!granted) return;
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
        } catch (err) {
          console.warn("[useNotificationSettings] serviceWorker registration failed", err);
        }
      }
    }
    setEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, String(next));
    }
  }, [enabled, requestPermission]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!enabled || typeof window === "undefined") return;
    if ("serviceWorker" in navigator && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "/images/leaf.png",
          badge: "/images/leaf.png",
          tag: "neurosnap-reminder",
        });
      }).catch(() => {});
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/images/leaf.png" });
    }
  }, [enabled]);

  return { enabled, permission, toggle, sendNotification };
}