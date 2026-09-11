import React from "react";
import { MinoAvatar } from "./Visual.jsx";
export default function FishGuide({ message, onHelp, stage = 0, lang = "de", outfit }) {
  return (
    <div className={`fish-guide stage-${stage}`}>
      <button
        className="mino-help"
        onClick={onHelp}
        aria-label={
          lang === "tr" ? "Mino’dan yardım iste" : "Mino um Hilfe bitten"
        }
      >
        <MinoAvatar outfit={outfit} />
        <span className="mino-help-symbol">?</span>
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
