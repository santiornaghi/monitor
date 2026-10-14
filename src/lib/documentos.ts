import type { SupabaseClient } from "@supabase/supabase-js";

export const TIPOS_DOC: Record<string, string> = {
  manual_usuario: "Manual de usuario",
  manual_servicio: "Manual de servicio",
  certificado: "Certificado de calibración",
  foto: "Foto",
  otro: "Otro documento",
};

export const BUCKET = "documentos";
export const TAMANO_MAXIMO = 50 * 1024 * 1024;
export const TIPOS_ARCHIVO = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

export type Doc = { nombre: string; tipo: string; path: string | null; url: string | null };

/** Devuelve el enlace de cada documento: el externo, o uno firmado que vence en 1 hora. */
export async function enlaces<T extends Doc>(supabase: SupabaseClient, docs: T[]) {
  const paths = docs.map((d) => d.path).filter((p): p is string => !!p);
  const firmados = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    (data ?? []).forEach((s) => { if (s.path && s.signedUrl) firmados.set(s.path, s.signedUrl); });
  }
  return docs.map((d) => ({ ...d, href: d.url ?? (d.path ? firmados.get(d.path) ?? null : null) }));
}
