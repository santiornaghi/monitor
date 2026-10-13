"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { contexto } from "@/lib/contexto";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function crearProveedor(formData: FormData) {
  const { supabase } = await contexto();
  const { error } = await supabase.from("proveedores").insert({
    org_id: txt(formData, "org_id"), nombre: txt(formData, "nombre"), especialidad: txt(formData, "especialidad") || null,
    localidad: txt(formData, "localidad") || null, provincia: txt(formData, "provincia") || null,
    telefono: txt(formData, "telefono") || null, email: txt(formData, "email") || null,
  });
  if (error) redirect("/proveedores?error=" + encodeURIComponent(error.message));
  revalidatePath("/proveedores");
  redirect("/proveedores");
}

export async function crearCliente(formData: FormData) {
  const { supabase, proveedorPropio } = await contexto();
  if (!proveedorPropio) redirect("/");
  const { data: id, error } = await supabase.rpc("crear_cliente", {
    p_proveedor: proveedorPropio.id, p_nombre: txt(formData, "nombre"), p_ciudad: txt(formData, "ciudad"), p_provincia: txt(formData, "provincia"),
  });
  if (error) redirect("/clientes?error=" + encodeURIComponent(error.message));
  (await cookies()).set("org", id as string, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
  redirect("/equipos/nuevo");
}
