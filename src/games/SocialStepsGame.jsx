import React, { useMemo } from "react";
import { Volume2 } from "lucide-react";
import { speak } from "../audio/voice.js";
import Visual from "../components/Visual.jsx";
import { choicesFor, sample } from "../utils/random.js";
import { useLesson } from "./shared.jsx";
import { buildSocialSafetyRounds } from "./socialSteps.js";
import { difficultyProfile } from "./difficulty.js";

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
  const profile = difficultyProfile(difficulty);
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
      options: choicesFor(target, pool, profile.options),
    };
  }, [items, profile.options]);

  if (!round) return null;

  const text =
    lang === "tr"
      ? `${round.title.tr}. Sonra ne yapmalıyız?`
      : `${round.title.de}. Was machen wir danach?`;
  const spokenPrompt = lang === "tr" ? "Sonra ne gelir?" : "Was kommt danach?";
  const help = spokenPrompt;
  const showAnswerLabels = profile.id !== "hard" || hint >= 1;
  const showSequenceLabels = profile.id === "easy" || hint >= 1;

  useLesson(
    onReady,
    text,
    () => speak(spokenPrompt, lang, settings),
    round.items.map((item) => item.id),
    help,
  );
  const controlsDisabled = paused || interactionBlocked();

  function blocked() {
    return paused || interactionBlocked();
  }

  function hearStep(item) {
    if (blocked()) return;
    speak(item.labels[lang], lang, settings);
  }

  function handleStepKeyDown(event, item) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    hearStep(item);
  }

  function pick(item) {
    if (blocked()) return;
    item.id === round.target.id
      ? onSolve(round.items.map((entry) => entry.id))
      : onWrong(round.items.map((entry) => entry.id));
  }

  return (
    <div className="social-steps-game" aria-disabled={controlsDisabled || undefined} data-difficulty={profile.id}>
      <div className="social-scenario-title">{round.title[lang]}</div>
      <div className="social-sequence-strip" aria-label={round.title[lang]}>
        {[round.first, round.second].map((item, index) => (
          <React.Fragment key={item.id}>
            <div
              className="social-step-card complete social-step-listenable"
              role="button"
              tabIndex={controlsDisabled ? -1 : 0}
              aria-disabled={controlsDisabled || undefined}
              aria-label={lang === "tr" ? `${item.labels.tr} kelimesini tekrar dinle` : `${item.labels.de} noch einmal anhören`}
              onClick={() => hearStep(item)}
              onKeyDown={(event) => handleStepKeyDown(event, item)}
            >
              <span className="social-step-number">{index + 1}</span>
              <Visual item={item} lang={lang} photos={settings.photos} />
              {showSequenceLabels && <b>{item.labels[lang]}</b>}
              <span className="social-step-hear" aria-hidden="true"><Volume2 size={18} /></span>
            </div>
            <span className="social-step-arrow" aria-hidden="true">→</span>
          </React.Fragment>
        ))}
        <div className="social-step-card question" aria-hidden="true">
          <span className="social-step-number">3</span>
          <strong>?</strong>
        </div>
      </div>

      <div className={`answer-grid options-${round.options.length}`} aria-disabled={controlsDisabled || undefined}>
        {round.options.map((item) => (
          <button
            key={item.id}
            className={`answer-card ${hint >= 2 && item.id === round.target.id ? "hint-target" : ""}`}
            onClick={() => pick(item)}
            disabled={controlsDisabled}
            aria-label={item.labels[lang]}
          >
            <Visual item={item} lang={lang} photos={settings.photos} />
            {showAnswerLabels && <b>{item.labels[lang]}</b>}
          </button>
        ))}
      </div>
    </div>
  );
}
