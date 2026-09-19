import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Play,
  Star,
  Sparkles,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { gamesForWorld } from "../games/registry.js";
import { Art } from "../components/Visual.jsx";
import { speak, stopSpeech } from "../audio/voice.js";
import { unlockAudio, playSound } from "../audio/sounds.js";
import { worldMastery } from "../learning/mastery.js";
import { gamesForAge } from "../learning/age.js";
import SceneExplorer from "./SceneExplorer.jsx";

// Keep the free world as gentle as the in-game Mino help system: when a child
// simply looks at the discovery scene without tapping, Mino offers the recorded
// guidance aloud (10 s sits between the in-game hint and help delays).
const FREE_WORLD_HELP_DELAY_MS = 11000;

export default function WorldScreen({ world, progress, onNavigate }) {
  const { lang } = progress.settings;
  const settings = progress.settings;
  const [view, setView] = useState("adventure");
  const [discovered, setDiscovered] = useState([]);
  const [speakingId, setSpeakingId] = useState(null);
  const [activity, setActivity] = useState(0);
  const speechRun = useRef(0);
  const screenRef = useRef(null);
  const t = (de, tr) => (lang === "tr" ? tr : de);
  const mastery = worldMastery(progress, world, lang);
  const visibleGames = gamesForAge(
    gamesForWorld(world.id),
    progress.activeProfile?.ageGroup,
  );
  function start(gameId) {
    unlockAudio();
    onNavigate(`/play/${gameId}/${world.id}`);
  }
  async function speakItem(item) {
    const run = ++speechRun.current;
    setSpeakingId(item.id);
    try {
      await speak(item.labels[lang], lang, progress.settings);
    } finally {
      if (run === speechRun.current) setSpeakingId(null);
    }
  }
  function discover(item) {
    playSound("tap", progress.settings);
    setDiscovered((old) => (old.includes(item.id) ? old : [...old, item.id]));
    setActivity((a) => a + 1);
    speakItem(item);
  }
  function selectView(next) {
    if (next === view) return;
    speechRun.current += 1;
    setSpeakingId(null);
    stopSpeech();
    setActivity((a) => a + 1);
    setView(next);
  }
  useEffect(
    () => () => {
      speechRun.current += 1;
      stopSpeech();
    },
    [lang],
  );

  // Any touch, mouse or keyboard interaction in the destination restarts the
  // inactive Mino guidance timer; moving between or inside views does too.
  useEffect(() => {
    const root = screenRef.current;
    if (!root) return;
    const bump = () => setActivity((a) => a + 1);
    root.addEventListener("pointerdown", bump, { passive: true });
    root.addEventListener("keydown", bump);
    return () => {
      root.removeEventListener("pointerdown", bump);
      root.removeEventListener("keydown", bump);
    };
  }, []);

  // A quiet free world should stay audible: after a while without interaction
  // Mino speaks the recorded discovery guidance, exactly like the in-game help
  // system. The phrase is part of the fixed narrator library in both languages.
  useEffect(() => {
    if (view === "games" || !settings.autoHelp || !settings.audio) return;
    if (typeof document !== "undefined" && document.hidden) return;
    const timer = setTimeout(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (speakingId !== null) return;
      if (!settings.autoHelp || !settings.audio) return;
      speak(
        lang === "tr"
          ? "Büyük resme dokun. Sonra kaydır!"
          : "Tippe auf das große Bild. Wische weiter!",
        lang,
        settings,
      );
    }, FREE_WORLD_HELP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [view, lang, activity, speakingId, settings.autoHelp, settings.audio]);
  const modes = [
    ["adventure", Sparkles, t("Entdecken", "Keşfet")],
    ["games", Gamepad2, t("Spielen", "Oyna")],
    ["words", BookOpen, t("Wörter", "Kelimeler")],
  ];
  return (
    <div className="world-destination" ref={screenRef}>
      <header className="destination-header">
        <button
          className="scene-round-button"
          onClick={() => onNavigate("/worlds")}
          aria-label={t("Alle Lernwelten", "Tüm dünyalar")}
        >
          <ArrowLeft size={25} />
        </button>
        <h1>{world.labels[lang]}</h1>
        <span
          className="destination-mastery"
          aria-label={t(
            `${mastery.mastered} von ${world.items.length} sicher gelernt`,
            `${world.items.length} kelimeden ${mastery.mastered} öğrenildi`,
          )}
        >
          <Star size={21} fill="currentColor" />
          {mastery.mastered}/{world.items.length}
        </span>
      </header>
      <div
        className="destination-modes"
        role="tablist"
        aria-label={t("Ansicht wählen", "Görünüm seç")}
      >
        {modes.map(([id, Icon, name], index) => (
          <button
            key={id}
            role="tab"
            id={`mode-${id}`}
            aria-selected={view === id}
            aria-controls="destination-panel"
            tabIndex={view === id ? 0 : -1}
            onClick={() => selectView(id)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? modes.length - 1
                    : (index +
                        (event.key === "ArrowRight" ? 1 : modes.length - 1)) %
                      modes.length;
              selectView(modes[next][0]);
              document.getElementById(`mode-${modes[next][0]}`)?.focus();
            }}
          >
            <Icon size={23} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div
        id="destination-panel"
        role="tabpanel"
        aria-labelledby={`mode-${view}`}
      >
        {view === "games" ? (
          <div className="activity-landscape">
            {mastery.practice > 0 && (
              <button className="world-review" onClick={() => start("review")}>
                <Star size={25} />
                {t("Zusammen üben", "Birlikte çalışalım")}
                <Play size={22} />
              </button>
            )}
            <div className="activity-trail">
              {visibleGames.map((game) => (
                <button
                  key={game.id}
                  className="activity-toy"
                  style={{ "--toy-color": game.color }}
                  onClick={() => start(game.id)}
                  aria-label={`${game[lang]}: ${game.description[lang]}`}
                >
                  <Art name={game.asset} />
                  <b>{game[lang]}</b>
                  <span>
                    <Play size={24} fill="currentColor" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <SceneExplorer
            key={`${world.id}-${view}`}
            items={world.items}
            worldId={world.id}
            lang={lang}
            settings={progress.settings}
            found={discovered}
            speakingId={speakingId}
            onDiscover={discover}
            outfit={progress.minoOutfit}
            onMino={() =>
              speak(
                t(
                  "Tippe auf das große Bild. Wische weiter!",
                  "Büyük resme dokun. Sonra kaydır!",
                ),
                lang,
                progress.settings,
              )
            }
            footer={
              <button
                className="scene-play"
                onClick={() => start(view === "words" ? "listen" : "explore")}
              >
                <Play size={23} fill="currentColor" />
                <span>{t("Spielen", "Oyna")}</span>
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
