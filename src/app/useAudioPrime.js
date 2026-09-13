import { useEffect } from "react";
import { unlockAudio, startMusic, stopMusic } from "../audio/sounds.js";
import { unlockVoiceAudio } from "../audio/voice.js";

/**
 * Prime both audio engines from the first real user gesture.
 * Important: this unlocks ONE reusable media element only. It must never
 * preload the whole voice library during boot.
 */
export function useAudioPrime(enabled = true, musicEnabled = enabled) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let webAudioReady = false;
    let voiceReady = false;
    let disposed = false;

    const cleanupGestureListeners = () => {
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("touchstart", prime, true);
      window.removeEventListener("keydown", prime, true);
    };
    const maybeFinish = () => {
      if (webAudioReady && voiceReady) cleanupGestureListeners();
    };
    const prime = () => {
      if (disposed || document.visibilityState !== "visible") return;

      // Both resume()/play() are invoked synchronously inside the real gesture.
      const context = unlockAudio();
      startMusic({ enabled: musicEnabled });
      if (context?.state === "running") {
        webAudioReady = true;
      } else if (context?.resume) {
        context.resume().then(() => {
          if (disposed) return;
          webAudioReady = context.state === "running";
          maybeFinish();
        }).catch(() => {});
      }

      unlockVoiceAudio().then((ok) => {
        if (disposed) return;
        voiceReady ||= ok;
        maybeFinish();
      }).catch(() => {});
      maybeFinish();
    };
    const resumeAfterBackground = () => {
      stopMusic();
      if (document.visibilityState !== "visible") return;
      // Safari may suspend WebAudio or revoke media playback readiness after
      // backgrounding. Re-arm BOTH audio paths for the next real tap; never
      // assume the old voice media unlock is still valid after resume.
      webAudioReady = false;
      voiceReady = false;
      window.addEventListener("pointerdown", prime, true);
      window.addEventListener("touchstart", prime, true);
      window.addEventListener("keydown", prime, true);
    };

    window.addEventListener("pointerdown", prime, true);
    window.addEventListener("touchstart", prime, true);
    window.addEventListener("keydown", prime, true);
    document.addEventListener("visibilitychange", resumeAfterBackground);
    window.addEventListener("pagehide", stopMusic);

    return () => {
      disposed = true;
      stopMusic();
      cleanupGestureListeners();
      document.removeEventListener("visibilitychange", resumeAfterBackground);
      window.removeEventListener("pagehide", stopMusic);
    };
  }, [enabled, musicEnabled]);
}
