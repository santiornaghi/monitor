"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";
import { registrarEvento } from "@/lib/eventos";
import { PROTOCOLOS, fueraDeRango } from "@/lib/protocolos";
import { hoyISO, sumarDias, numeroOT } from "@/lib/formato";

export async function realizarPreventivo(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const planId = String(formData.get("plan_id"));
  const { data: plan } = await supabase.from("planes_preventivo").select("id,org_id,equipo_id,frecuencia_dias,equipos(tipo,estado,proveedor_id)").eq("id", planId).single();
  if (!plan) redirect("/preventivos");
  const eq: any = Array.isArray(plan.equipos) ? plan.equipos[0] : plan.equipos;
  const pasos = PROTOCOLOS[eq.tipo] ?? PROTOCOLOS["Otro"];
  const resultados = pasos.map((p, i) => {
    if (!p.unidad) return { paso: p.texto, ok: formData.get(`p${i}`) === "on" };
    const v = Number(String(formData.get(`p${i}`)).replace(",", "."));
    return { paso: p.texto, valor: v, unidad: p.unidad, ok: Number.isFinite(v) && !fueraDeRango(p, v) };
  });
  const incompletos = resultados.filter((r) => r.valor === undefined && !r.ok);
  if (incompletos.length) redirect(`/preventivos/${planId}?error=` + encodeURIComponent("Marcá todos los pasos del checklist."));
  const fallas = resultados.filter((r) => r.valor !== undefined && !r.ok);
  const observaciones = String(formData.get("observaciones") ?? "").trim();
  const usuario = { id: user.id, nombre: nombreUsuario };

  const resumen = resultados.filter((r) => r.valor !== undefined).map((r) => `${r.paso.split(" (")[0]}: ${r.valor} ${r.unidad}`).join("; ");
  await registrarEvento(supabase, {
    org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "Preventivo",
    texto: `Preventivo realizado. ${resumen || "Checklist completo."}${fallas.length ? ` — ${fallas.length} medición fuera de rango` : ""}${observaciones ? `. ${observaciones}` : ""}`,
    datos: { resultados, observaciones },
  }, usuario);

  const hoy = hoyISO();
  await supabase.from("planes_preventivo").update({ ultima: hoy, proxima: sumarDias(hoy, plan.frecuencia_dias) }).eq("id", planId);
  await supabase.from("ordenes").insert({
    org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "Preventivo", estado: "Cerrada", prioridad: "Media",
    descripcion: "Preventivo programado", reporta: "Plan de preventivos", proveedor_id: eq.proveedor_id,
    cerrada_en: new Date().toISOString(), trabajo: "Protocolo completo", created_by: user.id,
  });

  let aviso = `Preventivo registrado. Próximo: ${sumarDias(hoy, plan.frecuencia_dias).split("-").reverse().join("/")}.`;
  if (fallas.length) {
    const { data: ot } = await supabase.from("ordenes").insert({
      org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "Correctivo", prioridad: "Alta",
      descripcion: `Preventivo con mediciones fuera de rango: ${fallas.map((f) => f.paso.split(" (")[0]).join(", ")}`,
      reporta: "Protocolo de preventivo", proveedor_id: eq.proveedor_id, created_by: user.id,
    }).select("numero").single();
    await supabase.from("equipos").update({ estado: "reparacion" }).eq("id", plan.equipo_id);
    await registrarEvento(supabase, { org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "OT", texto: `${numeroOT(ot?.numero ?? 0)} abierta automáticamente por medición fuera de rango; equipo en reparación` }, usuario);
    aviso = `Preventivo registrado con mediciones fuera de rango. Se abrió ${numeroOT(ot?.numero ?? 0)} y el equipo pasó a reparación.`;
  }
  revalidatePath("/", "layout");
  redirect(`/equipos/${plan.equipo_id}?aviso=` + encodeURIComponent(aviso));
}

export async function reprogramar(formData: FormData) {
  const { supabase } = await contexto();
  const id = String(formData.get("plan_id"));
  const frecuencia = Number(formData.get("frecuencia"));
  const proxima = String(formData.get("proxima"));
  const { error } = await supabase.from("planes_preventivo").update({ frecuencia_dias: frecuencia, proxima }).eq("id", id);
  if (error) redirect(`/preventivos/${id}?error=` + encodeURIComponent(error.message));
  revalidatePath("/", "layout");
  redirect(`/preventivos/${id}?aviso=` + encodeURIComponent("Plan actualizado."));
}
