(() => {
  'use strict';
  const KEY = 'pip-demo-v1';
  const moods = ['Calm', 'Happy', 'Tired', 'Sad', 'Tense'];
  const colors = { Calm: '#ddebdc', Happy: '#ffe3b5', Tired: '#e6dff4', Sad: '#dce6f2', Tense: '#f4d8d8' };
  const replies = {
    Calm: "A quiet little moment. Let's keep it close. You don't have to fill every bit of today — we can just enjoy being here together.",
    Happy: "Look at you glowing! I’m doing a tiny happy dance over here. What made you smile today? Let's save a little of that sunshine.",
    Tired: "You've been carrying a lot today. It's okay to slow down. Find somewhere soft, take a sip of water, and let this moment be enough.",
    Sad: "Sad days are allowed to just be sad. You showed up and told me anyway — that counts for something. I'll sit here with you for a bit.",
    Tense: "We don't have to untangle everything right now. Let your shoulders settle, take one easy breath, and we'll go one small step at a time."
  };
  const outfits = { Crown: '👑', Glasses: '👓', Sweater: '🧣', Headset: '🎧', Flower: '🌸', Umbrella: '☂️', Nightcap: '💤', Aura: '✨', Bow: '🎀', Scarf: '🧣', Star: '⭐', Butterfly: '🦋' };
  const freeOutfits = ['Crown', 'Glasses', 'Sweater', 'Headset'];
  const app = document.querySelector('#app');
  const dialog = document.querySelector('#dialog');
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = dateKey();
  const defaults = () => ({ nickname: 'Emma', birthday: '2000-09-15', outfit: 'Crown', plus: false, entries: {}, bond: 0, started: today });
  let state = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') {
      state = { ...state, ...saved };
      state.entries = Object.fromEntries(Object.entries(saved.entries || {}).filter(([key, entry]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && entry && moods.includes(entry.mood)));
      if (!(state.outfit in outfits)) state.outfit = 'Crown';
      state.bond = Number.isFinite(state.bond) ? Math.max(0, state.bond) : 0;
    }
  } catch { /* A fresh session also works when storage is unavailable. */ }
  let route = 'home';
  let returnFromPlus = 'home';
  let selectedDate = today;
  let calendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let calendarMode = 'month';
  let toastTimer;
  let lastFocus;
  const named = (name, root = app) => root.querySelector(`[data-pencil-name="${name}"]`);
  const allNamed = (name, root = app) => [...root.querySelectorAll(`[data-pencil-name="${name}"]`)];
  const text = (name, value, root = app) => { const element = named(name, root); if (element) element.textContent = value; };
  function toast(message) {
    const node = document.querySelector('#toast');
    node.textContent = message;
    node.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('visible'), 3000);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch { toast('Browser storage is unavailable. Changes last for this session.'); }
  }
  function actionable(element, callback, label) {
    if (!element) return;
    element.setAttribute('role', 'button');
    element.tabIndex = 0;
    if (label) element.setAttribute('aria-label', label);
    element.addEventListener('click', callback);
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(event); }
    });
  }
  const bind = (name, fn, label, root = app) => actionable(named(name, root), fn, label);
  function button(label, callback, className = 'secondary') {
    const node = document.createElement('button');
    node.type = 'button'; node.className = className; node.textContent = label;
    node.addEventListener('click', callback); return node;
  }
  function paragraph(content, root = dialog, className = '') {
    const node = document.createElement('p'); node.textContent = content; node.className = className; root.append(node); return node;
  }
  function closeDialog() { dialog.close(); }
  function openDialog(title) {
    if (dialog.open) dialog.close();
    lastFocus = document.activeElement;
    dialog.replaceChildren(button('×', closeDialog, 'dialog-close'));
    dialog.firstChild.setAttribute('aria-label', 'Close dialog');
    const heading = document.createElement('h2'); heading.id = 'dialog-title'; heading.textContent = title; dialog.append(heading);
    dialog.showModal();
  }
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); });
  function navigate(next) {
    if (dialog.open) closeDialog();
    if (next === 'plus' && route !== 'plus') returnFromPlus = route === 'reply' ? 'home' : route;
    if (location.hash === `#${next}`) render(); else location.hash = next;
  }
  function streak() {
    const day = new Date(); let count = 0;
    if (!state.entries[dateKey(day)]) day.setDate(day.getDate() - 1);
    while (state.entries[dateKey(day)]) { count++; day.setDate(day.getDate() - 1); }
    return count;
  }
  const level = () => 7 + Math.floor(state.bond / 100);
  function render() {
    route = location.hash.slice(1);
    if (!['home', 'reply', 'journal', 'me', 'plus'].includes(route)) { route = 'home'; history.replaceState(null, '', '#home'); }
    app.replaceChildren(document.querySelector(`#page-${route}`).content.cloneNode(true));
    document.title = `Pip · ${{ home: 'Your little companion', reply: 'Pip heard you', journal: 'Journal', me: 'Me', plus: 'Plus' }[route]}`;
    allNamed('Time').forEach(node => { node.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); });
    for (const [tab, destination] of [['Tab Pip', 'home'], ['Tab Journal', 'journal'], ['Tab Me', 'me']]) {
      bind(tab, () => navigate(destination), destination === 'home' ? 'Pip home' : destination === 'me' ? 'Me' : 'Journal');
      if (route === destination || route === 'reply' && destination === 'home') named(tab)?.setAttribute('aria-current', 'page');
    }
    allNamed('Count').filter(node => node.parentElement.dataset.pencilName === 'Streak').forEach(node => node.textContent = streak());
    if (route === 'home' || route === 'reply') setupHome();
    if (route === 'reply') setupReply();
    if (route === 'journal') setupJournal();
    if (route === 'me') setupMe();
    if (route === 'plus') setupPlus();
  }
  function setupHome() {
    named('Header Actions').append(button(state.plus ? 'Plus ✓' : '✦ Plus', () => navigate('plus'), 'plus-shortcut'));
    text('Days', `Day ${Math.max(1, Math.floor((new Date(today + 'T12:00:00') - new Date(state.started + 'T12:00:00')) / 86400000) + 1)} together`);
    const existing = state.entries[today];
    if (existing) text('Prompt', `Today: ${existing.mood.toLowerCase()} · check in again?`);
    for (const mood of moods) {
      const tile = named(mood, named('Quick Moods'));
      tile.setAttribute('aria-pressed', String(existing?.mood === mood));
      actionable(tile, () => {
        const previous = state.entries[today];
        state.entries[today] = { mood, note: previous?.note || '', saved: previous?.saved || false, hugged: previous?.hugged || false, created: new Date().toISOString() };
        if (!previous) state.bond += 15;
        selectedDate = today; save(); navigate('reply');
      }, `Feeling ${mood.toLowerCase()}`);
    }
    bind('Sprite Pip', () => {
      const sprite = named('Sprite Pip'); sprite.classList.remove('petting'); void sprite.offsetWidth; sprite.classList.add('petting');
      text('Line', `That feels nice, ${String(state.nickname).slice(0, 30)} ♡`);
    }, 'Pet Pip');
    const accessory = document.createElement('span'); accessory.className = 'outfit'; accessory.textContent = outfits[state.outfit]; accessory.setAttribute('aria-label', state.outfit); named('Stage').append(accessory);
  }
  function setupReply() {
    const entry = state.entries[selectedDate] || state.entries[today];
    const mood = entry?.mood || 'Sad';
    const moodState = named('Mood State');
    text('Label', `Today · ${mood.toLowerCase()}`, moodState);
    text('Emoji', { Calm: '🍃', Happy: '☀️', Tired: '🌙', Sad: '☁️', Tense: '🌧️' }[mood], moodState);
    const sheet = named('Reply Sheet');
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Pip heard you');
    for (const child of app.firstElementChild.children) if (child !== sheet && child !== named('Scrim')) child.inert = true;
    text('Reply', replies[mood], sheet);
    text('Sub', `Feeling ${mood.toLowerCase()} · ${entry ? 'just now' : 'sample reply'}`, named('Meta', sheet));
    text('Label', `Bond Lv.${level()}`, named('Bond', sheet));
    text('Gain', entry ? '♡ Together' : 'Preview', named('Bond', sheet));
    named('Fill', named('Bond', sheet)).style.width = `${30 + state.bond % 100 * .7}%`;
    bind('Close', () => navigate('home'), 'Close reply', sheet);
    named('Scrim').addEventListener('click', () => navigate('home'));
    bind('Hug Button', () => {
      if (entry && !entry.hugged) { entry.hugged = true; state.bond += 5; save(); }
      text('Label', 'Hug received ♡', named('Hug Button', sheet));
      text('Label', `Bond Lv.${level()}`, named('Bond', sheet));
      named('Fill', named('Bond', sheet)).style.width = `${30 + state.bond % 100 * .7}%`;
      toast('Pip is hugging you right back ♡');
    }, 'Hug Pip', sheet);
    bind('Save Button', () => {
      if (!entry) { toast('Choose a mood on Home to start your journal.'); return; }
      entry.saved = !entry.saved; save(); updateSaved(); toast(entry.saved ? 'Reply saved to your journal' : 'Reply bookmark removed');
    }, 'Save reply', sheet);
    function updateSaved() { named('Save Button', sheet).setAttribute('aria-pressed', String(!!entry?.saved)); named('Save Button', sheet).style.backgroundColor = entry?.saved ? '#ffe3d3' : '#fbf3ec'; }
    updateSaved();
    requestAnimationFrame(() => named('Close', sheet)?.focus());
    sheet.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); navigate('home'); }
      if (event.key === 'Tab') {
        const items = [...sheet.querySelectorAll('[tabindex="0"]')];
        if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
      }
    });
  }
  function setupJournal() {
    bind('Month', () => { calendarMode = 'month'; render(); }, 'Month view', named('Switch'));
    bind('Year', () => { calendarMode = 'year'; render(); }, 'Year view', named('Switch'));
    for (const mode of ['Month', 'Year']) named(mode, named('Switch')).setAttribute('aria-selected', String(calendarMode === mode.toLowerCase()));
    const calendar = named('Calendar');
    [...calendar.children].filter(node => /^Week \d/.test(node.dataset.pencilName || '')).forEach(node => node.remove());
    text('Month', calendarMode === 'year' ? String(calendarDate.getFullYear()) : calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), named('Cal Head'));
    named('Arrows').replaceChildren(...[-1, 1].map(direction => {
      const node = button(direction === -1 ? '‹' : '›', () => { calendarDate = new Date(calendarDate.getFullYear() + (calendarMode === 'year' ? direction : 0), calendarDate.getMonth() + (calendarMode === 'month' ? direction : 0), 1); render(); }, 'calendar-nav');
      node.setAttribute('aria-label', `${direction === -1 ? 'Previous' : 'Next'} ${calendarMode}`); return node;
    }));
    const grid = document.createElement('div'); grid.className = calendarMode === 'month' ? 'calendar-grid' : 'year-grid';
    calendar.insertBefore(grid, named('Legend', calendar));
    if (calendarMode === 'year') {
      named('Weekdays').style.display = 'none';
      for (let month = 0; month < 12; month++) {
        const date = new Date(calendarDate.getFullYear(), month, 1);
        const prefix = dateKey(date).slice(0, 7);
        const node = button(date.toLocaleDateString('en-US', { month: 'short' }), () => { calendarDate = date; calendarMode = 'month'; render(); }, '');
        const count = document.createElement('small'); count.textContent = `${Object.keys(state.entries).filter(key => key.startsWith(prefix)).length} days`; node.append(count); grid.append(node);
      }
    } else {
      const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
      const offset = (new Date(year, month, 1).getDay() + 6) % 7;
      for (let i = 0; i < offset; i++) grid.append(document.createElement('span'));
      for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const key = dateKey(new Date(year, month, day)); const entry = state.entries[key];
        const node = button(String(day), () => showEntry(key), `calendar-day${key === today ? ' today' : ''}${entry ? ' has-entry' : ''}`);
        if (entry) node.style.backgroundColor = colors[entry.mood];
        node.setAttribute('aria-label', `${key}${entry ? `, ${entry.mood}` : ', no entry'}`);
        if (key === today) node.setAttribute('aria-current', 'date'); grid.append(node);
      }
    }
    const legend = named('Legend', calendar); legend.replaceChildren();
    for (const mood of moods) { const item = document.createElement('span'); item.textContent = mood; item.style.cssText = `font-size:10px;border-bottom:3px solid ${colors[mood]};padding-bottom:3px`; legend.append(item); }
    const prefix = dateKey(calendarDate).slice(0, calendarMode === 'year' ? 4 : 7);
    const entries = Object.entries(state.entries).filter(([key]) => key.startsWith(prefix));
    text('V', entries.length, named('Days logged'));
    text('V', mostFrequent(entries), named('Most frequent'));
    text('V', streak(), named('Day streak'));
    text('Title', `${calendarDate.toLocaleDateString('en-US', { month: 'long' })} report`, named('Monthly Report Button'));
    bind('Monthly Report Button', showReport, 'Open monthly report');
  }
  function mostFrequent(entries) {
    if (!entries.length) return '—';
    const counts = Object.fromEntries(moods.map(mood => [mood, entries.filter(([, entry]) => entry.mood === mood).length]));
    return moods.slice().sort((a, b) => counts[b] - counts[a])[0];
  }
  function showEntry(key) {
    const entry = state.entries[key]; openDialog(new Date(key + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    if (!entry) {
      paragraph(key > today ? 'A little space for a day still to come.' : 'No check-in recorded for this day.');
      if (key === today) dialog.append(button('Check in with Pip', () => navigate('home'), 'primary'));
      return;
    }
    paragraph(entry.mood, dialog, 'entry-mood').style.backgroundColor = colors[entry.mood];
    paragraph(replies[entry.mood]);
    if (entry.saved) paragraph('♡ Saved reply', dialog, 'muted');
    const label = document.createElement('label'); label.htmlFor = 'entry-note'; label.textContent = 'A little note about your day';
    const input = document.createElement('textarea'); input.id = 'entry-note'; input.maxLength = 1000; input.value = entry.note || ''; input.placeholder = 'What would you like to remember?';
    dialog.append(label, input, button('Save note', () => { entry.note = input.value.trim(); save(); closeDialog(); toast('Your note is saved'); }, 'primary'));
  }
  function showReport() {
    const prefix = dateKey(calendarDate).slice(0, 7);
    const entries = Object.entries(state.entries).filter(([key]) => key.startsWith(prefix));
    openDialog(`${calendarDate.toLocaleDateString('en-US', { month: 'long' })} report`);
    paragraph(`${entries.length} days checked in · Most frequent: ${mostFrequent(entries)}`);
    if (!entries.length) paragraph('Your story starts with a single check-in. Choose a mood on Home, then come back here.');
    for (const mood of moods) if (entries.some(([, e]) => e.mood === mood)) paragraph(`${mood}: ${entries.filter(([, e]) => e.mood === mood).length} days`);
    paragraph('This summary reflects your check-ins in this browser.', dialog, 'muted');
  }
  function setupMe() {
    text('Value', state.nickname, named('Nickname'));
    const birthday = new Date(`${state.birthday}T12:00:00`);
    text('Value', Number.isNaN(birthday.getTime()) ? 'Not set' : birthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), named('Birthday'));
    text('L', `Lv.${level()} · Fluff stage`, named('Level'));
    text('Born', `Together since ${new Date(state.started + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
    named('Fill', named('Bond Bar')).style.width = `${30 + state.bond % 100 * .7}%`;
    text('V', Object.keys(state.entries).length, named('Entries'));
    text('V', Object.keys(state.entries).length, named('Replies'));
    text('V', streak(), named('Day streak'));
    bind('Nickname', () => editProfile('nickname'), 'Edit nickname');
    bind('Birthday', () => editProfile('birthday'), 'Edit birthday');
    bind('Settings', showSettings, 'Settings');
    text('Count', state.plus ? '12 of 12 unlocked' : '4 of 12 unlocked', named('Dressing Room'));
    for (const outfit of Object.keys(outfits)) {
      const node = named(outfit, named('Dressing Room')); if (!node) continue;
      node.setAttribute('aria-pressed', String(state.outfit === outfit));
      text('Label', state.outfit === outfit ? 'Worn' : outfit, node);
      named('Tile', node).style.opacity = state.plus || freeOutfits.includes(outfit) ? '1' : '.5';
      actionable(node, () => wear(outfit), `Wear ${outfit}${!state.plus && !freeOutfits.includes(outfit) ? ', Plus' : ''}`);
    }
    bind('Open Wardrobe', showWardrobe, 'Open wardrobe');
  }
  function editProfile(field) {
    openDialog(field === 'nickname' ? 'Your nickname' : 'Your birthday');
    const form = document.createElement('form');
    const label = document.createElement('label'); label.htmlFor = 'profile-value'; label.textContent = field === 'nickname' ? 'What should Pip call you?' : 'Birthday';
    const input = document.createElement('input'); input.id = 'profile-value'; input.type = field === 'nickname' ? 'text' : 'date'; input.required = true;
    if (field === 'nickname') input.maxLength = 30; else input.max = today;
    input.value = state[field];
    const submit = button('Save', () => {}, 'primary'); submit.type = 'submit';
    form.append(label, input, submit); dialog.append(form);
    form.addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) { input.setCustomValidity('Please enter a nickname.'); input.reportValidity(); return; } state[field] = input.value.trim(); save(); closeDialog(); render(); toast('Profile updated'); });
    input.addEventListener('input', () => input.setCustomValidity('')); input.focus();
  }
  function wear(outfit) {
    if (!state.plus && !freeOutfits.includes(outfit)) { navigate('plus'); return; }
    state.outfit = outfit; save(); if (dialog.open) closeDialog(); render(); toast(`${outfit} on! Visit Pip to see it.`);
  }
  function showWardrobe() {
    openDialog('Pip’s wardrobe');
    paragraph('Choose a little accessory for Pip.');
    const grid = document.createElement('div'); grid.className = 'wardrobe-grid';
    for (const [name, emoji] of Object.entries(outfits)) grid.append(button(`${emoji} ${name}${name === state.outfit ? ' ✓' : !state.plus && !freeOutfits.includes(name) ? ' · Plus' : ''}`, () => wear(name), ''));
    dialog.append(grid);
  }
  function showSettings() {
    openDialog('Settings');
    paragraph(`Pip Plus: ${state.plus ? 'demo membership active' : 'free plan'}`);
    dialog.append(button('Manage Pip Plus', () => navigate('plus')));
    paragraph('This demo stores your check-ins and profile in this browser. Pip’s replies are preset. No account or payment is connected.', dialog, 'muted');
    dialog.append(button('Reset demo data', () => {
      openDialog('Reset this demo?'); paragraph('This deletes your check-ins, notes, profile changes and demo membership in this browser.');
      dialog.append(button('Delete demo data', () => { state = defaults(); save(); closeDialog(); navigate('home'); toast('Demo reset'); }, 'primary'), button('Keep my data', closeDialog));
    }));
  }
  function setupPlus() {
    bind('Close', () => navigate(returnFromPlus), 'Close Plus');
    text('Label', state.plus ? 'Manage demo membership' : 'Try monthly membership', named('Primary Button'));
    bind('Primary Button', () => {
      openDialog(state.plus ? 'Your demo membership' : 'Try Pip Plus');
      paragraph(state.plus ? 'All 12 accessories are unlocked in this browser. This is a simulated membership.' : '$4.99 USD / month in the design. Activating this demo unlocks all 12 accessories. No payment, charges or automatic renewal.');
      dialog.append(button(state.plus ? 'End demo membership' : 'Activate free demo', () => {
        state.plus = !state.plus;
        if (!state.plus && !freeOutfits.includes(state.outfit)) state.outfit = 'Crown';
        save(); closeDialog(); render(); toast(state.plus ? 'Welcome to Pip Plus! All outfits unlocked.' : 'Demo membership ended');
      }, 'primary'));
    }, state.plus ? 'Manage demo membership' : 'Try monthly membership');
    bind('Restore demo', () => toast(state.plus ? 'Your demo membership is already active.' : 'No active demo membership in this browser.'), 'Restore demo');
    bind('Terms', () => { openDialog('Demo terms'); paragraph('Pip is an interactive prototype. The $4.99 monthly price is illustrative. There is no checkout, charge, renewal or real subscription. Demo membership only changes features stored in this browser.'); });
    bind('Privacy', () => { openDialog('Demo privacy'); paragraph('Your nickname, birthday, mood check-ins, notes and demo preferences are stored locally in this browser. The demo does not send these to a server. Clear them with Settings → Reset demo data.'); });
  }
  window.addEventListener('hashchange', render);
  render();
})();
