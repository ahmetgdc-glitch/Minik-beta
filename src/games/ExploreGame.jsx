import React, { useEffect, useMemo, useState } from "react";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { sample } from "../utils/random.js";
import { useLesson } from "./shared.jsx";

export default function ExploreGame({ items, lang, settings, round, hint, paused, onReady, onSolve }) {
  const [found, setFound] = useState([]);
  const sceneItems = useMemo(() => sample(items, Math.min(6, items.length)), [items, round]);
  const targetCount = Math.min(4, sceneItems.length);
  const text = lang === "tr" ? "Dünyaya dokun ve neler bulduğunu keşfet." : "Tippe in die Welt und entdecke, was du findest.";
  const help = lang === "tr" ? "Parlayan resimlerden birine dokun." : "Tippe auf eines der großen Bilder, die leicht wackeln.";
  useLesson(onReady, text, () => speak(text, lang, settings), sceneItems.map(x => x.id), help);

  function discover(item) {
    if (paused || found.includes(item.id)) return;
    const next = [...found, item.id];
    setFound(next);
    speak(item.labels[lang], lang, settings);
  }

  useEffect(() => {
    if (paused || found.length < targetCount) return;
    const timer = setTimeout(() => onSolve(found), 350);
    return () => clearTimeout(timer);
  }, [paused, found, targetCount, onSolve]);

  return <div className={`explore-scene world-${round % 4} ${hint >= 2 ? "show-hints" : ""}`}>
    <div className="scene-sky"><span className="scene-cloud cloud-a"/><span className="scene-cloud cloud-b"/></div>
    <div className="scene-hill hill-a"/><div className="scene-hill hill-b"/>
    <div className="scene-ground"/>
    {sceneItems.map((item, index) => (
      <button
        key={item.id}
        className={`scene-object scene-pos-${index + 1} ${found.includes(item.id) ? "discovered" : ""}`}
        onClick={() => discover(item)}
        aria-label={item.labels[lang]}
      >
        <Visual item={item} lang={lang} photos={settings.photos}/>
        {found.includes(item.id) && <span className="scene-label">✓ {item.labels[lang]}</span>}
      </button>
    ))}
    <div className="scene-progress" aria-live="polite">
      {Array.from({length: targetCount}, (_, i) => <i key={i} className={i < found.length ? "done" : ""}/>) }
    </div>
  </div>;
}
