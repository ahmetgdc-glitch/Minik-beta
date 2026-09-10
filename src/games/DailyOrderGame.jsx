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
      <div className="routine-now-card">
        <small>{lang === "tr" ? "Önce" : "Zuerst"}</small>
        <Visual item={prompt} lang={lang} photos={settings.photos} />
        <b>{prompt.labels[lang]}</b>
        <span className="routine-arrow">→</span>
      </div>
      <div className={`answer-grid options-${options.length}`}>
        {options.map((item) => (
          <button
            key={item.id}
            className={`answer-card ${hint >= 2 && item.id === target.id ? "hint-target" : ""}`}
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
    </div>
  );
}
