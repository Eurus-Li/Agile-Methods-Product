import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/js/activities.js';
const { catalog, recommend, normalizeEntry, select, changeMood } = globalThis.RongrongActivities;

test('every supported mood has exactly three unique complete recommendations', () => {
  assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  for (const mood of ['Calm', 'Happy', 'Tired', 'Sad', 'Tense']) {
    const items = recommend(mood);
    assert.equal(items.length, 3);
    assert.equal(new Set(items.map(item => item.id)).size, 3);
    for (const item of items) {
      assert.ok(item.name && item.description && item.minutes > 0);
      assert.ok(item.steps.length > 0 && item.steps.every(step => typeof step === 'string' && step.length > 0));
    }
    assert.deepEqual(recommend(mood), items);
  }
  assert.notDeepEqual(recommend('Happy'), recommend('Sad'));
});
test('invalid moods never produce recommendations or allow selection', () => {
  for (const mood of [null, undefined, '', 'unknown', 'constructor', '__proto__']) {
    assert.deepEqual(recommend(mood), []);
    assert.equal(select({ mood }, 'notice').activityId, null);
  }
  assert.equal(select(null, 'notice'), null);
});
test('old records migrate and invalid or unrelated IDs are cleared without losing data', () => {
  const entry = { mood: 'Calm', note: 'A quiet day', saved: true, hugged: true, created: '2026-09-22' };
  for (const activityId of [undefined, null, 'missing', 'water', {}, ['notice']]) {
    assert.deepEqual(normalizeEntry({ ...entry, activityId }), { ...entry, activityId: null });
  }
  assert.deepEqual(normalizeEntry(entry), { ...entry, activityId: null });
});
test('selection is immutable, replaceable, idempotent, and survives JSON reload', () => {
  const entry = { mood: 'Calm', note: 'keep me' };
  const chosen = select(entry, 'notice');
  assert.equal(entry.activityId, undefined);
  assert.equal(chosen.activityId, 'notice');
  assert.deepEqual(select(chosen, 'notice'), chosen);
  assert.deepEqual(normalizeEntry(JSON.parse(JSON.stringify(chosen))), chosen);
  assert.equal(select(chosen, 'music').activityId, 'music');
  assert.deepEqual(select(chosen, 'water'), chosen);
});
test('same mood preserves selection; changed mood clears it even when activity is shared', () => {
  const entry = select({ mood: 'Calm', note: 'note', saved: true, hugged: true, created: 'earlier' }, 'music');
  assert.deepEqual(changeMood(entry, 'Calm'), entry);
  assert.deepEqual(changeMood(entry, 'Sad'), { ...entry, mood: 'Sad', activityId: null });
  assert.equal(changeMood(undefined, 'Happy').activityId, null);
});
test('updating a historical entry leaves other dates and membership untouched', () => {
  const state = { plus: false, bond: 15, entries: { '2026-09-21': { mood: 'Sad' }, '2026-09-22': { mood: 'Happy' } } };
  state.entries['2026-09-21'] = select(state.entries['2026-09-21'], 'comfort');
  assert.deepEqual(state.entries['2026-09-22'], { mood: 'Happy' });
  assert.equal(state.bond, 15);
  assert.equal(state.plus, false);
});
