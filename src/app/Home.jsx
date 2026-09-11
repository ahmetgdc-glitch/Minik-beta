import React, { useMemo } from "react";
import { Play, Star, Compass, Check } from "lucide-react";
import { worlds, worldById } from "../data/content.js";
import { gameById } from "../games/registry.js";
import { localDay } from "../progress/model.js";
import { Art } from "../components/Visual.jsx";
import WorldAtlas from "../worlds/WorldAtlas.jsx";
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
  return (
    <div className="home-world">
      <WorldAtlas progress={progress} welcome resume={resume}
        onOpen={world => onNavigate(`/world/${world.id}`)}
        onStart={() => {
          if (resume) {
            unlockAudio();
            onNavigate(`/play/${resume.game.id}/${resume.world.id}`);
          } else start();
        }}
      />
      <section className="mino-trail" aria-label={t("Minos Lernpfad", "Mino’nun öğrenme yolu")}>
        <div className="trail-heading"><h2>{t("Mit Mino weiter", "Mino ile devam")}</h2>
          <button className="trail-treasure" onClick={() => onNavigate("/aquarium")} aria-label={t(`${Math.min(today, 5)} von 5 Tagessternen. Schätze öffnen`, `5 günlük yıldızdan ${Math.min(today, 5)}. Hazineleri aç`)}>
            <Art name="wrapped-gift" /><span>{Array.from({length:5}, (_, i) => <Star key={i} size={19} fill={i < today ? "currentColor" : "none"} />)}</span>
          </button>
        </div>
        <div className="trail-activities">
          {recommendations.map(({ world, game }, index) => <button key={`${world.id}-${game.id}`} className={`trail-stop trail-stop-${index}`} onClick={() => {
            unlockAudio();
            onNavigate(`/play/${game.id}/${world.id}`);
          }} aria-label={`${world[lang]} · ${game[lang]}`}>
            <span className="trail-step">{index + 1}</span><Art name={world.asset} /><b>{world[lang]}</b><Play className="trail-play" size={22} fill="currentColor" />
          </button>)}
        </div>
        <div className="journey-pebbles" aria-label={journey.progressLabel}>
          {journey.missions.map((mission, index) => <button key={mission.id} className={mission.done ? "done" : ""} aria-label={`${mission.label}: ${mission.current}/${mission.target}`} onClick={() => speak(mission.label, lang, progress.settings)}>
            {mission.done ? <Check size={23} /> : index === 0 ? <Play size={23} /> : index === 1 ? <Star size={23} /> : <Compass size={23} />}<b>{mission.current}/{mission.target}</b>
          </button>)}
          {journey.completed && <span role="status">{journey.doneText}</span>}
        </div>
      </section>
    </div>
  );
}
