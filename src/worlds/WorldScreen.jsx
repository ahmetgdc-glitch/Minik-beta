import React, { useMemo, useState } from "react";
import { ArrowLeft, Play, Volume2, Star, Sparkles, Gamepad2, BookOpen } from "lucide-react";
import { gamesForWorld } from "../games/registry.js";
import Visual, { Art, Mino } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { unlockAudio, playSound } from "../audio/sounds.js";
import { itemMastery, worldMastery } from "../learning/mastery.js";
import { gamesForAge } from "../learning/age.js";

const scenePositions = [
  "scene-item-a",
  "scene-item-b",
  "scene-item-c",
  "scene-item-d",
  "scene-item-e",
  "scene-item-f",
];

export default function WorldScreen({ world, progress, onNavigate }) {
  const { lang } = progress.settings;
  const [view, setView] = useState("adventure");
  const [discovered, setDiscovered] = useState(() => new Set());
  const t = (de, tr) => (lang === "tr" ? tr : de);
  const mastery = worldMastery(progress, world, lang);
  const practiced = mastery.mastered;
  const visibleGames = gamesForAge(gamesForWorld(world.id), progress.activeProfile?.ageGroup);
  const sceneItems = useMemo(() => world.items.slice(0, 6), [world.id]);

  function discover(item) {
    unlockAudio();
    playSound("tap", progress.settings);
    setDiscovered((old) => {
      const next = new Set(old);
      next.add(item.id);
      return next;
    });
    speak(item.labels[lang], lang, progress.settings);
  }

  function startAdventure() {
    unlockAudio();
    onNavigate(`/play/explore/${world.id}`);
  }

  return (
    <>
      <button className="back-link" onClick={() => onNavigate("/worlds")}>
        <ArrowLeft size={18} />
        {t("Alle Lernwelten", "Tüm dünyalar")}
      </button>

      <section
        className="world-banner world-banner-immersive"
        style={{ "--world-color": world.color }}
      >
        <div>
          <span className="eyebrow">
            {t("Entdecken, spielen, lernen", "Keşfet, oyna, öğren")}
          </span>
          <h1>{world.labels[lang]}</h1>
          <p>{world.description[lang]}</p>
          <span className="mastered-count">
            <Star size={18} />
            {practiced} / {world.items.length} {t("sicher gelernt", "öğrenildi")}
          </span>
          <div className="world-mastery-progress" aria-label={t("Lernfortschritt", "Öğrenme ilerlemesi")}>
            <span><i style={{ width: `${mastery.percent}%` }} /></span>
            <b>{mastery.percent}%</b>
          </div>
        </div>
        <Art name={world.asset} />
      </section>

      {mastery.practice > 0 && (
        <button
          className="smart-review-callout"
          onClick={() => {
            unlockAudio();
            onNavigate(`/play/review/${world.id}`);
          }}
        >
          <span className="smart-review-icon">↻</span>
          <span>
            <b>{t("Mino weiß, was wir noch üben", "Mino neyi tekrar etmemiz gerektiğini biliyor")}</b>
            <small>{t(`${mastery.practice} Begriffe brauchen noch etwas Übung.`, `${mastery.practice} kelime biraz daha çalışılmalı.`)}</small>
          </span>
          <Play size={20} fill="currentColor" />
        </button>
      )}

      <div className="world-mode-tabs" role="tablist" aria-label={t("Ansicht wählen", "Görünüm seç")}> 
        <button className={view === "adventure" ? "active" : ""} onClick={() => setView("adventure")}> 
          <Sparkles size={20} /> {t("Abenteuer", "Macera")}
        </button>
        <button className={view === "games" ? "active" : ""} onClick={() => setView("games")}> 
          <Gamepad2 size={20} /> {t("Spiele", "Oyunlar")}
        </button>
        <button className={view === "words" ? "active" : ""} onClick={() => setView("words")}> 
          <BookOpen size={20} /> {t("Entdecken", "Keşfet")}
        </button>
      </div>

      {view === "adventure" ? (
        <section className={`world-live-scene world-live-${world.id}`} style={{ "--world-color": world.color }}>
          <div className="world-live-sun" />
          <div className="world-live-cloud cloud-one" />
          <div className="world-live-cloud cloud-two" />
          <div className="world-live-hill hill-one" />
          <div className="world-live-hill hill-two" />
          <div className="world-live-ground" />
          <div className="world-scene-title">
            <span>{t("Tippe die großen Bilder an", "Büyük resimlere dokun")}</span>
            <strong>{discovered.size} / {sceneItems.length}</strong>
          </div>
          {sceneItems.map((item, index) => {
            const state = itemMastery(progress, item.id, lang);
            return (
              <button
                key={item.id}
                className={`world-live-item ${scenePositions[index]} ${discovered.has(item.id) ? "found" : ""} mastery-${state.level}`}
                onClick={() => discover(item)}
                aria-label={item.labels[lang]}
              >
                <Visual item={item} lang={lang} photos={progress.settings.photos} />
                <b>{item.labels[lang]}</b>
                {state.level === "mastered" && <span className="item-status mastered">★</span>}
                {state.level === "practice" && <span className="item-status practice">↻</span>}
              </button>
            );
          })}
          <div className="world-scene-mino">
            <Mino />
            <span>{t("Ich zeige dir noch mehr!", "Sana daha fazlasını göstereyim!")}</span>
          </div>
          <button className="world-adventure-start primary" onClick={startAdventure}>
            <Play size={22} fill="currentColor" />
            {t("Großes Abenteuer starten", "Büyük macerayı başlat")}
          </button>
        </section>
      ) : view === "games" ? (
        <>
          <div className="section-heading compact-world-heading">
            <div>
              <h2>{t("Wie möchtest du spielen?", "Nasıl oynayalım?")}</h2>
              <p>{t("Jedes Spiel trainiert etwas anderes.", "Her oyun farklı bir şeyi çalıştırır.")}</p>
            </div>
          </div>
          <div className="games-grid">
            {visibleGames.map((game) => (
              <button
                className="game-card"
                key={game.id}
                style={{ "--game-color": game.color }}
                onClick={() => {
                  unlockAudio();
                  onNavigate(`/play/${game.id}/${world.id}`);
                }}
              >
                <div className="game-card-art">
                  <Art name={game.asset} />
                  <span><Play size={19} fill="currentColor" /></span>
                </div>
                <h3>{game[lang]}</h3>
                <p>{game.description[lang]}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="discovery-grid discovery-grid-large">
          {world.items.map((item) => {
            const state = itemMastery(progress, item.id, lang);
            const statusText = {
              mastered: t("Kann ich", "Biliyorum"),
              practice: t("Noch üben", "Biraz daha çalış"),
              learning: t("Lerne ich", "Öğreniyorum"),
              new: t("Neu", "Yeni"),
            }[state.level];
            return (
              <button
                className={`discovery-card mastery-${state.level}`}
                key={item.id}
                onClick={() => speak(item.labels[lang], lang, progress.settings)}
              >
                <span className={`discovery-status ${state.level}`}>{statusText}</span>
                <Visual item={item} lang={lang} photos={progress.settings.photos} />
                <b>{item.labels[lang]}</b>
                <span>
                  <Volume2 size={17} />
                  {item.labels[lang === "de" ? "tr" : "de"]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
