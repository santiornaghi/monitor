"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";
import { registrarEvento } from "@/lib/eventos";
import { ESTADOS, numeroOT } from "@/lib/formato";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function crearOrden(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const equipo_id = txt(formData, "equipo_id");
  const { data: eq } = await supabase.from("equipos").select("org_id,proveedor_id,estado").eq("id", equipo_id).single();
  if (!eq) redirect("/ordenes/nueva?error=" + encodeURIComponent("Elegí un equipo."));
  const descripcion = txt(formData, "descripcion");
  const { data: ot, error } = await supabase.from("ordenes").insert({
    org_id: eq.org_id, equipo_id, descripcion, tipo: txt(formData, "tipo") || "Correctivo",
    prioridad: txt(formData, "prioridad") || "Media", reporta: txt(formData, "reporta") || nombreUsuario,
    proveedor_id: txt(formData, "proveedor_id") || eq.proveedor_id, created_by: user.id,
  }).select("id,numero").single();
  if (error) redirect("/ordenes/nueva?error=" + encodeURIComponent(error.message));
  const usuario = { id: user.id, nombre: nombreUsuario };
  await registrarEvento(supabase, { org_id: eq.org_id, equipo_id, tipo: "OT", texto: `${numeroOT(ot.numero)} abierta: ${descripcion}` }, usuario);
  if (formData.get("fuera") === "on" && eq.estado !== "fuera") {
    await supabase.from("equipos").update({ estado: "fuera" }).eq("id", equipo_id);
    await registrarEvento(supabase, { org_id: eq.org_id, equipo_id, tipo: "Estado", texto: `Estado: ${ESTADOS[eq.estado].label} → Fuera de servicio` }, usuario);
  }
  revalidatePath("/", "layout");
  redirect(`/ordenes/${ot.id}`);
}

export async function actualizarOrden(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const id = txt(formData, "id");
  const estado = txt(formData, "estado");
  const { data: ot } = await supabase.from("ordenes").select("numero,org_id,equipo_id,estado").eq("id", id).single();
  if (!ot || estado === "Cerrada" || ot.estado === estado) return;
  await supabase.from("ordenes").update({ estado, proveedor_id: txt(formData, "proveedor_id") || null }).eq("id", id);
  await registrarEvento(supabase, { org_id: ot.org_id, equipo_id: ot.equipo_id, tipo: "OT", texto: `${numeroOT(ot.numero)}: ${ot.estado} → ${estado}` }, { id: user.id, nombre: nombreUsuario });
  revalidatePath("/", "layout");
}

export async function cerrarOrden(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const id = txt(formData, "id");
  const { data: ot } = await supabase.from("ordenes").select("numero,org_id,equipo_id,equipos(estado)").eq("id", id).single();
  if (!ot) redirect("/ordenes");
  const trabajo = txt(formData, "trabajo");
  const costo = Number(txt(formData, "costo").replace(",", ".")) || 0;
  const { error } = await supabase.from("ordenes").update({ estado: "Cerrada", cerrada_en: new Date().toISOString(), trabajo, costo }).eq("id", id);
  if (error) redirect(`/ordenes/${id}?error=` + encodeURIComponent(error.message));
  const usuario = { id: user.id, nombre: nombreUsuario };
  await registrarEvento(supabase, { org_id: ot.org_id, equipo_id: ot.equipo_id, tipo: "OT", texto: `${numeroOT(ot.numero)} cerrada: ${trabajo}${costo ? ` (${"$ " + costo.toLocaleString("es-AR")})` : ""}`, datos: { costo } }, usuario);
  const nuevo = txt(formData, "estado_equipo");
  const actual = (Array.isArray(ot.equipos) ? ot.equipos[0] : (ot.equipos as any))?.estado;
  if (ESTADOS[nuevo] && nuevo !== actual) {
    await supabase.from("equipos").update({ estado: nuevo }).eq("id", ot.equipo_id);
    await registrarEvento(supabase, { org_id: ot.org_id, equipo_id: ot.equipo_id, tipo: "Estado", texto: `Estado: ${ESTADOS[actual]?.label ?? actual} → ${ESTADOS[nuevo].label}` }, usuario);
  }
  revalidatePath("/", "layout");
  redirect(`/ordenes/${id}`);
}
