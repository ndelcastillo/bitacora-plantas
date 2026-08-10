import { qs } from './dom.js';
import { contarColeccion } from '../services/coleccion.js';

export async function syncColeccionNavCount() {
  const countEl = qs('#coleccion-count');
  if (!countEl) return;
  const count = await contarColeccion();
  countEl.textContent = `(${count})`;
}
