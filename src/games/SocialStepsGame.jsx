import React, { useMemo } from "react";
import { speak } from "../audio/voice.js";
import Visual from "../components/Visual.jsx";
import { choicesFor, sample } from "../utils/random.js";
import { useLesson } from "./shared.jsx";
import { buildSocialSafetyRounds } from "./socialSteps.js";

export default function SocialStepsGame({
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
  const round = useMemo(() => {
    const sequence = sample(buildSocialSafetyRounds(items), 1)[0];
    if (!sequence) return null;
    const [first, second, target] = sequence.items;
    const pool = items.filter((item) => item.id !== first.id && item.id !== second.id);
    return {
      ...sequence,
      first,
      second,
      target,
      options: choicesFor(target, pool, difficulty),
    };
  }, [items, difficulty]);

  if (!round) return null;

  const text =
    lang === "tr"
      ? `${round.title.tr}. Sonra ne yapmalıyız?`
      : `${round.title.de}. Was machen wir danach?`;
  const help =
    lang === "tr"
      ? `${round.first.labels.tr}, sonra ${round.second.labels.tr}, ardından ${round.target.labels.tr}.`
      : `${round.first.labels.de}, dann ${round.second.labels.de}, danach ${round.target.labels.de}.`;

  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    round.items.map((item) => item.id),
    help,
  );

  function pick(item) {
    if (paused || interactionBlocked()) return;
    item.id === round.target.id
      ? onSolve(round.items.map((entry) => entry.id))
      : onWrong(round.items.map((entry) => entry.id));
  }

  return (
    <div className="social-steps-game" aria-disabled={paused || undefined}>
      <div className="social-scenario-title">{round.title[lang]}</div>
      <div className="social-sequence-strip" aria-label={round.title[lang]}>
        {[round.first, round.second].map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="social-step-card complete">
              <span className="social-step-number">{index + 1}</span>
              <Visual item={item} lang={lang} photos={settings.photos} />
              <b>{item.labels[lang]}</b>
            </div>
            <span className="social-step-arrow" aria-hidden="true">→</span>
          </React.Fragment>
        ))}
        <div className="social-step-card question" aria-hidden="true">
          <span className="social-step-number">3</span>
          <strong>?</strong>
        </div>
      </div>

      <div className={`answer-grid options-${round.options.length}`}>
        {round.options.map((item) => (
          <button
            key={item.id}
            className={`answer-card ${hint >= 2 && item.id === round.target.id ? "hint-target" : ""}`}
            onClick={() => pick(item)}
            disabled={paused}
            aria-label={item.labels[lang]}
          >
            <Visual item={item} lang={lang} photos={settings.photos} />
            <b>{item.labels[lang]}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
