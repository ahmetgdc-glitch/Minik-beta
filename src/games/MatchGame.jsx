import React, { useEffect, useState, useRef } from "react";
import { sample, shuffle } from "../utils/random.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
import { useDragPlacement } from "./useDragPlacement.js";
import { placePair } from "./dragSession.js";
import DragPreview from "./DragPreview.jsx";
export default function MatchGame({
  items,
  progress,
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
    [selected, setSelected] = useState(null),
    [speakingSourceId, setSpeakingSourceId] = useState(null),
    [pendingSolve, setPendingSolve] = useState(null);
  const matchedRef = useRef([]);
  const speechRun = useRef(0);
  const text = lang === "tr" ? "Resmi eşine götür." : "Bring das Bild zu seinem Zwilling.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    chosen.map((x) => x.id),
    lang === "tr" ? "Önce resmi, sonra eşini seç." : "Tippe auf ein Bild und dann auf seinen Zwilling.",
  );
  const controlsDisabled = paused || interactionBlocked();

  useEffect(() => {
    if (!pendingSolve || speakingSourceId !== null || paused || interactionBlocked()) return;
    const solvedIds = pendingSolve;
    setPendingSolve(null);
    onSolve(solvedIds);
  }, [pendingSolve, speakingSourceId, paused, interactionBlocked, onSolve]);

  async function selectSource(id) {
    if (id == null) {
      setSelected(null);
      return;
    }
    if (paused || interactionBlocked() || matchedRef.current.includes(id)) return;
    setSelected(id);
    const item = chosen.find((entry) => entry.id === id);
    if (!item) return;
    const run = ++speechRun.current;
    setSpeakingSourceId(id);
    try {
      await speak(item.labels[lang], lang, settings);
    } finally {
      if (run === speechRun.current) setSpeakingSourceId(null);
    }
  }

  function drop(source, target) {
    if (paused || interactionBlocked()) return;
    const result = placePair(matchedRef.current, source, target, chosen.map(x => x.id));
    if (result.outcome === "match") {
      matchedRef.current = result.matched;
      setMatched(result.matched);
      setSelected(null);
      if (result.matched.length === chosen.length) {
        const solvedIds = chosen.map((x) => x.id);
        if (speakingSourceId !== null) setPendingSolve(solvedIds);
        else onSolve(solvedIds);
      }
    } else if (result.outcome === "retry") {
      setSelected(null);
      onWrong([source]);
    }
  }

  function tapTarget(item) {
    if (paused || interactionBlocked() || matchedRef.current.includes(item.id)) return;
    if (selected) {
      drop(selected, item.id);
      return;
    }
    speak(item.labels[lang], lang, settings);
  }

  const placement = useDragPlacement({
    paused,
    interactionBlocked,
    onDragStart: setSelected,
    onDrop: drop,
    onSelect: selectSource,
  });
  const help = selected || chosen.find((x) => !matched.includes(x.id))?.id;
  const progressLabel = lang === "tr" ? `${matched.length} / ${chosen.length} eş bulundu` : `${matched.length} / ${chosen.length} Paare gefunden`;
  return (
    <section className="match-playground" aria-label={text} aria-disabled={controlsDisabled || undefined}>
      <header className="match-stage-header">
        <div className="match-mino-guide" aria-hidden="true">
          <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
        </div>
        <span className="match-stage-badge">{lang === "tr" ? "İkizleri bul" : "Finde die Zwillinge"}</span>
        <div className="match-progress" role="status" aria-label={progressLabel}>
          {chosen.map((item) => <i key={item.id} className={matched.includes(item.id) ? "done" : ""} />)}
        </div>
        <p>{lang === "tr" ? "Sürükle veya resme ve yerine dokun." : "Ziehe ein Bild zu seinem Zwilling – oder tippe beide nacheinander an."}</p>
      </header>
      <div className={`matching-board pairs-${chosen.length}`} ref={placement.boardRef}>
        <div className="matching-zone matching-sources" aria-label={lang === "tr" ? "Resimler" : "Bilder"}>
          <strong>{lang === "tr" ? "Resimler" : "Bilder"}</strong>
          <div className="matching-zone-grid">
            {chosen.map((item) => (
              <button
                key={item.id}
                className={`match-source ${matched.includes(item.id) ? "placed" : ""} ${selected === item.id ? "selected" : ""}`}
                disabled={controlsDisabled || matched.includes(item.id)}
                aria-label={`${item.labels[lang]} ${lang === "tr" ? "seç" : "auswählen"}`}
                style={{ touchAction: "none" }}
                {...placement.sourceProps(item.id)}
                aria-pressed={selected === item.id}
              >
                <Visual item={item} lang={lang} photos={settings.photos} />
                <span>{item.labels[lang]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="matching-bridge" aria-hidden="true"><span>↔</span></div>
        <div className="matching-zone matching-slots" aria-label={lang === "tr" ? "Eşler" : "Zwillinge"}>
          <strong>{lang === "tr" ? "Eşler" : "Zwillinge"}</strong>
          <div className="matching-zone-grid">
            {slots.map((item) => (
              <button
                key={item.id}
                data-drop-id={item.id}
                disabled={controlsDisabled || matched.includes(item.id)}
                className={`match-slot ${placement.drag?.over === item.id ? "drop-hover" : ""} ${matched.includes(item.id) ? "filled" : ""} ${hint >= 2 && help === item.id ? "hint-target" : ""}`}
                onClick={() => tapTarget(item)}
                aria-label={`${item.labels[lang]} ${lang === "tr" ? "yerleştir" : "ablegen"}`}
              >
                <Visual item={item} lang={lang} photos={settings.photos} />
                {matched.includes(item.id) ? <span className="match-check">✓</span> : <span className="match-target-ring" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <DragPreview drag={placement.drag} items={chosen} {...{lang, settings}} />
    </section>
  );
}
