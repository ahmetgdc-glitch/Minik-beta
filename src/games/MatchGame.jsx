import React, { useState, useRef } from "react";
import { sample, shuffle } from "../utils/random.js";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
export default function MatchGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const [chosen] = useState(() => sample(items, difficulty === 6 ? 4 : 3)),
    [slots] = useState(() => shuffle(chosen));
  const [matched, setMatched] = useState([]),
    [selected, setSelected] = useState(null),
    [drag, setDrag] = useState(null);
  const pointer = useRef(null),
    suppressClick = useRef(false);
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
    if (!source || matched.includes(source)) return;
    if (source === target) {
      const next = [...matched, source];
      setMatched(next);
      setSelected(null);
      if (next.length === chosen.length) onSolve(chosen.map((x) => x.id));
    } else onWrong([source]);
  }
  function begin(e, id) {
    pointer.current = { id, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(id);
  }
  function move(e) {
    const p = pointer.current;
    if (!p) return;
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) {
      p.moved = true;
      setDrag({ id: p.id, x: e.clientX, y: e.clientY });
    }
  }
  function end(e) {
    const p = pointer.current;
    if (!p) return;
    if (p.moved) {
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest("[data-drop-id]");
      if (target) drop(p.id, target.dataset.dropId);
      suppressClick.current = true;
    }
    pointer.current = null;
    setDrag(null);
  }
  const help = selected || chosen.find((x) => !matched.includes(x.id))?.id;
  return (
    <>
      <p className="game-instruction">
        {lang === "tr"
          ? "Sürükle veya resme ve yerine dokun."
          : "Ziehen oder Bild und Platz antippen."}
      </p>
      <div className="matching-board">
        <div className="matching-sources">
          {chosen.map((item) => (
            <button
              key={item.id}
              className={`match-source ${matched.includes(item.id) ? "placed" : ""} ${selected === item.id ? "selected" : ""}`}
              disabled={matched.includes(item.id)}
              aria-label={`${item.labels[lang]} ${lang === "tr" ? "seç" : "auswählen"}`}
              onPointerDown={(e) => begin(e, item.id)}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={() => {
                pointer.current = null;
                setDrag(null);
              }}
              onClick={() => {
                if (suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                setSelected(item.id);
              }}
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
              className={`match-slot ${matched.includes(item.id) ? "filled" : ""} ${hint >= 2 && help === item.id ? "hint-target" : ""}`}
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
      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <Visual
            item={chosen.find((x) => x.id === drag.id)}
            lang={lang}
            photos={settings.photos}
          />
        </div>
      )}
    </>
  );
}
