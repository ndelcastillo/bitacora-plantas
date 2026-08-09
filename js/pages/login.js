import { signIn, signUp, getSession } from '../services/auth.js';
import { qs, showError, clearError } from '../utils/dom.js';

const form = qs('#form-auth');
const errorEl = qs('#error-auth');
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
  actualizarModo();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError(errorEl);
  const email = qs('#email').value;
  const password = qs('#password').value;

  try {
    if (modo === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError(errorEl, err.message);
  }
});

(async function redirigirSiYaHaySesion() {
  const session = await getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
})();
