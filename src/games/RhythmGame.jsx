import React, { useState, useEffect } from "react";
import { Play, Music2, Sparkles } from "lucide-react";
import { playNote, stopSounds, ensureAudioReady } from "../audio/sounds.js";
import { stopSpeech } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";

const colors = ["#ee8470", "#eac856", "#71b5de", "#a193d9"];
const symbols = ["●", "▲", "■", "★"];

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
    if (paused || playing) return;
    stopSpeech();
    await ensureAudioReady();
    if (paused) return;
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
  }, [cursor, playing, paused, sequence]);

  useEffect(() => {
    if (!paused) return;
    setPlaying(false);
    setLit(-1);
    setCursor(-1);
    stopSounds();
  }, [paused]);

  async function tap(i) {
    if (playing || paused) return;
    await playNote(i);
    if (paused) return;
    if (i !== sequence[input.length]) {
      onWrong(["sounds.piano"]);
      setInput([]);
      return;
    }
    const next = [...input, i];
    setInput(next);
    if (next.length === sequence.length) onSolve(["sounds.piano"]);
  }

  const heardCount = playing ? Math.max(0, Math.min(sequence.length, cursor)) : 0;
  const status = playing
    ? lang === "tr"
      ? "Mino çalıyor…"
      : "Mino spielt vor…"
    : input.length
      ? lang === "tr"
        ? `${input.length} / ${sequence.length} doğru`
        : `${input.length} / ${sequence.length} richtig`
      : lang === "tr"
        ? "Şimdi sıra sende!"
        : "Jetzt bist du dran!";

  return (
    <section className="rhythm-stage rhythm-playground" aria-label={text}>
      <div className="rhythm-sky" aria-hidden="true">
        <span className="rhythm-cloud rhythm-cloud-one" />
        <span className="rhythm-cloud rhythm-cloud-two" />
        <Music2 className="rhythm-floating-note note-one" />
        <Music2 className="rhythm-floating-note note-two" />
      </div>

      <div className="rhythm-hero">
        <div className="rhythm-hero-badge" aria-hidden="true">
          <Sparkles size={28} />
        </div>
        <div>
          <strong>{lang === "tr" ? "Mino'nun müzik sahnesi" : "Minos Musikbühne"}</strong>
          <span aria-live="polite">{status}</span>
        </div>
      </div>

      <div className="rhythm-path" aria-label={lang === "tr" ? "Melodi ilerlemesi" : "Melodie-Fortschritt"}>
        {sequence.map((value, i) => {
          const completed = i < input.length;
          const previewed = playing && i < heardCount;
          const current = playing && i === cursor;
          return (
            <span
              key={i}
              className={`rhythm-step ${completed ? "done" : ""} ${previewed ? "heard" : ""} ${current ? "current" : ""}`}
              style={{ "--step-color": hint >= 2 || current ? colors[value] : undefined }}
              aria-label={`${i + 1}`}
            >
              {completed ? "✓" : i + 1}
            </span>
          );
        })}
      </div>

      <div className="music-pads" role="group" aria-label={lang === "tr" ? "Müzik tuşları" : "Musiktasten"}>
        {colors.map((color, i) => (
          <button
            key={i}
            className={`music-pad ${lit === i ? "lit" : ""} ${hint >= 2 && !playing && sequence[input.length] === i ? "hint-target" : ""}`}
            style={{ "--pad": color }}
            disabled={playing || paused}
            onClick={() => tap(i)}
            aria-label={`${lang === "tr" ? "Ses" : "Ton"} ${i + 1}`}
          >
            <span className="music-pad-glow" aria-hidden="true" />
            <span className="music-pad-symbol" aria-hidden="true">{symbols[i]}</span>
            <span className="music-pad-label">{lang === "tr" ? `Ses ${i + 1}` : `Ton ${i + 1}`}</span>
          </button>
        ))}
      </div>

      <button
        className="rhythm-repeat"
        onClick={repeat}
        disabled={playing || paused}
      >
        <span className="rhythm-repeat-icon"><Play size={28} fill="currentColor" /></span>
        <span>
          <strong>{lang === "tr" ? "Melodiyi dinle" : "Melodie anhören"}</strong>
          <small>{lang === "tr" ? "Mino sana bir kez daha çalsın" : "Mino spielt sie dir noch einmal vor"}</small>
        </span>
      </button>
    </section>
  );
}
