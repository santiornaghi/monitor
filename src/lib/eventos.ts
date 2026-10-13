import type { SupabaseClient } from "@supabase/supabase-js";

export async function registrarEvento(
  supabase: SupabaseClient,
  ev: { org_id: string; equipo_id: string; tipo: string; texto: string; datos?: unknown },
  usuario: { id: string; nombre: string }
) {
  await supabase.from("eventos").insert({ ...ev, usuario_id: usuario.id, usuario_nombre: usuario.nombre });
}

/** PostgREST devuelve una relación 1 a 1 como objeto o como arreglo según la versión. */
export function uno<T>(x: T | T[] | null | undefined): T | null {
  if (!x) return null;
  return Array.isArray(x) ? x[0] ?? null : x;
}
