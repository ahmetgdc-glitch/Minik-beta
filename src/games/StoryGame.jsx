import React, { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import Visual from "../components/Visual.jsx";
import { sample, choicesFor } from "../utils/random.js";
import { useLesson, OptionGrid } from "./shared.jsx";
import { speak } from "../audio/voice.js";

export default function StoryGame({
  items,
  difficulty,
  lang,
  settings,
  hint,
  onReady,
  onWrong,
  onSolve,
}) {
  const [storyItems] = useState(() => sample(items, Math.min(3, items.length)));
  const [question, setQuestion] = useState(false);
  const target = storyItems[storyItems.length - 1];
  const options = useMemo(() => choicesFor(target, items, difficulty), [target, items, difficulty]);
  const labels = storyItems.map((item) => item.labels[lang]);
  const story = lang === "tr"
    ? `Mino önce ${labels[0]}, sonra ${labels[1]} ve en son ${labels[2]} görüyor.`
    : `Mino sieht zuerst ${labels[0]}, dann ${labels[1]} und zum Schluss ${labels[2]}.`;
  const prompt = lang === "tr" ? "Mino en son ne görüyor?" : "Was sieht Mino zum Schluss?";
  const text = question ? prompt : story;

  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [target.id],
    `${prompt} ${target.labels[lang]}`,
  );

  if (!target) return null;
  return (
    <div className="story-game">
      {!question ? (
        <>
          <div className="story-strip" aria-label={lang === "tr" ? "Hikâye sırası" : "Reihenfolge der Geschichte"}>
            {storyItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="story-scene-card">
                  <span className="story-step">{index + 1}</span>
                  <Visual item={item} lang={lang} photos={settings.photos} />
                  <b>{item.labels[lang]}</b>
                </div>
                {index < storyItems.length - 1 && <ArrowRight className="story-arrow" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
          <button className="primary centered story-continue" onClick={() => setQuestion(true)}>
            {lang === "tr" ? "Soruyu sor" : "Zur Frage"} <ArrowRight size={20} />
          </button>
        </>
      ) : (
        <>
          <div className="story-memory-cue">
            <span>1</span><i /><span>2</span><i /><span className={hint >= 2 ? "hinted" : ""}>?</span>
          </div>
          <OptionGrid
            {...{ options, target, hint, lang, settings }}
            onPick={(item) => item.id === target.id ? onSolve([target.id]) : onWrong([target.id])}
          />
        </>
      )}
    </div>
  );
}
