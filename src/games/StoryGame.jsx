import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Volume2 } from "lucide-react";
import Visual from "../components/Visual.jsx";
import { sample, choicesFor } from "../utils/random.js";
import { useLesson, OptionGrid } from "./shared.jsx";
import { speak } from "../audio/voice.js";

function storySentence(labels, lang) {
  if (labels.length <= 1) {
    return lang === "tr"
      ? `Mino ${labels[0] || "bir şey"} görüyor.`
      : `Mino sieht ${labels[0] || "etwas"}.`;
  }
  if (labels.length === 2) {
    return lang === "tr"
      ? `Mino önce ${labels[0]} ve sonra ${labels[1]} görüyor.`
      : `Mino sieht zuerst ${labels[0]} und dann ${labels[1]}.`;
  }
  return lang === "tr"
    ? `Mino önce ${labels[0]}, sonra ${labels[1]} ve en son ${labels[2]} görüyor.`
    : `Mino sieht zuerst ${labels[0]}, dann ${labels[1]} und zum Schluss ${labels[2]}.`;
}

export default function StoryGame({
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
  const [storyItems] = useState(() => sample(items, Math.min(3, items.length)));
  const [question, setQuestion] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const speechRun = useRef(0);
  const target = storyItems[storyItems.length - 1];
  const options = useMemo(() => choicesFor(target, items, difficulty), [target, items, difficulty]);

  if (!target) return null;

  const labels = storyItems.map((item) => item.labels[lang]);
  const story = storySentence(labels, lang);
  const prompt = lang === "tr" ? "Mino en son ne görüyor?" : "Was sieht Mino zum Schluss?";
  const text = question ? prompt : story;
  const controlsDisabled = paused || interactionBlocked();

  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    `${prompt} ${target.labels[lang]}`,
  );

  useEffect(() => {
    if (!controlsDisabled && !question) return;
    speechRun.current += 1;
    setSpeakingId(null);
  }, [controlsDisabled, question]);

  useEffect(() => () => {
    speechRun.current += 1;
  }, []);

  function blocked() {
    return paused || interactionBlocked();
  }

  async function hearStoryItem(item) {
    if (blocked() || question) return;
    const run = ++speechRun.current;
    setSpeakingId(item.id);
    try {
      await speak(item.labels[lang], lang, settings);
    } finally {
      if (run === speechRun.current) setSpeakingId(null);
    }
  }

  function handleStoryKeyDown(event, item) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    hearStoryItem(item);
  }

  function beginRecall() {
    if (blocked()) return;
    speechRun.current += 1;
    setSpeakingId(null);
    setQuestion(true);
  }

  function pick(item) {
    if (blocked()) return;
    item.id === target.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  return (
    <div className="story-game" aria-disabled={controlsDisabled || undefined}>
      {!question ? (
        <>
          <div className="story-journey" aria-label={lang === "tr" ? "Hikâye yolculuğu" : "Bilderbuch-Reise"}>
            {storyItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <section
                  className={`story-page story-page-listenable ${speakingId === item.id ? "speaking" : ""}`}
                  role="button"
                  tabIndex={controlsDisabled ? -1 : 0}
                  aria-disabled={controlsDisabled || undefined}
                  aria-label={lang === "tr" ? `${item.labels.tr} kelimesini tekrar dinle` : `${item.labels.de} noch einmal anhören`}
                  onClick={() => hearStoryItem(item)}
                  onKeyDown={(event) => handleStoryKeyDown(event, item)}
                >
                  <div className="story-page-visual">
                    <Visual item={item} lang={lang} photos={settings.photos} />
                  </div>
                  <div className="story-page-copy">
                    <span className="story-step-bubble" aria-label={`${lang === "tr" ? "Adım" : "Schritt"} ${index + 1}`}>
                      {index + 1}
                    </span>
                    <b>{item.labels[lang]}</b>
                    <span className="story-hear-cue" aria-hidden="true"><Volume2 size={18} /></span>
                  </div>
                </section>
                {index < storyItems.length - 1 && (
                  <div className="story-connector" aria-hidden="true">
                    <ArrowDown />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="story-continue-wrap">
            <button className="primary centered story-continue story-journey-button" onClick={beginRecall} disabled={controlsDisabled}>
              {lang === "tr" ? "Şimdi hatırla" : "Jetzt erinnern"} <ArrowRight size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className="story-recall-stage">
          <div className="story-memory-cue story-large-cue" aria-hidden="true">
            {storyItems.slice(0, -1).map((item, index) => (
              <React.Fragment key={item.id}>
                <span>{index + 1}</span><i />
              </React.Fragment>
            ))}
            <span className={hint >= 2 ? "hinted" : ""}>?</span>
          </div>
          <OptionGrid
            {...{ options, target, hint, lang, settings }}
            disabled={controlsDisabled}
            onPick={pick}
          />
        </div>
      )}
    </div>
  );
}
