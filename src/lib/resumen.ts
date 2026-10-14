import { clienteAdmin } from "./supabase/admin";
import { enviarEmail, esc, lista, plantilla } from "./email";
import { estadoPlan, cuandoVence, diasHasta, fecha, hoyISO, numeroOT, sumarDias } from "./formato";

type Admin = NonNullable<ReturnType<typeof clienteAdmin>>;

/** Arma el contenido del resumen de una institución. Devuelve null si no hay nada que avisar. */
async function seccionInstitucion(db: Admin, orgId: string) {
  const hoy = hoyISO();
  const [{ data: planes }, { data: certs }, { data: ots }, { data: reps }] = await Promise.all([
    db.from("planes_preventivo").select("proxima,frecuencia_horas,proximas_horas,equipos(id,tipo,marca,modelo,serial,servicio,estado,horas_uso)").eq("org_id", orgId),
    db.from("documentos").select("nombre,vence,equipo_id,marca,modelo,equipos(tipo,marca,modelo,serial)").eq("org_id", orgId).eq("tipo", "certificado").not("vence", "is", null).lte("vence", sumarDias(hoy, 30)),
    db.from("ordenes").select("id,numero,descripcion,estado,abierta_en,equipos(tipo,marca,modelo,servicio)").eq("org_id", orgId).eq("prioridad", "Alta").neq("estado", "Cerrada"),
    db.from("repuestos").select("descripcion,codigo,stock,stock_minimo").eq("org_id", orgId).gt("stock_minimo", 0),
  ]);
  const uno = (x: any) => (Array.isArray(x) ? x[0] : x);
  const nombreEq = (e: any) => `${esc(e.tipo)} ${esc(e.marca)} ${esc(e.modelo)} <span style="color:#5b6f77">(S/N ${esc(e.serial)}${e.servicio ? `, ${esc(e.servicio)}` : ""})</span>`;

  const prev = (planes ?? []).map((p: any) => ({ ...p, eq: uno(p.equipos) })).filter((p) => p.eq && p.eq.estado !== "baja")
    .map((p) => ({ ...p, st: estadoPlan(p, p.eq.horas_uso) }));
  const vencidos = prev.filter((p) => p.st.clase === "p-crit");
  const proximos = prev.filter((p) => p.st.clase === "p-warn" && (p.st.motivo === "horas" || p.st.dias <= 7));
  const certificados = (certs ?? []).map((c: any) => {
    const e = uno(c.equipos);
    const quien = e ? `${esc(e.tipo)} ${esc(e.marca)} ${esc(e.modelo)} (S/N ${esc(e.serial)})` : `todos los ${esc(c.marca)} ${esc(c.modelo)}`;
    const d = diasHasta(c.vence);
    return `${esc(c.nombre)} — ${quien}: ${d < 0 ? `<strong>vencido el ${fecha(c.vence)}</strong>` : `vence el ${fecha(c.vence)}`}`;
  });
  const altas = (ots ?? []).map((o: any) => {
    const e = uno(o.equipos);
    return `<strong>${numeroOT(o.numero)}</strong> ${esc(e?.tipo)} ${esc(e?.marca)} ${esc(e?.modelo)} — ${esc(o.descripcion)} <span style="color:#5b6f77">(${esc(o.estado.toLowerCase())}, abierta el ${fecha(o.abierta_en)})</span>`;
  });
  const stock = (reps ?? []).filter((r) => r.stock <= r.stock_minimo)
    .map((r) => `${esc(r.descripcion)}${r.codigo ? ` (${esc(r.codigo)})` : ""}: stock ${r.stock}, mínimo ${r.stock_minimo}`);

  const total = vencidos.length + proximos.length + certificados.length + altas.length + stock.length;
  if (!total) return null;
  const h = (t: string, n: number) => `<h2 style="font-size:15px;margin:14px 0 4px">${t} (${n})</h2>`;
  let html = "";
  if (vencidos.length) html += h("Preventivos vencidos", vencidos.length) + lista(vencidos.map((p) => `${nombreEq(p.eq)} — ${cuandoVence(p.st)}`));
  if (proximos.length) html += h("Preventivos de esta semana", proximos.length) + lista(proximos.map((p) => `${nombreEq(p.eq)} — ${cuandoVence(p.st)}`));
  if (altas.length) html += h("Órdenes de prioridad alta abiertas", altas.length) + lista(altas);
  if (certificados.length) html += h("Certificados vencidos o por vencer", certificados.length) + lista(certificados);
  if (stock.length) html += h("Repuestos bajo mínimo", stock.length) + lista(stock);
  return { html, total, vencidos: vencidos.length };
}

/** Envía el resumen diario a cada usuario con avisos activados. */
export async function enviarResumenes(soloEmail?: string) {
  const db = clienteAdmin();
  if (!db) return { enviados: 0, error: "Falta SUPABASE_SECRET_KEY" };
  const [{ data: miembros }, { data: orgs }, { data: accesos }] = await Promise.all([
    db.from("miembros").select("user_id,org_id,email,recibe_avisos").eq("recibe_avisos", true).not("email", "is", null),
    db.from("organizaciones").select("id,nombre,tipo"),
    db.from("accesos").select("proveedor_id,institucion_id"),
  ]);
  const orgPorId = new Map((orgs ?? []).map((o) => [o.id, o]));
  // Instituciones que ve cada email
  const porEmail = new Map<string, Set<string>>();
  for (const m of miembros ?? []) {
    if (soloEmail && m.email !== soloEmail) continue;
    const set = porEmail.get(m.email!) ?? new Set<string>();
    const o = orgPorId.get(m.org_id);
    if (o?.tipo === "institucion") set.add(o.id);
    if (o?.tipo === "proveedor") (accesos ?? []).filter((a) => a.proveedor_id === o.id).forEach((a) => set.add(a.institucion_id));
    porEmail.set(m.email!, set);
  }
  const cache = new Map<string, Awaited<ReturnType<typeof seccionInstitucion>>>();
  let enviados = 0;
  for (const [email, ids] of porEmail) {
    const partes: string[] = [];
    let total = 0, vencidos = 0;
    for (const id of ids) {
      if (!cache.has(id)) cache.set(id, await seccionInstitucion(db, id));
      const s = cache.get(id);
      if (!s) continue;
      total += s.total; vencidos += s.vencidos;
      partes.push(ids.size > 1 ? `<h2 style="font-size:16px;margin:18px 0 0;color:#0b6e79">${esc(orgPorId.get(id)?.nombre)}</h2>${s.html}` : s.html);
    }
    if (!total) continue;
    const r = await enviarEmail({
      to: [email],
      subject: vencidos ? `Monitor: ${vencidos} preventivo${vencidos > 1 ? "s" : ""} vencido${vencidos > 1 ? "s" : ""} y ${total - vencidos} aviso${total - vencidos === 1 ? "" : "s"} más` : `Monitor: ${total} aviso${total > 1 ? "s" : ""} para hoy`,
      html: plantilla(`Resumen del ${fecha(hoyISO())}`, partes.join(""), { texto: "Abrir el panel", ruta: "/" }),
    });
    if (r.ok) enviados++;
  }
  return { enviados };
}
