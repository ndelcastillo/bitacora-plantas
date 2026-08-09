import { getSession, signOut } from '../services/auth.js';
import { listarPlantas, crearPlanta, subirFotoPlanta, actualizarPlanta, obtenerUrlFoto } from '../services/plantas.js';
import { calcularEstadoDePlanta } from '../services/cuidados.js';
import { qs, showError, clearError } from '../utils/dom.js';

const ETIQUETAS_ESTADO = {
  vencido: { texto: 'Vencido', clase: 'badge-vencido' },
  proximo: { texto: 'Próximo', clase: 'badge-proximo' },
  al_dia: { texto: 'Al día', clase: 'badge-neutral' },
  sin_registrar: { texto: 'Sin registrar', clase: 'badge-neutral' },
};

async function requerirSesion() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

async function renderPlantas() {
  const grid = qs('#grid-plantas');
  const mensajeVacio = qs('#mensaje-vacio');
  grid.innerHTML = '';

  const plantas = await listarPlantas();
  if (plantas.length === 0) {
    mensajeVacio.hidden = false;
    return;
  }
  mensajeVacio.hidden = true;

  for (const planta of plantas) {
    const [estado, fotoUrl] = await Promise.all([
      calcularEstadoDePlanta(planta),
      obtenerUrlFoto(planta.foto_url),
    ]);

    const etiqueta = ETIQUETAS_ESTADO[estado];
    const card = document.createElement('a');
    card.href = `planta.html?id=${planta.id}`;
    card.className = 'planta-card';
    card.innerHTML = `
      ${fotoUrl ? `<img src="${fotoUrl}" alt="${planta.nombre}" />` : `<div class="placeholder-foto"></div>`}
      <h3>${planta.nombre}</h3>
      <p>${planta.especie ?? ''}</p>
      <p class="${etiqueta.clase}">${etiqueta.texto}</p>
    `;
    grid.appendChild(card);
  }
}

function wireLogout() {
  qs('#btn-logout').addEventListener('click', async () => {
    await signOut();
    window.location.href = 'index.html';
  });
}

function wireNuevaPlanta() {
  const dialog = qs('#dialog-nueva-planta');
  const form = qs('#form-nueva-planta');
  const errorEl = qs('#error-nueva-planta');

  qs('#btn-nueva-planta').addEventListener('click', () => dialog.showModal());
  qs('#btn-cancelar-planta').addEventListener('click', () => dialog.close());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError(errorEl);

    const datos = {
      nombre: qs('#nombre').value,
      especie: qs('#especie').value || null,
      ubicacion: qs('#ubicacion').value || null,
      fecha_adquisicion: qs('#fecha_adquisicion').value || null,
    };
    const archivoFoto = qs('#foto').files[0];

    try {
      const planta = await crearPlanta(datos);
      let advertenciaFoto = null;

      if (archivoFoto) {
        try {
          const path = await subirFotoPlanta(planta.user_id, planta.id, archivoFoto);
          await actualizarPlanta(planta.id, { foto_url: path });
        } catch (fotoError) {
          advertenciaFoto = `Planta guardada, pero la foto no se pudo subir: ${fotoError.message}`;
        }
      }

      await renderPlantas();

      if (advertenciaFoto) {
        // Dejamos el diálogo abierto para que el usuario vea la advertencia.
        showError(errorEl, advertenciaFoto);
      } else {
        form.reset();
        dialog.close();
      }
    } catch (err) {
      showError(errorEl, err.message);
    }
  });
}

(async function init() {
  const session = await requerirSesion();
  if (!session) return;

  wireLogout();
  wireNuevaPlanta();
  await renderPlantas();
})();
