import { localDay } from "../progress/model.js";

function dayOf(timestamp) {
  if (!timestamp) return "";
  return localDay(new Date(timestamp));
}

export function dailyJourney(progress, lang = progress?.settings?.lang || "de", day = localDay()) {
  const history = (progress?.history || []).filter((entry) => dayOf(entry.at) === day);
  const sessions = (progress?.sessions || []).filter((session) => dayOf(session.ended || session.started) === day);
  const completedSessions = sessions.filter((session) => session.completed).length;
  const cleanCorrect = history.filter((entry) => entry.correct && entry.clean).length;
  const worlds = new Set([
    ...history.map((entry) => entry.worldId),
    ...sessions.filter((session) => session.completed).map((session) => session.worldId),
  ].filter(Boolean));

  const copy = lang === "tr" ? {
    title: "Mino’nun günlük yolculuğu",
    intro: "Üç küçük adımı tamamla ve bugünkü maceranı bitir.",
    play: "Bir oyun bitir",
    clean: "5 yıldızlık cevabı kendin bul",
    worlds: "2 farklı dünyayı ziyaret et",
    done: "Bugünkü yolculuk tamam!",
    progress: "Bugünkü yolculuk",
  } : {
    title: "Minos Tagesreise",
    intro: "Schaffe drei kleine Schritte und vollende dein heutiges Abenteuer.",
    play: "Ein Spiel zu Ende spielen",
    clean: "5 Stern-Antworten selbst schaffen",
    worlds: "2 verschiedene Welten besuchen",
    done: "Tagesreise geschafft!",
    progress: "Deine Tagesreise",
  };

  const missions = [
    { id: "session", label: copy.play, current: Math.min(1, completedSessions), target: 1 },
    { id: "clean", label: copy.clean, current: Math.min(5, cleanCorrect), target: 5 },
    { id: "worlds", label: copy.worlds, current: Math.min(2, worlds.size), target: 2 },
  ].map((mission) => ({ ...mission, done: mission.current >= mission.target }));

  return {
    day,
    title: copy.title,
    intro: copy.intro,
    doneText: copy.done,
    progressLabel: copy.progress,
    missions,
    completed: missions.every((mission) => mission.done),
    completedCount: missions.filter((mission) => mission.done).length,
  };
}
