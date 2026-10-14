"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";
import { registrarEvento } from "@/lib/eventos";
import { PROTOCOLOS, fueraDeRango } from "@/lib/protocolos";
import { hoyISO, sumarDias, numeroOT } from "@/lib/formato";
import { after } from "next/server";
import { avisarNuevaOT } from "@/lib/avisos";

export async function realizarPreventivo(formData: FormData) {
  const { supabase, user, nombreUsuario } = await contexto();
  const planId = String(formData.get("plan_id"));
  const { data: plan } = await supabase.from("planes_preventivo").select("id,org_id,equipo_id,frecuencia_dias,frecuencia_horas,equipos(tipo,estado,proveedor_id,horas_uso)").eq("id", planId).single();
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
  const lecturaTxt = String(formData.get("lectura_horas") ?? "").trim();
  const lectura = lecturaTxt ? Math.round(Number(lecturaTxt)) : null;
  if (plan.frecuencia_horas && (lectura == null || !Number.isFinite(lectura) || lectura < 0)) {
    redirect(`/preventivos/${planId}?error=` + encodeURIComponent("Este plan es por horas: ingresá las horas del contador."));
  }
  const usuario = { id: user.id, nombre: nombreUsuario };

  const resumen = resultados.filter((r) => r.valor !== undefined).map((r) => `${r.paso.split(" (")[0]}: ${r.valor} ${r.unidad}`).join("; ");
  await registrarEvento(supabase, {
    org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "Preventivo",
    texto: `Preventivo realizado${lectura != null ? ` a las ${lectura.toLocaleString("es-AR")} h` : ""}. ${resumen || "Checklist completo."}${fallas.length ? ` — ${fallas.length} medición fuera de rango` : ""}${observaciones ? `. ${observaciones}` : ""}`,
    datos: { resultados, observaciones, horas: lectura },
  }, usuario);

  const hoy = hoyISO();
  await supabase.from("planes_preventivo").update({
    ultima: hoy,
    proxima: sumarDias(hoy, plan.frecuencia_dias),
    ...(lectura != null ? { ultimas_horas: lectura } : {}),
    ...(lectura != null && plan.frecuencia_horas ? { proximas_horas: lectura + plan.frecuencia_horas } : {}),
  }).eq("id", planId);
  if (lectura != null) await supabase.from("equipos").update({ horas_uso: lectura }).eq("id", plan.equipo_id);
  await supabase.from("ordenes").insert({
    org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "Preventivo", estado: "Cerrada", prioridad: "Media",
    descripcion: "Preventivo programado", reporta: "Plan de preventivos", proveedor_id: eq.proveedor_id,
    cerrada_en: new Date().toISOString(), trabajo: "Protocolo completo", created_by: user.id,
  });

  const proxHoras = lectura != null && plan.frecuencia_horas ? ` o a las ${(lectura + plan.frecuencia_horas).toLocaleString("es-AR")} h` : "";
  let aviso = `Preventivo registrado. Próximo: ${sumarDias(hoy, plan.frecuencia_dias).split("-").reverse().join("/")}${proxHoras}.`;
  if (fallas.length) {
    const { data: ot } = await supabase.from("ordenes").insert({
      org_id: plan.org_id, equipo_id: plan.equipo_id, tipo: "Correctivo", prioridad: "Alta",
      descripcion: `Preventivo con mediciones fuera de rango: ${fallas.map((f) => f.paso.split(" (")[0]).join(", ")}`,
      reporta: "Protocolo de preventivo", proveedor_id: eq.proveedor_id, created_by: user.id,
    }).select("id,numero").single();
    if (ot) after(() => avisarNuevaOT(ot.id, { excluirUsuario: user.id }));
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
  const frecuenciaHoras = Number(formData.get("frecuencia_horas")) || null;
  const proximasTxt = String(formData.get("proximas_horas") ?? "").trim();
  let proximasHoras: number | null = proximasTxt ? Math.round(Number(proximasTxt)) : null;
  if (frecuenciaHoras && proximasHoras == null) {
    const { data: p } = await supabase.from("planes_preventivo").select("ultimas_horas,equipos(horas_uso)").eq("id", id).single();
    const eq: any = Array.isArray(p?.equipos) ? p?.equipos[0] : p?.equipos;
    proximasHoras = (p?.ultimas_horas ?? eq?.horas_uso ?? 0) + frecuenciaHoras;
  }
  const { error } = await supabase.from("planes_preventivo").update({
    frecuencia_dias: frecuencia, proxima,
    frecuencia_horas: frecuenciaHoras,
    proximas_horas: frecuenciaHoras ? proximasHoras : null,
  }).eq("id", id);
  if (error) redirect(`/preventivos/${id}?error=` + encodeURIComponent(error.message));
  revalidatePath("/", "layout");
  redirect(`/preventivos/${id}?aviso=` + encodeURIComponent("Plan actualizado."));
}
