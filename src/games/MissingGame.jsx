import React, { useState } from "react";
import { sample, choicesFor } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { useLesson, OptionGrid } from "./shared.jsx";
import { speak } from "../audio/voice.js";
export default function MissingGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const [row] = useState(() => sample(items, difficulty === 2 ? 3 : 4)),
    [target] = useState(() => sample(row, 1)[0]);
  const [options] = useState(() => choicesFor(target, items, difficulty)),
    [hidden, setHidden] = useState(false);
  const text = hidden
    ? lang === "tr"
      ? "Hangi resim kayboldu?"
      : "Welches Bild ist verschwunden?"
    : lang === "tr"
      ? "Resimlere dikkatle bak."
      : "Schau dir die Bilder gut an.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    target.labels[lang],
  );
  return (
    <>
      <div className="remember-row">
        {row.map((x) => (
          <div key={x.id}>
            {hidden && x.id === target.id && hint < 3 ? (
              <span className="missing-mark">?</span>
            ) : (
              <Visual item={x} lang={lang} photos={settings.photos} />
            )}
          </div>
        ))}
      </div>
      {!hidden ? (
        <button className="primary centered" onClick={() => setHidden(true)}>
          {lang === "tr" ? "Hazırım!" : "Ich bin bereit!"}
        </button>
      ) : (
        <OptionGrid
          {...{ options, target, hint, lang, settings }}
          onPick={(x) =>
            x.id === target.id ? onSolve([target.id]) : onWrong([target.id])
          }
        />
      )}
    </>
  );
}
