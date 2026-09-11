import { useEffect, useState } from "react";
import { stopSpeech } from "../audio/voice.js";
import { stopSounds } from "../audio/sounds.js";

let firstRouteRead = true;
function current() {
  const path = window.location.hash.slice(1) || "/";
  if (firstRouteRead) {
    firstRouteRead = false;
    // Safari restores the exact hash after a tab/process crash. Never cold-boot
    // directly back into an active game: Home can offer the saved checkpoint
    // safely, while a broken/heavy game can no longer create a crash loop.
    if (path.startsWith("/play/")) {
      try {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#/`,
        );
      } catch {
        window.location.hash = "/";
      }
      return "/";
    }
  }
  return path;
}
export function navigate(path) {
  stopSpeech();
  stopSounds();
  window.location.hash = path;
}
export function useRoute() {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const update = () => {
      setPath(current());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return path.split("/").filter(Boolean);
}
