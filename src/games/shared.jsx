import React, { useEffect, useRef, useState } from "react";
import Visual from "../components/Visual.jsx";
import { choicesFor, sample } from "../utils/random.js";
import { difficultyProfile } from "./difficulty.js";
export function useSelection(items, difficulty) {
  const profile = difficultyProfile(difficulty);
  const [target] = useState(() => sample(items, 1)[0]);
  const [options] = useState(() => choicesFor(target, items, profile.options));
  return { target, options };
}
export function useLesson(onReady, text, repeat, ids, help) {
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;
  useEffect(() => {
    onReady({
      text,
      repeat: (...args) => repeatRef.current?.(...args),
      ids,
      help,
    });
  }, [text, help, ids?.join("|"), onReady]);
}
export function OptionGrid({
  options,
  target,
  hint,
  lang,
  settings,
  onPick,
  hiddenLabels = false,
  disabled = false,
}) {
  const wrong = options.find((x) => x.id !== target?.id);
  return (
    <div className={`answer-grid options-${options.length}`} aria-disabled={disabled || undefined}>
      {options.map((item) => (
        <button
          key={item.id}
          className={`answer-card ${hint >= 2 && item.id === target?.id ? "hint-target" : ""} ${hint >= 2 && options.length > 2 && item.id === wrong?.id ? "quiet-option" : ""}`}
          onClick={() => { if (!disabled) onPick(item); }}
          disabled={disabled}
          aria-label={item.labels[lang]}
        >
          <Visual item={item} lang={lang} photos={settings.photos} />
          {!hiddenLabels && <b>{item.labels[lang]}</b>}
        </button>
      ))}
    </div>
  );
}
