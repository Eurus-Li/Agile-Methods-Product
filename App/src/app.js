import { createHomePage } from '../../Home/src/home.js';
import { createJournalPage } from '../../Journal/src/journal.js';
import { createMePage } from '../../Me/src/me.js';
import { createCommercializationPage } from '../../Commercialization/src/commercialization.js';

const ICONS = {
  home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/>',
  edit: '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="M12 20h9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>',
};
function tabIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const TABS = [
  { id: 'home', label: 'Pip', icon: 'home', mount: createHomePage },
  { id: 'journal', label: 'Journal', icon: 'edit', mount: createJournalPage },
  { id: 'me', label: 'Me', icon: 'user', mount: createMePage },
];

/** Mounts the whole Pip app (bottom-tab shell + Plus overlay) in a DOM container. */
export function createApp(root) {
  root.innerHTML = `
    <div class="app-shell">
      <div class="app-page" data-page></div>
      <nav class="tab-bar" data-tab-bar></nav>
      <div class="plus-overlay" data-plus-overlay hidden></div>
    </div>`;
  const get = selector => root.querySelector(selector);
  const pageMount = get('[data-page]');
  const plusOverlay = get('[data-plus-overlay]');
  let activeTab = TABS[0].id;
  let activePage = null;

  function renderTabBar() {
    get('[data-tab-bar]').innerHTML = TABS.map(tab =>
      `<button type="button" class="tab-button${tab.id === activeTab ? ' active' : ''}" data-tab="${tab.id}" aria-label="${tab.label}">
        ${tabIcon(tab.icon)}</button>`).join('');
    get('[data-tab-bar]').querySelectorAll('[data-tab]').forEach(button =>
      button.addEventListener('click', () => showTab(button.dataset.tab)));
  }

  function showTab(id) {
    activeTab = id;
    activePage?.destroy();
    const tab = TABS.find(t => t.id === id);
    activePage = tab.mount(pageMount, tab.id === 'me' ? { onOpenPlus: openPlus } : {});
    renderTabBar();
  }

  function openPlus() {
    plusOverlay.hidden = false;
    createCommercializationPage(plusOverlay, { onBack: closePlus });
  }
  function closePlus() {
    plusOverlay.hidden = true;
    plusOverlay.replaceChildren();
  }

  showTab(activeTab);
  return { showTab };
}
