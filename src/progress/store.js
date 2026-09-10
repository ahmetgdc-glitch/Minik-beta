import { useSyncExternalStore } from "react";
import { STORAGE_KEY, freshState, migrate, normalizeState, reduceProgress } from "./model.js";
import { createBackupPayload, parseBackupPayload } from "./backup.js";
import { normalizeAgeGroup } from "../learning/age.js";
import { chooseActiveProfileId, chooseFamilyEnvelope, persistFamilyEnvelope } from "./familyPersistence.js";
import { clearCheckpoint, clearCheckpoints } from "../games/sessionCheckpoint.js";

const FAMILY_KEY = "minik_profiles_v1";
const ACTIVE_KEY = "minik_active_profile_v1";
const RECOVERY_KEY = "minik_profiles_recovery_v1";
const MAX_PROFILES = 8;
const AVATARS = ["🐠","🦁","🐼","🐰","🦊","🐸","🐯","🐨","🦄","🚀","🌈","⭐"];
let storage;
try { storage = window.localStorage; } catch {}
let storageFailed = false;
let storageRecovered = false;
const listeners = new Set();

const cleanName = (name, fallback = "Kind") => String(name || "").trim().slice(0, 18) || fallback;
const makeId = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const publicProfile = (p) => {
  const progress = normalizeState(p?.progress);
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    ageGroup: normalizeAgeGroup(p.ageGroup),
    createdAt: p.createdAt,
    stars: progress.stars,
    xp: progress.xp,
    sessions: progress.sessions.filter((x) => x.completed).length,
    learned: Object.values(progress.mastery).filter((x) => (x?.independent || 0) >= 3).length,
  };
};

function loadFamily() {
  try {
    const chosen = chooseFamilyEnvelope(
      storage?.getItem(FAMILY_KEY),
      storage?.getItem(RECOVERY_KEY),
    );
    const raw = chosen.raw;
    if (raw) {
      storageRecovered = chosen.source === "recovery";
      const profiles = raw.profiles.slice(0, MAX_PROFILES).map((p,i) => ({
        id: String(p.id || makeId()),
        name: cleanName(p.name, `Kind ${i+1}`),
        avatar: AVATARS.includes(p.avatar) ? p.avatar : AVATARS[i % AVATARS.length],
        ageGroup: normalizeAgeGroup(p.ageGroup),
        createdAt: Number(p.createdAt) || Date.now(),
        progress: normalizeState(p.progress),
      }));
      const legacyRequested = storage?.getItem(ACTIVE_KEY);
      // New family envelopes carry the active child atomically with all profile
      // progress. The separate ACTIVE_KEY remains a backwards-compatibility
      // fallback for older installs, but it can no longer make a freshly saved
      // family reopen on the wrong child after a partial storage write.
      const activeId = chooseActiveProfileId(raw, legacyRequested) || profiles[0].id;
      // Repair the live key immediately after a successful recovery without
      // replacing the last-known-good recovery snapshot with the corrupt live
      // value that forced recovery in the first place.
      if (chosen.source === "recovery") {
        try {
          persistFamilyEnvelope(storage, FAMILY_KEY, RECOVERY_KEY, {
            version: 1,
            profiles,
            activeId,
          });
        } catch {}
      }
      return { profiles, activeId };
    }
  } catch {}
  // First profile inherits the existing MINIK progress so no child loses stars or learning history.
  const legacy = migrate(storage);
  const first = { id: makeId(), name: "Kind 1", avatar: "🐠", ageGroup: "4-5", createdAt: Date.now(), progress: legacy };
  return { profiles:[first], activeId:first.id };
}

let family = loadFamily();
let state = family.profiles.find(p=>p.id===family.activeId)?.progress || freshState();
let snapshot;

function rebuildSnapshot(){
  snapshot = {
    ...state,
    profiles: family.profiles.map(publicProfile),
    activeProfileId: family.activeId,
    activeProfile: publicProfile(family.profiles.find(p=>p.id===family.activeId) || family.profiles[0]),
    maxProfiles: MAX_PROFILES,
    profileAvatars: AVATARS,
  };
}
rebuildSnapshot();

function saveFamily(){
  try {
    const active = family.profiles.find(p=>p.id===family.activeId);
    if (active) active.progress = normalizeState(state);
    // Persist profile data and the selected child in one authoritative JSON
    // write. The two legacy keys are best-effort compatibility mirrors only; a
    // failure there must not make a successful family save look unsuccessful.
    persistFamilyEnvelope(storage, FAMILY_KEY, RECOVERY_KEY, {
      version: 1,
      profiles: family.profiles,
      activeId: family.activeId,
    });
    storageFailed = false;
    try { storage?.setItem(ACTIVE_KEY, family.activeId); } catch {}
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    } catch {}
    return true;
  } catch {
    storageFailed = true;
    return false;
  }
}
function emit(){ rebuildSnapshot(); listeners.forEach(fn=>fn()); }

export const getState = () => snapshot;
export const getStorageFailure = () => storageFailed;
export const getStorageRecovery = () => storageRecovered;
export function dispatch(action){
  const previousGameContext = {
    lang: state.settings?.lang,
    adaptive: state.settings?.adaptive,
    options: state.settings?.options,
  };
  state = reduceProgress(state, action);
  if (action?.type === "reset") clearCheckpoint(storage, family.activeId);
  // A resumable round belongs to one language and difficulty context. If an
  // adult changes any setting that can alter the available answers or lesson
  // language, discard the old checkpoint instead of resuming a mixed round.
  if (action?.type === "settings") {
    const contextChanged =
      state.settings?.lang !== previousGameContext.lang ||
      state.settings?.adaptive !== previousGameContext.adaptive ||
      state.settings?.options !== previousGameContext.options;
    if (contextChanged) clearCheckpoint(storage, family.activeId);
  }
  saveFamily(); emit(); return snapshot;
}
export const setSettings = (patch) => dispatch({type:"settings",patch});

export function switchProfile(id){
  const next = family.profiles.find(p=>p.id===id);
  if (!next || id===family.activeId) return snapshot;
  const current = family.profiles.find(p=>p.id===family.activeId);
  if (current) current.progress = normalizeState(state);
  family.activeId = id;
  state = normalizeState(next.progress);
  saveFamily(); emit(); return snapshot;
}

export function addProfile({name, avatar, ageGroup} = {}){
  if (family.profiles.length >= MAX_PROFILES) return null;
  const currentSettings = state.settings;
  const progress = freshState();
  progress.settings = {
    ...progress.settings,
    lang: currentSettings.lang,
    audio: currentSettings.audio,
    sfx: currentSettings.sfx,
    rate: currentSettings.rate,
    pitch: currentSettings.pitch,
    voices: {...currentSettings.voices},
  };
  const p = {
    id: makeId(),
    name: cleanName(name, `Kind ${family.profiles.length+1}`),
    avatar: AVATARS.includes(avatar) ? avatar : AVATARS[family.profiles.length % AVATARS.length],
    ageGroup: normalizeAgeGroup(ageGroup),
    createdAt: Date.now(), progress,
  };
  const current = family.profiles.find(x=>x.id===family.activeId);
  if (current) current.progress = normalizeState(state);
  family.profiles.push(p); family.activeId = p.id; state = progress;
  saveFamily(); emit(); return p.id;
}

export function updateProfile(id, patch={}){
  const p = family.profiles.find(x=>x.id===id); if(!p) return;
  if (patch.name !== undefined) p.name = cleanName(patch.name, p.name);
  if (patch.avatar !== undefined && AVATARS.includes(patch.avatar)) p.avatar = patch.avatar;
  if (patch.ageGroup !== undefined) {
    const nextAgeGroup = normalizeAgeGroup(patch.ageGroup);
    if (nextAgeGroup !== p.ageGroup) clearCheckpoint(storage, id);
    p.ageGroup = nextAgeGroup;
  }
  saveFamily(); emit();
}

export function deleteProfile(id){
  if (family.profiles.length <= 1) return false;
  const idx = family.profiles.findIndex(p=>p.id===id); if(idx<0) return false;
  const deletingActive = family.activeId===id;
  clearCheckpoint(storage, id);
  family.profiles.splice(idx,1);
  if(deletingActive){
    const next = family.profiles[Math.min(idx, family.profiles.length-1)];
    family.activeId = next.id; state = normalizeState(next.progress);
  }
  saveFamily(); emit(); return true;
}


export function createFamilyBackup(){
  const active = family.profiles.find(p=>p.id===family.activeId);
  if (active) active.progress = normalizeState(state);
  return createBackupPayload(family.profiles, family.activeId);
}

export function restoreFamilyBackup(payload){
  const restored = parseBackupPayload(payload);
  const oldProfileIds = family.profiles.map((p) => p.id);
  const restoredProfiles = restored.profiles.map((p,i)=>({ ...p, avatar: AVATARS.includes(p.avatar) ? p.avatar : AVATARS[i % AVATARS.length], ageGroup: normalizeAgeGroup(p.ageGroup) }));
  clearCheckpoints(storage, [...oldProfileIds, ...restoredProfiles.map((p) => p.id)]);
  family = { profiles: restoredProfiles, activeId: restored.activeId };
  state = normalizeState(family.profiles.find(p=>p.id===family.activeId)?.progress);
  saveFamily(); emit(); return snapshot;
}

export function useProgress(){
  return useSyncExternalStore(
    fn=>{listeners.add(fn); return ()=>listeners.delete(fn)},
    getState,
    getState,
  );
}

if (typeof window !== "undefined") window.addEventListener("storage", e=>{
  if ([FAMILY_KEY,ACTIVE_KEY].includes(e.key)) {
    family = loadFamily(); state = normalizeState(family.profiles.find(p=>p.id===family.activeId)?.progress); emit();
  }
});
