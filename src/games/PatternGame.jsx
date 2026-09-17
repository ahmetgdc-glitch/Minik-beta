import React, { useState } from "react";
import { sample, choicesFor } from "../utils/random.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { speak } from "../audio/voice.js";
import { difficultyProfile } from "./difficulty.js";
export default function PatternGame({
  items,
  progress,
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
  const profile = difficultyProfile(difficulty);
  const [base] = useState(() => sample(items, profile.id === "hard" ? 3 : 2));
  const sequence = profile.id === "medium"
    ? [0, 0, 1, 0, 0]
    : profile.id === "hard"
      ? [0, 1, 2, 0, 1]
      : [0, 1, 0, 1];
  const target = base[profile.id === "hard" ? 2 : profile.id === "medium" ? 1 : 0];
  const [options] = useState(() => choicesFor(target, items, profile.options));
  const text = lang === "tr" ? "Sırada hangi resim var?" : "Welches Bild kommt als Nächstes?";
  const help = lang === "tr" ? "Hangi resmin tekrar ettiğine bak." : "Schau, welches Bild sich wiederholt.";
  useLesson(onReady, text, () => speak(text, lang, settings), [target.id], help);
  const controlsDisabled = paused || interactionBlocked();

  function speakNode(item) {
    if (controlsDisabled) return;
    speak(item.labels[lang], lang, settings);
  }

  function pick(item) {
    if (controlsDisabled) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="pattern-path-game" data-difficulty={profile.id} aria-disabled={controlsDisabled || undefined}>
      <section className="pattern-path-stage" aria-label={text}>
        <div className="pattern-path-head">
          <div className="pattern-mino-guide" aria-hidden="true">
            <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
            <span className="pattern-mino-thought">?</span>
          </div>
          <span className="pattern-path-label">{lang === "tr" ? "Deseni takip et" : "Folge dem Muster"}</span>
        </div>
        <div className="pattern-path-sequence">
          {sequence.map((i, k) => (
            <React.Fragment key={k}>
              <div
                className={`pattern-path-node ${hint >= 2 ? "pattern-emphasis" : ""}`}
                style={{ animationDelay: `${k * 0.2}s` }}
                role="button"
                tabIndex={controlsDisabled ? -1 : 0}
                aria-label={base[i].labels[lang]}
                aria-disabled={controlsDisabled || undefined}
                onClick={() => speakNode(base[i])}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    speakNode(base[i]);
                  }
                }}
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
            <button key={x.id} className={`pattern-choice ${hint >= 2 && x.id === target.id ? "hint-target" : ""}`} onClick={() => pick(x)} disabled={controlsDisabled} aria-label={x.labels[lang]}>
              <Visual item={x} lang={lang} photos={settings.photos} />
              {hint >= 3 && <b>{x.labels[lang]}</b>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
