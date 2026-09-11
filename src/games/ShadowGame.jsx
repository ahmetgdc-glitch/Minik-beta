import React from "react";
import { Volume2 } from "lucide-react";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
export default function ShadowGame({
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
  const { target, options } = useSelection(items, difficulty);
  const text =
    lang === "tr"
      ? "Bu gölge hangi resme ait?"
      : "Zu welchem Bild gehört der Schatten?";
  const help = lang === "tr" ? "Şekle dikkatlice bak." : "Schau genau auf die Form.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    help,
  );
  const controlsDisabled = paused || interactionBlocked();

  function repeatPrompt() {
    if (controlsDisabled) return;
    speak(text, lang, settings);
  }

  function pick(item) {
    if (controlsDisabled) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="shadow-playground" aria-disabled={controlsDisabled || undefined}>
      <button
        type="button"
        className="shadow-stage"
        onClick={repeatPrompt}
        disabled={controlsDisabled}
        aria-label={lang === "tr" ? "Soruyu tekrar dinle" : "Aufgabe noch einmal hören"}
      >
        <Visual item={target} lang={lang} silhouette={hint < 3} />
        <span className="shadow-listen-hint" aria-hidden="true"><Volume2 size={24} /></span>
      </button>
      <OptionGrid
        {...{ target, options, hint, lang, settings }}
        disabled={controlsDisabled}
        onPick={pick}
      />
    </div>
  );
}
