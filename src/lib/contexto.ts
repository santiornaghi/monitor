import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Org = { id: string; nombre: string; tipo: "institucion" | "proveedor"; ciudad: string | null; provincia: string | null };

/**
 * Devuelve el usuario, las organizaciones que puede ver y el alcance elegido.
 * `orgIds` son las instituciones cuyo parque se muestra según el selector.
 */
export async function contexto() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: orgsData } = await supabase.from("organizaciones").select("id,nombre,tipo,ciudad,provincia").order("nombre");
  const orgs = (orgsData ?? []) as Org[];
  if (orgs.length === 0) redirect("/bienvenida");

  const { data: miembrosData } = await supabase.from("miembros").select("org_id,rol,nombre").eq("user_id", auth.user.id);
  const membresias = miembrosData ?? [];

  const instituciones = orgs.filter((o) => o.tipo === "institucion");
  const proveedorPropio = orgs.find((o) => o.tipo === "proveedor" && membresias.some((m) => m.org_id === o.id));

  const elegido = (await cookies()).get("org")?.value ?? "todas";
  const alcance = instituciones.some((o) => o.id === elegido) ? elegido : "todas";
  const ids = alcance === "todas" ? instituciones.map((o) => o.id) : [alcance];
  // Sin instituciones todavía (proveedor recién creado): un id imposible evita un filtro vacío
  const orgIds = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];

  const nombreUsuario = membresias[0]?.nombre || auth.user.email || "Usuario";
  const esAdminDe = (orgId: string) => membresias.some((m) => m.org_id === orgId && m.rol === "admin");

  return { supabase, user: auth.user, orgs, instituciones, proveedorPropio, alcance, orgIds, nombreUsuario, esAdminDe, membresias };
}

export function nombreOrg(orgs: Org[], id: string) {
  return orgs.find((o) => o.id === id)?.nombre ?? "";
}
