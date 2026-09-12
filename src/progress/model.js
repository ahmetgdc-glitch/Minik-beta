import { maxOptionsForAge } from "../learning/age.js";
import { outfitById, normalizeOutfit } from "../rewards/outfits.js";
export const STORAGE_KEY = "minik_progress_v3";
export const MAX_WORLD_PROGRESS_ENTRIES = 128;
export const MAX_MASTERY_ENTRIES = 2500;
export const MAX_EVENT_IDS = 600;
export const MAX_REWARD_IDS = 128;

export const defaultSettings = {
  lang: "de",
  audio: true,
  systemVoiceFallback: false,
  sfx: true,
  autoHelp: true,
  photos: true,
  adaptive: true,
  options: 2,
  rate: 0.9,
  pitch: 1,
  voices: { de: "", tr: "" },
  pin: "",
  reducedMotion: false,
};
export function freshState() {
  return {
    version: 3,
    settings: { ...defaultSettings, voices: { de: "", tr: "" } },
    stars: 0,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    answers: 0,
    correct: 0,
    worlds: {},
    mastery: {},
    history: [],
    sessions: [],
    events: [],
    inventory: [],
    equipped: [],
    minoOutfit: "classic",
    daily: { date: "", correct: 0 },
    lastWorld: "animals",
  };
}
const count = (x, max = Number.MAX_SAFE_INTEGER) =>
  Math.min(max, Math.max(0, Number.isFinite(Number(x)) ? Math.floor(Number(x)) : 0));
const boolSetting = (value, fallback) =>
  typeof value === "boolean" ? value : fallback;
const MAX_FUTURE_SKEW_MS = 24 * 60 * 60 * 1000;
const finiteTime = (value, now = Date.now()) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= now + MAX_FUTURE_SKEW_MS
    ? n
    : undefined;
};
const safeText = (value, max = 96) =>
  typeof value === "string" ? value.slice(0, max) : "";
const safeId = (value, max = 120) => safeText(value, max).trim();
const safeLang = (value) => (["de", "tr"].includes(value) ? value : "");
const uniqueTextList = (value, maxItems = 32, maxLength = 160, fromEnd = false) => {
  if (!Array.isArray(value) || maxItems <= 0) return [];
  const out = [];
  const seen = new Set();
  if (fromEnd) {
    for (let index = value.length - 1; index >= 0 && out.length < maxItems; index--) {
      const cleaned = safeId(value[index], maxLength);
      if (!cleaned || seen.has(cleaned)) continue;
      seen.add(cleaned);
      out.push(cleaned);
    }
    return out.reverse();
  }
  for (let index = 0; index < value.length && out.length < maxItems; index++) {
    const cleaned = safeId(value[index], maxLength);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    out.push(cleaned);
  }
  return out;
};

function normalizeHistoryEntry(entry, now) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const at = finiteTime(entry.at, now);
  const worldId = safeId(entry.worldId);
  const gameId = safeId(entry.gameId);
  const lang = safeLang(entry.lang);
  if (!at || !worldId || !gameId || !lang) return null;
  const correct = Boolean(entry.correct);
  return {
    at,
    worldId,
    gameId,
    lang,
    correct,
    assisted: Boolean(entry.assisted),
    clean: correct && Boolean(entry.clean),
    itemIds: uniqueTextList(entry.itemIds),
  };
}

function normalizeSessionEntry(entry, now) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const id = safeId(entry.id, 96);
  const worldId = safeId(entry.worldId);
  const gameId = safeId(entry.gameId);
  const lang = safeLang(entry.lang);
  if (!id || !worldId || !gameId || !lang) return null;
  const rawStarted = finiteTime(entry.started, now);
  const rawEnded = finiteTime(entry.ended, now);
  if (!rawStarted && !rawEnded) return null;
  const started = rawStarted || rawEnded;
  const ended = Math.max(started, rawEnded || started);
  return {
    id,
    worldId,
    gameId,
    lang,
    started,
    ended,
    seconds: count(entry.seconds, 24 * 60 * 60),
    rounds: count(entry.rounds, 999),
    attempts: count(entry.attempts, 9999),
    completed: Boolean(entry.completed),
  };
}

function sameSessionContext(a, b) {
  return (
    a?.worldId === b?.worldId &&
    a?.gameId === b?.gameId &&
    a?.lang === b?.lang
  );
}

function mergeSessionEntries(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming || !sameSessionContext(existing, incoming)) return existing;
  // A finalized session is authoritative. A stale tab/pagehide event must
  // never downgrade it back to incomplete. Before completion, however, real
  // Safari exits can legitimately produce multiple snapshots of the same
  // resumed session. Keep the furthest cumulative progress so the eventual
  // completion can upgrade that one record instead of creating a duplicate.
  if (existing.completed) return existing;
  return {
    ...incoming,
    started: Math.min(existing.started, incoming.started),
    ended: Math.max(existing.ended, incoming.ended),
    seconds: Math.max(existing.seconds, incoming.seconds),
    rounds: Math.max(existing.rounds, incoming.rounds),
    attempts: Math.max(existing.attempts, incoming.attempts),
    completed: Boolean(existing.completed || incoming.completed),
  };
}
export function normalizeState(raw) {
  const s = freshState();
  if (!raw || typeof raw !== "object" || raw.version !== 3) return s;
  const now = Date.now();
  for (const key of [
    "stars",
    "xp",
    "streak",
    "bestStreak",
    "answers",
    "correct",
  ])
    s[key] = count(raw[key]);
  s.correct = Math.min(s.correct, s.answers);
  s.bestStreak = Math.max(s.bestStreak, s.streak);

  const rawSettings =
    raw.settings && typeof raw.settings === "object" && !Array.isArray(raw.settings)
      ? raw.settings
      : {};
  // Rebuild settings from the explicit schema instead of spreading arbitrary
  // persisted keys back into the live app. This keeps corrupt/oversized
  // localStorage and imported backups from growing the settings object forever.
  const settings = { ...defaultSettings, voices: { ...defaultSettings.voices } };
  settings.lang = ["de", "tr"].includes(rawSettings.lang) ? rawSettings.lang : "de";
  settings.audio = boolSetting(rawSettings.audio, defaultSettings.audio);
  settings.systemVoiceFallback = boolSetting(
    rawSettings.systemVoiceFallback,
    defaultSettings.systemVoiceFallback,
  );
  settings.sfx = boolSetting(rawSettings.sfx, defaultSettings.sfx);
  settings.autoHelp = boolSetting(rawSettings.autoHelp, defaultSettings.autoHelp);
  settings.photos = boolSetting(rawSettings.photos, defaultSettings.photos);
  settings.adaptive = boolSetting(rawSettings.adaptive, defaultSettings.adaptive);
  settings.reducedMotion = boolSetting(
    rawSettings.reducedMotion,
    defaultSettings.reducedMotion,
  );
  settings.options = [2, 4, 6].includes(Number(rawSettings.options))
    ? Number(rawSettings.options)
    : defaultSettings.options;
  settings.rate = Math.min(
    1.15,
    Math.max(0.65, Number(rawSettings.rate) || defaultSettings.rate),
  );
  settings.pitch = Math.min(
    1.3,
    Math.max(0.8, Number(rawSettings.pitch) || defaultSettings.pitch),
  );
  const rawVoices =
    rawSettings.voices && typeof rawSettings.voices === "object" && !Array.isArray(rawSettings.voices)
      ? rawSettings.voices
      : {};
  settings.voices = {
    de: safeText(rawVoices.de, 160),
    tr: safeText(rawVoices.tr, 160),
  };
  const normalizedPin = String(rawSettings.pin || "")
    .replace(/\D/g, "")
    .slice(0, 4);
  // A persisted PIN is valid only when it is exactly four digits. Corrupt or
  // legacy partial values must not silently weaken the adult gate to 1-3 digits.
  settings.pin = normalizedPin.length === 4 ? normalizedPin : "";
  s.settings = settings;

  const rawWorlds =
    raw.worlds && typeof raw.worlds === "object" && !Array.isArray(raw.worlds)
      ? raw.worlds
      : {};
  let worldEntries = 0;
  for (const key in rawWorlds) {
    if (!Object.prototype.hasOwnProperty.call(rawWorlds, key)) continue;
    if (worldEntries >= MAX_WORLD_PROGRESS_ENTRIES) break;
    const value = rawWorlds[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const id = safeId(key);
    if (!id) continue;
    const answers = count(value.answers);
    const recent = Array.isArray(value.recent)
      ? value.recent
          .slice(-12)
          .flatMap((entry) =>
            entry === true || entry === 1
              ? [true]
              : entry === false || entry === 0
                ? [false]
                : [],
          )
      : [];
    s.worlds[id] = {
      answers,
      correct: Math.min(answers, count(value.correct)),
      sessions: count(value.sessions),
      recent,
    };
    worldEntries++;
  }

  const rawMastery =
    raw.mastery && typeof raw.mastery === "object" && !Array.isArray(raw.mastery)
      ? raw.mastery
      : {};
  let masteryEntries = 0;
  for (const key in rawMastery) {
    if (!Object.prototype.hasOwnProperty.call(rawMastery, key)) continue;
    if (masteryEntries >= MAX_MASTERY_ENTRIES) break;
    const value = rawMastery[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const id = safeId(key, 160);
    if (!id) continue;
    const correct = count(value.correct);
    const normalized = {
      correct,
      wrong: count(value.wrong),
      independent: Math.min(correct, count(value.independent)),
    };
    const lastSeen = finiteTime(value.lastSeen, now);
    if (lastSeen) normalized.lastSeen = lastSeen;
    s.mastery[id] = normalized;
    masteryEntries++;
  }

  s.history = Array.isArray(raw.history)
    ? raw.history
        .slice(-500)
        .map((entry) => normalizeHistoryEntry(entry, now))
        .filter(Boolean)
    : [];

  if (Array.isArray(raw.sessions)) {
    const positions = new Map();
    const normalized = [];
    for (let index = raw.sessions.length - 1; index >= 0; index--) {
      const session = normalizeSessionEntry(raw.sessions[index], now);
      if (!session) continue;
      const position = positions.get(session.id);
      if (position != null) {
        normalized[position] = mergeSessionEntries(normalized[position], session);
        continue;
      }
      positions.set(session.id, normalized.length);
      normalized.push(session);
      if (normalized.length >= 100) break;
    }
    s.sessions = normalized.reverse();
  }

  s.events = uniqueTextList(raw.events, MAX_EVENT_IDS, 96, true);
  s.inventory = uniqueTextList(raw.inventory, MAX_REWARD_IDS, 96);
  const equipped = uniqueTextList(raw.equipped, MAX_REWARD_IDS, 96);
  s.equipped = equipped.filter((id) => s.inventory.includes(id));
  s.minoOutfit = normalizeOutfit(raw.minoOutfit, s.stars);
  const dailyDate = safeText(raw.daily?.date, 10);
  s.daily = /^\d{4}-\d{2}-\d{2}$/.test(dailyDate)
    ? { date: dailyDate, correct: count(raw.daily?.correct) }
    : s.daily;
  s.lastWorld = safeId(raw.lastWorld) || "animals";
  return s;
}

export function migrate(storage) {
  try {
    const current = storage?.getItem(STORAGE_KEY);
    if (current) return normalizeState(JSON.parse(current));
    const s = freshState();
    const old = JSON.parse(storage?.getItem("minik_state_v2") || "null");
    s.stars = count(old?.stars ?? storage?.getItem("minik_stars"));
    s.xp = s.stars * 10;
    s.streak = count(old?.streak ?? storage?.getItem("minik_streak"));
    s.bestStreak = s.streak;
    const lang = old?.settings?.lang || storage?.getItem("minik_lang");
    if (["de", "tr"].includes(lang)) s.settings.lang = lang;
    if (old?.settings) {
      s.settings.rate = Number(old.settings.voiceRate) || 0.9;
      s.settings.options = [2, 4, 6].includes(Number(old.settings.difficulty))
        ? Number(old.settings.difficulty)
        : 2;
    }
    return s;
  } catch {
    return freshState();
  }
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function difficultyFor(state, worldId, lang = state.settings.lang) {
  const maxByAge = maxOptionsForAge(state.activeProfile?.ageGroup);
  if (!state.settings.adaptive) return Math.min(state.settings.options, maxByAge);
  const recent = state.worlds[`${lang}:${worldId}`]?.recent || [];
  if (recent.length < 8) return 2;
  const last = recent.slice(-12),
    accuracy = last.filter(Boolean).length / last.length;
  const adaptive = accuracy >= 0.9 && last.length >= 12 ? 6 : accuracy >= 0.75 ? 4 : 2;
  return Math.min(adaptive, maxByAge);
}
export function reduceProgress(state, action) {
  if (action.type === "settings")
    return {
      ...state,
      settings: {
        ...state.settings,
        ...action.patch,
        voices: { ...state.settings.voices, ...action.patch.voices },
      },
    };
  if (action.type === "answer") {
    if (state.events.includes(action.eventId)) return state;
    const correct = !!action.correct,
      clean = correct && !action.assisted && !action.hadErrors;
    const s = {
      ...state,
      events: [...state.events, action.eventId].slice(-600),
      worlds: { ...state.worlds },
      mastery: { ...state.mastery },
      answers: state.answers + 1,
      correct: state.correct + Number(correct),
      stars: state.stars + Number(correct),
      xp: state.xp + (correct ? 10 : 0),
      streak: correct ? state.streak + 1 : 0,
      lastWorld: action.worldId,
    };
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    const today = action.day || localDay();
    s.daily = {
      date: today,
      correct:
        (state.daily.date === today ? state.daily.correct : 0) +
        Number(correct),
    };
    const key = `${action.lang}:${action.worldId}`,
      w = state.worlds[key] || {
        answers: 0,
        correct: 0,
        recent: [],
        sessions: 0,
      };
    s.worlds[key] = {
      ...w,
      answers: w.answers + 1,
      correct: w.correct + Number(correct),
      recent: [...w.recent, clean].slice(-12),
    };
    for (const id of [...new Set(action.itemIds || [])]) {
      const mk = `${action.lang}:${id}`,
        m = state.mastery[mk] || { correct: 0, wrong: 0, independent: 0 };
      s.mastery[mk] = {
        ...m,
        correct: m.correct + Number(correct),
        wrong: m.wrong + Number(!correct),
        independent: m.independent + Number(clean),
        lastSeen: action.at,
      };
    }
    s.history = [
      ...state.history,
      {
        at: action.at,
        worldId: action.worldId,
        gameId: action.gameId,
        lang: action.lang,
        correct,
        assisted: !!action.assisted,
        clean,
        itemIds: action.itemIds || [],
      },
    ].slice(-500);
    return s;
  }
  if (action.type === "session") {
    const session = normalizeSessionEntry(action.session, Date.now());
    if (!session) return state;
    const existingIndex = state.sessions.findIndex((saved) => saved.id === session.id);
    if (existingIndex >= 0) {
      const existing = state.sessions[existingIndex];
      if (!sameSessionContext(existing, session)) return state;
      const merged = mergeSessionEntries(existing, session);
      if (merged === existing) return state;
      const sessions = [...state.sessions];
      sessions[existingIndex] = merged;
      const upgraded = !existing.completed && merged.completed;
      if (!upgraded) return { ...state, sessions };
      const key = `${merged.lang}:${merged.worldId}`;
      const w = state.worlds[key] || {
        answers: 0,
        correct: 0,
        recent: [],
        sessions: 0,
      };
      return {
        ...state,
        sessions,
        worlds: {
          ...state.worlds,
          [key]: { ...w, sessions: (w.sessions || 0) + 1 },
        },
      };
    }
    const key = `${session.lang}:${session.worldId}`,
      w = state.worlds[key] || {
        answers: 0,
        correct: 0,
        recent: [],
        sessions: 0,
      };
    return {
      ...state,
      sessions: [...state.sessions, session].slice(-100),
      worlds: {
        ...state.worlds,
        [key]: {
          ...w,
          sessions: (w.sessions || 0) + Number(session.completed),
        },
      },
    };
  }
  if (action.type === "claim") {
    if (
      state.inventory.includes(action.reward.id) ||
      state.stars < action.reward.stars
    )
      return state;
    return {
      ...state,
      inventory: [...state.inventory, action.reward.id],
      equipped: [...state.equipped, action.reward.id],
    };
  }
  if (action.type === "equip") {
    if (!state.inventory.includes(action.id)) return state;
    return {
      ...state,
      equipped: state.equipped.includes(action.id)
        ? state.equipped.filter((x) => x !== action.id)
        : [...state.equipped, action.id],
    };
  }
  if (action.type === "outfit") {
    const outfit = outfitById[action.id];
    if (!outfit || state.stars < outfit.stars) return state;
    return { ...state, minoOutfit: outfit.id };
  }
  if (action.type === "reset")
    return { ...freshState(), settings: state.settings };
  return state;
}
