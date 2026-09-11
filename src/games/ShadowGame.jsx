import React from "react";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
export default function ShadowGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const { target, options } = useSelection(items, difficulty);
  const text =
    lang === "tr"
      ? "Bu gölge hangi resme ait?"
      : "Zu welchem Bild gehört der Schatten?";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    target.labels[lang],
  );
  return (
    <div className="shadow-playground">
      <div className="shadow-stage">
        <Visual item={target} lang={lang} silhouette={hint < 3} />
      </div>
      <OptionGrid
        {...{ target, options, hint, lang, settings }}
        onPick={(item) =>
          item.id === target.id ? onSolve([target.id]) : onWrong([target.id])
        }
      />
    </div>
  );
}
