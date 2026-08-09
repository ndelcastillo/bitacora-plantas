import { supabase } from '../config.js';
import { calcularProximoVencimiento, calcularEstadoPlanta } from '../utils/recordatorios.js';

export async function listarConfig(plantaId) {
  const { data, error } = await supabase
    .from('cuidado_config')
    .select('*')
    .eq('planta_id', plantaId);
  if (error) throw error;
  return data;
}

export async function guardarConfig(plantaId, tipo, frecuenciaDias) {
  const { data, error } = await supabase
    .from('cuidado_config')
    .upsert({ planta_id: plantaId, tipo, frecuencia_dias: frecuenciaDias }, { onConflict: 'planta_id,tipo' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listarBitacora(plantaId) {
  const { data, error } = await supabase
    .from('cuidados')
    .select('*')
    .eq('planta_id', plantaId)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return data;
}

export async function registrarCuidado(plantaId, tipo, fecha, notas) {
  const { data, error } = await supabase
    .from('cuidados')
    .insert({ planta_id: plantaId, tipo, fecha, notas })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function calcularEstadoDePlanta(planta) {
  const configs = await listarConfig(planta.id);
  const vencimientos = [];

  for (const cfg of configs) {
    if (cfg.frecuencia_dias == null) continue;

    const { data: ultimos, error } = await supabase
      .from('cuidados')
      .select('fecha')
      .eq('planta_id', planta.id)
      .eq('tipo', cfg.tipo)
      .order('fecha', { ascending: false })
      .limit(1);
    if (error) throw error;

    const ultimaFecha = ultimos[0]?.fecha ?? null;
    vencimientos.push(
      calcularProximoVencimiento({
        ultimaFecha,
        fechaAlta: planta.fecha_adquisicion ?? planta.created_at,
        frecuenciaDias: cfg.frecuencia_dias,
      })
    );
  }

  return calcularEstadoPlanta(vencimientos);
}
