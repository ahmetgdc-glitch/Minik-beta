import React, { useMemo } from "react";
import { speak } from "../audio/voice.js";
import { itemMastery } from "../learning/mastery.js";
import { reviewItems } from "../learning/review.js";
import { choicesFor } from "../utils/random.js";
import { useLesson, OptionGrid } from "./shared.jsx";

export default function ReviewGame({
  items,
  progress,
  difficulty,
  lang,
  settings,
  hint,
  round,
  onReady,
  onWrong,
  onSolve,
}) {
  const candidates = useMemo(() => reviewItems(progress, items, lang), [progress, items, lang]);
  const target = candidates[round % candidates.length] || items[round % items.length];
  const options = useMemo(
    () => choicesFor(target, items, Math.min(Math.max(2, difficulty), Math.min(6, items.length))),
    [target, items, difficulty],
  );
  const state = itemMastery(progress, target.id, lang);
  const text = lang === "tr"
    ? `${target.labels.tr} nerede? Bir kez daha hatırlayalım.`
    : `Wo ist ${target.labels.de}? Das wiederholen wir noch einmal.`;
  const help = lang === "tr" ? `${target.labels.tr}. Bu resmi seç.` : `${target.labels.de}. Tippe auf dieses Bild.`;

  useLesson(onReady, text, () => speak(text, lang, settings), [target.id], help);

  return (
    <div className={`review-game review-${state.level}`}>
      <div className="review-focus-badge">
        {state.level === "practice"
          ? (lang === "tr" ? "Biraz daha çalışalım" : "Das üben wir noch")
          : state.level === "learning"
            ? (lang === "tr" ? "Öğreniyorum" : "Lerne ich")
            : (lang === "tr" ? "Tekrar turu" : "Wiederholungsrunde")}
      </div>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        onPick={(item) => item.id === target.id ? onSolve([target.id]) : onWrong([target.id])}
      />
    </div>
  );
}
