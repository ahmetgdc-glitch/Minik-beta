import React, { useEffect, useRef, useState } from "react";
import { sample, shuffle } from "../utils/random.js";
import Visual, { Art } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";

export default function MemoryGame({
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
  const [chosen] = useState(() => sample(items, difficulty === 2 ? 2 : difficulty === 4 ? 4 : 6));
  const [cards] = useState(() => shuffle(chosen.flatMap((item) => [
    { id: item.id + "a", item },
    { id: item.id + "b", item },
  ])));
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const openRef = useRef([]);
  const lockedRef = useRef(false);
  const matchedRef = useRef([]);

  const text = lang === "tr" ? "Aynı iki resmi bul." : "Finde zwei gleiche Bilder.";
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    chosen.map((i) => i.id),
    lang === "tr" ? "Kartları birlikte çevirelim." : "Wir drehen die Karten zusammen um.",
  );

  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { matchedRef.current = matched; }, [matched]);

  useEffect(() => {
    if (open.length !== 2 || paused) return;
    lockedRef.current = true;
    const a = cards.find((c) => c.id === open[0]);
    const b = cards.find((c) => c.id === open[1]);
    if (!a || !b) { lockedRef.current = false; setOpen([]); return; }
    const ok = a.item.id === b.item.id;
    const timer = setTimeout(() => {
      if (interactionBlocked()) return;
      if (ok) {
        const next = [...matchedRef.current, a.item.id];
        matchedRef.current = next;
        setMatched(next);
        speak(a.item.labels[lang], lang, settings);
        if (next.length === chosen.length) onSolve(chosen.map((i) => i.id));
      } else {
        onWrong([a.item.id, b.item.id]);
      }
      openRef.current = [];
      setOpen([]);
      lockedRef.current = false;
    }, ok ? 450 : 900);
    return () => clearTimeout(timer);
  }, [open, paused, cards, chosen, lang, settings, onSolve, onWrong]);

  function flip(card) {
    if (paused || interactionBlocked() || lockedRef.current || matchedRef.current.includes(card.item.id)) return;
    const now = openRef.current;
    if (now.length >= 2 || now.includes(card.id)) return;
    const next = [...now, card.id];
    openRef.current = next;
    if (next.length >= 2) lockedRef.current = true;
    setOpen(next);
    speak(card.item.labels[lang], lang, settings);
  }

  const helpPair = chosen.find((i) => !matched.includes(i.id))?.id;
  return (
    <section className="memory-playground" aria-label={lang === "tr" ? "Hafıza oyun alanı" : "Memory-Spielwiese"}>
      <div className="memory-playground-status">{matched.length} / {chosen.length} {lang === "tr" ? "çift" : "Paare"}</div>
      <div className={`memory-grid cards-${cards.length}`}>
        {cards.map((card, index) => {
          const found = matched.includes(card.item.id);
          const show = found || open.includes(card.id) || hint >= 3 || (hint >= 2 && card.item.id === helpPair);
          return (
            <button
              className={`memory-card ${show ? "flipped" : ""} ${found ? "matched" : ""}`}
              key={card.id}
              disabled={found || open.length >= 2 || lockedRef.current}
              onClick={() => flip(card)}
              aria-label={show ? card.item.labels[lang] : lang === "tr" ? `Kart ${index + 1}, çevir` : `Karte ${index + 1}, umdrehen`}
            >
              {show ? (
                <Visual item={card.item} lang={lang} photos={settings.photos} />
              ) : (
                <><Art name="spiral-shell" /><span className="card-dot" /></>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
