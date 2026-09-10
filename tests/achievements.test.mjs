import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { achievements, achievementState } from '../src/rewards/achievements.js';

const empty = () => ({stars:0,bestStreak:0,sessions:[],mastery:{},inventory:[]});

test('achievement catalog is unique, bilingual and uses local art', () => {
  assert.equal(new Set(achievements.map(a=>a.id)).size, achievements.length);
  assert.ok(achievements.length >= 10);
  for (const a of achievements) {
    assert.ok(a.de && a.tr && a.textDe && a.textTr);
    assert.equal(typeof a.test, 'function');
    const file = path.resolve('public/assets/illustrations', `${a.asset}.svg`);
    assert.ok(fs.existsSync(file), `missing achievement art: ${a.asset}`);
  }
});

test('achievement state unlocks only earned milestones', () => {
  const p = empty();
  assert.equal(achievementState(p).filter(a=>a.unlocked).length, 0);
  p.stars = 1;
  assert.equal(achievementState(p).find(a=>a.id==='first-star').unlocked, true);
  assert.equal(achievementState(p).find(a=>a.id==='star-25').unlocked, false);
});

test('varied play unlocks world and game diversity milestones', () => {
  const p = empty();
  p.sessions = [
    {completed:true,worldId:'animals',gameId:'listen'},
    {completed:true,worldId:'food',gameId:'memory'},
    {completed:true,worldId:'vehicles',gameId:'match'},
    {completed:true,worldId:'animals',gameId:'count'},
    {completed:true,worldId:'food',gameId:'draw'},
  ];
  const state = achievementState(p);
  assert.equal(state.find(a=>a.id==='worlds-3').unlocked, true);
  assert.equal(state.find(a=>a.id==='games-5').unlocked, true);
});
