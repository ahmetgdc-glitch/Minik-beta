import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Volume2 } from "lucide-react";
import { speak } from "../audio/voice.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { itemMastery } from "../learning/mastery.js";
import { reviewItems } from "../learning/review.js";
import { choicesFor } from "../utils/random.js";
import { useLesson } from "./shared.jsx";

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
  // Review is listening-first too: keep the visible guide generic so the
  // target word is learned from Mino's voice instead of being readable before
  // the child answers. The exact target-specific sentence is still narrated.
  const displayText = lang === "tr"
    ? "Kelimeyi dinle ve doğru resmi bul."
    : "Hör das Wort und finde das richtige Bild.";
  const help = lang === "tr" ? `${target.labels.tr}. Bu resmi seç.` : `${target.labels.de}. Tippe auf dieses Bild.`;
  const badge = state.level === "practice"
    ? (lang === "tr" ? "Biraz daha çalışalım" : "Das üben wir noch")
    : state.level === "learning"
      ? (lang === "tr" ? "Öğreniyorum" : "Lerne ich")
      : (lang === "tr" ? "Tekrar turu" : "Wiederholungsrunde");

  const [hearingTarget, setHearingTarget] = useState(false);
  const voiceRun = useRef(0);
  const controlsDisabled = paused || interactionBlocked();
  const answersDisabled = controlsDisabled || hearingTarget;
  const quietOption = options.find((item) => item.id !== target.id);

  async function speakLocked(spokenText) {
    if (controlsDisabled) return;
    const run = ++voiceRun.current;
    setHearingTarget(true);
    try {
      await speak(spokenText, lang, settings);
    } finally {
      if (run === voiceRun.current) setHearingTarget(false);
    }
  }

  function playPrompt() {
    return speakLocked(text);
  }

  useLesson(onReady, displayText, playPrompt, [target.id], help);

  useEffect(() => {
    if (!controlsDisabled) return;
    voiceRun.current += 1;
    setHearingTarget(false);
  }, [controlsDisabled]);

  function replayTarget() {
    if (controlsDisabled || hearingTarget) return;
    return speakLocked(target.labels[lang]);
  }

  function pick(item) {
    if (answersDisabled) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className={`review-game review-island review-${state.level}`} aria-disabled={answersDisabled || undefined}>
      <section className="review-island__stage" aria-label={badge}>
        <div className="review-island__focus">
          <div className="review-island__badge"><Sparkles size={18} aria-hidden="true" /> {badge}</div>
          <button
            type="button"
            className="review-island__orb review-island__listen"
            onClick={replayTarget}
            disabled={answersDisabled}
            aria-label={lang === "tr" ? `${target.labels.tr} kelimesini tekrar dinle` : `${target.labels.de} noch einmal anhören`}
          >
            <Volume2 size={64} aria-hidden="true" />
          </button>
          <h3 className="review-island__title">
            {lang === "tr" ? "Mino ile tekrar zamanı" : "Trainingszeit mit Mino"}
          </h3>
          <p className="review-island__subtitle">{displayText}</p>
        </div>
        <div className="review-island__mino" aria-hidden="true">
          <span className="review-island__mino-glow" />
          <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
        </div>
      </section>
      <div className="review-island__choice-label">{lang === "tr" ? "Doğru resmi bul" : "Finde das richtige Bild"}</div>
      <div className={`review-island__choices choices-${options.length}`} aria-disabled={answersDisabled || undefined}>
        {options.map((item, index) => {
          const isTarget = item.id === target.id;
          const hinted = hint >= 2 && isTarget;
          const quiet = hint >= 2 && options.length > 2 && item.id === quietOption?.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`review-island__choice review-choice-${(index % 4) + 1} ${hinted ? "hint-target" : ""} ${quiet ? "quiet-option" : ""}`}
              onClick={() => pick(item)}
              disabled={answersDisabled}
              aria-label={item.labels[lang]}
            >
              <span className="review-island__choice-glow" aria-hidden="true" />
              <Visual item={item} lang={lang} photos={settings.photos} />
              {hint >= 3 && <b>{item.labels[lang]}</b>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
