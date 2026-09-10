import test from "node:test";
import assert from "node:assert/strict";
import { freshState, normalizeState, reduceProgress } from "../src/progress/model.js";

const now = Date.now();
const sessionAction = (completed, extra = {}) => ({
  type: "session",
  session: {
    id: "resume-session-1",
    worldId: "animals",
    gameId: "listen",
    lang: "de",
    started: now - 60_000,
    ended: now - 30_000,
    seconds: 30,
    rounds: 1,
    attempts: 2,
    completed,
    ...extra,
  },
});

test("a real Safari exit can later upgrade the same resumed session to completed", () => {
  let state = reduceProgress(freshState(), sessionAction(false));
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].completed, false);
  assert.equal(state.worlds["de:animals"].sessions, 0);

  state = reduceProgress(
    state,
    sessionAction(true, { ended: now, seconds: 61, rounds: 4, attempts: 7 }),
  );

  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].completed, true);
  assert.equal(state.sessions[0].seconds, 61);
  assert.equal(state.sessions[0].rounds, 4);
  assert.equal(state.sessions[0].attempts, 7);
  assert.equal(state.worlds["de:animals"].sessions, 1);
});

test("repeated incomplete exits refresh one cumulative session without counting completion", () => {
  let state = reduceProgress(freshState(), sessionAction(false));
  state = reduceProgress(
    state,
    sessionAction(false, { ended: now, seconds: 52, rounds: 2, attempts: 5 }),
  );

  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].completed, false);
  assert.equal(state.sessions[0].seconds, 52);
  assert.equal(state.sessions[0].rounds, 2);
  assert.equal(state.sessions[0].attempts, 5);
  assert.equal(state.worlds["de:animals"].sessions, 0);
});

test("a stale incomplete write can never downgrade an already completed session", () => {
  let state = reduceProgress(freshState(), sessionAction(true, { ended: now, seconds: 60 }));
  state = reduceProgress(state, sessionAction(false, { ended: now + 1, seconds: 1 }));

  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].completed, true);
  assert.equal(state.sessions[0].seconds, 60);
  assert.equal(state.worlds["de:animals"].sessions, 1);
});

test("reload normalization prefers completion when legacy duplicate session ids exist", () => {
  const raw = freshState();
  raw.sessions = [
    sessionAction(true, { ended: now, seconds: 60 }).session,
    sessionAction(false, { ended: now - 10_000, seconds: 45 }).session,
  ];
  const loaded = normalizeState(raw);

  assert.equal(loaded.sessions.length, 1);
  assert.equal(loaded.sessions[0].completed, true);
  assert.equal(loaded.sessions[0].seconds, 60);
});
