import React, { useEffect, useRef, useState } from "react";
import Visual from "../components/Visual.jsx";
import { choicesFor, sample } from "../utils/random.js";
export function useSelection(items, difficulty) {
  const [target] = useState(() => sample(items, 1)[0]);
  const [options] = useState(() => choicesFor(target, items, difficulty));
  return { target, options };
}
export function useLesson(onReady, text, repeat, ids, help) {
  // Keep the callback itself stable for GameSession, while forwarding to the
  // newest render. This matters when voice/audio settings change in another
  // tab: the replay button must never keep speaking with stale settings just
  // because the visible lesson text stayed the same.
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;
  useEffect(() => {
    onReady({
      text,
      repeat: (...args) => repeatRef.current?.(...args),
      ids,
      help,
    });
  }, [text, onReady]);
}
export function OptionGrid({
  options,
  target,
  hint,
  lang,
  settings,
  onPick,
  hiddenLabels = false,
}) {
  const wrong = options.find((x) => x.id !== target?.id);
  return (
    <div className={`answer-grid options-${options.length}`}>
      {options.map((item) => (
        <button
          key={item.id}
          className={`answer-card ${hint >= 2 && item.id === target?.id ? "hint-target" : ""} ${hint >= 2 && options.length > 2 && item.id === wrong?.id ? "quiet-option" : ""}`}
          onClick={() => onPick(item)}
          aria-label={item.labels[lang]}
        >
          <Visual item={item} lang={lang} photos={settings.photos} />
          {!hiddenLabels && <b>{item.labels[lang]}</b>}
        </button>
      ))}
    </div>
  );
}
