import { qs, qsa } from '../utils/dom.js';
import {
  agregarAColeccion,
  estaEnColeccion,
  idDesdePlanta,
  quitarDeColeccion,
} from '../services/coleccion.js';
import { getSession } from '../services/auth.js';
import { wireCatalogAccordion } from '../utils/catalog-accordion.js';
import { wireCatalogFilters, wireFiltersToggle } from '../utils/catalog-filters.js';
import { wireCatalogView } from '../utils/catalog-view.js';
import { syncColeccionNavCount } from '../utils/coleccion-nav.js';
import { wireRiegoEstacion } from '../utils/catalog-riego-estacion.js';
import { refreshCatalogFilters } from '../utils/catalog-filters.js';
import { wireAuthModal } from '../utils/auth-modal.js';

function parseGaleria(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseRiegos(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function plantaDesdeBoton(btn) {
  const galeria = parseGaleria(btn.dataset.galeria);
  const riegos = parseRiegos(btn.dataset.riegos);
  return {
    id: btn.dataset.id,
    nombre: btn.dataset.nombre,
    especie: btn.dataset.especie,
    riego: btn.dataset.riego,
    riegos,
    luz: btn.dataset.luz,
    ubicacion: btn.dataset.ubicacion,
    suelo: btn.dataset.suelo,
    cuidado: btn.dataset.cuidado,
    estado: btn.dataset.estado || 'Sin registrar',
    ultimoRiego: btn.dataset.ultimoRiego,
    imagen: btn.dataset.imagen || galeria[0] || null,
    galeria,
  };
}

function etiquetaDisponible(btn) {
  return btn.classList.contains('catalog-add--tile') ||
    btn.classList.contains('catalog-add--spotlight')
    ? '(+)'
    : '(Agregar)';
}

function etiquetaAgregado(btn) {
  return btn.classList.contains('catalog-add--tile') ||
    btn.classList.contains('catalog-add--spotlight')
    ? '(-)'
    : '(Eliminar)';
}

function marcarDisponible(btn) {
  btn.classList.remove('is-added');
  btn.textContent = etiquetaDisponible(btn);
  btn.setAttribute('aria-label', 'Agregar a Colección');
  btn.title = 'Agregar a Colección';
}

function marcarAgregado(btn) {
  btn.classList.add('is-added');
  btn.textContent = etiquetaAgregado(btn);
  btn.setAttribute('aria-label', 'Eliminar de Colección');
  btn.title = 'Eliminar de Colección';
}

function syncFilaColeccion(id, added) {
  qsa(`.catalog-add[data-id="${CSS.escape(id)}"]`).forEach((btn) => {
    if (added) marcarAgregado(btn);
    else marcarDisponible(btn);
    btn.closest('.catalog-entry')?.classList.toggle('is-in-coleccion', added);
  });
}

async function syncBotones() {
  const entries = qsa('.catalog-entry');
  for (const entry of entries) {
    const btn = entry.querySelector('.catalog-add[data-id]');
    if (!btn) continue;
    const added = await estaEnColeccion(btn.dataset.id);
    qsa('.catalog-add[data-id]', entry).forEach((b) => {
      if (added) marcarAgregado(b);
      else marcarDisponible(b);
    });
    entry.classList.toggle('is-in-coleccion', added);
  }
}

async function toggleColeccion(btn) {
  const planta = plantaDesdeBoton(btn);
  if (!planta.id) {
    planta.id = idDesdePlanta(planta);
  }

  if (btn.classList.contains('is-added')) {
    const result = await quitarDeColeccion(planta.id);
    if (result.ok || result.reason === 'missing') {
      syncFilaColeccion(planta.id, false);
      await syncColeccionNavCount();
    }
    return;
  }

  const result = await agregarAColeccion(planta);
  if (result.ok || result.reason === 'duplicate') {
    syncFilaColeccion(planta.id, true);
    await syncColeccionNavCount();
  }
}

function wireAdd(root, authModal) {
  if (!root) return;

  root.addEventListener('click', (event) => {
    const btn = event.target.closest('.catalog-add');
    if (!btn || !root.contains(btn)) return;

    event.preventDefault();
    event.stopPropagation();

    getSession().then((session) => {
      if (session) {
        toggleColeccion(btn);
        return;
      }
      authModal.open({ onSuccess: () => toggleColeccion(btn) });
    });
  });
}

function wireNavColeccion(authModal) {
  const link = qs('#nav-coleccion');
  if (!link) return;

  link.addEventListener('click', (event) => {
    event.preventDefault();
    getSession().then((session) => {
      if (session) {
        window.location.href = link.href;
        return;
      }
      authModal.open({ onSuccess: () => window.location.href = link.href });
    });
  });
}

const root = qs('#catalog-rows');
const authModal = wireAuthModal();
wireCatalogAccordion(root);
wireAdd(root, authModal);
wireNavColeccion(authModal);
wireCatalogFilters(root);
wireFiltersToggle();
wireCatalogView();
wireRiegoEstacion(root, {
  onChange: () => refreshCatalogFilters(root),
});
syncBotones().catch(console.error);
syncColeccionNavCount().catch(console.error);
