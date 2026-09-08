import { MOODS, moodById, addEntry, updateEntry, loadEntries, computeStreak } from '../../Journal/src/journal.js';

export const BOND_KEY = 'pip.bond.v1';
const POINTS_PER_LEVEL = 100;

/** Turns raw bond points into a level (starting at 1) and progress within that level. */
export function computeBondLevel(points = 0) {
  const safePoints = Math.max(0, points);
  const level = 1 + Math.floor(safePoints / POINTS_PER_LEVEL);
  const progress = safePoints % POINTS_PER_LEVEL;
  return { level, progress, pointsToNext: POINTS_PER_LEVEL - progress };
}

export function loadBondPoints(storage) {
  const raw = Number(storage.getItem(BOND_KEY));
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
}
export function addBondPoints(storage, amount) {
  const total = loadBondPoints(storage) + amount;
  storage.setItem(BOND_KEY, String(total));
  return total;
}

const REPLIES = {
  calm: 'A calm day is still a day well spent. I like sitting quietly with you.',
  happy: 'That happiness looks good on you. Tell me more whenever you want.',
  tired: 'Rest counts as progress too. I\'ll keep watch while you recharge.',
  sad: 'Sad days are allowed to just be sad. You showed up and told me anyway — that counts for something.',
  angry: 'That sounds frustrating. I\'m not going anywhere, so let it out.',
};

function icon(name) {
  const paths = { bookmark: '<path d="M6 4h12v16l-6-4-6 4Z"/>' };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

/**
 * Mount the home/check-in screen in any DOM container. Returns { destroy() }.
 * storage and now are injectable for tests; defaults use this browser/device.
 */
export function createHomePage(root, { storage, now = () => new Date() } = {}) {
  if (!root || typeof root.querySelector !== 'function') throw new TypeError('A DOM container is required');
  const store = storage ?? window.localStorage;
  const controller = new AbortController();
  const listen = (element, event, callback) => element.addEventListener(event, callback, { signal: controller.signal });
  let selectedMood = null; let lastEntryId = null;

  root.innerHTML = `
    <article class="home">
      <header class="topbar">
        <span class="day-count" data-streak></span>
      </header>
      <div class="page-content">
        <p class="greeting-bubble">You're back — I waited all day.</p>
        <button type="button" class="pet-scene" data-pet aria-label="Tap Pip to pet">
          <span class="spark s1">✧</span><span class="spark s2">✦</span>
          <div class="pet"><i class="ear left"></i><i class="ear right"></i><div class="face"><i></i><span>ᴗ</span><i></i></div><div class="cheek c1"></div><div class="cheek c2"></div></div>
          <div class="cushion"></div>
        </button>
        <p class="pet-hint">Tap Pip to pet</p>
        <section class="check-in" aria-labelledby="check-in-title">
          <h2 id="check-in-title">How are you feeling?</h2>
          <div class="mood-row" data-mood-row></div>
          <textarea data-feeling rows="2" placeholder="Write about your feelings..."></textarea>
          <button type="button" class="send-button" data-send aria-label="Send">↑</button>
        </section>
      </div>
      <section class="response-sheet" data-sheet hidden aria-live="polite">
        <header><span class="response-title" data-response-title></span><button class="icon-button" data-close aria-label="Close">×</button></header>
        <p class="response-body" data-response-body></p>
        <div class="bond-row"><span>Bond <b data-bond-level></b></span><span class="bond-delta">+15</span></div>
        <div class="bond-bar"><i data-bond-fill></i></div>
        <div class="response-actions">
          <button class="primary-button" data-hug>Hug Pip</button>
          <button class="icon-button" data-bookmark aria-label="Bookmark this moment">${icon('bookmark')}</button>
        </div>
      </section>
    </article>`;

  const get = selector => root.querySelector(selector);
  get('[data-mood-row]').innerHTML = MOODS.map(mood =>
    `<button type="button" class="mood-button" data-mood="${mood.id}" style="--mood-bg:${mood.bg};--mood-color:${mood.color}">
      <span>${mood.emoji}</span>${mood.label}</button>`).join('');
  get('[data-mood-row]').querySelectorAll('[data-mood]').forEach(button => listen(button, 'click', () => {
    selectedMood = button.dataset.mood;
    get('[data-mood-row]').querySelectorAll('[data-mood]').forEach(b => b.classList.toggle('selected', b === button));
  }));

  function renderStreak() {
    get('[data-streak]').textContent = `🔥 ${computeStreak(loadEntries(store), now())}`;
  }
  function renderBond() {
    const { level, progress } = computeBondLevel(loadBondPoints(store));
    get('[data-bond-level]').textContent = `Lv.${level}`;
    get('[data-bond-fill]').style.width = `${progress}%`;
  }

  listen(get('[data-pet]'), 'click', () => {
    get('[data-pet]').classList.add('bounce');
    window.setTimeout(() => get('[data-pet]')?.classList.remove('bounce'), 260);
  });

  listen(get('[data-send]'), 'click', () => {
    const mood = selectedMood ?? MOODS[0].id;
    const text = get('[data-feeling]').value.trim();
    const entry = addEntry(store, { mood, text, now: now() });
    lastEntryId = entry.id;
    get('[data-feeling]').value = '';
    get('[data-response-title]').textContent = `Pip heard you`;
    get('[data-response-body]').textContent = REPLIES[mood] ?? REPLIES.calm;
    renderBond();
    get('[data-sheet]').hidden = false;
    renderStreak();
  });
  listen(get('[data-close]'), 'click', () => { get('[data-sheet]').hidden = true; });
  listen(get('[data-hug]'), 'click', () => {
    addBondPoints(store, 15);
    if (lastEntryId) updateEntry(store, lastEntryId, { hugged: true });
    renderBond();
  });
  listen(get('[data-bookmark]'), 'click', event => {
    if (lastEntryId) updateEntry(store, lastEntryId, { bookmarked: true });
    event.currentTarget.classList.add('active');
  });

  renderStreak(); renderBond();
  return { destroy() { controller.abort(); root.replaceChildren(); } };
}
