import { useEffect } from "react";
import { unlockAudio } from "../audio/sounds.js";
import { refreshVoices } from "../audio/voice.js";

/**
 * Prime browser audio from the first real user gesture.
 * iOS/iPadOS Safari may block WebAudio until a direct pointer/keyboard event.
 * Keeping this at app level means later game sounds do not depend on the child
 * tapping a tiny replay control first.
 */
export function useAudioPrime(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let primed = false;
    const prime = () => {
      refreshVoices();
      const context = unlockAudio();
      if (context?.state === "running") {
        primed = true;
        cleanupGestureListeners();
      }
    };
    const resumeAfterBackground = () => {
      if (document.visibilityState === "visible") prime();
    };
    const cleanupGestureListeners = () => {
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("keydown", prime, true);
    };

    // Use capture so the audio unlock runs inside the original user gesture,
    // before a game button can schedule speech or WebAudio effects.
    window.addEventListener("pointerdown", prime, true);
    window.addEventListener("keydown", prime, true);
    document.addEventListener("visibilitychange", resumeAfterBackground);

    return () => {
      cleanupGestureListeners();
      document.removeEventListener("visibilitychange", resumeAfterBackground);
      primed = false;
    };
  }, [enabled]);
}
