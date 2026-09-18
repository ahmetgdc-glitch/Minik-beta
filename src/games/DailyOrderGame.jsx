import React, { useMemo } from "react";
import { speak } from "../audio/voice.js";
import { choicesFor, sample } from "../utils/random.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { orderPairs } from "./dailyOrder.js";
import { difficultyProfile } from "./difficulty.js";

export default function DailyOrderGame({
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
  const { prompt, target, options } = useMemo(() => {
    const pair = sample(orderPairs(items), 1)[0] || [items[0], items[1]];
    return {
      prompt: pair[0],
      target: pair[1],
      options: choicesFor(pair[1], items.filter((x) => x.id !== pair[0].id), profile.options),
    };
  }, [items, profile.options]);

  const text = lang === "tr" ? `${prompt.labels.tr} sonrasında ne gelir?` : `Was kommt nach ${prompt.labels.de}?`;
  const help = lang === "tr" ? `${prompt.labels.tr} sonrasında ${target.labels.tr} gelir.` : `Nach ${prompt.labels.de} kommt ${target.labels.de}.`;
  const showAnswerLabels = hint >= 3;

  useLesson(onReady, text, () => speak(text, lang, settings), [prompt.id, target.id], help);
  const controlsDisabled = paused || interactionBlocked();

  function replayPrompt() {
    if (controlsDisabled) return;
    speak(prompt.labels[lang], lang, settings);
  }

  function pick(item) {
    if (controlsDisabled) return;
    item.id === target.id ? onSolve([prompt.id, target.id]) : onWrong([prompt.id, target.id]);
  }

  return (
    <div className="concept-game routine-order-game" aria-disabled={controlsDisabled || undefined} data-difficulty={profile.id}>
      <section className="routine-journey-stage" aria-label={lang === "tr" ? "Şimdi olan" : "Was jetzt passiert"}>
        <span className="routine-scene-label">{lang === "tr" ? "Şimdi" : "Jetzt"}</span>
        <button
          type="button"
          className="routine-now-scene"
          onClick={replayPrompt}
          disabled={controlsDisabled}
          aria-label={lang === "tr" ? `${prompt.labels.tr} kelimesini tekrar dinle` : `${prompt.labels.de} noch einmal anhören`}
        >
          <Visual item={prompt} lang={lang} photos={settings.photos} />
          <b>{prompt.labels[lang]}</b>
        </button>
        <div className="routine-mino-guide" aria-hidden="true">
          <span className="routine-mino-step">1</span>
          <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
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
              onClick={() => pick(item)}
              disabled={controlsDisabled}
              aria-label={item.labels[lang]}
            >
              <Visual item={item} lang={lang} photos={settings.photos} />
              {showAnswerLabels && <b>{item.labels[lang]}</b>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
