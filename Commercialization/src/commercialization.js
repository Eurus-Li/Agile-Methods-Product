export const MEMBERSHIP_KEY = 'rongrong.plus.demo.v1';

/** One calendar month, clamped to the last day of shorter months. */
export function addCalendarMonth(isoDate) {
  const date = new Date(isoDate);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString();
}

export function parseMembership(raw) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || value.plan !== 'monthly-demo' ||
        typeof value.renewalEnabled !== 'boolean' ||
        typeof value.startedAt !== 'string' || typeof value.expiresAt !== 'string' ||
        !Number.isFinite(Date.parse(value.startedAt)) ||
        !Number.isFinite(Date.parse(value.expiresAt)) ||
        value.expiresAt !== addCalendarMonth(value.startedAt)) return null;
    return { version: 1, plan: value.plan, startedAt: value.startedAt,
      expiresAt: value.expiresAt, renewalEnabled: value.renewalEnabled };
  } catch { return null; }
}

export function isMembershipActive(membership, now = new Date()) {
  return Boolean(membership && Date.parse(membership.startedAt) <= now.getTime() &&
    Date.parse(membership.expiresAt) > now.getTime());
}

/** Local demo adapter only. Never use localStorage to grant paid production access. */
export function createDemoMembershipStore(storage, now = () => new Date()) {
  return {
    load() { return parseMembership(storage.getItem(MEMBERSHIP_KEY)); },
    activate() {
      const existing = this.load();
      if (isMembershipActive(existing, now())) return existing;
      const startedAt = now().toISOString();
      const membership = { version: 1, plan: 'monthly-demo', startedAt,
        expiresAt: addCalendarMonth(startedAt), renewalEnabled: true };
      storage.setItem(MEMBERSHIP_KEY, JSON.stringify(membership));
      return membership;
    },
    cancelRenewal() {
      const membership = this.load();
      if (!isMembershipActive(membership, now())) throw new Error('No active membership');
      const updated = { ...membership, renewalEnabled: false };
      storage.setItem(MEMBERSHIP_KEY, JSON.stringify(updated));
      return updated;
    },
  };
}

const icons = {
  sparkle: '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z"/>',
  shirt: '<path d="m8 4-5 3 3 5 2-1v9h8v-9l2 1 3-5-5-3c0 4-8 4-8 0Z"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/>',
  wind: '<path d="M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3"/>',
  book: '<path d="M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Zm0 0v15"/>',
  heart: '<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 3 11 8 15 5-4 13-10 8-15Z"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

/**
 * Mount the independent commercialization screen in any DOM container.
 * Returns { destroy() }. onBack is an optional host-app navigation callback.
 * storage and now can be injected for tests; defaults use this browser/device.
 */
export function createCommercializationPage(root, { storage, now = () => new Date(), onBack } = {}) {
  if (!root || typeof root.querySelector !== 'function') throw new TypeError('A DOM container is required');
  let store;
  let membership = null;
  let storageError = false;
  try {
    store = createDemoMembershipStore(storage ?? window.localStorage, now);
    membership = store.load();
  } catch { storageError = true; }
  const controller = new AbortController();
  const listen = (element, event, callback) => element.addEventListener(event, callback, { signal: controller.signal });
  const benefits = [
    ['shirt', 'peach', 'Exclusive outfits', 'More ways to be yourself'],
    ['home', 'lavender', 'Cozy room themes', 'Make your space feel like you'],
    ['wind', 'mint', 'Guided rituals', 'Gentle moments to pause'],
    ['book', 'butter', 'Monthly mood stories', 'Look back with kindness'],
  ];
  root.innerHTML = `
    <article class="commercialization">
      <header class="topbar">
        <button class="icon-button" data-back aria-label="Go back" ${onBack ? '' : 'hidden'}>‹</button>
        <span class="brand">${icon('sparkle')} Rongrong <b>Plus</b></span>
        <button class="icon-button" data-info="help" aria-label="Membership help">?</button>
      </header>
      <div class="page-content">
        <section class="hero" aria-labelledby="page-title">
          <span class="eyebrow">A LITTLE MORE MAGIC</span>
          <h1 id="page-title">Make room for<br>more little joys.</h1>
          <p>A cozier world for you and Rongrong.</p>
          <div class="pet-scene" role="img" aria-label="A happy cream-colored Rongrong wearing a lavender scarf">
            <span class="spark s1">✧</span><span class="spark s2">✦</span>
            <div class="pet"><i class="ear left"></i><i class="ear right"></i><div class="face"><i></i><span>ᴗ</span><i></i></div><div class="cheek c1"></div><div class="cheek c2"></div><div class="scarf"></div></div>
            <div class="cushion"></div>
          </div>
        </section>
        <section class="plan-card" aria-labelledby="plan-title">
          <div class="plan-heading"><h2 id="plan-title">Monthly membership</h2><span class="plus-tag">PLUS</span></div>
          <div class="price">$4.99 <span>USD / month</span></div>
          <p>Billed monthly · Cancel anytime</p>
          <div class="demo-note">Demo preview · No real payment</div>
          <p class="membership-status" data-membership hidden></p>
          <button class="text-button" data-cancel hidden>Cancel demo renewal</button>
        </section>
        <section class="benefits" aria-labelledby="benefits-title">
          <h2 id="benefits-title">Little extras, all yours</h2>
          <div class="benefit-grid">${benefits.map(([name, color, title, copy]) => `<div class="benefit-card"><span class="benefit-icon ${color}">${icon(name)}</span><h3>${title}</h3><p>${copy}</p></div>`).join('')}</div>
        </section>
        <aside class="reassurance">${icon('heart')}<div><strong>Everyday check-ins stay free.</strong><p>Your bond grows at your own pace.</p></div></aside>
        <p class="feedback" role="status" aria-live="polite" data-feedback></p>
      </div>
      <footer class="purchase-panel">
        <button class="primary-button" data-subscribe>Try monthly membership</button>
        <p class="billing-copy">Demo of a $4.99 USD/month subscription.<br>No charges or automatic renewals in this preview.</p>
        <nav class="footer-links" aria-label="Membership information"><button data-restore>Restore demo</button><span>·</span><button data-info="terms">Terms</button><span>·</span><button data-info="privacy">Privacy</button></nav>
      </footer>
      <dialog aria-labelledby="dialog-title"><form method="dialog"><button class="dialog-close icon-button" aria-label="Close dialog">×</button></form><span class="eyebrow">RONGRONG PLUS</span><h2 id="dialog-title"></h2><div data-dialog-body></div><button class="primary-button" data-confirm hidden></button></dialog>
    </article>`;
  const get = selector => root.querySelector(selector);
  const dialog = get('dialog');
  let confirmAction = null;
  const feedback = message => { get('[data-feedback]').textContent = message; };
  const dateLabel = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  function refresh() {
    const active = isMembershipActive(membership, now());
    get('[data-subscribe]').textContent = active ? 'Membership active' : 'Try monthly membership';
    get('[data-subscribe]').disabled = active;
    get('[data-membership]').hidden = !active;
    get('[data-membership]').textContent = active ? `Demo active through ${dateLabel(membership.expiresAt)}. ${membership.renewalEnabled ? 'No real billing is connected.' : 'Renewal canceled; access continues until this date.'}` : '';
    get('[data-cancel]').hidden = !active || !membership.renewalEnabled;
  }
  function showDialog(title, paragraphs, label, action) {
    get('#dialog-title').textContent = title;
    get('[data-dialog-body]').replaceChildren(...paragraphs.map(text => {
      const p = document.createElement('p'); p.textContent = text; return p;
    }));
    get('[data-confirm]').hidden = !action;
    get('[data-confirm]').textContent = label || '';
    confirmAction = action || null;
    dialog.showModal();
  }
  listen(get('[data-confirm]'), 'click', () => {
    if (!confirmAction) return;
    try { confirmAction(); dialog.close(); refresh(); }
    catch { dialog.close(); feedback('We could not save your demo membership. Allow browser storage and try again. No payment was taken.'); }
  });
  listen(dialog, 'close', () => { confirmAction = null; });
  listen(get('[data-subscribe]'), 'click', () => showDialog('A little more, for you.', [
    'Preview plan: $4.99 USD per month. A live subscription would renew monthly until canceled.',
    'This demo does not collect payment details or charge you. Activate one calendar month of local demo membership to explore the flow.',
    'Your demo is saved only in this browser. No paid content or payment provider is connected yet.',
  ], 'Activate demo membership', () => {
    if (!store) throw new Error('Storage unavailable');
    membership = store.activate(); feedback('Welcome to Rongrong Plus! Your demo membership is active. No payment was taken.');
  }));
  listen(get('[data-cancel]'), 'click', () => showDialog('Cancel demo renewal?', [
    'Your demo membership will remain active until the displayed end date. Everyday check-ins remain free.',
    'This changes the saved demo renewal setting. There are no real charges or scheduled renewals.',
  ], 'Confirm cancellation', () => {
    membership = store.cancelRenewal(); feedback('Demo renewal canceled. Your current membership remains active until its end date.');
  }));
  listen(get('[data-restore]'), 'click', () => {
    try {
      if (!store) throw new Error('Storage unavailable');
      membership = store.load(); refresh();
      feedback(isMembershipActive(membership, now()) ? 'Your saved demo membership has been restored in this browser.' : 'No active demo membership found in this browser. You can activate one above.');
    } catch { feedback('Browser storage is unavailable. Restore requires access to local browser storage.'); }
  });
  const info = {
    help: ['A little help', ['Try monthly membership to open the demo confirmation. Restore demo reloads membership saved in this browser.', 'A live monthly plan is proposed at $4.99 USD. Outfits, room themes, rituals, and mood stories are proposed Plus benefits; this preview demonstrates membership controls only.']],
    terms: ['Demo membership terms', ['This is a product prototype, not a paid service. The $4.99 USD/month price and listed benefits are proposals.', 'Activating creates a one-calendar-month membership in this browser. It expires without an actual renewal. Canceling the demo renewal setting keeps access until expiry.', 'Production billing, refunds, account-based restoration, and final service terms must be added before accepting payments.']],
    privacy: ['Your demo stays here', ['This page stores only demo plan, start date, end date, and renewal setting in localStorage on this browser.', 'It does not collect payment information, mood entries, or analytics. Clearing site data removes the demo membership. It does not sync across devices.']],
  };
  root.querySelectorAll('[data-info]').forEach(button => listen(button, 'click', () => {
    const [title, paragraphs] = info[button.dataset.info]; showDialog(title, paragraphs);
  }));
  if (onBack) listen(get('[data-back]'), 'click', onBack);
  listen(window, 'storage', event => {
    if (event.key === MEMBERSHIP_KEY || event.key === null) {
      try { membership = store?.load() ?? null; refresh(); } catch { feedback('Unable to refresh saved membership.'); }
    }
  });
  listen(window, 'focus', refresh);
  const expiryTimer = window.setInterval(refresh, 60000);
  refresh();
  if (storageError) feedback('Browser storage is unavailable. Enable it to activate or restore a demo membership.');
  return { destroy() { controller.abort(); window.clearInterval(expiryTimer); dialog.close(); root.replaceChildren(); } };
}
