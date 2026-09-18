import React, { useEffect, useRef, useState } from "react";
import { Headphones, Volume2 } from "lucide-react";
import { speak } from "../audio/voice.js";
import Visual, { MinoAvatar } from "../components/Visual.jsx";
import { useSelection, useLesson } from "./shared.jsx";

export default function ListenGame({
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
  const { target, options } = useSelection(items, difficulty);
  const [hearingTarget, setHearingTarget] = useState(false);
  const voiceRun = useRef(0);
  const text =
    lang === "tr"
      ? `${target.labels.tr} nerede?`
      : `Finde: ${target.labels.de}.`;
  // Keep the on-screen Mino bubble from spelling out the answer. The narrator
  // still speaks the complete target-specific sentence below; stronger help can
  // reveal that concrete text only after the child actually needs assistance.
  const displayText = lang === "tr"
    ? "İyi dinle ve doğru resmi bul."
    : "Hör genau hin und finde das passende Bild.";
  const controlsDisabled = paused || interactionBlocked();
  const answersDisabled = controlsDisabled || hearingTarget;
  const quietOption = options.find((item) => item.id !== target.id);

  async function hearTarget(spokenText) {
    if (controlsDisabled) return;
    const run = ++voiceRun.current;
    setHearingTarget(true);
    try {
      await speak(spokenText, lang, settings);
    } finally {
      if (run === voiceRun.current) setHearingTarget(false);
    }
  }

  function playPrompt() {
    return hearTarget(text);
  }

  useLesson(
    onReady,
    displayText,
    playPrompt,
    [target.id],
    text,
  );

  useEffect(() => {
    if (!controlsDisabled) return;
    voiceRun.current += 1;
    setHearingTarget(false);
  }, [controlsDisabled]);

  function pick(item) {
    if (answersDisabled) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  function repeatWord() {
    if (controlsDisabled || hearingTarget) return;
    // Replay means replay the learning word itself. If that exact word has no
    // fixed MINIK recording yet, voice.js uses the approved exact-text Voice 4
    // fallback instead of substituting or expanding the child's request.
    return hearTarget(target.labels[lang]);
  }

  return (
    <section className="listen-playground" aria-disabled={controlsDisabled || undefined}>
      <div className="listen-stage" aria-label={lang === "tr" ? "Mino dinleme istasyonu" : "Minos Hörstation"}>
        <div className="listen-stage-copy">
          <span className="listen-badge"><Headphones size={20} /> {lang === "tr" ? "Kulaklarını aç" : "Ohren auf"}</span>
          <strong>{lang === "tr" ? "Mino bir kelime söylüyor" : "Mino sagt dir ein Wort"}</strong>
          <small>{displayText}</small>
        </div>
        <div className="listen-mino" aria-hidden="true">
          <span className="listen-mino-ring" />
          <MinoAvatar outfit={progress?.minoOutfit || "classic"} />
          <Headphones className="listen-mino-headphones" size={58} />
        </div>
        <button className={`listen-orb ${hearingTarget ? "playing" : ""}`} type="button" onClick={repeatWord} disabled={controlsDisabled || hearingTarget} aria-label={lang === "tr" ? "Kelimeyi tekrar dinle" : "Wort noch einmal hören"}>
          <span className="listen-wave wave-one" aria-hidden="true" />
          <span className="listen-wave wave-two" aria-hidden="true" />
          <span className="listen-wave wave-three" aria-hidden="true" />
          <Volume2 className="listen-speaker" size={72} aria-hidden="true" />
          <span className="listen-replay-label">{lang === "tr" ? "Tekrar dinle" : "Nochmal hören"}</span>
        </button>
      </div>
      <div className="listen-choice-label">{lang === "tr" ? "Hangi resim?" : "Welches Bild passt?"}</div>
      <div className={`listen-choice-field choices-${options.length}`} aria-disabled={answersDisabled || undefined}>
        {options.map((item, index) => {
          const isTarget = item.id === target.id;
          const hinted = hint >= 2 && isTarget;
          const quiet = hint >= 2 && options.length > 2 && item.id === quietOption?.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`listen-choice listen-choice-${(index % 4) + 1} ${hinted ? "hint-target" : ""} ${quiet ? "quiet-option" : ""}`}
              onClick={() => pick(item)}
              disabled={answersDisabled}
              aria-label={item.labels[lang]}
            >
              <span className="listen-choice-glow" aria-hidden="true" />
              <Visual item={item} lang={lang} photos={settings.photos} />
              {hint >= 3 && <b>{item.labels[lang]}</b>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
