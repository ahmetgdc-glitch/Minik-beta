import { useEffect } from "react";

export function useGameWakeLock(active) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return undefined;
    let sentinel = null;
    let cancelled = false;

    async function request() {
      if (cancelled || document.visibilityState !== "visible") return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        sentinel = null;
      }
    }
    function onVisibility() {
      if (document.visibilityState === "visible" && !sentinel) request();
    }

    request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      try { sentinel?.release(); } catch {}
      sentinel = null;
    };
  }, [active]);
}
