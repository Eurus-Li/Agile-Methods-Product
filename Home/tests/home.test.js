import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBondLevel, loadBondPoints, addBondPoints, BOND_KEY } from '../src/home.js';

function memoryStorage() {
  const map = new Map();
  return { getItem: key => (map.has(key) ? map.get(key) : null), setItem: (key, value) => map.set(key, value) };
}

test('computeBondLevel starts at level 1 with zero progress', () => {
  assert.deepEqual(computeBondLevel(0), { level: 1, progress: 0, pointsToNext: 100 });
});

test('computeBondLevel rolls over into the next level at 100 points', () => {
  assert.deepEqual(computeBondLevel(115), { level: 2, progress: 15, pointsToNext: 85 });
});

test('addBondPoints accumulates and persists points', () => {
  const storage = memoryStorage();
  addBondPoints(storage, 15);
  addBondPoints(storage, 15);
  assert.equal(loadBondPoints(storage), 30);
  assert.equal(storage.getItem(BOND_KEY), '30');
});

test('loadBondPoints ignores corrupt values', () => {
  const storage = memoryStorage();
  storage.setItem(BOND_KEY, 'not-a-number');
  assert.equal(loadBondPoints(storage), 0);
});
