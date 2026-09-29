(() => {
  'use strict';
  const pool = Object.freeze([
    { id: 'wish-mint', name: 'Pistachio Picnic', rarity: 'Common', weight: 32, tone: 'pistachio' },
    { id: 'wish-cherry', name: 'Cocoa Cloud', rarity: 'Common', weight: 25, tone: 'cocoa' },
    { id: 'wish-starlight', name: 'Silver Mist', rarity: 'Rare', weight: 18, tone: 'silver' },
    { id: 'wish-honey', name: 'Honey Dream', rarity: 'Rare', weight: 12, tone: 'honey' },
    { id: 'wish-aurora', name: 'Aurora Waltz', rarity: 'Epic', weight: 7, tone: 'aurora' },
    { id: 'wish-peach', name: 'Peach Picnic', rarity: 'Epic', weight: 4, tone: 'peach' },
    { id: 'wish-celestial', name: 'Celestial Crown', rarity: 'Legendary', weight: 2, tone: 'celestial' }
  ].map(Object.freeze));
  const packs = Object.freeze([1, 5, 10]);
  const topUpLimits = Object.freeze({ minUSD: 1, maxUSD: 100, coinsPerUSD: 100 });
  function topUpCoins(dollars) {
    if (typeof dollars !== 'number' || !Number.isFinite(dollars) || dollars < topUpLimits.minUSD || dollars > topUpLimits.maxUSD || Number(dollars.toFixed(2)) !== dollars) {
      throw new RangeError(`Enter $${topUpLimits.minUSD}–$${topUpLimits.maxUSD}, with up to two decimal places.`);
    }
    return Math.round(dollars * topUpLimits.coinsPerUSD);
  }
  const prices = Object.freeze([100, 200, 300, 400, 600, 800, 1000]);
  const integer = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
  function normalize(state = {}) {
    const base = globalThis.RongrongSkins.normalize(state);
    const w = state.wheel || {};
    const acquired = pool.filter(p => base.ownedSkins.includes(p.id)).length;
    return { ...base, wheel: { balance: integer(w.balance), draws: acquired, toppedUp: integer(w.toppedUp), history: Array.isArray(w.history) ? w.history.filter(h => h && pool.some(p => p.id === h.id) && prices.includes(h.cost)).slice(0, 7) : [] } };
  }
  const cost = draws => prices[integer(draws)] ?? null;
  function remaining(state) {
    const normalized = normalize(state);
    const available = pool.filter(item => !normalized.ownedSkins.includes(item.id));
    const total = available.reduce((sum, item) => sum + item.weight, 0);
    return available.map(item => ({ ...item, probability: item.weight / total }));
  }
  function pick(state, random) {
    if (!Number.isFinite(random) || random < 0 || random >= 1) throw new RangeError('Invalid random sample');
    const available = remaining(state);
    if (!available.length) return null;
    const total = available.reduce((sum, item) => sum + item.weight, 0);
    let upper = 0;
    for (const item of available) { upper += item.weight; if (random < upper / total) return item; }
    return available.at(-1);
  }
  function topUp(state, dollars) {
    const amount = topUpCoins(dollars);
    const next = normalize(state);
    if (!remaining(next).length) throw new RangeError('Collection complete');
    if (!Number.isSafeInteger(next.wheel.balance + amount) || !Number.isSafeInteger(next.wheel.toppedUp + amount)) throw new RangeError('Balance limit reached');
    next.wheel.balance += amount; next.wheel.toppedUp += amount; return next;
  }
  function draw(state, random) {
    const next = normalize(state), amount = cost(next.wheel.draws);
    if (amount === null) return { state: next, error: 'complete' };
    if (next.wheel.balance < amount) return { state: next, error: 'insufficient' };
    const reward = pick(next, random);
    next.wheel.balance -= amount; next.wheel.draws++;
    next.ownedSkins = [...next.ownedSkins, reward.id];
    const result = { id: reward.id, cost: amount, number: next.wheel.draws };
    next.wheel.history = [result, ...next.wheel.history].slice(0, 7);
    return { state: next, result };
  }
  globalThis.RongrongWheel = Object.freeze({ pool, packs, prices, topUpLimits, topUpCoins, normalize, cost, remaining, pick, topUp, draw });
})();
