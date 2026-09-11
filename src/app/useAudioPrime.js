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

    let webAudioReady = false;
    let voiceAudioReady = false;
    const cleanupGestureListeners = () => {
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("touchend", prime, true);
      window.removeEventListener("keydown", prime, true);
    };
    const maybeFinish = () => {
      if (!webAudioReady || !voiceAudioReady) return;
      cleanupGestureListeners();
    };
    const prime = () => {
      refreshVoices();
      // play() is called synchronously inside primeVoiceAudio before its first
      // await. Keep touchend armed when pointerdown alone is insufficient.
      primeVoiceAudio().then((ok) => {
        voiceAudioReady ||= ok;
        maybeFinish();
      }).catch(() => {});
      const context = unlockAudio();
      if (context?.state === "running") {
        webAudioReady = true;
        maybeFinish();
      } else if (context?.resume) {
        context.resume().then(() => {
          webAudioReady = context.state === "running";
          maybeFinish();
        }).catch(() => {});
      }
    };
    const resumeAfterBackground = () => {
      if (document.visibilityState !== "visible") return;
      // Safari can suspend WebAudio while the app is backgrounded. Re-arm the
      // gesture path; the persistent voice element itself remains reusable.
      webAudioReady = false;
      refreshVoices();
      window.addEventListener("pointerdown", prime, true);
      window.addEventListener("touchend", prime, true);
      window.addEventListener("keydown", prime, true);
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
      webAudioReady = false;
      voiceAudioReady = false;
    };
  }, [enabled]);
}
