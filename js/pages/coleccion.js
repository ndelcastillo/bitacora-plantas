import { qs, escapeHtml } from '../utils/dom.js';
import { getSession } from '../services/auth.js';
import { listarColeccion, quitarDeColeccion, onColeccionChange } from '../services/coleccion.js';
import {
  refreshCatalogFilters,
  wireCatalogFilters,
  wireFiltersToggle,
} from '../utils/catalog-filters.js';
import { syncColeccionNavCount } from '../utils/coleccion-nav.js';
import {
  estacionActual,
  refreshRiegoEstacion,
  riegoParaEstacion,
  wireRiegoEstacion,
} from '../utils/catalog-riego-estacion.js';
import { wireAuthModal } from '../utils/auth-modal.js';
import { iniciarPagina } from '../utils/guard.js';

function riegosDePlanta(planta) {
  if (planta.riegos && typeof planta.riegos === 'object') return planta.riegos;
  const fallback = planta.riego || '';
  return {
    verano: fallback,
    invierno: fallback,
    primavera: fallback,
    otoño: fallback,
  };
}

function entryMarkup(planta) {
  const galeria = Array.isArray(planta.galeria) ? planta.galeria : [];
  const riegos = riegosDePlanta(planta);
  const riego = riegoParaEstacion(riegos, planta.riego, estacionActual());
  const imagen = planta.imagen || galeria[0] || '';
  const estacion = estacionActual();

  return `
    <article class="coleccion-card">
      <div class="coleccion-card-info">
        <div class="coleccion-card-title">
          <h2>${escapeHtml(planta.nombre)}</h2>
        </div>
        <ul class="coleccion-card-facts">
          <li><span>Especie</span><span>${escapeHtml(planta.especie || '—')}</span></li>
          <li><span>Ubicación</span><span>${escapeHtml(planta.ubicacion || '—')}</span></li>
          <li><span>Luz</span><span>${escapeHtml(planta.luz || '—')}</span></li>
          <li>
            <button type="button" class="coleccion-riego-btn" data-estacion="${escapeHtml(estacion)}" aria-label="Riego en ${escapeHtml(estacion)}. Clic para cambiar estación">
              Riego <span class="coleccion-card-estacion">(${escapeHtml(estacion)})</span>
            </button>
            <span class="catalog-riego">${escapeHtml(riego)}</span>
          </li>
          <li><span>Suelo</span><span>${escapeHtml(planta.suelo || '—')}</span></li>
          <li><span>Cuidado</span><span>${escapeHtml(planta.cuidado || '—')}</span></li>
          <li>
            <span>Colección</span>
            <button
              type="button"
              class="coleccion-eliminar-btn"
              data-id="${escapeHtml(planta.id)}"
              title="Eliminar de Colección"
              aria-label="Eliminar de Colección"
            >Eliminar</button>
          </li>
        </ul>
      </div>
      <figure class="coleccion-card-media">
        ${
          imagen
            ? `<img src="${escapeHtml(imagen)}" alt="${escapeHtml(planta.nombre)}" loading="lazy" width="900" height="700" />`
            : ''
        }
      </figure>
    </article>
  `;
}

async function render(root) {
  const vacio = qs('#mensaje-vacio');
  if (!root || !vacio) return;

  const plantas = await listarColeccion();
  root.innerHTML = '';

  if (plantas.length === 0) {
    vacio.hidden = false;
    await syncColeccionNavCount();
    return;
  }

  vacio.hidden = true;

  for (const planta of plantas) {
    const riegos = riegosDePlanta(planta);
    const entry = document.createElement('div');
    entry.className = 'catalog-entry';
    entry.dataset.id = planta.planta_id || planta.id || '';
    entry.dataset.nombre = planta.nombre || '';
    entry.dataset.especie = planta.especie || '';
    entry.dataset.riego = riegoParaEstacion(riegos, planta.riego, estacionActual());
    entry.dataset.riegos = JSON.stringify(riegos);
    entry.dataset.luz = planta.luz || '';
    entry.dataset.ubicacion = planta.ubicacion || '';
    entry.dataset.suelo = planta.suelo || '';
    entry.dataset.cuidado = planta.cuidado || '';
    entry.innerHTML = entryMarkup(planta);
    root.appendChild(entry);
  }

  refreshRiegoEstacion(root);
  refreshCatalogFilters(root);
  await syncColeccionNavCount();
}

function wireEliminar(root) {
  if (!root) return;

  root.addEventListener('click', async (event) => {
    const btn = event.target.closest('.coleccion-eliminar-btn');
    if (!btn || !root.contains(btn)) return;

    event.preventDefault();
    event.stopPropagation();

    const id = btn.dataset.id;
    if (!id) return;

    const result = await quitarDeColeccion(id);
    if (result.ok || result.reason === 'missing') {
      await render(root);
    }
  });
}

const root = qs('#coleccion-rows');
const authModal = wireAuthModal();

function iniciarColeccion() {
  qs('#coleccion-contenido').hidden = false;
  render(root);
  wireEliminar(root);
  wireCatalogFilters(root);
  wireFiltersToggle();
  wireRiegoEstacion(root, {
    onChange: () => refreshCatalogFilters(root),
  });
  syncColeccionNavCount();

  // Escuchar cambios en tiempo real
  const unsubscribe = onColeccionChange(() => {
    render(root).catch(console.error);
  });

  // Limpiar suscripción si el usuario se va de la página
  window.addEventListener('beforeunload', unsubscribe, { once: true });
}

iniciarPagina(async function init() {
  const session = await getSession();
  if (session) {
    iniciarColeccion();
    return;
  }

  authModal.open({
    onSuccess: () => iniciarColeccion(),
    onDismiss: () => {
      window.location.href = 'index.html';
    },
  });
});
