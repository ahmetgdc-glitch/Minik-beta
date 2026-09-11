import React, { useMemo } from "react";
import { Volume2 } from "lucide-react";
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
  paused,
  interactionBlocked = () => false,
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
  const badge = state.level === "practice"
    ? (lang === "tr" ? "Biraz daha çalışalım" : "Das üben wir noch")
    : state.level === "learning"
      ? (lang === "tr" ? "Öğreniyorum" : "Lerne ich")
      : (lang === "tr" ? "Tekrar turu" : "Wiederholungsrunde");

  useLesson(onReady, text, () => speak(text, lang, settings), [target.id], help);

  function replayTarget() {
    if (paused || interactionBlocked()) return;
    speak(target.labels[lang], lang, settings);
  }

  function pick(item) {
    if (paused || interactionBlocked()) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className={`review-game review-island review-${state.level}`} aria-disabled={paused || undefined}>
      <section className="review-island__stage" aria-label={badge}>
        <div className="review-island__focus">
          <div className="review-island__badge">{badge}</div>
          <button
            type="button"
            className="review-island__orb review-island__listen"
            onClick={replayTarget}
            disabled={paused}
            aria-label={lang === "tr" ? `${target.labels.tr} kelimesini tekrar dinle` : `${target.labels.de} noch einmal anhören`}
          >
            <Volume2 size={64} aria-hidden="true" />
          </button>
          <h3 className="review-island__title">
            {lang === "tr" ? "Mino ile tekrar zamanı" : "Trainingszeit mit Mino"}
          </h3>
          <p className="review-island__subtitle">
            {lang === "tr"
              ? "Kelimeyi dinle, doğru resmi bul ve öğrendiğini güçlendir."
              : "Hör das Wort, finde das richtige Bild und festige, was du schon gelernt hast."}
          </p>
        </div>
      </section>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        onPick={pick}
      />
    </div>
  );
}
