export const ENTRIES_KEY = 'pip.journal.entries.v1';

export const MOODS = [
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#5f9d82', bg: '#e4f2e9' },
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#d68560', bg: '#ffe8da' },
  { id: 'tired', label: 'Tired', emoji: '😪', color: '#a98f5a', bg: '#fcf0d8' },
  { id: 'sad', label: 'Sad', emoji: '🙁', color: '#7c8fd0', bg: '#e6eaf9' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: '#c96455', bg: '#fbe3df' },
];
export function moodById(id) { return MOODS.find(m => m.id === id) ?? null; }

function toDateKey(date) { return new Date(date).toISOString().slice(0, 10); }

export function loadEntries(storage) {
  try {
    const raw = JSON.parse(storage.getItem(ENTRIES_KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function saveEntries(storage, entries) { storage.setItem(ENTRIES_KEY, JSON.stringify(entries)); }

/** Adds a journal entry for `now` and returns it. mood must be a MOODS id. */
export function addEntry(storage, { mood, text, now = new Date() }) {
  const entries = loadEntries(storage);
  const entry = { id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    dateISO: toDateKey(now), time: now.toISOString(), mood, text: text ?? '', hugged: false, bookmarked: false };
  entries.push(entry);
  saveEntries(storage, entries);
  return entry;
}

export function updateEntry(storage, id, patch) {
  const entries = loadEntries(storage);
  const index = entries.findIndex(entry => entry.id === id);
  if (index === -1) return null;
  entries[index] = { ...entries[index], ...patch };
  saveEntries(storage, entries);
  return entries[index];
}

export function deleteEntry(storage, id) {
  saveEntries(storage, loadEntries(storage).filter(entry => entry.id !== id));
}

/** Consecutive days with at least one entry, counting back from today (or yesterday if today is empty). */
export function computeStreak(entries, now = new Date()) {
  const days = new Set(entries.map(entry => entry.dateISO));
  const cursor = new Date(now);
  if (!days.has(toDateKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(toDateKey(cursor))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  return streak;
}

/** Stats for the calendar month containing `monthDate`. */
export function computeMonthStats(entries, monthDate = new Date()) {
  const year = monthDate.getUTCFullYear(); const month = monthDate.getUTCMonth();
  const inMonth = entries.filter(entry => {
    const d = new Date(entry.dateISO); return d.getUTCFullYear() === year && d.getUTCMonth() === month;
  });
  const daysLogged = new Set(inMonth.map(entry => entry.dateISO)).size;
  const counts = {};
  for (const entry of inMonth) counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
  let mostFrequent = null;
  for (const [mood, count] of Object.entries(counts)) if (!mostFrequent || count > counts[mostFrequent]) mostFrequent = mood;
  const byDay = new Map();
  for (const entry of inMonth) byDay.set(entry.dateISO, entry.mood);
  return { daysLogged, mostFrequentMoodId: mostFrequent, byDay };
}

function icon(name) {
  const paths = {
    chevronLeft: '<path d="m15 6-6 6 6 6"/>', chevronRight: '<path d="m9 6 6 6-6 6"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

/**
 * Mount the journal/calendar screen in any DOM container. Returns { destroy() }.
 * storage and now are injectable for tests; defaults use this browser/device.
 */
export function createJournalPage(root, { storage, now = () => new Date() } = {}) {
  if (!root || typeof root.querySelector !== 'function') throw new TypeError('A DOM container is required');
  const store = storage ?? window.localStorage;
  const controller = new AbortController();
  const listen = (element, event, callback) => element.addEventListener(event, callback, { signal: controller.signal });
  let viewMonth = new Date(now()); viewMonth.setUTCDate(1);

  root.innerHTML = `
    <article class="journal">
      <header class="topbar"><h1>Journal</h1></header>
      <div class="page-content">
        <section class="month-nav">
          <button class="icon-button" data-prev aria-label="Previous month">${icon('chevronLeft')}</button>
          <span class="month-label" data-month-label></span>
          <button class="icon-button" data-next aria-label="Next month">${icon('chevronRight')}</button>
        </section>
        <section class="calendar" data-calendar aria-label="Mood calendar"></section>
        <section class="legend" data-legend></section>
        <section class="stat-row" data-stats></section>
        <section class="recent" aria-labelledby="recent-title">
          <div class="recent-heading"><h2 id="recent-title">Recent moods</h2></div>
          <div class="recent-list" data-recent></div>
        </section>
      </div>
      <dialog aria-labelledby="entry-title">
        <form method="dialog"><button class="dialog-close icon-button" aria-label="Close dialog">×</button></form>
        <span class="eyebrow">JOURNAL ENTRY</span>
        <h2 id="entry-title" data-entry-date></h2>
        <div class="mood-picker" data-mood-picker></div>
        <textarea data-entry-text rows="4" placeholder="What happened?"></textarea>
        <div class="dialog-actions">
          <button class="text-button" data-delete hidden>Delete</button>
          <button class="primary-button" data-save>Save entry</button>
        </div>
      </dialog>
    </article>`;

  const get = selector => root.querySelector(selector);
  const dialog = get('dialog');
  const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
  let editingDateISO = null; let editingMood = MOODS[0].id;

  function renderMoodPicker() {
    get('[data-mood-picker]').innerHTML = MOODS.map(mood => `
      <button type="button" class="mood-chip${mood.id === editingMood ? ' selected' : ''}" data-mood="${mood.id}"
        style="--chip-bg:${mood.bg};--chip-color:${mood.color}">${mood.emoji} ${mood.label}</button>`).join('');
    get('[data-mood-picker]').querySelectorAll('[data-mood]').forEach(button => listen(button, 'click', () => {
      editingMood = button.dataset.mood; renderMoodPicker();
    }));
  }

  function openDay(dateISO) {
    // If the day has more than one check-in, edit the most recent — Home allows several per day.
    const entries = loadEntries(store);
    const existing = [...entries].reverse().find(entry => entry.dateISO === dateISO);
    editingDateISO = dateISO; editingMood = existing?.mood ?? MOODS[0].id;
    get('[data-entry-date]').textContent = dayFormat.format(new Date(dateISO));
    get('[data-entry-text]').value = existing?.text ?? '';
    get('[data-delete]').hidden = !existing;
    renderMoodPicker();
    dialog.showModal();
  }

  listen(get('[data-save]'), 'click', event => {
    event.preventDefault();
    const entries = loadEntries(store);
    const existing = [...entries].reverse().find(entry => entry.dateISO === editingDateISO);
    const text = get('[data-entry-text]').value;
    if (existing) updateEntry(store, existing.id, { mood: editingMood, text });
    else addEntry(store, { mood: editingMood, text, now: new Date(`${editingDateISO}T12:00:00.000Z`) });
    dialog.close(); render();
  });
  listen(get('[data-delete]'), 'click', event => {
    event.preventDefault();
    const existing = [...loadEntries(store)].reverse().find(entry => entry.dateISO === editingDateISO);
    if (existing) deleteEntry(store, existing.id);
    dialog.close(); render();
  });

  function render() {
    const today = new Date(now());
    const todayKey = toDateKey(today);
    const entries = loadEntries(store);
    const { daysLogged, mostFrequentMoodId, byDay } = computeMonthStats(entries, viewMonth);
    const streak = computeStreak(entries, today);

    get('[data-month-label]').textContent = monthFormat.format(viewMonth);
    get('[data-legend]').innerHTML = MOODS.map(mood =>
      `<span class="legend-item"><i style="background:${mood.color}"></i>${mood.label}</span>`).join('');

    const year = viewMonth.getUTCFullYear(); const month = viewMonth.getUTCMonth();
    const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push('<span class="day empty"></span>');
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateISO = toDateKey(new Date(Date.UTC(year, month, day)));
      const mood = byDay.get(dateISO);
      const isToday = dateISO === todayKey;
      const isFuture = dateISO > todayKey;
      const style = mood ? `style="background:${moodById(mood).bg};color:${moodById(mood).color}"` : '';
      cells.push(`<button type="button" class="day${mood ? ' logged' : ''}${isToday ? ' today' : ''}${isFuture ? ' future' : ''}"
        data-date="${dateISO}" ${isFuture ? 'disabled' : ''} ${style}>${day}</button>`);
    }
    get('[data-calendar]').innerHTML = `
      <div class="weekday-row">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(w => `<span>${w}</span>`).join('')}</div>
      <div class="day-grid">${cells.join('')}</div>`;
    get('[data-calendar]').querySelectorAll('[data-date]').forEach(button => listen(button, 'click', () => openDay(button.dataset.date)));

    const topMood = mostFrequentMoodId ? moodById(mostFrequentMoodId).label : '—';
    get('[data-stats]').innerHTML = `
      <div class="stat-tile"><strong>${daysLogged}</strong><span>Days logged</span></div>
      <div class="stat-tile"><strong>${topMood}</strong><span>Most frequent</span></div>
      <div class="stat-tile"><strong>${streak}</strong><span>Day streak</span></div>`;

    const recent = [...entries].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);
    get('[data-recent]').innerHTML = recent.length ? recent.map(entry => {
      const mood = moodById(entry.mood);
      return `<button type="button" class="recent-item" data-date="${entry.dateISO}">
        <span class="recent-icon" style="background:${mood.bg}">${mood.emoji}</span>
        <span class="recent-body"><strong>${mood.label}</strong><p>${entry.text || 'No note'}</p></span>
        <span class="recent-date">${new Date(entry.dateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
      </button>`;
    }).join('') : '<p class="empty-note">No moods logged yet. Tap a day to add one.</p>';
    get('[data-recent]').querySelectorAll('[data-date]').forEach(button => listen(button, 'click', () => openDay(button.dataset.date)));
  }

  listen(get('[data-prev]'), 'click', () => { viewMonth.setUTCMonth(viewMonth.getUTCMonth() - 1); render(); });
  listen(get('[data-next]'), 'click', () => { viewMonth.setUTCMonth(viewMonth.getUTCMonth() + 1); render(); });
  render();
  return {
    refresh: render,
    destroy() { controller.abort(); dialog.close(); root.replaceChildren(); },
  };
}
