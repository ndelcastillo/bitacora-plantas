const STORAGE_KEY = 'bitacora-coleccion';

function leer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardar(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listarColeccion() {
  return leer().sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );
}

export function contarColeccion() {
  return leer().length;
}

export function estaEnColeccion(id) {
  return leer().some((p) => p.id === id);
}

export function agregarAColeccion(planta) {
  const items = leer();
  if (items.some((p) => p.id === planta.id)) {
    return { ok: false, reason: 'duplicate' };
  }
  const riegos =
    planta.riegos && typeof planta.riegos === 'object'
      ? planta.riegos
      : {
          verano: planta.riego,
          invierno: planta.riego,
          primavera: planta.riego,
          otoño: planta.riego,
        };

  items.push({
    id: planta.id,
    nombre: planta.nombre,
    especie: planta.especie,
    riego: planta.riego,
    riegos,
    luz: planta.luz,
    ubicacion: planta.ubicacion,
    suelo: planta.suelo,
    cuidado: planta.cuidado,
    estado: planta.estado || 'Sin registrar',
    ultimoRiego: planta.ultimoRiego,
    imagen: planta.imagen || null,
    galeria: Array.isArray(planta.galeria) ? planta.galeria : [],
    addedAt: new Date().toISOString(),
  });
  guardar(items);
  return { ok: true };
}

export function quitarDeColeccion(id) {
  const items = leer();
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) {
    return { ok: false, reason: 'missing' };
  }
  guardar(next);
  return { ok: true };
}

export function idDesdePlanta({ nombre, especie, ubicacion }) {
  return [nombre, especie, ubicacion].join('::').toLowerCase();
}
