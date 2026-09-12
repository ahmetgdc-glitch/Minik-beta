import { useEffect } from "react";
import {
  pauseBackgroundMusic,
  resumeBackgroundMusic,
  setBackgroundMusicEnabled,
  startBackgroundMusic,
  unlockAudio,
} from "../audio/sounds.js";
import { unlockVoiceAudio } from "../audio/voice.js";

/**
 * Prime both audio engines from the first real user gesture.
 * Important: this unlocks ONE reusable media element only. It must never
 * preload the whole voice library during boot.
 */
export function useAudioPrime(enabled = true, backgroundMusic = false) {
  useEffect(() => {
    setBackgroundMusicEnabled(backgroundMusic);
  }, [backgroundMusic]);

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
    const startMusicAfterGesture = () => {
      if (!backgroundMusic || disposed) return;
      resumeBackgroundMusic("visibility");
      startBackgroundMusic();
    };
    const prime = () => {
      if (disposed) return;

      // Both resume()/play() are invoked synchronously inside the real gesture.
      const context = unlockAudio();
      if (context?.state === "running") {
        webAudioReady = true;
        startMusicAfterGesture();
      } else if (context?.resume) {
        context
          .resume()
          .then(() => {
            if (disposed) return;
            webAudioReady = context.state === "running";
            if (webAudioReady) startMusicAfterGesture();
            maybeFinish();
          })
          .catch(() => {});
      }

      unlockVoiceAudio()
        .then((ok) => {
          if (disposed) return;
          voiceReady ||= ok;
          maybeFinish();
        })
        .catch(() => {});
      maybeFinish();
    };
    const resumeAfterBackground = () => {
      if (document.visibilityState !== "visible") {
        pauseBackgroundMusic("visibility");
        return;
      }
      // Safari may suspend WebAudio after backgrounding. Re-arm the next tap;
      // never try to auto-play media from visibilitychange itself.
      webAudioReady = false;
      window.addEventListener("pointerdown", prime, true);
      window.addEventListener("touchstart", prime, true);
      window.addEventListener("keydown", prime, true);
    };

    window.addEventListener("pointerdown", prime, true);
    window.addEventListener("touchstart", prime, true);
    window.addEventListener("keydown", prime, true);
    document.addEventListener("visibilitychange", resumeAfterBackground);

    return () => {
      disposed = true;
      cleanupGestureListeners();
      document.removeEventListener("visibilitychange", resumeAfterBackground);
    };
  }, [enabled, backgroundMusic]);
}
