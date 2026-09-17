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
    const ua = String(window.navigator?.userAgent || "");
    const platform = String(window.navigator?.platform || "");
    const touchPoints = Number(window.navigator?.maxTouchPoints || 0);
    const ios = /iPad|iPhone|iPod/iu.test(ua) || (platform === "MacIntel" && touchPoints > 1);

    const prime = () => {
      if (disposed || document.visibilityState !== "visible") return;

      const wantsVoice = voiceEnabledRef.current;
      const wantsEffects = sfxEnabledRef.current;
      const wantsMusic = getMusicStyle() !== "off";

      // iOS requires the speech prime to happen inside the real gesture.
      if (wantsVoice) primeSystemSpeechForIOS();

      // Some learning content (Geräusche/Rhythmus) uses WebAudio even when the
      // optional reward-SFX switch is off. Main narration audio therefore also
      // primes WebAudio so those games never create a suspended context later,
      // outside the child's real gesture.
      if (wantsVoice || wantsEffects || wantsMusic) unlockAudio();
      if (wantsMusic) startMusic();

      // Keep lightweight gesture listeners mounted. Settings can change while
      // the app stays open, so a later tap must be able to re-enable narration
      // without requiring a reload. iOS may also revoke readiness after sleep.
      if (wantsVoice && (!voiceReady || ios)) {
        unlockVoiceAudio().then((ok) => {
          if (!disposed) voiceReady ||= ok;
        }).catch(() => {});
      }
    };

    const resumeAfterBackground = () => {
      stopMusic();
      if (document.visibilityState === "visible") voiceReady = false;
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
