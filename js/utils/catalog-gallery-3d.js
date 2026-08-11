export function angleForIndex(index, total) {
  const angleIncrement = 360 / Math.max(total, 1);
  return index * angleIncrement - 90;
}

export function extraerPlantasDelDom(root) {
  const entries = Array.from(root.querySelectorAll('.catalog-entry'));
  const plantas = [];
  for (const entry of entries) {
    const nombreEl = entry.querySelector('.catalog-tile-name');
    const imagenEl = entry.querySelector('[data-imagen]');
    const imagen = imagenEl?.dataset?.imagen;
    if (!nombreEl || !imagen) continue;
    plantas.push({ nombre: nombreEl.textContent, imagen });
  }
  return plantas;
}
