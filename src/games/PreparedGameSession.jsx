import React, { useEffect, useMemo, useState } from "react";
import GameSession from "./GameSession.jsx";
import { useProgress } from "../progress/store.js";
import { uniqueVisuals, worldById } from "../data/content.js";
import { fixedNaturalVoicePlan } from "../audio/fixedNaturalVoicePlans.js";
import { gameStyles } from "../gameStyles.js";
import { Mino } from "../components/Visual.jsx";
import { sceneForWorld } from "../worlds/scenes.js";
import "./prepared-game-session.css";

const gameModules = {
  speak: () => import("./SpeakGame.jsx"),
  socialsteps: () => import("./SocialStepsGame.jsx"),
  different: () => import("./DifferentGame.jsx"),
  dailyorder: () => import("./DailyOrderGame.jsx"),
  opposites: () => import("./OppositesGame.jsx"),
  initialletter: () => import("./InitialLetterGame.jsx"),
  story: () => import("./StoryGame.jsx"),
  review: () => import("./ReviewGame.jsx"),
  explore: () => import("./ExploreGame.jsx"),
  draw: () => import("./DrawGame.jsx"),
  listen: () => import("./ListenGame.jsx"),
  memory: () => import("./MemoryGame.jsx"),
  match: () => import("./MatchGame.jsx"),
  sort: () => import("./SortGame.jsx"),
  count: () => import("./CountGame.jsx"),
  sounds: () => import("./SoundsGame.jsx"),
  puzzle: () => import("./PuzzleGame.jsx"),
  shadow: () => import("./ShadowGame.jsx"),
  missing: () => import("./MissingGame.jsx"),
  pattern: () => import("./PatternGame.jsx"),
  trace: () => import("./TraceGame.jsx"),
  lettertrace: () => import("./TraceGame.jsx"),
  rhythm: () => import("./RhythmGame.jsx"),
};

const introText = {
  speak: { de: "Schau mal! Tippe auf das Bild.", tr: "Bak bakalım! Resme dokun." },
  memory: { de: "Finde zwei gleiche Bilder.", tr: "Aynı iki resmi bul." },
  match: { de: "Bring das Bild zu seinem Zwilling.", tr: "Resmi eşine götür." },
  sort: { de: "In welchen Korb gehört das?", tr: "Hangi sepete ait?" },
  count: { de: "Wie viele sind es?", tr: "Kaç tane var?" },
  sounds: { de: "Hör genau hin. Was klingt so?", tr: "Dinle. Bu ne sesi?" },
  puzzle: { de: "Tippe zwei Teile an und tausche sie.", tr: "İki parçaya dokun, yerlerini değiştir." },
  shadow: { de: "Zu welchem Bild gehört der Schatten?", tr: "Bu gölge hangi resme ait?" },
  missing: { de: "Welches Bild ist verschwunden?", tr: "Hangi resim kayboldu?" },
  trace: { de: "Folge dem grünen Punkt.", tr: "Yeşil noktayı takip et." },
  lettertrace: { de: "Folge dem grünen Punkt.", tr: "Yeşil noktayı takip et." },
  rhythm: { de: "Hör zu und spiele die Melodie nach.", tr: "Dinle ve aynı melodiyi çal." },
};

const bundleCache = new Map();
const assetCache = new Set();
const ASSET_TIMEOUT_MS = 9000;
const PRELOAD_CONCURRENCY = 6;
const MIN_LOADING_MS = 450;

function baseAssetUrl(path) {
  const base = import.meta.env?.BASE_URL || "/";
  return `${base}${String(path || "").replace(/^\/+/, "")}`;
}

function localVoiceUrl(remoteUrl) {
  try {
    const filename = new URL(remoteUrl).pathname.split("/").pop();
    return filename ? baseAssetUrl(`assets/voice/${filename}`) : "";
  } catch {
    return "";
  }
}

function sessionPhrases(lang) {
  return lang === "tr"
    ? ["Harika!", "Çok güzel yaptın!", "Bir daha bak.", "Sana yardım edeyim mi?"]
    : ["Super gemacht!", "Wunderbar!", "Das hast du toll gemacht!", "Schau noch einmal.", "Soll ich dir helfen?"];
}

function fixedVoiceUrls(texts, lang) {
  const urls = new Set();
  for (const text of texts) {
    for (const remote of fixedNaturalVoicePlan(text, lang)) {
      const local = localVoiceUrl(remote);
      if (local) urls.add(local);
    }
  }
  return [...urls];
}

function worldAssetTasks({ gameId, worldId, items, lang, photos }) {
  const images = new Set([
    baseAssetUrl("assets/mascot/mino.webp"),
    baseAssetUrl(`assets/scenes/${sceneForWorld(worldId)}.webp`),
  ]);
  const texts = new Set(sessionPhrases(lang));
  const intro = introText[gameId]?.[lang];
  if (intro) texts.add(intro);

  for (const item of items) {
    const label = item?.labels?.[lang];
    if (label) texts.add(label);
    if (item?.asset) images.add(baseAssetUrl(`assets/illustrations/${item.asset}.svg`));
    if (photos && item?.variants?.photo) images.add(baseAssetUrl(item.variants.photo));
  }

  return [
    ...[...images].map((url) => ({ url, type: "image" })),
    ...fixedVoiceUrls([...texts], lang).map((url) => ({ url, type: "voice" })),
  ];
}

function preloadImage(url) {
  if (!url || assetCache.has(url)) return Promise.resolve(true);
  if (typeof Image === "undefined") return preloadRequest(url);
  return new Promise((resolve) => {
    const image = new Image();
    let done = false;
    const timer = setTimeout(() => finish(false), ASSET_TIMEOUT_MS);
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (ok) assetCache.add(url);
      resolve(ok);
    };
    image.onload = () => {
      const decoded = typeof image.decode === "function" ? image.decode() : Promise.resolve();
      Promise.resolve(decoded).catch(() => {}).finally(() => finish(true));
    };
    image.onerror = () => finish(false);
    image.src = url;
    if (image.complete && image.naturalWidth > 0) finish(true);
  });
}

async function preloadRequest(url) {
  if (!url || assetCache.has(url)) return true;
  if (typeof fetch === "undefined") return false;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = setTimeout(() => controller?.abort(), ASSET_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      cache: "force-cache",
      credentials: "same-origin",
      signal: controller?.signal,
    });
    if (response.ok) assetCache.add(url);
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function preloadTasks(tasks, onProgress) {
  const pending = tasks.filter(({ url }) => url);
  if (!pending.length) {
    onProgress?.(1);
    return;
  }
  let cursor = 0;
  let complete = 0;
  const worker = async () => {
    while (cursor < pending.length) {
      const index = cursor++;
      const task = pending[index];
      if (task.type === "image") await preloadImage(task.url);
      else await preloadRequest(task.url);
      complete += 1;
      onProgress?.(complete / pending.length);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(PRELOAD_CONCURRENCY, pending.length) }, worker),
  );
}

async function preloadGameBundle(gameId) {
  if (!gameModules[gameId]) return;
  if (!bundleCache.has(gameId)) {
    const styles = gameStyles[gameId] || (() => Promise.resolve());
    bundleCache.set(gameId, Promise.all([gameModules[gameId](), styles()]));
  }
  try {
    await bundleCache.get(gameId);
  } catch (error) {
    bundleCache.delete(gameId);
    throw error;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function LoadingScreen({ lang, progress, failed, onRetry }) {
  const percent = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <section className="game-preload-screen" role="status" aria-live="polite">
      <div className="game-preload-card">
        <Mino />
        <h1>{lang === "tr" ? "Oyun hazırlanıyor" : "Spiel wird vorbereitet"}</h1>
        <p>
          {lang === "tr"
            ? "Resimler, sesler ve oyun alanı yükleniyor…"
            : "Bilder, Stimmen und Spielfeld werden geladen…"}
        </p>
        <div
          className="game-preload-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={percent}
          aria-label={lang === "tr" ? "Yükleme ilerlemesi" : "Ladefortschritt"}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <b>{percent}%</b>
        {failed && (
          <button type="button" className="primary" onClick={onRetry}>
            {lang === "tr" ? "Tekrar dene" : "Noch einmal versuchen"}
          </button>
        )}
      </div>
    </section>
  );
}

export default function PreparedGameSession(props) {
  const { gameId, worldId } = props;
  const progressState = useProgress();
  const lang = progressState.settings.lang;
  const photos = progressState.settings.photos;
  const world = worldById[worldId];
  const items = useMemo(() => uniqueVisuals(world?.items || []), [world]);
  const [status, setStatus] = useState({ ready: false, failed: false, progress: 0 });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus({ ready: false, failed: false, progress: 2 });
    const started = Date.now();
    const tasks = worldAssetTasks({ gameId, worldId, items, lang, photos });

    const prepare = async () => {
      try {
        await Promise.all([
          preloadGameBundle(gameId),
          preloadTasks(tasks, (value) => {
            if (!cancelled) {
              setStatus((current) => ({
                ...current,
                progress: Math.max(current.progress, 8 + value * 82),
              }));
            }
          }),
        ]);
        const remaining = Math.max(0, MIN_LOADING_MS - (Date.now() - started));
        if (remaining) await sleep(remaining);
        if (cancelled) return;
        setStatus({ ready: false, failed: false, progress: 100 });
        await sleep(90);
        if (!cancelled) setStatus({ ready: true, failed: false, progress: 100 });
      } catch {
        if (!cancelled) setStatus((current) => ({ ...current, failed: true }));
      }
    };

    void prepare();
    return () => {
      cancelled = true;
    };
  }, [gameId, worldId, items, lang, photos, retry]);

  if (!status.ready) {
    return (
      <LoadingScreen
        lang={lang}
        progress={status.progress}
        failed={status.failed}
        onRetry={() => setRetry((value) => value + 1)}
      />
    );
  }

  return <GameSession {...props} />;
}
