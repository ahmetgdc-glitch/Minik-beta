import React, { useMemo, useState } from "react";
import { speak } from "../audio/voice.js";
import Visual from "../components/Visual.jsx";
import { sample, shuffle } from "../utils/random.js";
import { useLesson } from "./shared.jsx";

const FALLBACK = {
  de: ["A", "B", "D", "E", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T", "W"],
  tr: ["A", "B", "C", "Ç", "D", "E", "F", "G", "H", "İ", "K", "L", "M", "N", "O", "Ö", "P", "S", "Ş", "T", "U", "Ü", "Y", "Z"],
};

import { initialLetter } from "./initialLetter.js";
function choices(targetLetter, items, lang, count) {
  const fromItems = items
    .map((item) => initialLetter(item.labels?.[lang], lang))
    .filter((letter) => letter && letter !== targetLetter);
  const pool = [...new Set([...fromItems, ...FALLBACK[lang]])].filter(
    (letter) => letter !== targetLetter,
  );
  return shuffle([targetLetter, ...sample(pool, Math.max(1, count - 1))]);
}

export default function InitialLetterGame({
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
  const [target] = useState(() => sample(items.filter((i) => i.labels?.[lang]), 1)[0]);
  const targetLetter = initialLetter(target?.labels?.[lang], lang);
  const optionCount = difficulty >= 6 ? 6 : difficulty >= 4 ? 4 : 3;
  const options = useMemo(
    () => choices(targetLetter, items, lang, optionCount),
    [targetLetter, items, lang, optionCount],
  );
  const prompt =
    lang === "tr"
      ? `${target.labels.tr} hangi harfle başlıyor?`
      : `Mit welchem Buchstaben beginnt ${target.labels.de}?`;

  useLesson(
    onReady,
    prompt,
    () => speak(prompt, lang, settings),
    [target.id],
    targetLetter,
  );

  function pick(letter) {
    if (paused || interactionBlocked()) return;
    letter === targetLetter ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="initial-letter-game" aria-disabled={paused || undefined}>
      <div className="initial-letter-target">
        <Visual item={target} lang={lang} photos={settings.photos} />
        <strong>{target.labels[lang]}</strong>
      </div>
      <div className={`letter-choice-grid options-${options.length}`}>
        {options.map((letter) => (
          <button
            key={letter}
            className={`letter-choice ${hint >= 2 && letter === targetLetter ? "hint-target" : ""}`}
            onClick={() => pick(letter)}
            disabled={paused}
            aria-label={letter}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
