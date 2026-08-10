import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLANTAS_PATH = path.join(__dirname, '..', 'plantas.html');

/** Seeds con ubicación + luz coherente (ejemplos de interior + exterior/ambos) */
const SEEDS = [
  // Interior — Alta
  { name: 'Monstera Deliciosa', species: 'Araceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Areca', species: 'Arecaceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Peperomia Watermelon', species: 'Piperaceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Alocasia Amazonica', species: 'Araceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Alocasia Odora', species: 'Araceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Strelitzia Nicolai', species: 'Strelitziaceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Ficus Elastica', species: 'Moraceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Ficus Lyrata', species: 'Moraceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Begonia Maculata', species: 'Begoniaceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Dracena Rubra', species: 'Asparagaceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Anthurium', species: 'Araceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Dracena Kiwi', species: 'Asparagaceae', ubic: 'Interior', luz: 'Alta' },
  { name: 'Dracena Tricolor', species: 'Asparagaceae', ubic: 'Interior', luz: 'Alta' },

  // Interior — Media
  { name: 'Philodendron Peruveano', species: 'Araceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Palo de Agua', species: 'Araceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Cordatum Variegado', species: 'Araceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Calathea Macoyana', species: 'Marantaceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Dieffenbachia Alex', species: 'Araceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Maranta Leuconeura', species: 'Marantaceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Dracena Marginata', species: 'Asparagaceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Philodendron Brasil', species: 'Araceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Helecho Boston', species: 'Nephrolepidaceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Calathea Orbifolia', species: 'Marantaceae', ubic: 'Interior', luz: 'Media' },
  { name: 'Monstera Adansonii', species: 'Araceae', ubic: 'Interior', luz: 'Media' },

  // Interior — Baja
  { name: 'Chamadorea Elegans', species: 'Arecaceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Aglaonema', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Espatifilio', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Potus', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Zamioculca', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Sanseveria', species: 'Asparagaceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Syngonium', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Aspidistra', species: 'Asparagaceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'Cordatum Verde', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },
  { name: 'ZZ Plant', species: 'Araceae', ubic: 'Interior', luz: 'Baja' },

  // Exterior
  { name: 'Lavanda', species: 'Lamiaceae', ubic: 'Exterior', luz: 'Directa' },
  { name: 'Romero', species: 'Lamiaceae', ubic: 'Exterior', luz: 'Directa' },
  { name: 'Limón', species: 'Rutaceae', ubic: 'Exterior', luz: 'Directa' },
  { name: 'Geranio', species: 'Geraniaceae', ubic: 'Exterior', luz: 'Directa' },
  { name: 'Buganvilla', species: 'Nyctaginaceae', ubic: 'Exterior', luz: 'Directa' },
  { name: 'Hortensia', species: 'Hydrangeaceae', ubic: 'Exterior', luz: 'Indirecta' },
  { name: 'Azalea', species: 'Ericaceae', ubic: 'Exterior', luz: 'Indirecta' },
  { name: 'Camelia', species: 'Theaceae', ubic: 'Exterior', luz: 'Indirecta' },
  { name: 'Helecho Exterior', species: 'Polypodiaceae', ubic: 'Exterior', luz: 'Sombra' },
  { name: 'Hosta', species: 'Asparagaceae', ubic: 'Exterior', luz: 'Sombra' },
  { name: 'Calatea Exterior', species: 'Marantaceae', ubic: 'Exterior', luz: 'Sombra' },

  // Ambos (luz tipo interior)
  { name: 'Aloe Vera', species: 'Asphodelaceae', ubic: 'Ambos', luz: 'Alta' },
  { name: 'Crassula Ovata', species: 'Crassulaceae', ubic: 'Ambos', luz: 'Alta' },
  { name: 'Echeveria', species: 'Crassulaceae', ubic: 'Ambos', luz: 'Alta' },
  { name: 'Pilea Peperomioides', species: 'Urticaceae', ubic: 'Ambos', luz: 'Media' },
  { name: 'Hoya Carnosa', species: 'Apocynaceae', ubic: 'Ambos', luz: 'Media' },
  { name: 'Tradescantia Zebrina', species: 'Commelinaceae', ubic: 'Ambos', luz: 'Media' },
  { name: 'Chlorophytum Comosum', species: 'Asparagaceae', ubic: 'Ambos', luz: 'Baja' },
  { name: 'Ceropegia Woodii', species: 'Apocynaceae', ubic: 'Ambos', luz: 'Media' },
];

const VARIANTS = [
  '',
  ' Variegata',
  ' Mini',
  ' Compacta',
  ' Grande',
];

const RIEGOS = [
  'Cada 5 días',
  'Cada 7 días',
  'Cada 10 días',
  'Cada 14 días',
  'Cada 21 días',
  'Cada 30 días',
];

/** Deriva frecuencias por estación a partir de un índice base (más frecuente en verano). */
function riegosEstacionales(baseIndex) {
  const clamp = (i) => RIEGOS[Math.max(0, Math.min(RIEGOS.length - 1, i))];
  return {
    verano: clamp(baseIndex - 1),
    primavera: clamp(baseIndex),
    otoño: clamp(baseIndex),
    invierno: clamp(baseIndex + 2),
  };
}

const SUELOS = ['Arenoso', 'Arcilloso', 'Franco'];

const CUIDADOS = ['Fácil', 'Medio', 'Exigente'];

const ESTADOS = ['Al día', 'Próximo', 'Vencido', 'Sin registrar'];

const LUZ_EXTERIOR = ['Directa', 'Indirecta', 'Sombra'];
const LUZ_INTERIOR = ['Alta', 'Media', 'Baja'];

/** Fotos de plantas (Unsplash) — rotan de forma estable por id */
const IMAGENES = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d1d1b9d9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1491147334573-44cbbdb10759?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=1400&q=80',
];

function hashId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % IMAGENES.length;
  }
  return hash;
}

function galeriaParaId(id, count = 5) {
  const start = hashId(id);
  return Array.from({ length: count }, (_, i) => IMAGENES[(start + i) % IMAGENES.length]);
}

const START_DATE = new Date('2025-01-01');
const END_DATE = new Date('2026-08-09');
const DAY_MS = 86400000;
const DATE_RANGE = Math.floor((END_DATE - START_DATE) / DAY_MS);

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function plantId(name, species, ubic) {
  return `${name}::${species}::${ubic}`.toLowerCase();
}

function luzParaUbic(ubic, seedLuz, index) {
  if (ubic === 'Exterior') {
    if (LUZ_EXTERIOR.includes(seedLuz)) return seedLuz;
    return LUZ_EXTERIOR[index % LUZ_EXTERIOR.length];
  }
  // Interior y Ambos usan escala Alta / Media / Baja
  if (LUZ_INTERIOR.includes(seedLuz)) return seedLuz;
  return LUZ_INTERIOR[index % LUZ_INTERIOR.length];
}

function buildRows(count = 150) {
  const rows = [];
  let i = 0;

  while (rows.length < count) {
    const seed = SEEDS[i % SEEDS.length];
    const variant = VARIANTS[Math.floor(i / SEEDS.length) % VARIANTS.length];
    const displayName = `${seed.name}${variant}`.trim();
    const ubic = seed.ubic;
    const luz = luzParaUbic(ubic, seed.luz, i);

    const baseRiego = i % RIEGOS.length;
    const riegos = riegosEstacionales(baseRiego);

    rows.push({
      name: displayName,
      species: seed.species,
      riego: riegos.verano,
      riegos,
      luz,
      ubic,
      suelo: SUELOS[i % SUELOS.length],
      cuidado: CUIDADOS[(i * 2 + 1) % CUIDADOS.length],
      estado: ESTADOS[(i * 5 + 2) % ESTADOS.length],
      date: formatDate(
        new Date(START_DATE.getTime() + ((i * 17 + 13) % DATE_RANGE) * DAY_MS)
      ),
      id: plantId(displayName, seed.species, ubic),
    });
    i += 1;
  }

  rows.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  for (const row of rows) {
    row.galeria = galeriaParaId(row.id, 5);
    row.imagen = row.galeria[0];
  }
  return rows;
}

function galleryHtml(row) {
  const total = row.galeria.length;
  return row.galeria
    .map(
      (src, i) => `<figure class="catalog-gallery-item">
      <img src="${escapeAttr(src)}" alt="${escapeAttr(row.name)} ${i + 1}/${total}" loading="lazy" width="200" height="150" />
      <figcaption>${i + 1}/${total}</figcaption>
    </figure>`
    )
    .join('\n    ');
}

function rowHtml(row) {
  const galeriaAttr = escapeAttr(JSON.stringify(row.galeria));
  const riegosAttr = escapeAttr(JSON.stringify(row.riegos));
  const addAttrs = `data-id="${escapeAttr(row.id)}" data-nombre="${escapeAttr(row.name)}" data-especie="${escapeAttr(row.species)}" data-riego="${escapeAttr(row.riego)}" data-riegos="${riegosAttr}" data-luz="${escapeAttr(row.luz)}" data-ubicacion="${escapeAttr(row.ubic)}" data-suelo="${escapeAttr(row.suelo)}" data-cuidado="${escapeAttr(row.cuidado)}" data-estado="${escapeAttr(row.estado)}" data-ultimo-riego="${escapeAttr(row.date)}" data-imagen="${escapeAttr(row.imagen)}" data-galeria="${galeriaAttr}"`;
  return `<div class="catalog-entry" data-riego="${escapeAttr(row.riego)}" data-riegos="${riegosAttr}" data-luz="${escapeAttr(row.luz)}" data-ubicacion="${escapeAttr(row.ubic)}" data-suelo="${escapeAttr(row.suelo)}" data-cuidado="${escapeAttr(row.cuidado)}">
  <figure class="catalog-tile">
    <div class="catalog-tile-head">
      <figcaption class="catalog-tile-name">${escapeAttr(row.name)}</figcaption>
      <button type="button" class="catalog-add catalog-add--tile" ${addAttrs} title="Agregar a Colección" aria-label="Agregar a Colección">(+)</button>
    </div>
    <div class="catalog-tile-media">
      <img src="${escapeAttr(row.imagen)}" alt="${escapeAttr(row.name)}" loading="lazy" width="300" height="300" />
    </div>
  </figure>
  <article class="catalog-spotlight">
    <div class="catalog-spotlight-side">
      <div class="catalog-spotlight-top">
        <span class="catalog-spotlight-name">${escapeAttr(row.name)}</span>
        <button type="button" class="catalog-add catalog-add--spotlight" ${addAttrs} title="Agregar a Colección" aria-label="Agregar a Colección">(+)</button>
      </div>
      <p class="catalog-spotlight-bottom">${escapeAttr(row.species)} · ${escapeAttr(row.ubic)}</p>
    </div>
    <figure class="catalog-spotlight-media">
      <img src="${escapeAttr(row.imagen)}" alt="${escapeAttr(row.name)}" loading="lazy" width="480" height="640" />
    </figure>
  </article>
  <div class="catalog-row" role="button" tabindex="0" aria-expanded="false">
    <span>${row.name}</span>
    <span>${row.species}</span>
    <span>${row.ubic}</span>
    <span>${row.luz}</span>
    <span class="catalog-riego">${row.riego}</span>
    <span>${row.suelo}</span>
    <span>${row.cuidado}</span>
    <span class="catalog-cell--action"><button type="button" class="catalog-add" ${addAttrs} title="Agregar a Colección" aria-label="Agregar a Colección">(Agregar)</button></span>
  </div>
  <div class="catalog-accordion" hidden>
    <div class="catalog-gallery">
    ${galleryHtml(row)}
    </div>
  </div>
</div>`;
}

const START_MARKER = '<!-- catalog-rows:start -->';
const END_MARKER = '<!-- catalog-rows:end -->';

function main() {
  const rows = buildRows(150);
  const html = rows.map(rowHtml).join('\n');

  const plantas = fs.readFileSync(PLANTAS_PATH, 'utf8');
  const startIdx = plantas.indexOf(START_MARKER);
  const endIdx = plantas.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    console.error('No se encontraron marcadores catalog-rows en plantas.html');
    process.exit(1);
  }

  const before = plantas.slice(0, startIdx + START_MARKER.length);
  const after = plantas.slice(endIdx);
  const replaced = `${before}\n${html}\n    ${after}`;

  fs.writeFileSync(PLANTAS_PATH, replaced, 'utf8');

  const byUbic = {};
  for (const row of rows) {
    byUbic[row.ubic] ??= new Set();
    byUbic[row.ubic].add(row.luz);
  }
  console.log(`Generadas ${rows.length} filas`);
  console.log(
    'Luz por ubicación:',
    Object.fromEntries(Object.entries(byUbic).map(([k, v]) => [k, [...v].sort()]))
  );
}

main();
