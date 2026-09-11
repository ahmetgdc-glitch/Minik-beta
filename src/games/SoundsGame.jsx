import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
import { itemsForWorld } from "../data/content.js";
import { ensureAudioReady, playSound, stopSounds } from "../audio/sounds.js";
import { stopSpeech } from "../audio/voice.js";
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
    [playing, setPlaying] = useState(false);
  async function repeat() {
    if (paused || interactionBlocked()) return;
    stopSpeech();
    const context = await ensureAudioReady();
    if (!context || paused || interactionBlocked()) {
      setPlaying(false);
      return;
    }
    const duration = playSound(target.sound, settings);
    setPlaying(duration > 0);
  }
  const text =
    lang === "tr" ? "Dinle. Bu ne sesi?" : "Hör genau hin. Was klingt so?";
  const help = lang === "tr"
    ? "Sesi bir kez daha dikkatle dinle."
    : "Hör das Geräusch noch einmal genau an.";
  useLesson(onReady, text, repeat, [target.id], help);
  useEffect(() => {
    if (paused) {
      stopSounds();
      setPlaying(false);
    }
  }, [paused]);
  useEffect(() => () => {
    stopSounds();
    setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), 2200);
    return () => clearTimeout(t);
  }, [playing]);

  function pick(item) {
    if (paused || interactionBlocked()) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="sounds-playground" aria-disabled={paused || undefined}>
      <button
        className={`sound-orb ${playing ? "playing" : ""}`}
        onClick={repeat}
        disabled={paused}
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
        onPick={pick}
      />
    </div>
  );
}
