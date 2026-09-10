import React, { useMemo } from "react";
import { speak } from "../audio/voice.js";
import { choicesFor, sample } from "../utils/random.js";
import { OptionGrid, useLesson } from "./shared.jsx";
import { pairsForWorld } from "./opposites.js";

export default function OppositesGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const pairs = useMemo(() => pairsForWorld(items[0]?.category, items), [items]);
  const { prompt, target, options } = useMemo(() => {
    const pair = sample(pairs, 1)[0] || [items[0], items[1]];
    const reverse = Math.random() > 0.5;
    const prompt = reverse ? pair[1] : pair[0];
    const target = reverse ? pair[0] : pair[1];
    return {
      prompt,
      target,
      options: choicesFor(target, items.filter((x) => x.id !== prompt.id), difficulty),
    };
  }, [pairs, items, difficulty]);

  const text =
    lang === "tr"
      ? `${prompt.labels.tr}. Bunun zıttı hangisi?`
      : `${prompt.labels.de}. Was ist das Gegenteil?`;
  const help =
    lang === "tr"
      ? `${target.labels.tr}, ${prompt.labels.tr} kelimesinin zıttıdır.`
      : `${target.labels.de} ist das Gegenteil von ${prompt.labels.de}.`;

  useLesson(onReady, text, () => speak(text, lang, settings), [prompt.id, target.id], help);

  return (
    <div className="concept-game">
      <div className="concept-prompt" aria-label={prompt.labels[lang]}>
        <strong>{prompt.labels[lang]}</strong>
        <span>↔</span>
        <small>{lang === "tr" ? "Zıttını bul" : "Finde das Gegenteil"}</small>
      </div>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        onPick={(item) =>
          item.id === target.id
            ? onSolve([prompt.id, target.id])
            : onWrong([prompt.id, target.id])
        }
      />
    </div>
  );
}
