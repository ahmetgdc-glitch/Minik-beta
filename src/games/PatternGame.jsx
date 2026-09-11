import React, { useState } from "react";
import { sample, choicesFor } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
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
    <div className="pattern-path-game">
      <section className="pattern-path-stage" aria-label={text}>
        <span className="pattern-path-label">{lang === "tr" ? "Deseni takip et" : "Folge dem Muster"}</span>
        <div className="pattern-path-sequence">
          {sequence.map((i, k) => (
            <React.Fragment key={k}>
              <div
                className={`pattern-path-node ${hint >= 2 ? "pattern-emphasis" : ""}`}
                style={{ animationDelay: `${k * 0.2}s` }}
              >
                <Visual item={base[i]} lang={lang} photos={settings.photos} />
              </div>
              <span className="pattern-path-connector" aria-hidden="true" />
            </React.Fragment>
          ))}
          <div className="pattern-path-question">?</div>
        </div>
      </section>
      <section className="pattern-choice-wrap" aria-label={lang === "tr" ? "Sıradaki resmi seç" : "Wähle das nächste Bild"}>
        <h2 className="pattern-choice-title">{lang === "tr" ? "Sonraki durak hangisi?" : "Was kommt auf den nächsten Platz?"}</h2>
        <div className="pattern-choice-grid">
          {options.map((x) => (
            <button
              key={x.id}
              className={`pattern-choice ${hint >= 2 && x.id === target.id ? "hint-target" : ""}`}
              onClick={() => x.id === target.id ? onSolve([target.id]) : onWrong([target.id])}
              aria-label={x.labels[lang]}
            >
              <Visual item={x} lang={lang} photos={settings.photos} />
              <b>{x.labels[lang]}</b>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
