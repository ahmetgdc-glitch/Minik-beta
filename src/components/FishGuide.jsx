import React from "react";
import { Mino } from "./Visual.jsx";
export default function FishGuide({ message, onHelp, stage = 0, lang = "de" }) {
  return (
    <div className={`fish-guide stage-${stage}`}>
      <button
        className="mino-help"
        onClick={onHelp}
        aria-label={
          lang === "tr" ? "Mino’dan yardım iste" : "Mino um Hilfe bitten"
        }
      >
        <Mino />
        <span>?</span>
      </button>
      <div className="speech-bubble" aria-live="polite">
        <strong>Mino</strong>
        <span>
          {message ||
            (lang === "tr"
              ? "Birlikte yapabiliriz!"
              : "Wir schaffen das zusammen!")}
        </span>
      </div>
    </div>
  );
}
