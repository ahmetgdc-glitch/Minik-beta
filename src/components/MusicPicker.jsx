import React, { useEffect, useRef, useState } from "react";
import { Music2, X } from "lucide-react";
import { MUSIC_STYLES, MUSIC_OFF, getMusicStyle, setMusicStyle } from "../audio/musicProfiles.js";
import { startMusic, stopMusic, unlockAudio } from "../audio/sounds.js";
import "./music-picker.css";

export default function MusicPicker({ lang = "tr", enabled = true }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState(() => getMusicStyle());
  const root = useRef(null);
  const t = (de, tr) => (lang === "tr" ? tr : de);
  const choices = [...MUSIC_STYLES, MUSIC_OFF];

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (!enabled) stopMusic();
  }, [enabled]);

  function choose(next) {
    unlockAudio();
    const selected = setMusicStyle(next);
    setStyle(selected);
    stopMusic();
    if (enabled && selected !== "off") startMusic({ enabled: true, style: selected });
    setOpen(false);
  }

  const current = choices.find((item) => item.id === style) || MUSIC_STYLES[0];

  return (
    <div className="music-picker" ref={root}>
      <button
        type="button"
        className={`music-picker-trigger ${style === "off" ? "is-off" : ""}`}
        aria-label={t("Hintergrundmusik wählen", "Arka plan müziğini seç")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Music2 size={20} />
        <span aria-hidden="true">{current.icon}</span>
      </button>
      {open && (
        <div className="music-picker-panel" role="dialog" aria-label={t("Hintergrundmusik", "Arka plan müziği")}>
          <div className="music-picker-head">
            <div>
              <b>{t("Hintergrundmusik", "Arka plan müziği")}</b>
              <small>{t("Wähle Minos Stimmung", "Mino’nun havasını seç")}</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("Schließen", "Kapat")}>
              <X size={20} />
            </button>
          </div>
          <div className="music-picker-options">
            {choices.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.id === style ? "selected" : ""}
                aria-pressed={item.id === style}
                onClick={() => choose(item.id)}
              >
                <span className="music-picker-icon" aria-hidden="true">{item.icon}</span>
                <span>
                  <b>{lang === "tr" ? item.tr : item.de}</b>
                  <small>{lang === "tr" ? item.descriptionTr : item.descriptionDe}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
