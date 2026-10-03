import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/js/profile.js';
const { normalize, cleanPetName, cleanGoals, address, isBirthday, backup, backupFileName, GOALS_MAX } = globalThis.RongrongProfile;
test('old data migrates with profile defaults and keeps existing fields', () => {
  const old = { nickname: 'Emma', birthday: '2000-09-15', entries: { '2026-09-01': { mood: 'Calm' } }, bond: 40 };
  assert.deepEqual(normalize(old), { ...old, petName: 'Rongrong', callMe: 'nickname', goals: [] });
});
test('pet name is trimmed, collapsed, capped at 20 and falls back to Rongrong', () => {
  assert.equal(cleanPetName('  Mochi   Bun  '), 'Mochi Bun');
  assert.equal(cleanPetName('A'.repeat(30)), 'A'.repeat(20));
  for (const value of ['', '   ', null, 42, {}]) assert.equal(cleanPetName(value), 'Rongrong');
});
test('call-me preference rejects unknown values and addresses the user', () => {
  assert.equal(normalize({ callMe: 'boss' }).callMe, 'nickname');
  assert.equal(address({ nickname: 'Emma', callMe: 'nickname' }), 'Emma');
  assert.equal(address({ nickname: 'Emma', callMe: 'dear' }), 'dear');
  assert.equal(address({ nickname: '   ', callMe: 'nickname' }), 'friend');
  assert.equal(address({ nickname: 'x'.repeat(40) }), 'x'.repeat(30));
});
test('goals keep known unique ids, capped at three', () => {
  assert.deepEqual(cleanGoals(['sleep', 'unknown', 'sleep', 'calm', 'kind', 'move']), ['sleep', 'calm', 'kind']);
  assert.equal(cleanGoals(['sleep', 'calm', 'kind', 'move']).length, GOALS_MAX);
  for (const value of [null, 'sleep', {}]) assert.deepEqual(cleanGoals(value), []);
});
test('birthday matches month and day, with Feb 29 on Feb 28 in non-leap years', () => {
  assert.equal(isBirthday('2000-09-15', '2026-09-15'), true);
  assert.equal(isBirthday('2000-09-15', '2026-09-16'), false);
  assert.equal(isBirthday('2004-02-29', '2027-02-28'), true);
  assert.equal(isBirthday('2004-02-29', '2028-02-28'), false);
  assert.equal(isBirthday('2004-02-29', '2028-02-29'), true);
  for (const value of ['', 'not a date', undefined]) assert.equal(isBirthday(value, '2026-09-15'), false);
});
test('backup wraps normalized state without mutating it and survives a JSON round trip', () => {
  const state = { nickname: 'Emma', petName: '  Mochi ', goals: ['sleep', 'nope'] };
  const file = backup(state, '2026-09-29T10:00:00.000Z');
  assert.deepEqual(file, { app: 'rongrong', format: 'rongrong-demo-v1', exportedAt: '2026-09-29T10:00:00.000Z', data: { nickname: 'Emma', petName: 'Mochi', callMe: 'nickname', goals: ['sleep'] } });
  assert.deepEqual(JSON.parse(JSON.stringify(file)), file);
  assert.equal(state.petName, '  Mochi ');
  assert.equal(backupFileName('2026-09-29'), 'rongrong-backup-2026-09-29.json');
});
const { growth, stageUp, growthStages } = globalThis.RongrongProfile;
test('growth stages follow bond thresholds and report progress to the next stage', () => {
  assert.deepEqual(growthStages.map(stage => stage.minBond), [0, 200, 500, 1000]);
  assert.equal(growth(0).stage.id, 'fluff');
  assert.equal(growth(199).stage.id, 'fluff');
  assert.equal(growth(200).stage.id, 'sprout');
  assert.deepEqual({ toNext: growth(350).toNext, progress: growth(350).progress, next: growth(350).next.id }, { toNext: 150, progress: 0.5, next: 'bloom' });
  assert.deepEqual({ stage: growth(5000).stage.id, next: growth(5000).next, toNext: growth(5000).toNext, progress: growth(5000).progress }, { stage: 'glow', next: null, toNext: 0, progress: 1 });
});
test('invalid bond is treated as zero', () => {
  for (const value of [NaN, -50, undefined, '300', Infinity]) assert.equal(growth(value).stage.id, 'fluff');
});
test('stageUp only fires when a threshold is crossed', () => {
  assert.equal(stageUp(185, 200).id, 'sprout');
  assert.equal(stageUp(490, 505).id, 'bloom');
  assert.equal(stageUp(200, 215), null);
  assert.equal(stageUp(1000, 1015), null);
});
