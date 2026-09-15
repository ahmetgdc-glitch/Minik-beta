import React from "react";
import { MinoAvatar } from "./Visual.jsx";
import { useProgress } from "../progress/store.js";

export default function FishGuide({
  message,
  onHelp,
  stage = 0,
  hint,
  lang = "de",
  outfit,
  disabled = false,
}) {
  const progress = useProgress();
  const visualStage = Number.isFinite(hint) ? hint : stage;
  const activeOutfit = outfit || progress.minoOutfit || "classic";
  return (
    <div className={`fish-guide stage-${visualStage}`}>
      <button
        className="mino-help"
        onClick={onHelp}
        disabled={disabled}
        aria-label={
          lang === "tr" ? "Mino’dan yardım iste" : "Mino um Hilfe bitten"
        }
      >
        <MinoAvatar outfit={activeOutfit} />
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
