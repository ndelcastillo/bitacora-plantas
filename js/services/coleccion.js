import { supabase } from '../config.js';
import { getSession } from './auth.js';

const STORAGE_KEY = 'bitacora-coleccion';

// Cache local para optimización
let coleccionCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Listeners para cambios en tiempo real
let realtimeSubscription = null;
let onChangeCallbacks = [];

function leerDelCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardarEnCache(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cacheValido() {
  return coleccionCache && Date.now() - cacheTimestamp < CACHE_DURATION;
}

async function leerDeSupabase() {
  const session = await getSession();
  if (!session?.user?.id) {
    return leerDelCache();
  }

  try {
    const { data, error } = await supabase
      .from('user_collection')
      .select('*')
      .eq('user_id', session.user.id)
      .order('nombre', { ascending: true });

    if (error) throw error;

    // Guardar en cache local como backup
    guardarEnCache(data || []);
    coleccionCache = data || [];
    cacheTimestamp = Date.now();

    return data || [];
  } catch (error) {
    console.error('Error leyendo colección de Supabase:', error);
    return leerDelCache();
  }
}

async function leer() {
  if (cacheValido()) {
    return coleccionCache;
  }
  return await leerDeSupabase();
}

export async function listarColeccion() {
  const items = await leer();
  return items.sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );
}

export async function contarColeccion() {
  const items = await leer();
  return items.length;
}

export async function estaEnColeccion(id) {
  const items = await leer();
  return items.some((p) => p.planta_id === id || p.id === id);
}

export async function agregarAColeccion(planta) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, reason: 'not_authenticated' };
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

  const nuevoItem = {
    user_id: session.user.id,
    planta_id: planta.id,
    nombre: planta.nombre,
    especie: planta.especie,
    riego: planta.riego,
    riegos,
    luz: planta.luz,
    ubicacion: planta.ubicacion,
    suelo: planta.suelo,
    cuidado: planta.cuidado,
    estado: planta.estado || 'Sin registrar',
    ultimoriego: planta.ultimoRiego,
    imagen: planta.imagen || null,
    galeria: Array.isArray(planta.galeria) ? planta.galeria : [],
  };

  try {
    const { error } = await supabase
      .from('user_collection')
      .insert([nuevoItem]);

    if (error) {
      if (error.code === '23505') {
        // Violación de constraint UNIQUE
        return { ok: false, reason: 'duplicate' };
      }
      throw error;
    }

    // Invalidar cache para que se recargue en la próxima lectura
    coleccionCache = null;

    return { ok: true };
  } catch (error) {
    console.error('Error agregando a colección:', error);
    return { ok: false, reason: 'error' };
  }
}

export async function quitarDeColeccion(id) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, reason: 'not_authenticated' };
  }

  try {
    // Buscar por planta_id o id
    const { data: items, error: selectError } = await supabase
      .from('user_collection')
      .select('id')
      .eq('user_id', session.user.id)
      .or(`planta_id.eq.${id},id.eq.${id}`);

    if (selectError) throw selectError;
    if (!items || items.length === 0) {
      return { ok: false, reason: 'missing' };
    }

    const { error: deleteError } = await supabase
      .from('user_collection')
      .delete()
      .eq('user_id', session.user.id)
      .or(`planta_id.eq.${id},id.eq.${id}`);

    if (deleteError) throw deleteError;

    // Invalidar cache
    coleccionCache = null;

    return { ok: true };
  } catch (error) {
    console.error('Error quitando de colección:', error);
    return { ok: false, reason: 'error' };
  }
}

export function idDesdePlanta({ nombre, especie, ubicacion }) {
  return [nombre, especie, ubicacion].join('::').toLowerCase();
}

// Sincronización en tiempo real con Supabase
async function setupRealtimeSync() {
  const session = await getSession();
  if (!session?.user?.id) return;

  // Cancelar suscripción anterior si existe
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription);
  }

  // Suscribirse a cambios en tiempo real
  realtimeSubscription = supabase
    .channel(`user_collection:${session.user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_collection',
        filter: `user_id=eq.${session.user.id}`,
      },
      () => {
        // Invalidar cache cuando hay cambios
        coleccionCache = null;
        // Notificar a listeners
        onChangeCallbacks.forEach(cb => cb?.());
      }
    )
    .subscribe();
}

export function onColeccionChange(callback) {
  onChangeCallbacks.push(callback);
  setupRealtimeSync().catch(console.error);

  // Retornar función para desuscribirse
  return () => {
    onChangeCallbacks = onChangeCallbacks.filter(cb => cb !== callback);
  };
}
