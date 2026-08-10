import { qs } from './dom.js';
import { contarColeccion } from '../services/coleccion.js';

export function syncColeccionNavCount() {
  const countEl = qs('#coleccion-count');
  if (!countEl) return;
  countEl.textContent = `(${contarColeccion()})`;
}
