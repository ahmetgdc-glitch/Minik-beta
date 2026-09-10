import React, { useState } from "react";
import { sample, choicesFor } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { useLesson, OptionGrid } from "./shared.jsx";
import { speak } from "../audio/voice.js";
export default function PatternGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const [base] = useState(() => sample(items, difficulty === 6 ? 3 : 2));
  const sequence =
    difficulty === 4
      ? [0, 0, 1, 0, 0]
      : difficulty === 6
        ? [0, 1, 2, 0, 1]
        : [0, 1, 0, 1, 0];
  const target = base[difficulty === 6 ? 2 : 1],
    [options] = useState(() => choicesFor(target, items, difficulty));
  const text =
    lang === "tr"
      ? "Sırada hangi resim var?"
      : "Welches Bild kommt als Nächstes?";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    target.labels[lang],
  );
  return (
    <>
      <div className="pattern-row">
        {sequence.map((i, k) => (
          <div
            key={k}
            className={hint >= 2 ? "pattern-emphasis" : ""}
            style={{ animationDelay: `${k * 0.2}s` }}
          >
            <Visual item={base[i]} lang={lang} photos={settings.photos} />
          </div>
        ))}
        <div className="pattern-question">?</div>
      </div>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        onPick={(x) =>
          x.id === target.id ? onSolve([target.id]) : onWrong([target.id])
        }
      />
    </>
  );
}
