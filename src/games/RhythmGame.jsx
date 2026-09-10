import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { playNote, stopSounds, ensureAudioReady } from "../audio/sounds.js";
import { stopSpeech } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
const colors = ["#ee8470", "#eac856", "#71b5de", "#a193d9"];
export default function RhythmGame({
  difficulty,
  lang,
  hint,
  paused,
  onReady,
  onWrong,
  onSolve,
}) {
  const [sequence] = useState(() =>
    Array.from(
      { length: difficulty === 2 ? 3 : difficulty === 4 ? 4 : 5 },
      () => Math.floor(Math.random() * 4),
    ),
  );
  const [playing, setPlaying] = useState(false),
    [cursor, setCursor] = useState(-1),
    [input, setInput] = useState([]),
    [lit, setLit] = useState(-1);
  async function repeat() {
    stopSpeech();
    await ensureAudioReady();
    setInput([]);
    setCursor(0);
    setPlaying(true);
  }
  const text =
    lang === "tr"
      ? "Dinle ve aynı melodiyi çal."
      : "Hör zu und spiele die Melodie nach.";
  useLesson(
    onReady,
    text,
    repeat,
    ["sounds.piano"],
    lang === "tr"
      ? "Parlayan tuşları takip et."
      : "Folge den leuchtenden Tasten.",
  );
  useEffect(() => {
    if (!playing || paused) return;
    if (cursor >= sequence.length) {
      setPlaying(false);
      setLit(-1);
      return;
    }
    playNote(sequence[cursor]);
    setLit(sequence[cursor]);
    const off = setTimeout(() => setLit(-1), 340),
      next = setTimeout(() => setCursor((c) => c + 1), 650);
    return () => {
      clearTimeout(off);
      clearTimeout(next);
      stopSounds();
    };
  }, [cursor, playing, paused]);
  async function tap(i) {
    if (playing) return;
    await playNote(i);
    if (i !== sequence[input.length]) {
      onWrong(["sounds.piano"]);
      setInput([]);
      return;
    }
    const next = [...input, i];
    setInput(next);
    if (next.length === sequence.length) onSolve(["sounds.piano"]);
  }
  return (
    <div className="rhythm-stage">
      <div className="rhythm-dots">
        {sequence.map((v, i) => (
          <span
            key={i}
            className={i < input.length ? "done" : ""}
            style={{ background: hint >= 2 ? colors[v] : undefined }}
          />
        ))}
      </div>
      <div className="music-pads">
        {colors.map((color, i) => (
          <button
            key={i}
            className={`${lit === i ? "lit" : ""} ${hint >= 2 && !playing && sequence[input.length] === i ? "hint-target" : ""}`}
            style={{ "--pad": color }}
            disabled={playing}
            onClick={() => tap(i)}
            aria-label={`${lang === "tr" ? "Ses" : "Ton"} ${i + 1}`}
          >
            <span>{["●", "▲", "■", "★"][i]}</span>
          </button>
        ))}
      </div>
      <button
        className="secondary centered"
        onClick={repeat}
        disabled={playing}
      >
        <Play size={20} />
        {lang === "tr" ? "Melodiyi dinle" : "Melodie anhören"}
      </button>
    </div>
  );
}
