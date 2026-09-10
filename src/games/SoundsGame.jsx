import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
import { itemsForWorld } from "../data/content.js";
import { playSound, stopSounds } from "../audio/sounds.js";
import { stopSpeech } from "../audio/voice.js";
export default function SoundsGame({
  difficulty,
  lang,
  settings,
  hint,
  paused,
  onReady,
  onWrong,
  onSolve,
}) {
  const { target, options } = useSelection(itemsForWorld("sounds"), difficulty),
    [playing, setPlaying] = useState(false);
  function repeat() {
    stopSpeech();
    playSound(target.sound);
    setPlaying(true);
  }
  const text =
    lang === "tr" ? "Dinle. Bu ne sesi?" : "Hör genau hin. Was klingt so?";
  useLesson(onReady, text, repeat, [target.id], target.labels[lang]);
  useEffect(() => {
    if (paused) {
      stopSounds();
      setPlaying(false);
    }
  }, [paused]);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), 2200);
    return () => clearTimeout(t);
  }, [playing]);
  return (
    <>
      <button
        className={`sound-orb ${playing ? "playing" : ""}`}
        onClick={repeat}
        aria-label={
          lang === "tr" ? "Sesi tekrar dinle" : "Geräusch noch einmal hören"
        }
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
        onPick={(item) =>
          item.id === target.id ? onSolve([target.id]) : onWrong([target.id])
        }
      />
    </>
  );
}
