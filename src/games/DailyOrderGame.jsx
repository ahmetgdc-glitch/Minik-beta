import React, { useMemo } from "react";
import { speak } from "../audio/voice.js";
import { choicesFor, sample } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { orderPairs } from "./dailyOrder.js";

export default function DailyOrderGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const { prompt, target, options } = useMemo(() => {
    const pair = sample(orderPairs(items), 1)[0] || [items[0], items[1]];
    return {
      prompt: pair[0],
      target: pair[1],
      options: choicesFor(pair[1], items.filter((x) => x.id !== pair[0].id), difficulty),
    };
  }, [items, difficulty]);

  const text =
    lang === "tr"
      ? `${prompt.labels.tr} sonrasında ne gelir?`
      : `Was kommt nach ${prompt.labels.de}?`;
  const help =
    lang === "tr"
      ? `${prompt.labels.tr} sonrasında ${target.labels.tr} gelir.`
      : `Nach ${prompt.labels.de} kommt ${target.labels.de}.`;

  useLesson(onReady, text, () => speak(text, lang, settings), [prompt.id, target.id], help);

  return (
    <div className="concept-game routine-order-game">
      <section className="routine-journey-stage" aria-label={lang === "tr" ? "Şimdi olan" : "Was jetzt passiert"}>
        <span className="routine-scene-label">{lang === "tr" ? "Şimdi" : "Jetzt"}</span>
        <div className="routine-now-scene">
          <Visual item={prompt} lang={lang} photos={settings.photos} />
          <b>{prompt.labels[lang]}</b>
        </div>
        <span className="routine-path-arrow" aria-hidden="true">→</span>
      </section>

      <section className="routine-next-wrap" aria-label={lang === "tr" ? "Sonraki adımı seç" : "Wähle den nächsten Schritt"}>
        <h2 className="routine-next-title">{lang === "tr" ? "Sonra ne olur?" : "Was passiert danach?"}</h2>
        <div className="routine-next-scenes">
          {options.map((item) => (
            <button
              key={item.id}
              className={`routine-next-scene ${hint >= 2 && item.id === target.id ? "hint-target" : ""}`}
              onClick={() =>
                item.id === target.id
                  ? onSolve([prompt.id, target.id])
                  : onWrong([prompt.id, target.id])
              }
              aria-label={item.labels[lang]}
            >
              <Visual item={item} lang={lang} photos={settings.photos} />
              <b>{item.labels[lang]}</b>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
