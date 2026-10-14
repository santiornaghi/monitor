"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => { const v = txt(f, k).replace(",", "."); return v === "" ? null : Number(v); };

export async function crearRepuesto(formData: FormData) {
  const { supabase, nombreUsuario } = await contexto();
  const { data, error } = await supabase.from("repuestos").insert({
    org_id: txt(formData, "org_id"),
    codigo: txt(formData, "codigo") || null,
    descripcion: txt(formData, "descripcion"),
    compatible: txt(formData, "compatible") || null,
    ubicacion: txt(formData, "ubicacion") || null,
    stock_minimo: num(formData, "stock_minimo") ?? 0,
    costo_unitario: num(formData, "costo_unitario") ?? 0,
    proveedor_id: txt(formData, "proveedor_id") || null,
  }).select("id").single();
  if (error) redirect("/repuestos?error=" + encodeURIComponent(error.code === "23505" ? "Ya existe un repuesto con ese código." : error.message));
  const inicial = num(formData, "stock_inicial");
  if (inicial && inicial > 0) await supabase.rpc("mover_stock", { p_repuesto: data.id, p_cantidad: Math.round(inicial), p_motivo: "Stock inicial", p_costo: null, p_usuario: nombreUsuario });
  revalidatePath("/", "layout");
  redirect(`/repuestos/${data.id}?aviso=` + encodeURIComponent("Repuesto agregado."));
}

export async function editarRepuesto(formData: FormData) {
  const { supabase } = await contexto();
  const id = txt(formData, "id");
  const { error } = await supabase.from("repuestos").update({
    codigo: txt(formData, "codigo") || null,
    descripcion: txt(formData, "descripcion"),
    compatible: txt(formData, "compatible") || null,
    ubicacion: txt(formData, "ubicacion") || null,
    stock_minimo: num(formData, "stock_minimo") ?? 0,
    costo_unitario: num(formData, "costo_unitario") ?? 0,
    proveedor_id: txt(formData, "proveedor_id") || null,
  }).eq("id", id);
  redirect(`/repuestos/${id}?` + (error ? "error=" + encodeURIComponent(error.message) : "aviso=" + encodeURIComponent("Datos guardados.")));
}

export async function moverStock(formData: FormData) {
  const { supabase, nombreUsuario } = await contexto();
  const id = txt(formData, "id");
  const cantidad = Math.round(num(formData, "cantidad") ?? 0) * (txt(formData, "sentido") === "salida" ? -1 : 1);
  const { error } = await supabase.rpc("mover_stock", {
    p_repuesto: id, p_cantidad: cantidad, p_motivo: txt(formData, "motivo"), p_costo: num(formData, "costo"), p_usuario: nombreUsuario,
  });
  revalidatePath("/", "layout");
  redirect(`/repuestos/${id}?` + (error ? "error=" + encodeURIComponent(error.message) : "aviso=" + encodeURIComponent("Stock actualizado.")));
}

export async function usarRepuesto(formData: FormData) {
  const { supabase, nombreUsuario } = await contexto();
  const orden = txt(formData, "orden_id");
  const { error } = await supabase.rpc("usar_repuesto", {
    p_orden: orden, p_repuesto: txt(formData, "repuesto_id"), p_cantidad: Math.round(num(formData, "cantidad") ?? 0), p_usuario: nombreUsuario,
  });
  revalidatePath("/", "layout");
  redirect(`/ordenes/${orden}` + (error ? "?error=" + encodeURIComponent(error.message) : ""));
}

export async function devolverRepuesto(formData: FormData) {
  const { supabase, nombreUsuario } = await contexto();
  const orden = txt(formData, "orden_id");
  const { error } = await supabase.rpc("devolver_repuesto", { p_linea: txt(formData, "linea_id"), p_usuario: nombreUsuario });
  revalidatePath("/", "layout");
  redirect(`/ordenes/${orden}` + (error ? "?error=" + encodeURIComponent(error.message) : ""));
}
