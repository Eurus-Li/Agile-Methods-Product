import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/js/skins.js';
import '../src/js/wheel-model.js';
const w = globalThis.RongrongWheel, skins = globalThis.RongrongSkins;
test('seven exclusive prizes have descending weights totaling 100', () => {
  assert.equal(w.pool.length,7); assert.equal(new Set(w.pool.map(p=>p.id)).size,7);
  assert.equal(w.pool.reduce((s,p)=>s+p.weight,0),100);
  assert.ok(w.pool.every(p=>skins.find(p.id).drawOnly));
  assert.ok(w.pool.every((p,i)=>!i || p.weight < w.pool[i-1].weight));
});
test('seven steps cover $1 to $10, total $34, then close', () => {
  assert.deepEqual(w.prices,[100,200,300,400,600,800,1000]);
  assert.equal(w.prices.reduce((a,b)=>a+b,0),3400); assert.equal(w.cost(7),null);
});
test('old and malformed wallet data normalize without changing journal', () => {
  const entries={today:{mood:'Calm'}};
  const s=w.normalize({entries,wheel:{balance:-5,toppedUp:'10',history:{}}});
  assert.deepEqual(s.entries,entries); assert.equal(s.wheel.balance,0); assert.equal(s.wheel.draws,0);
  assert.deepEqual(s.wheel.history,[]);
});
test('insufficient balance does not deduct or award a prize', () => {
  const s=w.normalize({}); const result=w.draw(s,0);
  assert.equal(result.error,'insufficient'); assert.deepEqual(result.state,s);
});
test('weighted boundaries select correct initial prizes', () => {
  for (const [sample,id] of [[0,0],[.319999,0],[.32,1],[.57,2],[.75,3],[.87,4],[.94,5],[.98,6],[.99999,6]]) assert.equal(w.pick({},sample).id,w.pool[id].id);
  assert.throws(()=>w.pick({},1)); assert.throws(()=>w.pick({},-1));
});
test('seven draws never repeat, even using the same random sample', () => {
  let s=w.topUp({},34); const ids=[];
  for(let i=0;i<7;i++) { const r=w.draw(s,0); assert.equal(r.error,undefined); assert.equal(r.result.cost,w.prices[i]); ids.push(r.result.id); s=r.state; }
  assert.equal(new Set(ids).size,7); assert.equal(s.wheel.balance,0);
  assert.equal(w.draw(s,0).error,'complete'); assert.equal(w.pick(s,0),null);
  assert.throws(()=>w.topUp(s,5));
});
test('remaining probabilities renormalize and owned prizes cannot win', () => {
  const s=w.draw(w.topUp({},5),0).state;
  const rest=w.remaining(s); assert.equal(rest.length,6);
  assert.equal(rest[0].probability,25/68);
  assert.ok(Math.abs(rest.reduce((n,p)=>n+p.probability,0)-1)<1e-12);
  for (let n=0;n<1000;n++) assert.notEqual(w.pick(s,n/1000).id,w.pool[0].id);
});
test('reward persists through reload and can be equipped on Home', () => {
  const s=w.draw(w.topUp({entries:{},plus:true,skin:'cream'},5),.99).state;
  const reloaded=w.normalize(JSON.parse(JSON.stringify(s)));
  assert.equal(reloaded.wheel.draws,1); assert.equal(reloaded.wheel.balance,400);
  assert.equal(skins.equip(reloaded,'wish-celestial').skin,'wish-celestial');
  assert.equal(skins.purchase({},'wish-celestial').skin,'cream');
  assert.equal(skins.equip({},'wish-celestial').skin,'cream');
});
test('presets and custom recharge amounts use exact integer coins', () => {
  assert.deepEqual(w.packs,[1,5,10]);
  assert.equal(w.topUp({},3).wheel.balance,300);
  assert.equal(w.topUp({},1.23).wheel.balance,123);
  assert.equal(w.topUp({},1.1).wheel.balance,110);
  assert.equal(w.topUp({},10).wheel.balance,1000);
  const original=w.normalize({}); w.topUp(original,5); assert.equal(original.wheel.balance,0);
});

test('top-up limit is enforced in transaction logic, not just the input', () => {
  assert.equal(w.topUp({},100).wheel.balance,10000);
  for (const bad of [100.01,101,0,-1,0.99,NaN,Infinity,'5',null,undefined,1.001]) {
    const original=w.normalize({});
    assert.throws(()=>w.topUp(original,bad),RangeError);
    assert.equal(original.wheel.balance,0);
  }
  const twice=w.topUp(w.topUp({},100),100);
  assert.equal(twice.wheel.balance,20000); // Per transaction, not a lifetime cap.
});

test('direct purchases remain wearable after wheel completion, reload and Plus cancellation', () => {
  let state = { plus: true };
  for (const id of ['mint', 'cherry', 'starlight']) state = skins.purchase(state, id);
  assert.equal(w.normalize(state).wheel.draws, 0);
  state = w.topUp(state, 34);
  for (let i = 0; i < 7; i++) state = w.draw(state, 0).state;
  state = w.normalize(JSON.parse(JSON.stringify({ ...state, plus: false })));
  for (const id of ['mint', 'cherry', 'starlight']) {
    assert.equal(skins.equip(state, id).skin, id);
    assert.deepEqual(skins.purchase(state, id).ownedSkins, state.ownedSkins);
  }
  assert.equal(state.wheel.draws, 7);
});

test('recolored legacy rewards preserve ownership and stay out of future draws', () => {
  const ids = ['wish-mint', 'wish-cherry', 'wish-starlight'];
  const state = w.normalize({ skin: ids[0], ownedSkins: ids, wheel: { history: [{ id: ids[0], cost: 100, number: 1 }] } });
  assert.equal(state.skin, ids[0]);
  assert.equal(state.wheel.draws, 3);
  assert.equal(state.wheel.history[0].id, ids[0]);
  assert.ok(w.remaining(state).every(p => !ids.includes(p.id)));
  assert.deepEqual(ids.map(id => skins.find(id).tone), ['pistachio', 'cocoa', 'silver']);
});
