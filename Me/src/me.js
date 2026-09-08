import { loadEntries, computeStreak } from '../../Journal/src/journal.js';
import { computeBondLevel, loadBondPoints } from '../../Home/src/home.js';

export const PROFILE_KEY = 'pip.profile.v1';
export const WARDROBE_KEY = 'pip.wardrobe.v1';
const STAGES = ['Egg', 'Newborn', 'Fluff', 'Feather', 'Stardust', 'Guardian'];
export const WARDROBE_ITEMS = [
  { id: 'worn', label: 'Worn', locked: false }, { id: 'glasses', label: 'Glasses', locked: false },
  { id: 'sweater', label: 'Sweater', locked: false }, { id: 'headset', label: 'Headset', locked: false },
  { id: 'flower', label: 'Flower', locked: true }, { id: 'umbrella', label: 'Umbrella', locked: true },
  { id: 'nightcap', label: 'Nightcap', locked: true }, { id: 'aura', label: 'Aura', locked: true },
];

export function stageForLevel(level) { return STAGES[Math.min(level - 1, STAGES.length - 1)]; }

export function loadProfile(storage, now = new Date()) {
  try {
    const raw = JSON.parse(storage.getItem(PROFILE_KEY) ?? 'null');
    if (raw && typeof raw.hatchedAt === 'string') return raw;
  } catch { /* fall through to default */ }
  const profile = { nickname: '', birthday: '', hatchedAt: now.toISOString() };
  storage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}
export function saveProfile(storage, patch) {
  const current = loadProfile(storage);
  const updated = { ...current, ...patch };
  storage.setItem(PROFILE_KEY, JSON.stringify(updated));
  return updated;
}

export function daysTogether(hatchedAtISO, now = new Date()) {
  const start = new Date(hatchedAtISO);
  const ms = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

function loadWardrobe(storage) {
  try {
    const raw = JSON.parse(storage.getItem(WARDROBE_KEY) ?? 'null');
    if (raw && typeof raw.equipped === 'string') return raw;
  } catch { /* fall through */ }
  return { equipped: 'worn' };
}
function equip(storage, id) { storage.setItem(WARDROBE_KEY, JSON.stringify({ equipped: id })); }

/**
 * Mount the profile screen in any DOM container. Returns { destroy() }.
 * onOpenPlus is called when the member taps a locked wardrobe item or "Open wardrobe" upsell.
 */
export function createMePage(root, { storage, now = () => new Date(), onOpenPlus } = {}) {
  if (!root || typeof root.querySelector !== 'function') throw new TypeError('A DOM container is required');
  const store = storage ?? window.localStorage;
  const controller = new AbortController();
  const listen = (element, event, callback) => element.addEventListener(event, callback, { signal: controller.signal });
  let editing = false;

  root.innerHTML = `
    <article class="me">
      <header class="topbar"><h1>Me</h1></header>
      <div class="page-content">
        <section class="profile-card">
          <div class="avatar"><div class="pet"><i class="ear left"></i><i class="ear right"></i><div class="face"><i></i><span>ᴗ</span><i></i></div></div></div>
          <div class="profile-info">
            <div class="name-row"><strong data-pet-name>Pip</strong><span class="stage-tag" data-stage></span></div>
            <span class="hatched-line" data-hatched></span>
            <div class="bond-bar"><i data-bond-fill></i></div>
          </div>
        </section>
        <section class="stat-row" data-stats></section>
        <section class="about-you" aria-labelledby="about-title">
          <div class="section-heading"><h2 id="about-title">About you</h2><button class="text-button" data-edit>Edit</button></div>
          <div class="field-row"><span>Nickname</span><b data-nickname-view>—</b><input data-nickname-input hidden></div>
          <div class="field-row"><span>Birthday</span><b data-birthday-view>—</b><input type="date" data-birthday-input hidden></div>
          <button class="primary-button small" data-save-profile hidden>Save</button>
        </section>
        <section class="wardrobe" aria-labelledby="wardrobe-title">
          <div class="section-heading"><h2 id="wardrobe-title">Dressing room</h2><span class="unlock-count" data-unlock-count></span></div>
          <div class="wardrobe-grid" data-wardrobe></div>
          <button class="ghost-button" data-open-wardrobe>Open wardrobe</button>
        </section>
      </div>
    </article>`;

  const get = selector => root.querySelector(selector);
  const dateLabel = value => value ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—';

  function render() {
    const entries = loadEntries(store);
    const profile = loadProfile(store, now());
    const { level, progress } = computeBondLevel(loadBondPoints(store));
    const wardrobe = loadWardrobe(store);

    get('[data-stage]').textContent = `Lv.${level} · ${stageForLevel(level)} stage`;
    get('[data-hatched]').textContent = `Hatched ${dateLabel(profile.hatchedAt)} · ${daysTogether(profile.hatchedAt, now())} days together`;
    get('[data-bond-fill]').style.width = `${progress}%`;

    const hugged = entries.filter(entry => entry.hugged).length;
    get('[data-stats]').innerHTML = `
      <div class="stat-tile"><strong>${entries.length}</strong><span>Entries</span></div>
      <div class="stat-tile"><strong>${hugged}</strong><span>Replies</span></div>
      <div class="stat-tile"><strong>${computeStreak(entries, now())}</strong><span>Day streak</span></div>`;

    get('[data-nickname-view]').textContent = profile.nickname || 'Not set';
    get('[data-birthday-view]').textContent = dateLabel(profile.birthday);
    get('[data-nickname-input]').value = profile.nickname;
    get('[data-birthday-input]').value = profile.birthday ? profile.birthday.slice(0, 10) : '';

    const unlockedCount = WARDROBE_ITEMS.filter(item => !item.locked).length;
    get('[data-unlock-count]').textContent = `${unlockedCount} of ${WARDROBE_ITEMS.length} unlocked`;
    get('[data-wardrobe]').innerHTML = WARDROBE_ITEMS.map(item => `
      <button type="button" class="wardrobe-item${item.locked ? ' locked' : ''}${wardrobe.equipped === item.id ? ' equipped' : ''}" data-item="${item.id}" data-locked="${item.locked}">
        <span class="item-icon">${item.locked ? '🔒' : '👕'}</span><span>${item.label}</span>
      </button>`).join('');
    get('[data-wardrobe]').querySelectorAll('[data-item]').forEach(button => listen(button, 'click', () => {
      if (button.dataset.locked === 'true') { onOpenPlus?.(); return; }
      equip(store, button.dataset.item); render();
    }));
  }

  listen(get('[data-edit]'), 'click', () => {
    editing = !editing;
    get('[data-nickname-view]').hidden = editing; get('[data-nickname-input]').hidden = !editing;
    get('[data-birthday-view]').hidden = editing; get('[data-birthday-input]').hidden = !editing;
    get('[data-save-profile]').hidden = !editing;
    get('[data-edit]').textContent = editing ? 'Cancel' : 'Edit';
  });
  listen(get('[data-save-profile]'), 'click', () => {
    saveProfile(store, { nickname: get('[data-nickname-input]').value.trim(), birthday: get('[data-birthday-input]').value });
    editing = false;
    get('[data-nickname-view]').hidden = false; get('[data-nickname-input]').hidden = true;
    get('[data-birthday-view]').hidden = false; get('[data-birthday-input]').hidden = true;
    get('[data-save-profile]').hidden = true; get('[data-edit]').textContent = 'Edit';
    render();
  });
  listen(get('[data-open-wardrobe]'), 'click', () => onOpenPlus?.());

  render();
  return { refresh: render, destroy() { controller.abort(); root.replaceChildren(); } };
}
