import test from 'node:test';
import assert from 'node:assert/strict';
import { daysTogether, stageForLevel, loadProfile, saveProfile, PROFILE_KEY } from '../src/me.js';

function memoryStorage() {
  const map = new Map();
  return { getItem: key => (map.has(key) ? map.get(key) : null), setItem: (key, value) => map.set(key, value) };
}

test('daysTogether counts the hatch day itself as day 1', () => {
  const hatchedAt = '2026-09-07T00:00:00.000Z';
  assert.equal(daysTogether(hatchedAt, new Date('2026-09-07T08:00:00.000Z')), 1);
  assert.equal(daysTogether(hatchedAt, new Date('2026-09-08T08:00:00.000Z')), 2);
});

test('stageForLevel caps at the last stage for high levels', () => {
  assert.equal(stageForLevel(1), 'Egg');
  assert.equal(stageForLevel(6), 'Guardian');
  assert.equal(stageForLevel(50), 'Guardian');
});

test('loadProfile creates and persists a default profile on first run', () => {
  const storage = memoryStorage();
  const now = new Date('2026-07-22T00:00:00.000Z');
  const profile = loadProfile(storage, now);
  assert.equal(profile.hatchedAt, now.toISOString());
  assert.equal(storage.getItem(PROFILE_KEY) !== null, true);
});

test('saveProfile merges into the existing profile', () => {
  const storage = memoryStorage();
  loadProfile(storage, new Date('2026-07-22T00:00:00.000Z'));
  const updated = saveProfile(storage, { nickname: 'Emma' });
  assert.equal(updated.nickname, 'Emma');
  assert.equal(updated.hatchedAt, '2026-07-22T00:00:00.000Z');
});
