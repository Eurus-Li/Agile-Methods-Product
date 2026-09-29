(() => {
  'use strict';
  const model = globalThis.RongrongWheel, skins = globalThis.RongrongSkins;
  const key = 'rongrong-demo-v1', $ = id => document.getElementById(id);
  let state, pack = 1, customMode = false, busy = false, rotation = 0, lastFocus, storageOK = true;
  const modal = $('modal'), content = $('modal-content');
  let noticeTimer;
  const money = coins => `$${coins / 100}`;
  const probability = value => `${(value * 100).toFixed(2).replace(/\.00$/, '')}%`;
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || '{}');
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid saved data');
      storageOK = true; return model.normalize(raw);
    } catch { storageOK = false; return state || model.normalize({}); }
  }
  function persist(next) {
    try { localStorage.setItem(key, JSON.stringify(next)); state = next; return true; }
    catch { storageOK = false; $('status').textContent = 'Your browser could not save this action. Enable local storage and try again.'; return false; }
  }
  function node(tag, text, className) {
    const el = document.createElement(tag); if (text !== undefined) el.textContent = text;
    if (className) el.className = className; return el;
  }
  function button(label, fn, className = 'secondary') {
    const el = node('button', label, className); el.type = 'button'; el.addEventListener('click', fn); return el;
  }
  function pet(id) {
    const skin = skins.find(id) || skins.find('cream');
    const art = node('div', undefined, 'pet-art'); art.setAttribute('role', 'img');
    art.setAttribute('aria-label', `${model.pool.find(p => p.id === id)?.name || skin.name} skin preview`);
    const image = node('img'); image.src = 'assets/images/rongrong-cutout.png'; image.alt = ''; image.draggable = false;
    art.append(image); if (skin.motif) { const motif = node('span', skin.motif, 'motif'); motif.setAttribute('aria-hidden', 'true'); art.append(motif); }
    if (skin.tone || id !== 'cream') art.style.setProperty('--pet-tone', `var(--${skin.tone || id})`);
    return art;
  }
  function open(title) {
    if (!modal.open) lastFocus = document.activeElement;
    content.replaceChildren(); const heading = node('h2', title); heading.id = 'modal-title'; content.append(heading);
    if (!modal.open) modal.showModal(); $('close-modal').focus();
  }
  function close() { modal.close(); }
  $('close-modal').addEventListener('click', close);
  modal.addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); else document.querySelector('.tab-dock [aria-current="page"]')?.focus(); });
  function paragraph(text, className) { content.append(node('p', text, className)); }
  function render() {
    const { balance, draws, toppedUp } = state.wheel, cost = model.cost(draws), remaining = model.remaining(state);
    $('balance').textContent = balance.toLocaleString('en-US');
    $('header-balance').textContent = balance.toLocaleString('en-US');
    $('add-coins').hidden = cost === null || balance >= cost;
    $('wallet-next-price').textContent = cost === null ? 'Collection complete' : `${cost} coins · ${money(cost)}`;
    $('total-topup').textContent = money(toppedUp);
    $('draw-count').textContent = `${draws} of 7 spins`;
    $('spin-button').replaceChildren(document.createTextNode(cost === null ? 'Collection complete ✓' : busy ? 'Making a little wish…' : `Spin ${draws + 1}`));
    if (cost !== null && !busy) $('spin-button').append(node('span', `✦ ${cost} · ${money(cost)}`));
    $('spin-button').disabled = busy || cost === null || !storageOK;
    $('next-price').textContent = cost === null ? 'All seven looks are yours. Thanks for every little wish.' : `This spin: ${cost} coins (${money(cost)} USD)${draws < 6 ? ` · Next spin: ${money(model.cost(draws + 1))}` : ' · Final spin in this collection'}`;
    $('status').textContent = !storageOK ? 'Local data could not be read. Actions are paused to protect your saved progress.' : cost !== null && balance < cost ? `You need ${cost - balance} more coins. Add a demo top-up in My Star Coins.` : '';
    renderTopUp(cost);
    renderOdds();
    $('price-steps').replaceChildren(...model.prices.map((price, index) => {
      const el = node('div', undefined, `step${index < draws ? ' done' : index === draws ? ' active' : ''}`);
      el.append(node('small', index < draws ? '✓' : `Spin ${index + 1}`), document.createTextNode(money(price)));
      if (index === draws) el.setAttribute('aria-current', 'step'); return el;
    }));
    $('equipped-pet').replaceChildren(pet(state.skin));
    $('equipped-name').textContent = model.pool.find(p => p.id === state.skin)?.name || skins.find(state.skin).name;
    $('collection-count').textContent = `${7 - remaining.length} of 7 owned`;
    $('collection-grid').replaceChildren(...model.pool.map(item => {
      const owned = state.ownedSkins.includes(item.id), equipped = state.skin === item.id;
      const card = node('article', undefined, `skin-card${equipped ? ' selected' : ''}`); card.style.setProperty('--card-tone', `var(--${item.tone})`);
      const top = node('div', undefined, 'card-top'); top.append(node('span', item.rarity, 'rarity'), node('span', `${item.weight}%`, 'chance'));
      const current = remaining.find(p => p.id === item.id);
      const action = button(equipped ? '✓ Equipped' : owned ? 'Equip skin' : 'Preview skin', () => owned ? equip(item.id) : preview(item)); action.disabled = busy || equipped;
      action.setAttribute('aria-label', `${action.textContent} · ${item.name}`);
      card.append(top, pet(item.id), node('h3', item.name), node('p', 'Initial odds', 'subtle'), node('p', owned ? 'Owned · Out of the pool' : `Current odds: ${probability(current.probability)}`, 'current-odds'), action); return card;
    }));
    for (const el of $('wheel').children) {
      const owned = state.ownedSkins.includes(el.dataset.id); el.classList.toggle('collected', owned);
      el.querySelector('.taken').textContent = owned ? '✓ Owned' : '';
    }
    $('history-list').replaceChildren(...(state.wheel.history.length ? state.wheel.history.map(h => {
      const row = node('div', undefined, 'history-entry'); row.append(node('span', `Spin ${h.number} · ${model.pool.find(p => p.id === h.id).name}`), node('span', `−${h.cost} coins · ${money(h.cost)}`)); return row;
    }) : [node('p', 'No wishes yet. Each spin will leave a new little look here.', 'empty')]));
  }
  function equip(id) {
    state = read(); if (!storageOK) { render(); return; }
    if (persist(skins.equip(state, id))) { close(); render(); navigate('wardrobe'); notify('Equipped! Your companion is wearing this look on Home, too.'); }
  }
  function preview(item) {
    open(item.name); content.append(pet(item.id));
    paragraph(`${item.rarity} exclusive skin · ${skins.find(item.id).motif}`);
    const available = model.remaining(state).find(p => p.id === item.id);
    paragraph(`Initial odds: ${item.weight}% · ${available ? `Current odds: ${probability(available.probability)}` : 'Owned and removed from the pool'}`);
    paragraph('Equip a skin as soon as you win it. All seven are unique; owned skins leave the pool.', 'subtle');
    content.append(button('Back to wheel', () => navigate('wheel'), 'primary'), button('Close preview', close));
  }
  function renderOdds() {
    $('odds-list').replaceChildren(...model.pool.map(item => {
      const current = model.remaining(state).find(p => p.id === item.id), row = node('div', undefined, 'rule-row');
      const name = node('span', item.name); name.append(node('small', `${item.rarity} · Initial ${item.weight}%`));
      row.append(name, node('span', current ? probability(current.probability) : 'Owned')); return row;
    }));
    $('odds-summary').textContent = model.remaining(state).length ? 'Remaining odds total 100%. Displayed percentages are rounded.' : 'Collection complete. All seven skins are yours.';
  }
  function notify(message) {
    clearTimeout(noticeTimer); $('notice').textContent = message;
    noticeTimer = setTimeout(() => { $('notice').textContent = ''; }, 4000);
  }
  function navigate(page) {
    close();
    if (location.hash === `#${page}`) showPage(); else location.hash = page;
  }
  function showPage(focus = true) {
    let page = location.hash.slice(1);
    if (!['wheel', 'wallet', 'wardrobe', 'odds'].includes(page)) { page = 'wheel'; history.replaceState(null, '', '#wheel'); }
    document.querySelectorAll('[data-page]').forEach(el => { el.hidden = el.dataset.page !== page; });
    document.querySelectorAll('.tab-dock a').forEach(el => {
      if (el.dataset.go === (page === 'odds' ? 'wheel' : page)) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    document.title = `${{ wheel: 'Wishing Wheel', wallet: 'Star Wallet', wardrobe: 'Wish Wardrobe', odds: 'Odds & Rules' }[page]} · Rongrong`;
    $('page-content').scrollTop = 0;
    if (focus) document.querySelector(`[data-page="${page}"] h1`)?.focus({ preventScroll: true });
  }
  async function transact(fn) {
    // Serialize the entire read-modify-write across tabs of the same origin.
    if (navigator.locks) return navigator.locks.request('rongrong-demo-write', fn);
    return fn();
  }
  function selectedAmount() {
    const raw = $('custom-amount').value.trim();
    const dollars = customMode ? (raw ? Number(raw) : NaN) : pack;
    try { return { dollars, coins: model.topUpCoins(dollars) }; }
    catch (error) { return { error: error.message }; }
  }
  function updateTopUp() {
    const amount = selectedAmount(), complete = model.cost(state.wheel.draws) === null;
    const input = $('custom-amount');
    input.disabled = busy || complete || !storageOK;
    input.setAttribute('aria-invalid', String(customMode && !!amount.error));
    $('custom-error').textContent = customMode && amount.error ? amount.error : '';
    $('custom-coins').textContent = !amount.error && customMode ? `You receive ${amount.coins.toLocaleString('en-US')} Star Coins.` : '';
    $('topup-button').textContent = complete ? 'Collection complete' : amount.error ? 'Enter a valid amount' : `Demo top-up · ${money(amount.coins)}`;
    $('topup-button').disabled = busy || complete || !storageOK || !!amount.error;
  }
  function renderTopUp(cost) {
    const active = document.activeElement;
    const focusPack = active?.dataset?.pack;
    const choices = model.packs.map(dollars => {
      const el = button('', () => { pack = dollars; customMode = false; renderTopUp(model.cost(state.wheel.draws)); }, 'pack');
      el.append(node('strong', `$${dollars}`), node('small', `${dollars * model.topUpLimits.coinsPerUSD} coins`));
      el.dataset.pack = String(dollars);
      el.setAttribute('aria-label', `$${dollars} top-up, ${dollars * model.topUpLimits.coinsPerUSD} coins`);
      el.setAttribute('aria-pressed', String(!customMode && pack === dollars)); el.disabled = busy || cost === null; return el;
    });
    const custom = button('', () => { customMode = true; renderTopUp(model.cost(state.wheel.draws)); $('custom-amount').focus(); }, 'pack');
    custom.append(node('strong', 'Custom'), node('small', 'Up to $100'));
    custom.dataset.pack = 'custom'; custom.setAttribute('aria-pressed', String(customMode));
    custom.setAttribute('aria-controls', 'custom-topup'); custom.disabled = busy || cost === null;
    $('packs').replaceChildren(...choices, custom);
    $('custom-topup').hidden = !customMode;
    updateTopUp();
    if (focusPack) [...$('packs').children].find(el => el.dataset.pack === focusPack)?.focus();
  }
  function topup() {
    const selected = selectedAmount();
    if (selected.error) { updateTopUp(); $('custom-amount').focus(); return; }
    const chosen = selected.dollars;
    open('Confirm demo top-up');
    paragraph(`Simulate ${money(selected.coins)} USD to receive ${selected.coins.toLocaleString('en-US')} Star Coins.`);
    paragraph(`Maximum $${model.topUpLimits.maxUSD} per top-up. This only adds demo coins. No payment page will open and no real charge will be made.`, 'subtle');
    const confirm = button(`Confirm demo top-up · ${money(selected.coins)}`, async () => {
      confirm.disabled = true;
      await transact(() => {
        state = read(); if (!storageOK) { close(); render(); return; }
        try { if (persist(model.topUp(state, chosen))) { close(); render(); navigate('wheel'); notify(`${selected.coins.toLocaleString('en-US')} demo coins added. No real charge.`); } else { close(); render(); } }
        catch { close(); render(); notify('Top-up unavailable. Check the amount, balance or collection status.'); }
      });
    }, 'primary'); content.append(confirm, button('Cancel', close));
  }
  function requestSpin() {
    state = read(); render(); if (!storageOK || busy || model.cost(state.wheel.draws) === null) return;
    const quotedCost = model.cost(state.wheel.draws), quotedDraws = state.wheel.draws;
    if (state.wheel.balance < quotedCost) { open('A few more coins'); paragraph(`This spin needs ${quotedCost} coins. Your balance is ${state.wheel.balance} coins. No coins have been spent and no spin has been used.`); content.append(button('Choose a demo top-up', () => navigate('wallet'), 'primary')); return; }
    open(`Spin ${quotedDraws + 1} · Confirm your wish`);
    paragraph(`Spend ${quotedCost} coins (${money(quotedCost)} USD equivalent). Your balance will be ${state.wheel.balance - quotedCost} coins.`);
    paragraph(`${model.remaining(state).length} skins remain. Each spin awards one skin you do not own. ${quotedDraws < 6 ? `Next spin: ${money(model.cost(quotedDraws + 1))}.` : 'This is the last skin in this collection.'}`, 'subtle');
    const confirm = button(`Confirm spin · ${quotedCost} coins`, async () => {
      confirm.disabled = true; if (busy) return; busy = true;
      let outcome;
      await transact(() => {
        state = read();
        if (!storageOK || state.wheel.draws !== quotedDraws) return;
        const random = new Uint32Array(1); crypto.getRandomValues(random);
        const next = model.draw(state, random[0] / 4294967296);
        if (!next.error && persist(next.state)) outcome = next.result;
      });
      close();
      if (!outcome) { busy = false; render(); $('status').textContent = 'Your balance or prize pool changed. No spin was made. Please confirm again.'; return; }
      const index = model.pool.findIndex(item => item.id === outcome.id), angle = (index + .5) * 360 / 7;
      const target = (360 - angle) % 360;
      rotation = rotation + 360 * 5 + ((target - rotation % 360 + 360) % 360);
      render(); $('wheel').style.transform = `rotate(${rotation}deg)`;
      const finish = () => { busy = false; state = read(); render(); showResult(outcome); };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish(); else setTimeout(finish, 3100);
    }, 'primary'); content.append(confirm, button('Not now', close));
  }
  function showResult(result) {
    const item = model.pool.find(p => p.id === result.id);
    open('A new little look, just for you');
    const resultArt = node('div', undefined, 'result'); resultArt.append(node('p', `${item.rarity} · NEW COMPANION LOOK`, 'modal-kicker'), pet(item.id), node('h3', item.name)); content.append(resultArt);
    paragraph(`Added to your wardrobe · ${result.cost} coins spent. This skin has left the pool and cannot be won again.`, 'subtle');
    content.append(button('Wear it now', () => equip(item.id), 'primary'), button('View wardrobe', () => navigate('wardrobe')));
  }
  const wheel = $('wheel');
  wheel.style.background = `conic-gradient(${model.pool.map((p,i) => `var(--${p.tone}) ${i * 360 / 7}deg ${(i + 1) * 360 / 7}deg`).join(',')})`;
  model.pool.forEach((p, i) => {
    const el = node('div', undefined, 'wheel-item'); el.style.setProperty('--angle', `${(i + .5) * 360 / 7}deg`); el.dataset.id = p.id;
    el.append(pet(p.id), node('small', p.name), node('small', '', 'taken')); wheel.append(el);
  });
  $('custom-amount').min = model.topUpLimits.minUSD;
  $('custom-amount').max = model.topUpLimits.maxUSD;
  $('custom-amount').addEventListener('input', updateTopUp);
  document.querySelectorAll('[data-go]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (busy) { notify('Your wish is spinning. Just a moment.'); return; }
    navigate(link.dataset.go);
  }));
  window.addEventListener('hashchange', () => { close(); showPage(); });
  $('spin-button').addEventListener('click', requestSpin); $('topup-button').addEventListener('click', topup);
  window.addEventListener('storage', event => { if (event.key === key && !busy) { state = read(); render(); } });
  window.addEventListener('pageshow', () => { if (!busy) { state = read(); render(); } });
  state = read(); render(); showPage(false);
})();
