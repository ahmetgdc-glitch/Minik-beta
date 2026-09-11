import React, { useState } from "react";
import { sample, choicesFor } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { speak } from "../audio/voice.js";
export default function MissingGame({
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
  const help = lang === "tr"
    ? "Az önceki sırayı hatırla."
    : "Denk an die Reihe von eben.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    help,
  );

  function replayPreview(item) {
    if (hidden || paused || interactionBlocked()) return;
    speak(item.labels[lang], lang, settings);
  }

  function previewKeyDown(event, item) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    replayPreview(item);
  }

  function revealQuestion() {
    if (paused || interactionBlocked()) return;
    setHidden(true);
  }

  function pick(item) {
    if (paused || interactionBlocked()) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="missing-stage-game" aria-disabled={paused || undefined}>
      <section className="missing-stage" aria-label={text}>
        <span className="missing-stage-label">
          {hidden
            ? lang === "tr" ? "Hangisi kayboldu?" : "Was ist verschwunden?"
            : lang === "tr" ? "İyi bak ve hatırla" : "Gut anschauen und merken"}
        </span>
        <div className="missing-object-row">
          {row.map((x) => {
            const vanished = hidden && x.id === target.id && hint < 3;
            return (
              <div
                key={x.id}
                className={`missing-object-slot ${vanished ? "vanished" : ""} ${!hidden ? "listening-target" : ""}`}
                role={!hidden ? "button" : undefined}
                tabIndex={!hidden && !paused ? 0 : undefined}
                aria-label={!hidden ? (lang === "tr" ? `${x.labels.tr} kelimesini dinle` : `${x.labels.de} anhören`) : undefined}
                onClick={() => replayPreview(x)}
                onKeyDown={(event) => previewKeyDown(event, x)}
              >
                {vanished ? (
                  <span className="missing-mark">?</span>
                ) : (
                  <Visual item={x} lang={lang} photos={settings.photos} />
                )}
              </div>
            );
          })}
        </div>
      </section>
      {!hidden ? (
        <button className="primary centered missing-ready" onClick={revealQuestion} disabled={paused}>
          {lang === "tr" ? "Hatırladım!" : "Ich habe es mir gemerkt!"}
        </button>
      ) : (
        <section className="missing-choices" aria-label={lang === "tr" ? "Kaybolan resmi seç" : "Wähle das verschwundene Bild"}>
          <h2 className="missing-choices-title">{lang === "tr" ? "Hangi resim eksik?" : "Welches Bild fehlt?"}</h2>
          <div className="missing-choice-grid">
            {options.map((x) => (
              <button
                key={x.id}
                className={`missing-choice ${hint >= 2 && x.id === target.id ? "hint-target" : ""}`}
                onClick={() => pick(x)}
                disabled={paused}
                aria-label={x.labels[lang]}
              >
                <Visual item={x} lang={lang} photos={settings.photos} />
                <b>{x.labels[lang]}</b>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
