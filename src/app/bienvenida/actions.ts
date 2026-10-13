"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function crearOrganizacion(formData: FormData) {
  const supabase = await createClient();
  const tipo = formData.get("tipo") === "proveedor" ? "proveedor" : "institucion";
  const { data: id, error } = await supabase.rpc("crear_organizacion", {
    p_nombre: String(formData.get("nombre")).trim(),
    p_tipo: tipo,
    p_ciudad: String(formData.get("ciudad") ?? "").trim(),
    p_provincia: String(formData.get("provincia") ?? "").trim(),
    p_usuario: String(formData.get("usuario") ?? "").trim(),
  });
  if (error) redirect("/bienvenida?error=" + encodeURIComponent(error.message));

  let institucion = id as string;
  if (tipo === "proveedor") {
    // Un proveedor arranca con un primer cliente para poder cargar equipos
    const cliente = String(formData.get("cliente") ?? "").trim() || "Primer cliente";
    const { data: cid, error: e2 } = await supabase.rpc("crear_cliente", {
      p_proveedor: id, p_nombre: cliente, p_ciudad: "", p_provincia: "",
    });
    if (e2) redirect("/bienvenida?error=" + encodeURIComponent(e2.message));
    institucion = cid as string;
  }
  if (formData.get("ejemplo") === "on") {
    await supabase.rpc("cargar_ejemplo", { p_org: institucion });
  }
  (await cookies()).set("org", "todas", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/");
}
