import React, { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { sample, choicesFor } from "../utils/random.js";
import { itemsForWorld } from "../data/content.js";
import { useLesson, OptionGrid } from "./shared.jsx";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";

export default function CountGame({
  items,
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
  const maximum = difficulty === 2 ? 5 : difficulty === 4 ? 10 : 20;
  const [n] = useState(() => 1 + Math.floor(Math.random() * maximum));
  const [object] = useState(
    () =>
      sample(
        items[0].type === "number" ? itemsForWorld("animals") : items,
        1,
      )[0],
  );
  const target = itemsForWorld("numbers")[n - 1];
  const [options] = useState(() =>
    choicesFor(target, itemsForWorld("numbers").slice(0, maximum), difficulty),
  );
  const [counted, setCounted] = useState([]);
  const countedRef = useRef([]);
  const text = lang === "tr" ? "Kaç tane var?" : "Wie viele sind es?";

  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    lang === "tr"
      ? "Her resme bir kez dokun ve say."
      : "Tippe jedes Bild einmal an und zähle mit.",
  );

  const countProgress = `${counted.length} / ${n}`;
  const allCounted = counted.length === n;
  const controlsDisabled = paused || interactionBlocked();

  return (
    <section className="count-playground count-meadow" aria-label={text} aria-disabled={controlsDisabled || undefined}>
      <header className="count-meadow-header">
        <span className="count-meadow-badge" aria-hidden="true"><Sparkles size={24} /></span>
        <div>
          <strong>{lang === "tr" ? "Mino ile say" : "Zähl mit Mino"}</strong>
          <span aria-live="polite">
            {allCounted
              ? lang === "tr" ? "Hepsini saydın! Şimdi sayıyı seç." : "Alle gezählt! Wähle jetzt die Zahl."
              : lang === "tr" ? `${countProgress} sayıldı` : `${countProgress} gezählt`}
          </span>
        </div>
      </header>

      <div
        className={`count-field count-${n > 10 ? "many" : "few"}`}
        style={{
          "--count-columns": Math.min(n, n <= 5 ? 3 : 5),
          "--count-height": `${n <= 2 ? 32 : n <= 5 ? 20 : n <= 10 ? 14 : 10}svh`,
        }}
      >
        {Array.from({ length: n }, (_, i) => {
          const isCounted = counted.includes(i);
          const shownNumber = hint >= 2 ? i + 1 : counted.indexOf(i) + 1;
          return (
            <button
              key={i}
              className={`count-object ${isCounted ? "counted" : ""}`}
              aria-label={`${object.labels[lang]} ${i + 1}`}
              disabled={controlsDisabled}
              onClick={() => {
                if (controlsDisabled) return;
                if (!countedRef.current.includes(i)) {
                  speak(
                    itemsForWorld("numbers")[countedRef.current.length].labels[lang],
                    lang,
                    settings,
                  );
                  countedRef.current = [...countedRef.current, i];
                  setCounted(countedRef.current);
                }
              }}
            >
              <span className="count-object-glow" aria-hidden="true" />
              <Visual item={object} lang={lang} photos={false} />
              {(isCounted || hint >= 2) && (
                <span className="count-number-bubble">{shownNumber}</span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className={`count-answer-stage ${allCounted ? "ready" : "locked"}`}
        aria-disabled={!allCounted || controlsDisabled || undefined}
      >
        <div className="count-answer-title">
          <strong>{lang === "tr" ? "Kaç tane?" : "Wie viele?"}</strong>
          <span>
            {allCounted
              ? lang === "tr" ? "Doğru sayı adasına dokun" : "Tippe auf die richtige Zahleninsel"
              : lang === "tr" ? "Önce tüm resimlere dokun ve say" : "Zähle zuerst alle Bilder"}
          </span>
        </div>
        <div className="number-options">
          <OptionGrid
            {...{ options, target, hint, lang, settings }}
            hiddenLabels
            disabled={!allCounted || controlsDisabled}
            onPick={(item) => {
              if (!allCounted || controlsDisabled) return;
              item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
            }}
          />
        </div>
      </div>
    </section>
  );
}
