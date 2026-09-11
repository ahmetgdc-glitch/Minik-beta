import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  ArrowLeft,
  Pause,
  Play,
  Volume2,
  Home,
  RotateCcw,
  Star,
  ArrowRight,
} from "lucide-react";
import { useProgress, dispatch } from "../progress/store.js";
import { difficultyFor } from "../progress/model.js";
import { gameById } from "./registry.js";
import { worldById, uniqueVisuals } from "../data/content.js";
import { speak, stopSpeech } from "../audio/voice.js";
import { playSound, stopSounds, unlockAudio } from "../audio/sounds.js";
import FishGuide from "../components/FishGuide.jsx";
import { Mino, Art, assetUrl } from "../components/Visual.jsx";
import { sceneForWorld } from "../worlds/scenes.js";
import { recommendedActivities } from "../learning/recommendations.js";
import { maxOptionsForAge } from "../learning/age.js";
import { shouldAcceptWrongTap, shouldBlockGameInteraction } from "./inputGuard.js";
import { loadCheckpoint, saveCheckpoint, clearCheckpoint, checkpointMatchesProfile, checkpointForGame, checkpointDifficulty } from "./sessionCheckpoint.js";
import ListenGame from "./ListenGame.jsx";
import MemoryGame from "./MemoryGame.jsx";
import MatchGame from "./MatchGame.jsx";
import SortGame from "./SortGame.jsx";
import CountGame from "./CountGame.jsx";
import SoundsGame from "./SoundsGame.jsx";
import PuzzleGame from "./PuzzleGame.jsx";
import ShadowGame from "./ShadowGame.jsx";
import MissingGame from "./MissingGame.jsx";
import PatternGame from "./PatternGame.jsx";
import TraceGame from "./TraceGame.jsx";
import RhythmGame from "./RhythmGame.jsx";
import DrawGame from "./DrawGame.jsx";
import ExploreGame from "./ExploreGame.jsx";
import ReviewGame from "./ReviewGame.jsx";
import StoryGame from "./StoryGame.jsx";
import InitialLetterGame from "./InitialLetterGame.jsx";
import OppositesGame from "./OppositesGame.jsx";
import DailyOrderGame from "./DailyOrderGame.jsx";
import DifferentGame from "./DifferentGame.jsx";
import SocialStepsGame from "./SocialStepsGame.jsx";
import SpeakGame from "./SpeakGame.jsx";
import { useModalSafety } from "../app/useModalSafety.js";
const components = {
  speak: SpeakGame,
  socialsteps: SocialStepsGame,
  different: DifferentGame,
  dailyorder: DailyOrderGame,
  opposites: OppositesGame,
  initialletter: InitialLetterGame,
  story: StoryGame,
  review: ReviewGame,
  explore: ExploreGame,
  draw: DrawGame,
  listen: ListenGame,
  memory: MemoryGame,
  match: MatchGame,
  sort: SortGame,
  count: CountGame,
  sounds: SoundsGame,
  puzzle: PuzzleGame,
  shadow: ShadowGame,
  missing: MissingGame,
  pattern: PatternGame,
  trace: TraceGame,
  lettertrace: TraceGame,
  rhythm: RhythmGame,
};
const praise = {
  de: ["Super gemacht!", "Wunderbar!", "Das hast du toll gemacht!"],
  tr: ["Harika!", "Çok güzel yaptın!"],
};
export default function GameSession({ gameId, worldId, onNavigate }) {
  const progress = useProgress(),
    settings = progress.settings,
    lang = settings.lang,
    spec = gameById[gameId],
    world = worldById[worldId],
    totalRounds = Math.max(1, Number(spec?.rounds) || 1);
  const checkpoint = useMemo(() => {
      try {
        const saved = loadCheckpoint(window.localStorage, progress.activeProfileId, gameId, worldId);
        const matching = checkpointMatchesProfile(saved, progress.settings.lang, progress.activeProfile?.ageGroup) ? saved : null;
        return checkpointForGame(matching, totalRounds);
      } catch {
        return null;
      }
    }, [progress.activeProfileId, progress.activeProfile?.ageGroup, progress.settings.lang, gameId, worldId, totalRounds]);
  const [difficulty] = useState(() =>
      checkpointDifficulty(
        checkpoint,
        difficultyFor(progress, worldId),
        maxOptionsForAge(progress.activeProfile?.ageGroup),
      ),
    ),
    [round, setRound] = useState(() => Math.min(checkpoint?.round || 0, Math.max(0, totalRounds - 1))),
    [phase, setPhase] = useState(() => checkpoint?.phase || "active"),
    [paused, setPaused] = useState(false),
    [hint, setHint] = useState(() => checkpoint?.hint || (checkpoint?.phase === "demo" ? 3 : 0)),
    [lesson, setLesson] = useState({ text: "", ids: [] }),
    [message, setMessage] = useState(""),
    [activity, setActivity] = useState(0),
    [earned, setEarned] = useState(() => checkpoint?.earned || 0);
  const manualPauseRef = useRef(false);
  const lifecyclePauseRef = useRef(false);
  const pausedRef = useRef(false);
  const phaseRef = useRef(checkpoint?.phase || "active");
  const roundRef = useRef(Math.min(checkpoint?.round || 0, Math.max(0, totalRounds - 1)));
  useModalSafety(paused, () => {
    manualPauseRef.current = false;
    lifecyclePauseRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    unlockAudio();
  });
  const locked = useRef(checkpoint?.phase === "success" || checkpoint?.phase === "demo"),
    mistakes = useRef(checkpoint?.mistakes || 0),
    attempt = useRef(checkpoint?.attempts || 0),
    earnedRef = useRef(checkpoint?.earned || 0),
    playedRef = useRef(checkpoint?.played || 0),
    saved = useRef(false),
    hintRef = useRef(checkpoint?.hint || (checkpoint?.phase === "demo" ? 3 : 0)),
    activeSeconds = useRef(checkpoint?.activeSeconds || 0),
    lastWrongTap = useRef(null);
  const interactionBlocked = useCallback(() => shouldBlockGameInteraction({
    locked: locked.current,
    paused: pausedRef.current || paused,
    manualPaused: manualPauseRef.current,
    lifecyclePaused: lifecyclePauseRef.current,
    phase: phaseRef.current,
    hidden: typeof document !== "undefined" && document.hidden,
  }), [paused]);
  const [sessionId] = useState(
      () => checkpoint?.sessionId || `minik-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ),
    started = useRef(checkpoint?.started || Date.now());
  const items = useMemo(() => uniqueVisuals(world?.items || []), [world]);
  const Component = components[gameId];
  const nextActivity = useMemo(() => {
    const choices = recommendedActivities(progress, lang, 3);
    return choices.find(({ world: w, game: g }) => w.id !== worldId || g.id !== gameId) || choices[0] || null;
  }, [progress, lang, worldId, gameId]);
  const saveSession = useCallback(
    (completed) => {
      if (saved.current || !playedRef.current) return;
      saved.current = true;
      dispatch({
        type: "session",
        session: {
          id: sessionId,
          worldId,
          gameId,
          lang,
          started: started.current,
          ended: Date.now(),
          seconds: activeSeconds.current,
          rounds: earnedRef.current,
          attempts: playedRef.current,
          completed,
        },
      });
    },
    [sessionId, worldId, gameId, lang],
  );
  const persistCheckpoint = useCallback(() => {
    if (phaseRef.current === "done" || playedRef.current < 1) return;
    try {
      saveCheckpoint(window.localStorage, progress.activeProfileId, {
        gameId,
        worldId,
        sessionId,
        round: roundRef.current,
        earned: earnedRef.current,
        attempts: attempt.current,
        mistakes: mistakes.current,
        hint: hintRef.current,
        played: playedRef.current,
        phase: phaseRef.current,
        activeSeconds: activeSeconds.current,
        started: started.current,
        lang,
        ageGroup: progress.activeProfile?.ageGroup,
        difficulty,
      });
    } catch {}
  }, [progress.activeProfileId, progress.activeProfile?.ageGroup, gameId, worldId, sessionId, lang, difficulty]);
  const removeCheckpoint = useCallback(() => {
    try { clearCheckpoint(window.localStorage, progress.activeProfileId); } catch {}
  }, [progress.activeProfileId]);
  useEffect(
    () => () => {
      stopSpeech();
      stopSounds();
    },
    [],
  );
  useEffect(() => {
    if (!settings.audio) stopSpeech();
  }, [settings.audio]);
  useEffect(() => {
    const onPageHide = (event) => {
      if (!manualPauseRef.current) lifecyclePauseRef.current = true;
      pausedRef.current = true;
      setPaused(true);
      stopSpeech();
      stopSounds();
      persistCheckpoint();
      if (!event.persisted) saveSession(false);
    };
    const onPageShow = (event) => {
      if (!event.persisted || manualPauseRef.current || !lifecyclePauseRef.current) return;
      lifecyclePauseRef.current = false;
      pausedRef.current = false;
      setPaused(false);
      unlockAudio();
    };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [persistCheckpoint, saveSession]);
  useEffect(() => {
    const onRouteLeave = () => {
      if (phaseRef.current === "done") return;
      saveSession(false);
      removeCheckpoint();
    };
    window.addEventListener("hashchange", onRouteLeave);
    return () => window.removeEventListener("hashchange", onRouteLeave);
  }, [saveSession, removeCheckpoint]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        if (!manualPauseRef.current) lifecyclePauseRef.current = true;
        pausedRef.current = true;
        setPaused(true);
        stopSpeech();
        stopSounds();
        persistCheckpoint();
        return;
      }
      if (lifecyclePauseRef.current && !manualPauseRef.current) {
        lifecyclePauseRef.current = false;
        pausedRef.current = false;
        setPaused(false);
        unlockAudio();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [persistCheckpoint]);
  useEffect(() => {
    if (paused || phase === "done") {
      stopSpeech();
      stopSounds();
      return;
    }
    const t = setInterval(() => activeSeconds.current++, 1000);
    return () => clearInterval(t);
  }, [paused, phase]);
  useEffect(() => {
    if (phase === "done") return;
    persistCheckpoint();
    const t = setInterval(persistCheckpoint, 5000);
    return () => clearInterval(t);
  }, [persistCheckpoint, phase]);
  useEffect(() => {
    hintRef.current = hint;
  }, [hint]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  const ready = useCallback((info) => {
    setLesson(info);
  }, []);
  useEffect(() => {
    if (!lesson.text || paused || phase !== "active" || !settings.audio) return;
    const t = setTimeout(() => {
      if (
        phaseRef.current !== "active" ||
        manualPauseRef.current ||
        lifecyclePauseRef.current ||
        (typeof document !== "undefined" && document.hidden)
      ) return;
      lesson.repeat?.();
    }, 200);
    return () => clearTimeout(t);
  }, [lesson, paused, phase, settings.audio]);
  useEffect(() => {
    if (paused || phase !== "active" || !settings.autoHelp) return;
    const stillInteractive = () =>
      phaseRef.current === "active" &&
      !manualPauseRef.current &&
      !lifecyclePauseRef.current &&
      !(typeof document !== "undefined" && document.hidden);
    const move = setTimeout(() => {
      if (!stillInteractive()) return;
      setHint((h) => Math.max(h, 1));
    }, 6000);
    const help = setTimeout(() => {
      if (!stillInteractive()) return;
      setMessage(
        lang === "tr"
          ? "Yardım ister misin? Bana dokun."
          : "Möchtest du Hilfe? Tippe auf mich.",
      );
      if (settings.audio)
        speak(
          lang === "tr" ? "Sana yardım edeyim mi?" : "Soll ich dir helfen?",
          lang,
          settings,
        );
    }, 11000);
    return () => {
      clearTimeout(move);
      clearTimeout(help);
    };
  }, [round, activity, paused, phase, settings.autoHelp, settings.audio, lang]);
  function record(correct, ids, meta = {}) {
    const id = `${sessionId}:${round}:${++attempt.current}`;
    playedRef.current++;
    dispatch({
      type: "answer",
      eventId: id,
      worldId,
      gameId,
      lang,
      itemIds: ids,
      correct,
      assisted: Boolean(meta.assisted) || hintRef.current >= 2,
      hadErrors: mistakes.current > 0,
      at: Date.now(),
    });
  }
  const wrong = useCallback(
    (ids) => {
      if (interactionBlocked()) return;
      const signature = [...(ids || [])].map(String).sort().join("|");
      const gate = shouldAcceptWrongTap(
        lastWrongTap.current,
        signature,
        typeof performance !== "undefined" ? performance.now() : Date.now(),
      );
      if (!gate.accept) return;
      lastWrongTap.current = gate.next;
      mistakes.current++;
      record(false, ids);
      setActivity((a) => a + 1);
      const text = lang === "tr" ? "Bir daha bak." : "Schau noch einmal.";
      setMessage(text);
      speak(text, lang, settings);
      if (mistakes.current >= 2) {
        setHint(2);
        hintRef.current = 2;
      }
      if (mistakes.current >= 3) {
        locked.current = true;
        setHint(3);
        hintRef.current = 3;
        phaseRef.current = "demo";
        setPhase("demo");
        setMessage(
          lang === "tr"
            ? "Bak, birlikte yapıyoruz."
            : "Schau, wir machen es zusammen.",
        );
        speak(lesson.help || lesson.text, lang, settings);
      }
    },
    [round, paused, lesson, lang, settings],
  );
  const solve = useCallback(
    (ids, meta = {}) => {
      if (interactionBlocked()) return;
      locked.current = true;
      record(true, ids, meta);
      earnedRef.current++;
      setEarned(earnedRef.current);
      phaseRef.current = "success";
      setPhase("success");
      const text = praise[lang][round % praise[lang].length];
      setMessage(text);
      playSound("success", settings);
      speak(text, lang, settings);
    },
    [round, paused, lang, settings],
  );
  useEffect(() => {
    if (paused || !["success", "demo"].includes(phase)) return;
    const t = setTimeout(
      () => {
        if (round + 1 >= totalRounds) {
          saveSession(true);
          removeCheckpoint();
          phaseRef.current = "done";
          setPhase("done");
          stopSounds();
          stopSpeech();
        } else {
          locked.current = false;
          mistakes.current = 0;
          lastWrongTap.current = null;
          hintRef.current = 0;
          setHint(0);
          setMessage("");
          setLesson({ text: "", ids: [] });
          const nextRound = Math.min(totalRounds - 1, roundRef.current + 1);
          roundRef.current = nextRound;
          phaseRef.current = "active";
          setRound(nextRound);
          setPhase("active");
        }
      },
      phase === "demo" ? 3800 : 1300,
    );
    return () => clearTimeout(t);
  }, [phase, paused, round, totalRounds, saveSession, removeCheckpoint]);
  function help() {
    if (interactionBlocked()) return;
    setHint(2);
    hintRef.current = 2;
    setActivity((a) => a + 1);
    setMessage(lesson.help || lesson.text);
    speak(lesson.help || lesson.text, lang, settings);
  }
  const pauseManually = useCallback(() => {
    manualPauseRef.current = true;
    lifecyclePauseRef.current = false;
    pausedRef.current = true;
    stopSpeech();
    stopSounds();
    persistCheckpoint();
    setPaused(true);
  }, [persistCheckpoint]);
  function exit() {
    saveSession(false);
    removeCheckpoint();
    onNavigate(`/world/${worldId}`);
  }
  if (!world || !spec || !Component) return null;
  if (phase === "done")
    return (
      <section className="session-finish">
        <div className="finish-stars">
          <Art name="star" />
          <Art name="glowing-star" />
          <Art name="star" />
        </div>
        <Mino />
        <h1>{lang === "tr" ? "Birlikte başardık!" : "Zusammen geschafft!"}</h1>
        <p>
          {lang === "tr"
            ? "Mino ile harika çalıştın."
            : "Du hast mit Mino fleißig geübt."}
        </p>
        <div className="earned">
          <Star fill="currentColor" />
          {earned} {lang === "tr" ? "yeni yıldız" : "neue Sterne"}
        </div>
        {nextActivity && (
          <button
            className="primary next-adventure-button"
            onClick={() => {
              unlockAudio();
              onNavigate(`/play/${nextActivity.game.id}/${nextActivity.world.id}`);
            }}
          >
            <Play size={21} fill="currentColor" />
            <span>
              <small>{lang === "tr" ? "Mino’nun sıradaki önerisi" : "Minos nächster Tipp"}</small>
              {nextActivity.world.labels[lang]} · {nextActivity.game[lang]}
            </span>
            <ArrowRight size={20} />
          </button>
        )}
        <div className="finish-actions">
          <button className="secondary" onClick={() => onNavigate("/aquarium")}>
            <Art name="wrapped-gift" />
            {lang === "tr" ? "Ödüllerim" : "Meine Schätze"}
          </button>
          <button
            className="secondary"
            onClick={() => onNavigate(`/replay/${gameId}/${worldId}`)}
          >
            <RotateCcw size={20} />
            {lang === "tr" ? "Tekrar oyna" : "Noch einmal"}
          </button>
          <button className="secondary" onClick={exit}>
            <Home size={20} />
            {lang === "tr" ? "Dünyama dön" : "Zur Lernwelt"}
          </button>
        </div>
      </section>
    );
  return (
    <section className={`game-session game-${gameId} phase-${phase}`}
      data-age={progress.activeProfile?.ageGroup || "4-5"}
      data-world={worldId}
      style={{ "--scene-background": `url("${assetUrl(`assets/scenes/${sceneForWorld(worldId)}.webp`)}")` }}>
      <header className="game-header" inert={paused ? true : undefined}>
        <button
          className="icon-button"
          onClick={pauseManually}
          aria-label={
            lang === "tr"
              ? "Oyunu duraklat ve çık"
              : "Spiel pausieren und verlassen"
          }
        >
          <ArrowLeft />
        </button>
        <div className="game-title">
          <b>{spec?.[lang]}</b>
          <span>{world?.labels?.[lang]}</span>
        </div>
        <button
          className="icon-button replay-button"
          onClick={() => lesson.repeat?.()}
          disabled={!lesson.repeat || paused}
          aria-label={lang === "tr" ? "Tekrar dinle" : "Noch einmal anhören"}
        >
          <Volume2 />
        </button>
      </header>
      <div className="game-stage" inert={paused ? true : undefined}>
        <FishGuide
          lang={lang}
          message={message || lesson.text}
          hint={hint}
          onHelp={help}
          disabled={interactionBlocked()}
        />
        <Component
          key={`${gameId}-${worldId}-${round}`}
          items={items}
          world={world}
          progress={progress}
          difficulty={difficulty}
          lang={lang}
          settings={settings}
          hint={hint}
          paused={paused}
          round={round}
          onReady={ready}
          onWrong={wrong}
          onSolve={solve}
        />
      </div>
      {paused && (
        <div className="pause-overlay" role="dialog" aria-modal="true">
          <Mino />
          <h2>{lang === "tr" ? "Mola zamanı" : "Kleine Pause"}</h2>
          <button
            className="primary"
            onClick={() => {
              manualPauseRef.current = false;
              lifecyclePauseRef.current = false;
              pausedRef.current = false;
              setPaused(false);
              unlockAudio();
            }}
          >
            <Play size={20} /> {lang === "tr" ? "Devam et" : "Weiterspielen"}
          </button>
          <button className="secondary" onClick={exit}>
            <Home size={20} /> {lang === "tr" ? "Dünyama dön" : "Zur Lernwelt"}
          </button>
        </div>
      )}
    </section>
  );
}
