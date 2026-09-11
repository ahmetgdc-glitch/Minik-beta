import { useEffect } from "react";
import { unlockAudio } from "../audio/sounds.js";
import { primeVoiceAudio, refreshVoices } from "../audio/voice.js";

/**
 * Prime browser audio from the first real user gesture.
 * iOS/iPadOS Safari treats WebAudio and HTMLMediaElement playback as separate
 * permissions, while MINIK uses both: WebAudio for effects and <audio> for the
 * recorded Mino voice. Unlock both inside the original child/parent gesture.
 */
export function useAudioPrime(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let primed = false;
    const cleanupGestureListeners = () => {
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("touchend", prime, true);
      window.removeEventListener("keydown", prime, true);
    };
    const prime = () => {
      refreshVoices();
      // Calling this function is intentionally synchronous up to audio.play().
      // Do not await it here: Safari must see play() in the original gesture.
      primeVoiceAudio().catch(() => false);
      const context = unlockAudio();
      if (context?.state === "running") {
        primed = true;
        cleanupGestureListeners();
      } else if (context?.resume) {
        context.resume().then(() => {
          if (context.state !== "running") return;
          primed = true;
          cleanupGestureListeners();
        }).catch(() => {});
      }
    };
    const resumeAfterBackground = () => {
      if (document.visibilityState !== "visible" || primed) return;
      // Keep listeners armed; the next real tap will re-unlock Safari audio.
      refreshVoices();
    };

    // Capture runs before navigation/button handlers, which is important on
    // iPhone: the recorded voice may start a few milliseconds after routing.
    window.addEventListener("pointerdown", prime, true);
    window.addEventListener("touchend", prime, true);
    window.addEventListener("keydown", prime, true);
    document.addEventListener("visibilitychange", resumeAfterBackground);

    return () => {
      cleanupGestureListeners();
      document.removeEventListener("visibilitychange", resumeAfterBackground);
      primed = false;
    };
  }, [enabled]);
}
