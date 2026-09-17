import { useEffect, useRef } from "react";
import { unlockAudio, startMusic, stopMusic } from "../audio/sounds.js";
import { getMusicStyle } from "../audio/musicProfiles.js";
import { primeSystemSpeechForIOS } from "../audio/iosSpeechPrime.js";
import { unlockVoiceAudio } from "../audio/voice.js";

/**
 * Prime narration, effects and background music from real user gestures.
 * These are independent audio layers: disabling narration must not silence a
 * selected music profile, and choosing "music off" must not disable speech.
 */
export function useAudioPrime(voiceEnabled = true, sfxEnabled = true) {
  const voiceEnabledRef = useRef(Boolean(voiceEnabled));
  const sfxEnabledRef = useRef(Boolean(sfxEnabled));
  voiceEnabledRef.current = Boolean(voiceEnabled);
  sfxEnabledRef.current = Boolean(sfxEnabled);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let disposed = false;
    let voiceReady = false;
    let lastPrimeAt = 0;
    const PRIME_DEDUP_MS = 120;

    const prime = () => {
      if (disposed || document.visibilityState !== "visible") return;
      const now = Date.now();
      // Modern iOS can emit touchstart and pointerdown for the same physical
      // tap. Running the shared HTMLAudio unlock twice can pause the natural
      // MINIK recording that the first event just allowed to play.
      if (lastPrimeAt && now - lastPrimeAt < PRIME_DEDUP_MS) return;
      lastPrimeAt = now;

      const wantsVoice = voiceEnabledRef.current;
      const wantsEffects = sfxEnabledRef.current;
      const wantsMusic = getMusicStyle() !== "off";

      // iOS requires the speech prime to happen inside the real gesture.
      // iosSpeechPrime itself keeps this cheap and idempotent between retries.
      if (wantsVoice) primeSystemSpeechForIOS();

      // Some learning content (Geräusche/Rhythmus) uses WebAudio even when the
      // optional reward-SFX switch is off. Main narration audio therefore also
      // primes WebAudio so those games never create a suspended context later,
      // outside the child's real gesture.
      if (wantsVoice || wantsEffects || wantsMusic) unlockAudio();
      if (wantsMusic) startMusic();

      // The recorded MINIK narrator shares one HTMLAudio player with actual
      // speech. Once that player has been unlocked, do NOT feed it another
      // silent unlock clip on every tap: doing so pauses/replaces live speech.
      // Returning from the background explicitly rearms this flag below.
      if (wantsVoice && !voiceReady) {
        unlockVoiceAudio().then((ok) => {
          if (!disposed) voiceReady ||= ok;
        }).catch(() => {});
      }
    };

    const resumeAfterBackground = () => {
      stopMusic();
      if (document.visibilityState === "visible") {
        voiceReady = false;
        lastPrimeAt = 0;
      }
    };

    window.addEventListener("pointerdown", prime, true);
    window.addEventListener("touchstart", prime, true);
    window.addEventListener("keydown", prime, true);
    document.addEventListener("visibilitychange", resumeAfterBackground);
    window.addEventListener("pagehide", stopMusic);

    return () => {
      disposed = true;
      stopMusic();
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("touchstart", prime, true);
      window.removeEventListener("keydown", prime, true);
      document.removeEventListener("visibilitychange", resumeAfterBackground);
      window.removeEventListener("pagehide", stopMusic);
    };
  }, []);
}
