import { supabase } from '../config.js';

export async function listarPlantas() {
  const { data, error } = await supabase
    .from('plantas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function obtenerPlanta(id) {
  const { data, error } = await supabase.from('plantas').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function crearPlanta(planta) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from('plantas')
    .insert({ ...planta, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarPlanta(id, cambios) {
  const { data, error } = await supabase
    .from('plantas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function subirFotoPlanta(userId, plantaId, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${plantaId}.${ext}`;
  const { error } = await supabase.storage
    .from('plantas-fotos')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function obtenerUrlFoto(fotoPath) {
  if (!fotoPath) return null;
  const { data, error } = await supabase.storage
    .from('plantas-fotos')
    .createSignedUrl(fotoPath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
