import React, { useMemo, useState } from "react";
import Visual from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { speak } from "../audio/voice.js";

import { buildDifferenceRound } from "./different.js";

export default function DifferentGame({
  items,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const [round] = useState(() => buildDifferenceRound(items));
  const prompt = lang === "tr" ? "Hangi resim farklı?" : "Welches Bild ist anders?";
  const help = lang === "tr"
    ? "Üç resim aynı. Farklı olanı bul."
    : "Drei Bilder sind gleich. Finde das andere.";

  useLesson(
    onReady,
    prompt,
    () => speak(prompt, lang, settings),
    [round?.odd?.id].filter(Boolean),
    help,
  );

  const cells = useMemo(() => round?.cells || [], [round]);
  if (!round) return null;

  return (
    <section className="different-game difference-playground" aria-label={prompt}>
      <div className="different-grid">
        {cells.map((cell) => (
          <button
            key={cell.key}
            className={`different-tile ${hint >= 2 && cell.odd ? "hint-target" : ""}`}
            onClick={() => cell.odd ? onSolve([cell.item.id]) : onWrong([cell.item.id, round.odd.id])}
            aria-label={cell.item.labels?.[lang] || cell.item.id}
          >
            <Visual item={cell.item} lang={lang} photos={settings.photos} />
          </button>
        ))}
      </div>
    </section>
  );
}
