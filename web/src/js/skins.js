(() => {
  'use strict';
  const catalog = Object.freeze([
    { id: 'cream', name: 'Classic Cream', cents: 0, motif: '', description: 'Your original soft little companion.' },
    { id: 'mint', name: 'Mint Cloud', cents: 99, motif: '🍃', description: 'A fresh mint tint and a little leaf.' },
    { id: 'cherry', name: 'Cherry Blossom', cents: 199, motif: '🌸', description: 'Rosy fluff with a spring blossom.' },
    { id: 'starlight', name: 'Starlight', cents: 299, motif: '🌙 ✨', description: 'Lavender fluff with moon and stars.' }
  ].map(Object.freeze));
  const find = id => catalog.find(skin => skin.id === id);
  const price = skin => skin.cents === 0 ? 'Free' : `$${(skin.cents / 100).toFixed(2)} USD`;
  function normalize(state) {
    const ownedSkins = [...new Set(['cream', ...(Array.isArray(state.ownedSkins) ? state.ownedSkins.filter(id => find(id)) : [])])];
    return { ...state, ownedSkins, skin: ownedSkins.includes(state.skin) ? state.skin : 'cream' };
  }
  function equip(state, id) {
    const next = normalize(state);
    return find(id) && next.ownedSkins.includes(id) ? { ...next, skin: id } : next;
  }
  function purchase(state, id) {
    const next = normalize(state);
    if (!find(id)) return next;
    return equip({ ...next, ownedSkins: [...new Set([...next.ownedSkins, id])] }, id);
  }
  globalThis.RongrongSkins = Object.freeze({ catalog, find, price, normalize, equip, purchase });
})();
