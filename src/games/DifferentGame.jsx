import React, { useMemo, useState } from "react";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { speak } from "../audio/voice.js";

import { buildDifferenceRound } from "./different.js";

export default function DifferentGame({
  items,
  progress,
  lang,
  settings,
  hint,
  paused,
  interactionBlocked = () => false,
  onReady,
  onWrong,
  onSolve,
}) {
  const [round] = useState(() => buildDifferenceRound(items));
  const prompt = lang === "tr"
    ? "Üç resim aynı. Farklı olanı bul."
    : "Drei Bilder sind gleich. Finde das andere.";
  const help = prompt;

  useLesson(
    onReady,
    prompt,
    () => speak(prompt, lang, settings),
    [round?.odd?.id].filter(Boolean),
    help,
  );

  const cells = useMemo(() => round?.cells || [], [round]);
  if (!round) return null;
  const controlsDisabled = paused || interactionBlocked();

  function pick(cell) {
    if (controlsDisabled) return;
    cell.odd ? onSolve([round.odd.id]) : onWrong([round.odd.id]);
  }

  return (
    <section className="different-game difference-playground" aria-label={prompt} aria-disabled={controlsDisabled || undefined}>
      <div className="difference-detective" aria-hidden="true">
        <span className="difference-spotlight" />
        <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
        <span className="difference-lens" />
      </div>
      <div className="different-grid">
        {cells.map((cell) => (
          <button
            key={cell.key}
            className={`different-tile ${hint >= 2 && cell.odd ? "hint-target" : ""}`}
            onClick={() => pick(cell)}
            disabled={controlsDisabled}
            aria-label={cell.item.labels?.[lang] || cell.item.id}
          >
            <Visual item={cell.item} lang={lang} photos={settings.photos} />
          </button>
        ))}
      </div>
    </section>
  );
}
