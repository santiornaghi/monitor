import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./clave";

/**
 * Cliente con permisos totales, solo para tareas del servidor (avisos por email).
 * Nunca importar desde un componente de cliente. Devuelve null si falta la clave secreta.
 */
export function clienteAdmin() {
  const clave = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) return null;
  return createClient(SUPABASE_URL, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}
