import React from "react";
import { speak } from "../audio/voice.js";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
export default function ListenGame({
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
      ? `${target.labels.tr} nerede?`
      : `Finde: ${target.labels.de}.`;
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    target.labels[lang],
  );

  function pick(item) {
    if (paused || interactionBlocked()) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="listen-playground" aria-disabled={paused || undefined}>
      <div className="listen-orb" aria-hidden="true"><span>♪</span></div>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        onPick={pick}
      />
    </div>
  );
}
