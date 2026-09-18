import React, { useMemo } from "react";
import { speak } from "../audio/voice.js";
import { choicesFor, sample } from "../utils/random.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { pairsForWorld } from "./opposites.js";
import { difficultyProfile } from "./difficulty.js";

export default function OppositesGame({
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
  const pairs = useMemo(() => pairsForWorld(items[0]?.category, items), [items]);
  const { prompt, target, options } = useMemo(() => {
    const pair = sample(pairs, 1)[0] || [items[0], items[1]];
    const reverse = Math.random() > 0.5;
    const prompt = reverse ? pair[1] : pair[0];
    const target = reverse ? pair[0] : pair[1];
    return {
      prompt,
      target,
      options: choicesFor(target, items.filter((x) => x.id !== prompt.id), profile.options),
    };
  }, [pairs, items, profile.options]);

  const text = lang === "tr" ? `${prompt.labels.tr}. Bunun zıttı hangisi?` : `${prompt.labels.de}. Was ist das Gegenteil?`;
  const help = lang === "tr" ? `${target.labels.tr}, ${prompt.labels.tr} kelimesinin zıttıdır.` : `${target.labels.de} ist das Gegenteil von ${prompt.labels.de}.`;
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
    <div className="opposites-playground" aria-disabled={controlsDisabled || undefined} data-difficulty={profile.id}>
      <section className="opposites-stage" aria-label={prompt.labels[lang]}>
        <button
          type="button"
          className="opposites-prompt-scene"
          onClick={replayPrompt}
          disabled={controlsDisabled}
          aria-label={lang === "tr" ? `${prompt.labels.tr} kelimesini tekrar dinle` : `${prompt.labels.de} noch einmal anhören`}
        >
          <Visual item={prompt} lang={lang} photos={settings.photos} />
          <strong>{prompt.labels[lang]}</strong>
        </button>
        <span className="opposites-stage-arrow" aria-hidden="true">↔</span>
        <div className="opposites-stage-prompt">
          <div className="opposites-mino-guide" aria-hidden="true">
            <span className="opposites-thought-mark">?</span>
            <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
          </div>
          <span>{lang === "tr" ? "Bunun zıttı hangisi?" : "Was ist das Gegenteil?"}</span>
        </div>
      </section>

      <section className="opposites-choice-wrap" aria-label={lang === "tr" ? "Zıt olanı seç" : "Wähle das Gegenteil"}>
        <h2 className="opposites-choice-title">{lang === "tr" ? "Karşısına hangisi gelir?" : "Was gehört auf die andere Seite?"}</h2>
        <div className="opposites-choice-grid">
          {options.map((item) => (
            <button
              key={item.id}
              className={`opposites-choice ${hint >= 2 && item.id === target.id ? "hint-target" : ""}`}
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
