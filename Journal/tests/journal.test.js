import test from 'node:test';
import assert from 'node:assert/strict';
import { addEntry, computeStreak, computeMonthStats, loadEntries, ENTRIES_KEY } from '../src/journal.js';

function memoryStorage() {
  const map = new Map();
  return { getItem: key => (map.has(key) ? map.get(key) : null), setItem: (key, value) => map.set(key, value) };
}

test('addEntry persists an entry retrievable by loadEntries', () => {
  const storage = memoryStorage();
  const now = new Date('2026-09-07T12:00:00.000Z');
  addEntry(storage, { mood: 'calm', text: 'Quiet morning', now });
  const entries = loadEntries(storage);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].mood, 'calm');
  assert.equal(entries[0].dateISO, '2026-09-07');
});

test('computeStreak counts consecutive days ending today', () => {
  const now = new Date('2026-09-07T09:00:00.000Z');
  const entries = [
    { dateISO: '2026-09-07', mood: 'calm' },
    { dateISO: '2026-09-06', mood: 'happy' },
    { dateISO: '2026-09-05', mood: 'tired' },
    { dateISO: '2026-09-02', mood: 'sad' },
  ];
  assert.equal(computeStreak(entries, now), 3);
});

test('computeStreak counts back from yesterday when today has no entry', () => {
  const now = new Date('2026-09-07T09:00:00.000Z');
  const entries = [{ dateISO: '2026-09-06', mood: 'happy' }, { dateISO: '2026-09-05', mood: 'tired' }];
  assert.equal(computeStreak(entries, now), 2);
});

test('computeMonthStats finds the most frequent mood within the month only', () => {
  const entries = [
    { dateISO: '2026-09-01', mood: 'calm' },
    { dateISO: '2026-09-02', mood: 'calm' },
    { dateISO: '2026-09-03', mood: 'happy' },
    { dateISO: '2026-08-31', mood: 'angry' },
  ];
  const stats = computeMonthStats(entries, new Date('2026-09-15T00:00:00.000Z'));
  assert.equal(stats.daysLogged, 3);
  assert.equal(stats.mostFrequentMoodId, 'calm');
});

test('malformed storage falls back to an empty list', () => {
  const storage = memoryStorage();
  storage.setItem(ENTRIES_KEY, '{not json');
  assert.deepEqual(loadEntries(storage), []);
});
