"use server";

import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";
import { registrarEvento } from "@/lib/eventos";
import { BUCKET, TIPOS_DOC } from "@/lib/documentos";

type Entrada = {
  equipoId: string;
  alcance: "equipo" | "modelo";
  tipo: string;
  nombre: string;
  publico: boolean;
  vence?: string;
  path?: string;
  url?: string;
};

export async function registrarDocumento(d: Entrada): Promise<{ error?: string }> {
  const { supabase, user, nombreUsuario } = await contexto();
  const { data: eq } = await supabase.from("equipos").select("id,org_id,marca,modelo").eq("id", d.equipoId).single();
  if (!eq) return { error: "No se encontró el equipo." };
  if (!TIPOS_DOC[d.tipo]) return { error: "Tipo de documento inválido." };
  if (d.path && !d.path.startsWith(`${eq.org_id}/`)) return { error: "Ruta de archivo inválida." };
  if (d.url && !/^https?:\/\//i.test(d.url)) return { error: "El enlace tiene que empezar con http:// o https://" };
  if (!d.path && !d.url) return { error: "Subí un archivo o pegá un enlace." };

  const { error } = await supabase.from("documentos").insert({
    org_id: eq.org_id,
    equipo_id: d.alcance === "equipo" ? eq.id : null,
    marca: d.alcance === "modelo" ? eq.marca : null,
    modelo: d.alcance === "modelo" ? eq.modelo : null,
    tipo: d.tipo,
    nombre: d.nombre.trim() || TIPOS_DOC[d.tipo],
    path: d.path || null,
    url: d.url || null,
    publico: d.publico,
    vence: d.vence || null,
    subido_por: user.id,
    subido_por_nombre: nombreUsuario,
  });
  if (error) {
    if (d.path) await supabase.storage.from(BUCKET).remove([d.path]);
    return { error: error.message };
  }
  await registrarEvento(supabase, {
    org_id: eq.org_id, equipo_id: eq.id, tipo: "Documento",
    texto: `${TIPOS_DOC[d.tipo]} agregado: ${d.nombre.trim() || TIPOS_DOC[d.tipo]}${d.alcance === "modelo" ? ` (para todos los ${eq.marca} ${eq.modelo})` : ""}${d.vence ? `, vence ${d.vence.split("-").reverse().join("/")}` : ""}`,
  }, { id: user.id, nombre: nombreUsuario });
  revalidatePath(`/equipos/${eq.id}`);
  return {};
}

export async function borrarDocumento(formData: FormData) {
  const { supabase } = await contexto();
  const id = String(formData.get("id"));
  const equipoId = String(formData.get("equipo_id"));
  const { data: doc } = await supabase.from("documentos").select("path").eq("id", id).single();
  const { error } = await supabase.from("documentos").delete().eq("id", id);
  if (!error && doc?.path) await supabase.storage.from(BUCKET).remove([doc.path]);
  revalidatePath(`/equipos/${equipoId}`);
}
