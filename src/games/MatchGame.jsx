import React, { useState, useRef } from "react";
import { sample, shuffle } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
import { useDragPlacement } from "./useDragPlacement.js";
import { placePair } from "./dragSession.js";
import DragPreview from "./DragPreview.jsx";
export default function MatchGame({
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
  const [chosen] = useState(() => sample(items, difficulty === 6 ? 4 : difficulty === 4 ? 3 : 2)),
    [slots] = useState(() => shuffle(chosen));
  const [matched, setMatched] = useState([]),
    [selected, setSelected] = useState(null);
  const matchedRef = useRef([]);
  const text =
    lang === "tr" ? "Resmi eşine götür." : "Bring das Bild zu seinem Zwilling.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    chosen.map((x) => x.id),
    lang === "tr"
      ? "Önce resmi, sonra eşini seç."
      : "Tippe auf ein Bild und dann auf seinen Zwilling.",
  );
  function drop(source, target) {
    if (paused || interactionBlocked()) return;
    const result = placePair(matchedRef.current, source, target, chosen.map(x => x.id));
    if (result.outcome === "match") {
      matchedRef.current = result.matched;
      setMatched(result.matched);
      setSelected(null);
      if (result.matched.length === chosen.length) onSolve(chosen.map(x => x.id));
    } else if (result.outcome === "retry") onWrong([source]);
  }
  const placement = useDragPlacement({ paused, interactionBlocked, onDrop: drop, onSelect: setSelected });
  const help = selected || chosen.find((x) => !matched.includes(x.id))?.id;
  return (
    <>
      <p className="game-instruction">
        {lang === "tr"
          ? "Sürükle veya resme ve yerine dokun."
          : "Ziehen oder Bild und Platz antippen."}
      </p>
      <div className={`matching-board pairs-${chosen.length}`} ref={placement.boardRef}>
        <div className="matching-sources">
          {chosen.map((item) => (
            <button
              key={item.id}
              className={`match-source ${matched.includes(item.id) ? "placed" : ""} ${selected === item.id ? "selected" : ""}`}
              disabled={paused || matched.includes(item.id)}
              aria-label={`${item.labels[lang]} ${lang === "tr" ? "seç" : "auswählen"}`}
              {...placement.sourceProps(item.id)}
              aria-pressed={selected === item.id}
            >
              <Visual item={item} lang={lang} photos={settings.photos} />
            </button>
          ))}
        </div>
        <div className="matching-slots">
          {slots.map((item) => (
            <button
              key={item.id}
              data-drop-id={item.id}
              disabled={paused || matched.includes(item.id)}
              className={`match-slot ${placement.drag?.over === item.id ? "drop-hover" : ""} ${matched.includes(item.id) ? "filled" : ""} ${hint >= 2 && help === item.id ? "hint-target" : ""}`}
              onClick={() => drop(selected, item.id)}
              aria-label={`${item.labels[lang]} ${lang === "tr" ? "yerleştir" : "ablegen"}`}
            >
              <Visual item={item} lang={lang} photos={settings.photos} />
              {matched.includes(item.id) && (
                <span className="match-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <DragPreview drag={placement.drag} items={chosen} {...{lang, settings}} />
    </>
  );
}
