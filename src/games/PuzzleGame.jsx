import React, { useState } from "react";
import { sample, shuffle } from "../utils/random.js";
import Visual, { assetUrl } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
import { itemsForWorld } from "../data/content.js";
export default function PuzzleGame({
  items,
  lang,
  settings,
  hint,
  paused,
  interactionBlocked = () => false,
  onReady,
  onSolve,
}) {
  const [target] = useState(
    () =>
      sample(
        items.filter((x) => x.type === "illustration").length
          ? items.filter((x) => x.type === "illustration")
          : itemsForWorld("animals"),
        1,
      )[0],
  );
  const [order, setOrder] = useState(() => {
      let p = shuffle([0, 1, 2, 3]);
      if (p.every((x, i) => x === i)) p = [1, 0, 3, 2];
      return p;
    }),
    [selected, setSelected] = useState(null);
  const text =
    lang === "tr"
      ? "İki parçaya dokun, yerlerini değiştir."
      : "Tippe zwei Teile an und tausche sie.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    lang === "tr" ? "Küçük resme bak." : "Schau auf das kleine Vorbild.",
  );
  const url = assetUrl(
    settings.photos && target.variants.photo
      ? target.variants.photo
      : `assets/illustrations/${target.asset}.svg`,
  );
  function pick(i) {
    if (paused || interactionBlocked()) return;
    if (selected === null) {
      setSelected(i);
      return;
    }
    const next = [...order];
    [next[i], next[selected]] = [next[selected], next[i]];
    setSelected(null);
    setOrder(next);
    if (next.every((x, k) => x === k)) onSolve([target.id]);
  }
  const misplaced = order.findIndex((x, i) => x !== i);
  return (
    <div className="puzzle-layout" aria-disabled={paused || undefined}>
      <div className="puzzle-reference">
        <Visual item={target} lang={lang} photos={settings.photos} />
        <span>{lang === "tr" ? "Resmi tamamla" : "So sieht’s aus"}</span>
      </div>
      <div className="puzzle-board">
        {order.map((piece, index) => (
          <button
            key={index}
            className={`${selected === index ? "selected" : ""} ${hint >= 2 && index === misplaced ? "hint-target" : ""}`}
            style={{
              backgroundImage: `url("${url}")`,
              backgroundPosition: `${(piece % 2) * 100}% ${Math.floor(piece / 2) * 100}%`,
            }}
            aria-label={`${lang === "tr" ? "Parça" : "Puzzleteil"} ${index + 1}`}
            onClick={() => pick(index)}
            disabled={paused}
          >
            {hint >= 3 && <span>{piece + 1}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
