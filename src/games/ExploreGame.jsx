import React, { useEffect, useMemo, useRef, useState } from "react";
import SceneExplorer from "../worlds/SceneExplorer.jsx";
import { addDiscovery, explorationSize } from "../worlds/scenes.js";
import { speak } from "../audio/voice.js";
import { sample } from "../utils/random.js";
import { useLesson } from "./shared.jsx";

export default function ExploreGame({ items, world, progress, difficulty, lang, settings, round, hint, paused, interactionBlocked = () => false, onReady, onSolve }) {
  const [found, setFound] = useState([]);
  const [speakingId, setSpeakingId] = useState(null);
  const foundRef = useRef([]);
  const speechRun = useRef(0);
  const sceneItems = useMemo(() => sample(items, explorationSize(difficulty)), [items, round, difficulty]);
  const targetCount = sceneItems.length;
  const text = lang === "tr" ? "Bak bakalım! Resme dokun." : "Schau mal! Tippe auf das Bild.";
  const help = lang === "tr" ? "Kaydır ve diğer resimleri keşfet." : "Wische und entdecke die anderen Bilder.";
  const controlsDisabled = paused || interactionBlocked();
  useLesson(onReady, text, () => speak(text, lang, settings), sceneItems.map(x => x.id), help);

  async function speakItem(item) {
    const run = ++speechRun.current;
    setSpeakingId(item.id);
    try {
      await speak(item.labels[lang], lang, settings);
    } finally {
      if (run === speechRun.current) setSpeakingId(null);
    }
  }

  function discover(item) {
    if (paused || interactionBlocked()) return;
    const next = addDiscovery(foundRef.current, item.id, sceneItems.map(x => x.id));
    if (next !== foundRef.current) {
      foundRef.current = next;
      setFound(next);
    }
    speakItem(item);
  }

  useEffect(() => {
    if (!controlsDisabled) return;
    speechRun.current += 1;
    setSpeakingId(null);
  }, [controlsDisabled]);

  useEffect(() => () => {
    speechRun.current += 1;
  }, []);

  useEffect(() => {
    if (controlsDisabled || found.length < targetCount) return;
    const timer = setTimeout(() => {
      if (!interactionBlocked()) onSolve(found);
    }, 350);
    return () => clearTimeout(timer);
  }, [controlsDisabled, found, targetCount, onSolve, interactionBlocked]);

  return <SceneExplorer items={sceneItems} worldId={world.id} {...{lang, settings, found, speakingId, hint, paused, interactionBlocked}}
    outfit={progress.minoOutfit} onDiscover={discover} onMino={() => {
      if (controlsDisabled) return;
      speechRun.current += 1;
      setSpeakingId(null);
      speak(help, lang, settings);
    }}
    footer={<div className="discovery-progress" role="status" aria-label={`${found.length} / ${targetCount}`}>
      {Array.from({length: targetCount}, (_, i) => <i key={i} className={i < found.length ? "done" : ""}/>) }
    </div>} />;
}
