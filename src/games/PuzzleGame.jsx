import React, { useRef, useState } from "react";
import { sample, shuffle } from "../utils/random.js";
import Visual, { assetUrl } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
import { itemsForWorld } from "../data/content.js";
import { useDragPlacement } from "./useDragPlacement.js";

function puzzleLayout(difficulty) {
  if (difficulty === 6) return { count: 9, cols: 3, rows: 3 };
  if (difficulty === 4) return { count: 6, cols: 3, rows: 2 };
  return { count: 4, cols: 2, rows: 2 };
}

function sourceId(index) { return `piece-${index}`; }
function slotId(index) { return `slot-${index}`; }
function parseIndex(value, prefix) {
  if (typeof value !== "string" || !value.startsWith(prefix)) return -1;
  const index = Number(value.slice(prefix.length));
  return Number.isInteger(index) ? index : -1;
}

export default function PuzzleGame({
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
  const [target] = useState(
    () =>
      sample(
        items.filter((x) => x.type === "illustration").length
          ? items.filter((x) => x.type === "illustration")
          : itemsForWorld("animals"),
        1,
      )[0],
  );
  const [{ count, cols, rows }] = useState(() => puzzleLayout(difficulty));
  const [tray] = useState(() => shuffle(Array.from({ length: count }, (_, index) => index)));
  const [placed, setPlaced] = useState([]);
  const placedRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const text =
    lang === "tr"
      ? "Puzzle parçalarını doğru yere sürükle."
      : "Ziehe die Puzzleteile an die richtige Stelle.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    lang === "tr" ? "Küçük resme bak. Parçaları tek tek yerleştir." : "Schau auf das Vorbild und setze die Teile nacheinander ein.",
  );
  const url = assetUrl(
    settings.photos && target.variants.photo
      ? target.variants.photo
      : `assets/illustrations/${target.asset}.svg`,
  );
  const controlsDisabled = paused || interactionBlocked();

  function pieceStyle(index) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = cols <= 1 ? 0 : (col / (cols - 1)) * 100;
    const y = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
    return {
      backgroundImage: `url("${url}")`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${x}% ${y}%`,
    };
  }

  function drop(source, destination) {
    if (paused || interactionBlocked()) return;
    const piece = parseIndex(source, "piece-");
    const slot = parseIndex(destination, "slot-");
    if (piece < 0 || slot < 0 || placedRef.current.includes(piece)) return;
    if (piece !== slot) {
      setSelected(source);
      onWrong?.([target.id]);
      return;
    }
    const next = [...placedRef.current, piece];
    placedRef.current = next;
    setPlaced(next);
    setSelected(null);
    if (next.length === count) onSolve([target.id]);
  }

  const placement = useDragPlacement({
    paused,
    interactionBlocked,
    onSelect: setSelected,
    onDrop: drop,
  });
  const selectedIndex = parseIndex(selected, "piece-");
  const progressLabel = lang === "tr" ? `${placed.length} / ${count} parça tamamlandı` : `${placed.length} / ${count} Teile eingesetzt`;
  const guideOpacity = hint >= 3 ? .30 : hint >= 2 ? .20 : .10;

  return (
    <section className="puzzle-layout real-puzzle" aria-disabled={controlsDisabled || undefined} ref={placement.boardRef}>
      <header className="puzzle-topbar">
        <div className="puzzle-reference">
          <Visual item={target} lang={lang} photos={settings.photos} />
          <span>{lang === "tr" ? "Örnek" : "Vorbild"}</span>
        </div>
        <div className="puzzle-progress" role="status" aria-label={progressLabel}>
          <strong>{progressLabel}</strong>
          <div>{Array.from({ length: count }, (_, index) => <i key={index} className={placed.includes(index) ? "done" : ""}/>)}</div>
        </div>
      </header>

      <div className="puzzle-workspace">
        <div
          className={`real-puzzle-board grid-${cols}x${rows}`}
          style={{ "--puzzle-image": `url("${url}")`, "--guide-opacity": guideOpacity, "--puzzle-cols": cols, "--puzzle-rows": rows }}
          aria-label={lang === "tr" ? "Puzzle tahtası" : "Puzzlebrett"}
        >
          {Array.from({ length: count }, (_, index) => {
            const filled = placed.includes(index);
            return <button
              key={index}
              type="button"
              data-drop-id={slotId(index)}
              disabled={controlsDisabled || filled}
              className={`puzzle-slot puzzle-piece shape-${index % 4} ${filled ? "filled" : ""} ${hint >= 2 && selectedIndex === index ? "hint-target" : ""}`}
              style={filled ? pieceStyle(index) : undefined}
              onClick={() => drop(selected, slotId(index))}
              aria-label={`${lang === "tr" ? "Puzzle yeri" : "Puzzleplatz"} ${index + 1}`}
            >
              {!filled && hint >= 3 && <span>{index + 1}</span>}
              {filled && <span className="puzzle-piece-check">✓</span>}
            </button>;
          })}
        </div>

        <div className={`puzzle-tray pieces-${count}`} aria-label={lang === "tr" ? "Puzzle parçaları" : "Puzzleteile"}>
          <strong>{lang === "tr" ? "Parçalar" : "Teile"}</strong>
          <div className="puzzle-tray-grid">
            {tray.map((index) => {
              const done = placed.includes(index);
              const id = sourceId(index);
              return <button
                key={index}
                type="button"
                disabled={controlsDisabled || done}
                className={`puzzle-source puzzle-piece shape-${index % 4} ${done ? "placed" : ""} ${selected === id ? "selected" : ""}`}
                style={pieceStyle(index)}
                aria-label={`${lang === "tr" ? "Parça" : "Puzzleteil"} ${index + 1}`}
                aria-pressed={selected === id}
                {...placement.sourceProps(id)}
              />;
            })}
          </div>
        </div>
      </div>

      {placement.drag && (() => {
        const index = parseIndex(placement.drag.id, "piece-");
        if (index < 0) return null;
        return <div
          className={`puzzle-drag-ghost puzzle-piece shape-${index % 4}`}
          style={{ ...pieceStyle(index), left: placement.drag.x, top: placement.drag.y }}
          aria-hidden="true"
        />;
      })()}
    </section>
  );
}
