import React, { useEffect, useMemo, useState } from "react";
import GameSession from "./GameSession.jsx";
import { useProgress } from "../progress/store.js";
import { uniqueVisuals, worldById } from "../data/content.js";
import { fixedNaturalVoicePlan } from "../audio/fixedNaturalVoicePlans.js";
import { naturalPhraseTexts } from "../audio/naturalVoicePlans.js";
import { helpVoiceTexts } from "../audio/helpVoiceClips.js";
import { preloadVoiceClip, preloadedVoiceReady, unlockVoiceAudio } from "../audio/voice.js";
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

// The round-0 instruction Mino speaks right after the loading card, per game
// family — exactly the strings the games pass to useLesson. Every here-static
// instruction is recorded as a fixed voiced clip (or, for puzzle, will be the
// moment a recording lands), so the first spoken words sit behind the same
// "playback-ready" preload gate as the word labels. Games that assemble their
// opening sentence at runtime from the target word or letter (speak, trace,
// lettertrace, dailyorder, opposites, review, listen, socialsteps and the story
// narrative) are intentionally absent — the sentence is built when the round
// starts, respecting the recorded Split-STEM principle.
const introText = {
  explore: { de: "Schau mal! Tippe auf das Bild.", tr: "Bak bakalım! Resme dokun." },
  different: { de: "Drei Bilder sind gleich. Finde das andere.", tr: "Üç resim aynı. Farklı olanı bul." },
  memory: { de: "Finde zwei gleiche Bilder.", tr: "Aynı iki resmi bul." },
  match: { de: "Bring das Bild zu seinem Zwilling.", tr: "Resmi eşine götür." },
  sort: { de: "In welchen Korb gehört das?", tr: "Hangi sepete ait?" },
  count: { de: "Wie viele sind es?", tr: "Kaç tane var?" },
  sounds: { de: "Hör genau hin. Was klingt so?", tr: "Dinle. Bu ne sesi?" },
  puzzle: { de: "Ziehe die Puzzleteile an die richtige Stelle.", tr: "Puzzle parçalarını doğru yere sürükle." },
  shadow: { de: "Zu welchem Bild gehört der Schatten?", tr: "Bu gölge hangi resme ait?" },
  missing: { de: "Welches Bild ist verschwunden?", tr: "Hangi resim kayboldu?" },
  pattern: { de: "Welches Bild kommt als Nächstes?", tr: "Sırada hangi resim var?" },
  story: { de: "Was sieht Mino zum Schluss?", tr: "Mino en son ne görüyor?" },
  initialletter: { de: "Mit welchem Buchstaben beginnt das Wort?", tr: "Bu kelime hangi harfle başlıyor?" },
  draw: { de: "Male, zeichne und erfinde etwas auf der großen Fläche.", tr: "Büyük tuvalde boya, çiz ve hayal et." },
  rhythm: { de: "Hör zu und spiele die Melodie nach.", tr: "Dinle ve aynı melodiyi çal." },
};

const bundleCache = new Map();
const assetCache = new Set();
const ASSET_TIMEOUT_MS = 9000;
const PRELOAD_CONCURRENCY = 6;
// Keep the prepared state visible long enough to be perceived on fast/cached
// phones. Without this, a ~450 ms transition can look like no loader at all.
const MIN_LOADING_MS = 900;

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

function sessionTexts({ gameId, items, lang }) {
  const texts = new Set(sessionPhrases(lang));
  const intro = introText[gameId]?.[lang];
  if (intro) texts.add(intro);
  for (const item of items) {
    const label = item?.labels?.[lang];
    if (label) texts.add(label);
  }
  // Dynamic sentences are composed at runtime from a learning word plus a
  // streamed instruction connector ("Finde dieses Bild.", "Bu resmi bul.", …).
  // Warm every connector and help hint of the session language as well so the
  // first spoken sentence needs neither a network round trip nor a decode.
  for (const phrase of naturalPhraseTexts(lang)) texts.add(phrase);
  for (const phrase of helpVoiceTexts(lang)) texts.add(phrase);
  return [...texts];
}

function worldAssetTasks({ gameId, worldId, items, lang, photos }) {
  const images = new Set([
    baseAssetUrl("assets/mascot/mino.webp"),
    baseAssetUrl(`assets/scenes/${sceneForWorld(worldId)}.webp`),
  ]);

  for (const item of items) {
    if (item?.asset) images.add(baseAssetUrl(`assets/illustrations/${item.asset}.svg`));
    if (photos && item?.variants?.photo) images.add(baseAssetUrl(item.variants.photo));
  }

  return [
    ...[...images].map((url) => ({ url, type: "image" })),
    ...fixedVoiceUrls(sessionTexts({ gameId, items, lang }), lang).map((url) => ({ url, type: "voice" })),
  ];
}

function preloadImage(url) {
  if (!url || assetCache.has(url)) return Promise.resolve(true);
  if (typeof Image === "undefined") return preloadRequest(url);
  return new Promise((resolve) => {
    const image = new Image();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (ok) assetCache.add(url);
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), ASSET_TIMEOUT_MS);
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
  let failed = 0;
  const worker = async () => {
    while (cursor < pending.length) {
      const index = cursor++;
      const task = pending[index];
      // Speech must be genuinely playback-ready (decoded into the narrator's
      // shared cache or buffered by the media player) before the session may
      // start. A plain HTTP warm fetch is not enough for that guarantee.
      const ok = task.type === "image"
        ? await preloadImage(task.url)
        : await preloadVoiceClip(task.url);
      if (!ok) failed += 1;
      complete += 1;
      onProgress?.(complete / pending.length);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(PRELOAD_CONCURRENCY, pending.length) }, worker),
  );
  if (failed) throw new Error(`failed to preload ${failed} game assets`);
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
          {failed
            ? lang === "tr"
              ? "Bir içerik yüklenemedi. Bağlantıyı kontrol edip tekrar deneyebilirsin."
              : "Ein Inhalt konnte nicht geladen werden. Prüfe die Verbindung und versuche es erneut."
            : lang === "tr"
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
        // The tap that opened this session also primed useAudioPrime, but an
        // explicit unlock here arms WebAudio immediately so the preload decode
        // reuses the narrator's gesture-resumed context instead of creating a
        // second suspended one.
        void unlockVoiceAudio().catch(() => false);
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
        // The shared media player buffers exactly one clip. Warm the round-0
        // instruction last, because it is what Mino speaks first after the
        // loading card and on iOS the media player is the only playback path.
        // The opener re-warm keeps the "100 % = voice ready" promise honest
        // for the very first utterance while every other session text stays
        // durably decoded in the narrator's shared cache.
        const openerText = introText[gameId]?.[lang];
        const openerUrls = openerText ? fixedVoiceUrls([openerText], lang) : [];
        if (openerUrls[0]) await preloadVoiceClip(openerUrls[0], { primeMedia: true });
        // 100 % must never be a lie: only show a ready session when every
        // required voice clip sits in the narrator's shared playback cache or
        // was buffered by the media player. Otherwise treat it as an audio
        // failure and keep the child on the loading card behind the retry.
        const voiceUrls = tasks.filter((task) => task.type === "voice").map((task) => task.url);
        if (!voiceUrls.every((url) => preloadedVoiceReady(url))) {
          throw new Error("session speech is not playback-ready");
        }
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
