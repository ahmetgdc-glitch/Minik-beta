import { useEffect } from "react";
import { unlockAudio, startMusic, stopMusic } from "../audio/sounds.js";
import { unlockVoiceAudio } from "../audio/voice.js";

/**
 * Prime both audio engines from real user gestures.
 * Important: this unlocks ONE reusable media element only. It must never
 * preload the whole voice library during boot.
 */
export function useAudioPrime(enabled = true, musicEnabled = enabled) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let webAudioReady = false;
    let voiceReady = false;
    let disposed = false;
    const ua = String(window.navigator?.userAgent || "");
    const platform = String(window.navigator?.platform || "");
    const touchPoints = Number(window.navigator?.maxTouchPoints || 0);
    const ios = /iPad|iPhone|iPod/iu.test(ua) || (platform === "MacIntel" && touchPoints > 1);

    const cleanupGestureListeners = () => {
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("touchstart", prime, true);
      window.removeEventListener("keydown", prime, true);
    };
    const maybeFinish = () => {
      // iOS can revoke media readiness after the first successful gesture or
      // report readiness too optimistically. Keep the lightweight prime hooks
      // available there so a later tap can recover voice without a reload.
      if (!ios && webAudioReady && voiceReady) cleanupGestureListeners();
    };
    const prime = () => {
      if (disposed || document.visibilityState !== "visible") return;

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
