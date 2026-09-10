let deferredPrompt = null;
const listeners = new Set();

function emit() {
  const snapshot = getInstallState();
  listeners.forEach((listener) => listener(snapshot));
}

export function isStandalone(win = window, nav = navigator) {
  try {
    return Boolean(nav?.standalone) || Boolean(win?.matchMedia?.("(display-mode: standalone)")?.matches);
  } catch {
    return false;
  }
}

export function isIosLike(nav = navigator) {
  const ua = String(nav?.userAgent || "");
  const platform = String(nav?.platform || "");
  const touchPoints = Number(nav?.maxTouchPoints || 0);
  return /iPad|iPhone|iPod/i.test(ua) || (platform === "MacIntel" && touchPoints > 1);
}

export function getInstallState(win = window, nav = navigator) {
  const standalone = isStandalone(win, nav);
  return {
    standalone,
    ios: isIosLike(nav),
    promptAvailable: !standalone && Boolean(deferredPrompt),
  };
}

export function subscribeInstallState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function requestInstall() {
  const prompt = deferredPrompt;
  if (!prompt || isStandalone()) return { outcome: "unavailable" };
  deferredPrompt = null;
  emit();
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    return { outcome: choice?.outcome || "dismissed" };
  } catch {
    return { outcome: "failed" };
  }
}

export function captureInstallPrompt(event) {
  event?.preventDefault?.();
  deferredPrompt = event || null;
  emit();
}

export function markInstalled() {
  deferredPrompt = null;
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", captureInstallPrompt);
  window.addEventListener("appinstalled", markInstalled);
}
