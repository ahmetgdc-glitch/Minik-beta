const UPDATE_EVENT = "minik:update-ready";
let updateReadyLatched = false;
let reloadForRequestedUpdate = false;
let visibilityUpdateCleanup = null;
let updateReloadArmed = false;
export const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

export function shouldCheckForOfflineUpdate(lastCheckAt, now = Date.now()) {
  const last = Number(lastCheckAt) || 0;
  return now - last >= UPDATE_CHECK_INTERVAL_MS;
}

export function safeOfflineUpdateRoute(hash = typeof window !== "undefined" ? window.location.hash : "") {
  const route = String(hash || "").replace(/^#/, "");
  return !/^\/(?:play|replay)\//u.test(route);
}

function appScopeUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

function armUpdateReload() {
  if (updateReloadArmed || !("serviceWorker" in navigator)) return;
  updateReloadArmed = true;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    updateReloadArmed = false;
    if (!consumeOfflineReloadRequest()) return;
    window.location.reload();
  });
}

function requestWaitingUpdate(registration) {
  if (!registration?.waiting) return false;
  updateReadyLatched = false;
  reloadForRequestedUpdate = true;
  armUpdateReload();
  try {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
  } catch {
    reloadForRequestedUpdate = false;
    return false;
  }
}

function announceUpdate(registration) {
  if (!registration?.waiting) return;
  updateReadyLatched = true;
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));

  // Do not strand iPhone/iPad users on an old JavaScript bundle just because
  // they never opened the parent screen where the old update button lived.
  // Activate automatically only outside an active game; if an update arrives
  // during play, the hashchange handler below applies it as soon as the child
  // returns to a safe screen.
  if (safeOfflineUpdateRoute()) {
    queueMicrotask(() => {
      if (registration.waiting && safeOfflineUpdateRoute()) requestWaitingUpdate(registration);
    });
  }
}

export async function registerOffline() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return null;
  try {
    const url = new URL("sw.js", appScopeUrl());
    const registration = await navigator.serviceWorker.register(url, {
      scope: new URL("./", url).pathname,
      // GitHub Pages may cache sw.js. Always revalidate the worker script itself
      // so an installed iPhone/iPad sees a freshly deployed MINIK release as
      // soon as the browser performs an update check.
      updateViaCache: "none",
    });

    announceUpdate(registration);
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          announceUpdate(registration);
        }
      });
    });

    // An installed PWA can stay open for hours or days. Re-check after returning
    // from the background, but throttle the network work so rapid app switching
    // cannot hammer GitHub Pages. Replace older listeners if registerOffline is
    // ever called twice (for example by development hot reload).
    let lastCheckAt = 0;
    const checkForUpdate = async (force = false) => {
      const now = Date.now();
      if (!force && !shouldCheckForOfflineUpdate(lastCheckAt, now)) return false;
      lastCheckAt = now;
      try {
        await registration.update();
        announceUpdate(registration);
        return true;
      } catch {
        return false;
      }
    };
    visibilityUpdateCleanup?.();
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkForUpdate();
    };
    const onRouteChange = () => announceUpdate(registration);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("hashchange", onRouteChange);
    visibilityUpdateCleanup = () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("hashchange", onRouteChange);
    };
    void checkForUpdate(true);

    return registration;
  } catch {
    // Offline installation is optional; storage and online play still function.
    return null;
  }
}

export async function applyOfflineUpdate() {
  if (!("serviceWorker" in navigator)) return false;
  let registration;
  try {
    registration = await navigator.serviceWorker.getRegistration(appScopeUrl());
  } catch {
    return false;
  }
  return requestWaitingUpdate(registration);
}

export function consumeOfflineReloadRequest() {
  if (!reloadForRequestedUpdate) return false;
  reloadForRequestedUpdate = false;
  return true;
}

export function onOfflineUpdateReady(listener) {
  window.addEventListener(UPDATE_EVENT, listener);
  // The service worker can finish installing before React mounts this listener.
  // Keep the state latched so a ready update is never lost in that race.
  if (updateReadyLatched) queueMicrotask(() => listener());
  return () => window.removeEventListener(UPDATE_EVENT, listener);
}

export function hasPendingOfflineUpdate() {
  return updateReadyLatched;
}
