import { useEffect, useState } from "react";
import { stopSpeech } from "../audio/voice.js";
import { stopSounds } from "../audio/sounds.js";
const current = () => window.location.hash.slice(1) || "/";
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
