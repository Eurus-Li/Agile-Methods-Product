import test from 'node:test';
import assert from 'node:assert/strict';
import { addCalendarMonth, parseMembership, isMembershipActive, createDemoMembershipStore, MEMBERSHIP_KEY } from '../src/commercialization.js';
function fixture(date = '2026-01-31T12:00:00.000Z') {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  let time = new Date(date);
  return { storage, store: createDemoMembershipStore(storage, () => time), setTime(value) { time = new Date(value); } };
}
test('one month clamps month-end and handles leap years and year boundaries', () => {
  assert.equal(addCalendarMonth('2026-01-31T12:00:00.000Z'), '2026-02-28T12:00:00.000Z');
  assert.equal(addCalendarMonth('2024-01-31T12:00:00.000Z'), '2024-02-29T12:00:00.000Z');
  assert.equal(addCalendarMonth('2026-12-15T12:00:00.000Z'), '2027-01-15T12:00:00.000Z');
});
test('activation persists and a fresh store can restore it', () => {
  const { store, storage } = fixture();
  assert.equal(store.load(), null);
  const member = store.activate();
  assert.deepEqual(createDemoMembershipStore(storage).load(), member);
});
test('duplicate activation does not extend an existing membership', () => {
  const { store, setTime } = fixture();
  const member = store.activate();
  setTime('2026-02-10T12:00:00.000Z');
  assert.deepEqual(store.activate(), member);
});
test('canceling renewal preserves access until expiry; expiry never auto-renews', () => {
  const { store } = fixture();
  const member = store.activate();
  const canceled = store.cancelRenewal();
  assert.equal(canceled.renewalEnabled, false);
  assert.equal(canceled.expiresAt, member.expiresAt);
  assert.equal(isMembershipActive(canceled, new Date('2026-02-28T11:59:59.999Z')), true);
  assert.equal(isMembershipActive(canceled, new Date(canceled.expiresAt)), false);
  assert.equal(isMembershipActive(member, new Date('2026-03-01')), false);
});
test('expired demo can be activated again; future membership is inactive', () => {
  const { store, setTime } = fixture();
  const old = store.activate();
  assert.equal(isMembershipActive(old, new Date('2025-12-01')), false);
  setTime('2026-03-01T00:00:00.000Z');
  const current = store.activate();
  assert.equal(current.expiresAt, '2026-04-01T00:00:00.000Z');
});
test('invalid or corrupted saved state is rejected safely', () => {
  for (const value of [null, '', '{', '{}', 'null', '[]', '{"version":99}']) assert.equal(parseMembership(value), null);
  const { store, storage } = fixture();
  const member = store.activate();
  for (const change of [{ expiresAt: 'invalid' }, { startedAt: 42 }, { plan: 'live' }, { renewalEnabled: 'yes' }, { expiresAt: '2099-01-01T00:00:00.000Z' }]) {
    storage.setItem(MEMBERSHIP_KEY, JSON.stringify({ ...member, ...change }));
    assert.equal(store.load(), null);
  }
});
test('storage failures do not silently claim successful activation', () => {
  const store = createDemoMembershipStore({ getItem: () => null, setItem: () => { throw new Error('quota'); } });
  assert.throws(() => store.activate(), /quota/);
  assert.throws(() => store.cancelRenewal(), /No active membership/);
});
