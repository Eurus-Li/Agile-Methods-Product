import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/js/skins.js';
const { catalog, price, normalize, purchase, equip } = globalThis.RongrongSkins;
test('catalog uses free default and distinct one-time USD prices', () => {
  assert.deepEqual(catalog.map(price), ['Free', '$0.99 USD', '$1.99 USD', '$2.99 USD']);
});
test('old data migrates without losing journal or membership', () => {
  const old = { entries: { today: { mood: 'Calm' } }, plus: true };
  assert.deepEqual(normalize(old), { ...old, skin: 'cream', ownedSkins: ['cream'] });
});
test('malformed ownership and unowned selection fall back safely', () => {
  for (const ownedSkins of [null, 'mint', {}, ['unknown', 'cream', 'cream']]) {
    assert.deepEqual(normalize({ skin: 'mint', ownedSkins }), { skin: 'cream', ownedSkins: ['cream'] });
  }
});
test('locked skins cannot be equipped; unknown purchases are ignored', () => {
  const state = normalize({});
  assert.deepEqual(equip(state, 'mint'), state);
  assert.deepEqual(purchase(state, 'unknown'), state);
});
test('purchase equips, is idempotent, and leaves original state untouched', () => {
  const state = normalize({ plus: false, outfit: 'Crown' });
  const next = purchase(state, 'cherry');
  assert.equal(next.skin, 'cherry');
  assert.deepEqual(next.ownedSkins, ['cream', 'cherry']);
  assert.deepEqual(purchase(next, 'cherry'), next);
  assert.equal(state.skin, 'cream');
  assert.equal(next.plus, false);
  assert.equal(next.outfit, 'Crown');
});
test('ownership survives reload and membership cancellation, default remains wearable', () => {
  const bought = purchase({ plus: true }, 'starlight');
  const reloaded = normalize(JSON.parse(JSON.stringify({ ...bought, plus: false })));
  assert.equal(reloaded.skin, 'starlight');
  assert.equal(equip(reloaded, 'cream').skin, 'cream');
  assert.equal(equip(equip(reloaded, 'cream'), 'starlight').skin, 'starlight');
});
