import React from "react";
import { speak } from "../audio/voice.js";
import { useSelection, useLesson, OptionGrid } from "./shared.jsx";
export default function ListenGame({
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
      ? `${target.labels.tr} nerede?`
      : `Finde: ${target.labels.de}.`;
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    target.labels[lang],
  );
  return (
    <div className="listen-playground">
      <div className="listen-orb" aria-hidden="true"><span>♪</span></div>
      <OptionGrid
        {...{ options, target, hint, lang, settings }}
        onPick={(item) =>
          item.id === target.id ? onSolve([target.id]) : onWrong([target.id])
        }
      />
    </div>
  );
}
