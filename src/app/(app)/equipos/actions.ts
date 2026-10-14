"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";
import { registrarEvento } from "@/lib/eventos";
import { FRECUENCIA_DEFECTO, TIPOS } from "@/lib/protocolos";
import { ESTADOS, hoyISO, sumarDias } from "@/lib/formato";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function crearEquipo(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const org_id = txt(formData, "org_id");
  const tipo = txt(formData, "tipo");
  const frecuencia = Number(formData.get("frecuencia")) || FRECUENCIA_DEFECTO[tipo] || 365;
  const frecuenciaHoras = Number(formData.get("frecuencia_horas")) || null;
  const horasIniciales = formData.get("horas_uso") ? Number(formData.get("horas_uso")) : null;
  const { data, error } = await supabase.from("equipos").insert({
    org_id, tipo,
    marca: txt(formData, "marca"), modelo: txt(formData, "modelo"), serial: txt(formData, "serial"),
    nro_inventario: txt(formData, "nro_inventario") || null, umdns: txt(formData, "umdns") || null,
    sede: txt(formData, "sede") || null, servicio: txt(formData, "servicio") || "Sin asignar",
    proveedor_id: txt(formData, "proveedor_id") || null,
    garantia_hasta: txt(formData, "garantia_hasta") || null,
    horas_uso: horasIniciales,
  }).select("id").single();
  if (error) {
    const msg = error.code === "23505" ? "Ya existe un equipo con ese serial en la institución." : error.message;
    redirect("/equipos/nuevo?error=" + encodeURIComponent(msg));
  }
  await supabase.from("planes_preventivo").insert({
    org_id, equipo_id: data.id, frecuencia_dias: frecuencia, proxima: txt(formData, "proxima") || sumarDias(hoyISO(), 30),
    ...(frecuenciaHoras ? { frecuencia_horas: frecuenciaHoras, proximas_horas: (horasIniciales ?? 0) + frecuenciaHoras } : {}),
  });
  await registrarEvento(supabase, { org_id, equipo_id: data.id, tipo: "Alta", texto: `Alta en inventario — ${txt(formData, "servicio") || "Sin asignar"}` }, { id: user.id, nombre: nombreUsuario });
  revalidatePath("/", "layout");
  redirect(`/equipos/${data.id}?aviso=` + encodeURIComponent("Equipo agregado. Ya tiene su código QR."));
}

/** Parser CSV mínimo con soporte de comillas. */
function parseCSV(texto: string) {
  const filas: string[][] = [];
  const sep = texto.split("\n")[0].includes(";") ? ";" : ",";
  for (const linea of texto.split(/\r?\n/)) {
    if (!linea.trim()) continue;
    const celdas: string[] = []; let cur = ""; let q = false;
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i];
      if (c === '"') { if (q && linea[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === sep && !q) { celdas.push(cur.trim()); cur = ""; }
      else cur += c;
    }
    celdas.push(cur.trim());
    filas.push(celdas);
  }
  return filas;
}

export async function importarCSV(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const org_id = txt(formData, "org_id");
  let texto = txt(formData, "csv");
  const archivo = formData.get("archivo");
  if (archivo instanceof File && archivo.size > 0) texto = await archivo.text();
  const filas = parseCSV(texto);
  if (filas.length < 2) redirect("/equipos/importar?error=" + encodeURIComponent("El archivo no tiene filas para importar."));
  const head = filas[0].map((h) => h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
  const col = (n: string) => head.indexOf(n);
  if (col("serial") < 0 || col("tipo") < 0) redirect("/equipos/importar?error=" + encodeURIComponent("Faltan las columnas obligatorias: tipo y serial."));

  const registros = filas.slice(1).map((c) => ({
    org_id,
    tipo: TIPOS.includes(c[col("tipo")]) ? c[col("tipo")] : "Otro",
    marca: col("marca") >= 0 ? c[col("marca")] ?? "" : "",
    modelo: col("modelo") >= 0 ? c[col("modelo")] ?? "" : "",
    serial: c[col("serial")] ?? "",
    servicio: (col("servicio") >= 0 && c[col("servicio")]) || "Sin asignar",
    nro_inventario: col("inventario") >= 0 ? c[col("inventario")] || null : null,
  })).filter((r) => r.serial);

  const { data: existentes } = await supabase.from("equipos").select("serial").eq("org_id", org_id);
  const ya = new Set((existentes ?? []).map((e) => e.serial.toLowerCase()));
  const vistos = new Set<string>();
  const nuevos = registros.filter((r) => { const k = r.serial.toLowerCase(); if (ya.has(k) || vistos.has(k)) return false; vistos.add(k); return true; });
  const descartados = filas.length - 1 - nuevos.length;

  if (nuevos.length) {
    const { data, error } = await supabase.from("equipos").insert(nuevos).select("id,tipo,servicio");
    if (error) redirect("/equipos/importar?error=" + encodeURIComponent(error.message));
    const hoy = hoyISO();
    await supabase.from("planes_preventivo").insert(data!.map((e) => ({ org_id, equipo_id: e.id, frecuencia_dias: FRECUENCIA_DEFECTO[e.tipo] || 365, proxima: sumarDias(hoy, 30) })));
    await supabase.from("eventos").insert(data!.map((e) => ({ org_id, equipo_id: e.id, tipo: "Alta", texto: `Alta por importación — ${e.servicio}`, usuario_id: user.id, usuario_nombre: nombreUsuario })));
  }
  revalidatePath("/", "layout");
  redirect("/equipos?aviso=" + encodeURIComponent(`${nuevos.length} equipos importados${descartados ? `, ${descartados} descartados por serial vacío o repetido` : ""}.`));
}

export async function cambiarEstado(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const id = txt(formData, "id");
  const estado = txt(formData, "estado");
  if (!ESTADOS[estado]) return;
  const { data: eq } = await supabase.from("equipos").select("org_id,estado").eq("id", id).single();
  if (!eq || eq.estado === estado) return;
  const { error } = await supabase.from("equipos").update({ estado }).eq("id", id);
  if (error) redirect(`/equipos/${id}?error=` + encodeURIComponent("No tenés permiso para cambiar este equipo."));
  await registrarEvento(supabase, { org_id: eq.org_id, equipo_id: id, tipo: "Estado", texto: `Estado: ${ESTADOS[eq.estado].label} → ${ESTADOS[estado].label}` }, { id: user.id, nombre: nombreUsuario });
  revalidatePath("/", "layout");
}

export async function agregarNota(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const id = txt(formData, "id"), nota = txt(formData, "nota");
  if (!nota) return;
  const { data: eq } = await supabase.from("equipos").select("org_id").eq("id", id).single();
  if (!eq) return;
  await registrarEvento(supabase, { org_id: eq.org_id, equipo_id: id, tipo: "Novedad", texto: nota }, { id: user.id, nombre: nombreUsuario });
  revalidatePath(`/equipos/${id}`);
}

export async function registrarHoras(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const id = txt(formData, "id");
  const lectura = Math.round(Number(formData.get("horas")));
  if (!Number.isFinite(lectura) || lectura < 0) redirect(`/equipos/${id}?error=` + encodeURIComponent("Ingresá las horas del contador."));
  const { data: eq } = await supabase.from("equipos").select("org_id,horas_uso").eq("id", id).single();
  if (!eq) return;
  const { error } = await supabase.from("equipos").update({ horas_uso: lectura }).eq("id", id);
  if (error) redirect(`/equipos/${id}?error=` + encodeURIComponent("No tenés permiso para cambiar este equipo."));
  const menor = eq.horas_uso != null && lectura < eq.horas_uso;
  await registrarEvento(supabase, {
    org_id: eq.org_id, equipo_id: id, tipo: "Horas",
    texto: `Lectura de horas: ${lectura.toLocaleString("es-AR")} h${eq.horas_uso != null ? ` (antes ${Number(eq.horas_uso).toLocaleString("es-AR")} h)` : ""}${menor ? ". Menor que la anterior: ¿se reemplazó el contador?" : ""}`,
  }, { id: user.id, nombre: nombreUsuario });
  revalidatePath("/", "layout");
  redirect(`/equipos/${id}?aviso=` + encodeURIComponent(menor ? "Horas registradas. Ojo: la lectura es menor que la anterior." : "Horas registradas."));
}
