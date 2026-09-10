import React, { useState } from "react";
import { sample } from "../utils/random.js";
import { itemsForWorld } from "../data/content.js";
import { useLesson, OptionGrid } from "./shared.jsx";
import { choicesFor } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
export default function CountGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
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
  return (
    <>
      <div className={`count-field count-${n > 10 ? "many" : "few"}`}>
        {Array.from({ length: n }, (_, i) => (
          <button
            key={i}
            className={counted.includes(i) ? "counted" : ""}
            aria-label={`${object.labels[lang]} ${i + 1}`}
            onClick={() => {
              if (!counted.includes(i)) {
                speak(
                  itemsForWorld("numbers")[counted.length].labels[lang],
                  lang,
                  settings,
                );
                setCounted([...counted, i]);
              }
            }}
          >
            <Visual item={object} lang={lang} photos={false} />
            {(counted.includes(i) || hint >= 2) && (
              <span>{hint >= 2 ? i + 1 : counted.indexOf(i) + 1}</span>
            )}
          </button>
        ))}
      </div>
      <div className="number-options">
        <OptionGrid
          {...{ options, target, hint, lang, settings }}
          hiddenLabels
          onPick={(item) =>
            item.id === target.id ? onSolve([target.id]) : onWrong([target.id])
          }
        />
      </div>
    </>
  );
}
