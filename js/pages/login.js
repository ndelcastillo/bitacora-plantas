import { signIn, signUp, getSession } from '../services/auth.js';
import { qs, showError, clearError, showStatus, clearStatus } from '../utils/dom.js';
import { iniciarPagina } from '../utils/guard.js';

const form = qs('#form-auth');
const errorEl = qs('#error-auth');
const statusEl = qs('#status-auth');
const toggleBtn = qs('#btn-toggle');
const submitBtn = qs('#btn-submit');
const titulo = qs('#titulo-form');

let modo = 'login';

function actualizarModo() {
  if (modo === 'login') {
    titulo.textContent = 'Iniciar sesión';
    submitBtn.textContent = 'Iniciar sesión';
    toggleBtn.textContent = '¿No tenés cuenta? Creá una';
  } else {
    titulo.textContent = 'Crear cuenta';
    submitBtn.textContent = 'Crear cuenta';
    toggleBtn.textContent = '¿Ya tenés cuenta? Iniciá sesión';
  }
}

toggleBtn.addEventListener('click', () => {
  modo = modo === 'login' ? 'signup' : 'login';
  clearError(errorEl);
  clearStatus(statusEl);
  actualizarModo();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError(errorEl);
  clearStatus(statusEl);
  const email = qs('#email').value;
  const password = qs('#password').value;

  try {
    const data = modo === 'login' ? await signIn(email, password) : await signUp(email, password);

    // Con confirmación por email activada, signUp devuelve `session: null` sin
    // error: la cuenta existe pero todavía no hay sesión, así que redirigir
    // acá rebotaría de vuelta al login sin explicación.
    if (!data?.session) {
      showStatus(statusEl, 'Te enviamos un email para confirmar tu cuenta. Confirmalo y después iniciá sesión.');
      return;
    }

    window.location.href = 'dashboard.html';
  } catch (err) {
    showError(errorEl, err.message);
  }
});

iniciarPagina(async function redirigirSiYaHaySesion() {
  const session = await getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
});
