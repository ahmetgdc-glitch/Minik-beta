import React from "react";
import { Volume2 } from "lucide-react";
import { useSelection, useLesson } from "./shared.jsx";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
export default function ShadowGame({
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
  const quietOption = options.find((item) => item.id !== target.id);

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
        <span className="shadow-cave-glow" aria-hidden="true" />
        <Visual item={target} lang={lang} silhouette={hint < 3} />
        <div className="shadow-mino-guide" aria-hidden="true">
          <span className="shadow-mino-lantern" />
          <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
        </div>
        <span className="shadow-listen-hint" aria-hidden="true"><Volume2 size={24} /></span>
      </button>
      <div className="shadow-choice-label">{lang === "tr" ? "Gölgenin sahibini bul" : "Finde das passende Bild"}</div>
      <div className={`shadow-choice-field choices-${options.length}`} aria-disabled={controlsDisabled || undefined}>
        {options.map((item, index) => {
          const isTarget = item.id === target.id;
          const hinted = hint >= 2 && isTarget;
          const quiet = hint >= 2 && options.length > 2 && item.id === quietOption?.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`shadow-choice shadow-choice-${(index % 4) + 1} ${hinted ? "hint-target" : ""} ${quiet ? "quiet-option" : ""}`}
              onClick={() => pick(item)}
              disabled={controlsDisabled}
              aria-label={item.labels[lang]}
            >
              <span className="shadow-choice-glow" aria-hidden="true" />
              <Visual item={item} lang={lang} photos={settings.photos} />
              <b>{item.labels[lang]}</b>
            </button>
          );
        })}
      </div>
    </div>
  );
}
