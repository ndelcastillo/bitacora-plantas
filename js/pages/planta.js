import { getSession } from '../services/auth.js';
import { obtenerPlanta, actualizarPlanta, subirFotoPlanta, obtenerUrlFoto } from '../services/plantas.js';
import { listarConfig, guardarConfig, listarBitacora, registrarCuidado } from '../services/cuidados.js';
import { TIPOS_CUIDADO } from '../utils/recordatorios.js';
import { qs, qsa, showError, clearError } from '../utils/dom.js';

const ETIQUETAS_TIPO = {
  regar: 'Regar',
  fertilizar: 'Fertilizar',
  trasplantar: 'Trasplantar',
  podar: 'Podar',
  otro: 'Otro',
};

const plantaId = new URLSearchParams(window.location.search).get('id');

async function requerirSesion() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

async function renderFoto(planta) {
  const url = await obtenerUrlFoto(planta.foto_url);
  const container = qs('#foto-container');
  container.innerHTML = url
    ? `<img src="${url}" alt="${planta.nombre}" style="width:100%; max-width:320px; aspect-ratio:1/1; object-fit:cover; border:1px solid var(--color-border);" />`
    : '';
}

function rellenarFormPlanta(planta) {
  qs('#nombre').value = planta.nombre ?? '';
  qs('#especie').value = planta.especie ?? '';
  qs('#ubicacion').value = planta.ubicacion ?? '';
  qs('#fecha_adquisicion').value = planta.fecha_adquisicion ?? '';
  qs('#notas').value = planta.notas ?? '';
}

function wireFormPlanta(planta) {
  const form = qs('#form-planta');
  const errorEl = qs('#error-planta');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError(errorEl);

    const cambios = {
      nombre: qs('#nombre').value,
      especie: qs('#especie').value || null,
      ubicacion: qs('#ubicacion').value || null,
      fecha_adquisicion: qs('#fecha_adquisicion').value || null,
      notas: qs('#notas').value || null,
    };
    const archivoFoto = qs('#foto').files[0];

    try {
      if (archivoFoto) {
        try {
          const path = await subirFotoPlanta(planta.user_id, planta.id, archivoFoto);
          cambios.foto_url = path;
        } catch (fotoError) {
          showError(errorEl, `Los datos se guardarán, pero la foto no se pudo subir: ${fotoError.message}`);
        }
      }
      const actualizada = await actualizarPlanta(planta.id, cambios);
      await renderFoto(actualizada);
    } catch (err) {
      showError(errorEl, err.message);
    }
  });
}

async function renderConfigCuidados(plantaId) {
  const container = qs('#config-cuidados');
  const configs = await listarConfig(plantaId);
  const porTipo = Object.fromEntries(configs.map((c) => [c.tipo, c.frecuencia_dias]));

  container.innerHTML = TIPOS_CUIDADO.map(
    (tipo) => `
      <div class="field" style="flex-direction: row; align-items: center; gap: var(--space-3);">
        <label style="min-width: 140px;" for="frecuencia-${tipo}">${ETIQUETAS_TIPO[tipo]}</label>
        <input class="input" style="max-width: 100px;" type="number" min="1" id="frecuencia-${tipo}"
          value="${porTipo[tipo] ?? ''}" placeholder="días" />
      </div>
    `
  ).join('');

  qsa('#config-cuidados input').forEach((input) => {
    input.addEventListener('change', async () => {
      const tipo = input.id.replace('frecuencia-', '');
      const valor = input.value ? Number(input.value) : null;
      await guardarConfig(plantaId, tipo, valor);
    });
  });
}

function poblarSelectTipos() {
  const select = qs('#tipo-cuidado');
  select.innerHTML = TIPOS_CUIDADO.map((tipo) => `<option value="${tipo}">${ETIQUETAS_TIPO[tipo]}</option>`).join('');
}

function wireFormCuidado(plantaId) {
  const form = qs('#form-cuidado');
  const errorEl = qs('#error-cuidado');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError(errorEl);

    const tipo = qs('#tipo-cuidado').value;
    const fecha = qs('#fecha-cuidado').value;
    const notas = qs('#notas-cuidado').value || null;

    try {
      await registrarCuidado(plantaId, tipo, new Date(fecha).toISOString(), notas);
      form.reset();
      await renderBitacora(plantaId);
    } catch (err) {
      showError(errorEl, err.message);
    }
  });
}

async function renderBitacora(plantaId) {
  const lista = qs('#lista-bitacora');
  const eventos = await listarBitacora(plantaId);

  lista.innerHTML = eventos
    .map(
      (evento) => `
        <li class="card" style="margin-bottom: var(--space-3);">
          <strong>${ETIQUETAS_TIPO[evento.tipo]}</strong> — ${new Date(evento.fecha).toLocaleDateString('es')}
          ${evento.notas ? `<p style="margin: var(--space-2) 0 0 0;">${evento.notas}</p>` : ''}
        </li>
      `
    )
    .join('');
}

(async function init() {
  const session = await requerirSesion();
  if (!session) return;

  if (!plantaId) {
    window.location.href = 'dashboard.html';
    return;
  }

  const planta = await obtenerPlanta(plantaId);
  rellenarFormPlanta(planta);
  await renderFoto(planta);
  wireFormPlanta(planta);

  poblarSelectTipos();
  qs('#fecha-cuidado').valueAsDate = new Date();

  await renderConfigCuidados(plantaId);
  wireFormCuidado(plantaId);
  await renderBitacora(plantaId);
})();
