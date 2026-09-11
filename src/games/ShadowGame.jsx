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

  function pick(item) {
    if (paused || interactionBlocked()) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="shadow-playground" aria-disabled={paused || undefined}>
      <div className="shadow-stage">
        <Visual item={target} lang={lang} silhouette={hint < 3} />
      </div>
      <OptionGrid
        {...{ target, options, hint, lang, settings }}
        onPick={pick}
      />
    </div>
  );
}
