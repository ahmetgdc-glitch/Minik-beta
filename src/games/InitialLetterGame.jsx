import React, { useEffect, useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { speak } from "../audio/voice.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { sample, shuffle } from "../utils/random.js";
import { useLesson } from "./shared.jsx";
import { difficultyProfile } from "./difficulty.js";

const FALLBACK = {
  de: ["A", "B", "D", "E", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T", "W"],
  tr: ["A", "B", "C", "Ç", "D", "E", "F", "G", "H", "İ", "K", "L", "M", "N", "O", "Ö", "P", "S", "Ş", "T", "U", "Ü", "Y", "Z"],
};

import { initialLetter } from "./initialLetter.js";
function choices(targetLetter, items, lang, count) {
  const fromItems = items
    .map((item) => initialLetter(item.labels?.[lang], lang))
    .filter((letter) => letter && letter !== targetLetter);
  const pool = [...new Set([...fromItems, ...FALLBACK[lang]])].filter(
    (letter) => letter !== targetLetter,
  );
  return shuffle([targetLetter, ...sample(pool, Math.max(1, count - 1))]);
}

export default function InitialLetterGame({
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
  const [target] = useState(() => sample(items.filter((i) => i.labels?.[lang]), 1)[0]);
  const [hearingTarget, setHearingTarget] = useState(false);
  const voiceRun = useRef(0);
  const targetLetter = initialLetter(target?.labels?.[lang], lang);
  const optionCount = profile.options;
  const options = useMemo(
    () => choices(targetLetter, items, lang, optionCount),
    [targetLetter, items, lang, optionCount],
  );
  const prompt =
    lang === "tr"
      ? `${target.labels.tr} hangi harfle başlıyor?`
      : `Mit welchem Buchstaben beginnt ${target.labels.de}?`;
  // Do not print the target word before the child has listened: showing it
  // would reveal the correct first letter. The full word still stays in the
  // spoken prompt, and becomes visible only with Mino's demonstration help.
  const displayPrompt =
    lang === "tr"
      ? "Bu kelime hangi harfle başlıyor?"
      : "Mit welchem Buchstaben beginnt das Wort?";

  const controlsDisabled = paused || interactionBlocked();
  const answersDisabled = controlsDisabled || hearingTarget;

  function blocked() {
    return paused || interactionBlocked();
  }

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
    return speakLocked(prompt);
  }

  useLesson(
    onReady,
    displayPrompt,
    playPrompt,
    [target.id],
    prompt,
  );

  useEffect(() => {
    if (!controlsDisabled) return;
    voiceRun.current += 1;
    setHearingTarget(false);
  }, [controlsDisabled]);

  function hearTarget() {
    if (controlsDisabled || hearingTarget) return;
    // The replay affordance names the learning target itself. Missing fixed
    // recordings are handled centrally by voice.js with exact-text Voice 4.
    return speakLocked(target.labels[lang]);
  }

  function handleTargetKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    hearTarget();
  }

  function pick(letter) {
    if (answersDisabled) return;
    letter === targetLetter ? onSolve([target.id]) : onWrong([target.id]);
  }

  const replayLabel = lang === "tr"
    ? `${target.labels.tr} kelimesini tekrar dinle`
    : `${target.labels.de} noch einmal anhören`;

  return (
    <div className="initial-letter-game" aria-disabled={controlsDisabled || undefined} data-difficulty={profile.id}>
      <div
        className="initial-letter-target"
        role="button"
        tabIndex={controlsDisabled || hearingTarget ? -1 : 0}
        aria-label={replayLabel}
        aria-disabled={controlsDisabled || hearingTarget || undefined}
        onClick={hearTarget}
        onKeyDown={handleTargetKeyDown}
      >
        <Visual item={target} lang={lang} photos={settings.photos} />
        <div className="initial-letter-mino-guide" aria-hidden="true">
          <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
          <span className="initial-letter-hear-cue"><Volume2 size={24} /></span>
        </div>
        {hint >= 3 && <strong className="initial-letter-word-hint">{target.labels[lang]}</strong>}
      </div>
      <div className={`letter-choice-grid options-${options.length}`}>
        {options.map((letter) => (
          <button
            key={letter}
            className={`letter-choice ${hint >= 2 && letter === targetLetter ? "hint-target" : ""}`}
            onClick={() => pick(letter)}
            disabled={answersDisabled}
            aria-label={letter}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
