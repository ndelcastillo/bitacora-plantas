import { qs, qsa } from './dom.js';

const STORAGE_KEY = 'bitacora-catalog-view';

function setActiveButtons(switcher, view) {
  qsa('.catalog-view-btn', switcher).forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function applyView(page, view) {
  page.dataset.view = view;

  const view3 = qs('#mensaje-view-3');
  if (view3) view3.hidden = true;
}

export function wireCatalogView() {
  const page = qs('.catalog-page');
  const switcher = qs('.catalog-view-switch');
  if (!page || !switcher) return;

  let initial = '1';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '1' || saved === '2' || saved === '3') initial = saved;
  } catch {
    /* ignore */
  }

  applyView(page, initial);
  setActiveButtons(switcher, initial);

  switcher.addEventListener('click', (event) => {
    const btn = event.target.closest('.catalog-view-btn');
    if (!btn || !switcher.contains(btn)) return;
    const view = btn.dataset.view;
    if (!view) return;
    applyView(page, view);
    setActiveButtons(switcher, view);
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
      /* ignore */
    }
  });
}
