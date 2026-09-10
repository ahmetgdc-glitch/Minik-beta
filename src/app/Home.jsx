import React, { useMemo } from "react";
import { ArrowRight, Play, Star, ChevronRight } from "lucide-react";
import { worlds, worldById } from "../data/content.js";
import { gameCatalog, gameById } from "../games/registry.js";
import { localDay } from "../progress/model.js";
import { nextReward } from "../rewards/catalog.js";
import { MinoAvatar, Art } from "../components/Visual.jsx";
import WorldCard from "../components/WorldCard.jsx";
import { unlockAudio } from "../audio/sounds.js";
import { speak } from "../audio/voice.js";
import { recommendedActivities } from "../learning/recommendations.js";
import { dailyJourney } from "../learning/quests.js";
import { gameFitsAge } from "../learning/age.js";
import { peekCheckpoint, checkpointMatchesProfile } from "../games/sessionCheckpoint.js";
export default function Home({ progress, onNavigate }) {
  const lang = progress.settings.lang,
    t = (de, tr) => (lang === "tr" ? tr : de),
    last = worldById[progress.lastWorld] || worlds[0],
    today = progress.daily.date === localDay() ? progress.daily.correct : 0,
    next = nextReward(progress),
    recommendations = recommendedActivities(progress, lang, 3),
    journey = dailyJourney(progress, lang);
  const resume = useMemo(() => {
    try {
      const saved = peekCheckpoint(window.localStorage, progress.activeProfileId);
      if (!saved || saved.played < 1 || !checkpointMatchesProfile(saved, lang, progress.activeProfile?.ageGroup)) return null;
      const savedWorld = worldById[saved.worldId];
      const savedGame = gameById[saved.gameId];
      if (
        !savedWorld ||
        !savedGame ||
        !gameFitsAge(savedGame, progress.activeProfile?.ageGroup) ||
        (!savedGame.allWorlds && !savedGame.worlds.includes(savedWorld.id))
      ) return null;
      return { ...saved, world: savedWorld, game: savedGame };
    } catch {
      return null;
    }
  }, [
    progress.activeProfileId,
    progress.activeProfile?.ageGroup,
    progress.settings.lang,
    progress.settings.adaptive,
    progress.settings.options,
    progress.sessions.length,
  ]);
  function start() {
    const first = recommendations[0];
    unlockAudio();
    speak(t("Los geht’s!", "Haydi başlayalım!"), lang, progress.settings);
    onNavigate(first ? `/play/${first.game.id}/${first.world.id}` : `/play/listen/${last.id}`);
  }
  const reasonText = (reason) => ({
    new: t("Neu für dich", "Senin için yeni"),
    due: t("Heute wiederholen", "Bugün tekrar zamanı"),
    practice: t("Das üben wir noch", "Bunu biraz daha çalışalım"),
    continue: t("Hier geht noch mehr", "Burada keşif devam ediyor"),
    variety: t("Heute mal anders", "Bugün farklı oynayalım"),
  }[reason]);
  return (
    <>
      <div className="welcome-heading">
        <div>
          <span className="eyebrow">
            {t(
              "Kleine Schritte. Große Entdeckungen.",
              "Küçük adımlar. Büyük keşifler.",
            )}
          </span>
          <h1>
            {progress.activeProfile?.name ? t(`Hallo ${progress.activeProfile.name}!`, `Merhaba ${progress.activeProfile.name}!`) : t("Hallo, kleine Weltentdecker!", "Merhaba, küçük kâşifler!")}
          </h1>
        </div>
        <span className="level-badge">
          <Art name="star" /> {t("Level", "Seviye")}{" "}
          {Math.floor(progress.xp / 100) + 1}
        </span>
      </div>
      {resume && (
        <button
          className="resume-session-card"
          onClick={() => {
            unlockAudio();
            onNavigate(`/play/${resume.game.id}/${resume.world.id}`);
          }}
          aria-label={t(
            `${resume.game.de} in ${resume.world.de} fortsetzen`,
            `${resume.world.tr} dünyasında ${resume.game.tr} oyununa devam et`,
          )}
        >
          <span className="resume-session-icon"><Play size={24} fill="currentColor" /></span>
          <span className="resume-session-copy">
            <small>{t("Unterbrochenes Spiel", "Yarım kalan oyun")}</small>
            <b>{t("Weiterspielen", "Devam et")}</b>
            <span>{resume.world[lang]} · {resume.game[lang]}</span>
          </span>
          <ChevronRight size={24} />
        </button>
      )}
      <div className="adventure-row">
        <section className="adventure-card">
          <div className="adventure-copy">
            <span className="adventure-tag">
              <span /> {t("Dein Abenteuer mit Mino", "Mino ile maceran")}
            </span>
            <h2>
              {t("Komm, wir\nentdecken was!", "Haydi, birlikte\nkeşfedelim!")}
            </h2>
            <p>
              {t(
                "Eine ganze Welt voller kleiner Wunder.",
                "Küçük harikalarla dolu kocaman bir dünya.",
              )}
            </p>
            <button className="primary" onClick={start}>
              <Play size={21} fill="currentColor" />
              {progress.correct
                ? t("Weiterspielen", "Devam et")
                : t("Los geht’s!", "Başlayalım!")}
            </button>
          </div>
          <div className="adventure-art">
            <span className="hero-halo" />
            <MinoAvatar outfit={progress.minoOutfit} />
            <Art className="floating-star one" name="star" />
            <Art className="floating-star two" name="star" />
            <span className="hello-bubble">{t("Hallo!", "Merhaba!")}</span>
          </div>
        </section>
        <button className="daily-card" onClick={() => onNavigate("/aquarium")}>
          <span className="eyebrow">
            {t("Deine Schatzmission", "Hazine görevin")}
          </span>
          <Art name="wrapped-gift" />
          <h3>
            {today >= 5
              ? t("Tagesziel geschafft!", "Günlük hedef tamam!")
              : t("Sammle 5 Sterne", "5 yıldız topla")}
          </h3>
          <div className="daily-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={25}
                fill={i < today ? "currentColor" : "none"}
                className={i < today ? "collected" : ""}
              />
            ))}
          </div>
          <span>
            {Math.min(today, 5)} / 5 <ChevronRight size={16} />
          </span>
        </button>
      </div>
      <section className={`daily-journey ${journey.completed ? "complete" : ""}`} aria-label={journey.progressLabel}>
        <div className="daily-journey-head">
          <div>
            <span className="eyebrow">{journey.progressLabel}</span>
            <h2>{journey.completed ? journey.doneText : journey.title}</h2>
            <p>{journey.intro}</p>
          </div>
          <div className="journey-badge" aria-label={`${journey.completedCount} / ${journey.missions.length}`}>
            <MinoAvatar outfit={progress.minoOutfit} />
            <b>{journey.completedCount}/{journey.missions.length}</b>
          </div>
        </div>
        <div className="journey-steps">
          {journey.missions.map((mission, index) => (
            <div className={`journey-step ${mission.done ? "done" : ""}`} key={mission.id}>
              <span className="journey-step-number">{mission.done ? "✓" : index + 1}</span>
              <div>
                <b>{mission.label}</b>
                <span>{mission.current} / {mission.target}</span>
              </div>
              <div className="journey-step-track"><i style={{ width: `${Math.min(100, mission.current / mission.target * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
      <section className="learning-path-section" aria-label={t("Minos Lernpfad", "Mino’nun öğrenme yolu")}>
        <div className="section-heading learning-path-heading">
          <div>
            <span className="eyebrow">{t("Mino hat für dich ausgesucht", "Mino senin için seçti")}</span>
            <h2>{t("Dein nächster Lernpfad", "Sıradaki öğrenme yolun")}</h2>
            <p>{t("Die Vorschläge passen sich an das an, was du schon kannst und was noch Übung braucht.", "Öneriler bildiklerine ve biraz daha çalışman gerekenlere göre değişir.")}</p>
          </div>
          <MinoAvatar outfit={progress.minoOutfit} />
        </div>
        <div className="learning-path-grid">
          {recommendations.map(({ world, game, reason }, index) => (
            <button
              key={`${world.id}-${game.id}`}
              className={`learning-path-card step-${index + 1}`}
              onClick={() => {
                unlockAudio();
                onNavigate(`/play/${game.id}/${world.id}`);
              }}
            >
              <span className="learning-path-number">{index + 1}</span>
              <div className="learning-path-art"><Art name={world.asset} /></div>
              <div className="learning-path-copy">
                <span>{reasonText(reason)}</span>
                <h3>{world[lang]}</h3>
                <p>{game[lang]}</p>
              </div>
              <span className="learning-path-play"><Play size={20} fill="currentColor" /></span>
            </button>
          ))}
        </div>
      </section>
      <div className="section-heading">
        <div>
          <h2>{t("Wohin geht’s heute?", "Bugün nereye gidelim?")}</h2>
          <p>{t("Such dir eine Lernwelt aus.", "Bir öğrenme dünyası seç.")}</p>
        </div>
        <button className="text-button" onClick={() => onNavigate("/worlds")}>
          {t(`Alle ${worlds.length} Welten`, `${worlds.length} dünyanın hepsi`)}
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="world-grid">
        {worlds.slice(0, 8).map((w) => (
          <WorldCard
            key={w.id}
            world={w}
            lang={lang}
            progress={progress}
            onOpen={(w) => onNavigate(`/world/${w.id}`)}
          />
        ))}
      </div>
      <button className="playroom-banner" onClick={() => onNavigate("/games")}>
        <div className="playroom-images">
          <Art name="puzzle-piece" />
          <Art name="drum" />
          <Art name="crayon" />
        </div>
        <div>
          <h2>
            {t("Heute lieber ein Spiel?", "Bugün bir oyun oynayalım mı?")}
          </h2>
          <p>
            {t(`${gameCatalog.length} Spielideen warten auf dich.`, `${gameCatalog.length} farklı oyun seni bekliyor.`)}
          </p>
        </div>
        <span className="circle-arrow">
          <ArrowRight />
        </span>
      </button>
    </>
  );
}
