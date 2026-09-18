import React, { useState, useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
import { itemsForWorld } from "../data/content.js";
import { prepareSoundPlayback, playSound, stopSounds } from "../audio/sounds.js";
import { speak, stopSpeech } from "../audio/voice.js";
export default function SoundsGame({
  difficulty,
  lang,
  settings,
  hint,
  paused,
  interactionBlocked = () => false,
  onReady,
  onWrong,
  onSolve,
}) {
  const { target, options } = useSelection(itemsForWorld("sounds"), difficulty),
    [playing, setPlaying] = useState(false),
    replayRun = useRef(0);
  const controlsDisabled = paused || interactionBlocked();
  async function repeat() {
    if (controlsDisabled) return;
    const run = ++replayRun.current;
    stopSpeech();
    const context = await prepareSoundPlayback();
    if (run !== replayRun.current || !context || paused || interactionBlocked()) {
      setPlaying(false);
      return;
    }
    // The target sound is the learning content itself, not a reward/effect.
    // Parent setting `sfx` only controls optional reward sounds. Keep this
    // essential listening cue audible whenever the main audio setting is on.
    const duration = playSound(target.sound, {
      ...settings,
      sfx: settings?.audio !== false,
    });
    setPlaying(duration > 0);
  }
  const text =
    lang === "tr" ? "Dinle. Bu ne sesi?" : "Hör genau hin. Was klingt so?";
  const help = lang === "tr"
    ? "Sesi bir kez daha dikkatle dinle."
    : "Hör das Geräusch noch einmal genau an.";

  async function playLesson() {
    if (paused || interactionBlocked()) return;
    await speak(text, lang, settings);
    if (paused || interactionBlocked()) return;
    await repeat();
  }

  // On entry, explain the task first and then play the learning sound. The
  // replay button itself still replays only the sound, exactly as its label says.
  useLesson(onReady, text, playLesson, [target.id], help);
  useEffect(() => {
    if (controlsDisabled) {
      replayRun.current += 1;
      stopSounds();
      setPlaying(false);
    }
  }, [controlsDisabled]);
  useEffect(() => () => {
    replayRun.current += 1;
    stopSounds();
    setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), 2200);
    return () => clearTimeout(t);
  }, [playing]);

  function pick(item) {
    if (controlsDisabled) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="sounds-playground" aria-disabled={controlsDisabled || undefined}>
      <button
        className={`sound-orb ${playing ? "playing" : ""}`}
        onClick={repeat}
        disabled={controlsDisabled}
        aria-label={lang === "tr" ? "Sesi tekrar dinle" : "Geräusch noch einmal hören"}
      >
        <Volume2 size={48} />
        <span className="sound-bars">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        hiddenLabels={hint < 3}
        disabled={controlsDisabled}
        onPick={pick}
      />
    </div>
  );
}
