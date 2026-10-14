import { clienteAdmin } from "./supabase/admin";
import { enviarEmail, esc, plantilla } from "./email";
import { numeroOT } from "./formato";

type Admin = NonNullable<ReturnType<typeof clienteAdmin>>;

/** Emails de quienes gestionan una institución: sus miembros y los de proveedores con acceso. */
export async function emailsGestion(db: Admin, institucionId: string, roles = ["admin", "tecnico"], excluir?: string) {
  const { data: acc } = await db.from("accesos").select("proveedor_id").eq("institucion_id", institucionId);
  const orgs = [institucionId, ...(acc ?? []).map((a) => a.proveedor_id)];
  const { data } = await db.from("miembros").select("user_id,email").in("org_id", orgs).in("rol", roles).eq("recibe_avisos", true).not("email", "is", null);
  return [...new Set((data ?? []).filter((m) => m.user_id !== excluir).map((m) => m.email as string))];
}

/** Aviso inmediato de una orden de trabajo nueva. */
export async function avisarNuevaOT(ordenId: string, opciones: { excluirUsuario?: string; avisarProveedor?: boolean } = {}) {
  const db = clienteAdmin();
  if (!db) return;
  const { data: o } = await db
    .from("ordenes")
    .select("id,numero,org_id,tipo,prioridad,descripcion,reporta,equipos(id,tipo,marca,modelo,serial,servicio,sede),proveedores(nombre,email),organizaciones(nombre)")
    .eq("id", ordenId)
    .single();
  if (!o) return;
  const e: any = Array.isArray(o.equipos) ? o.equipos[0] : o.equipos;
  const p: any = Array.isArray(o.proveedores) ? o.proveedores[0] : o.proveedores;
  const org: any = Array.isArray(o.organizaciones) ? o.organizaciones[0] : o.organizaciones;
  const ot = numeroOT(o.numero);
  const detalle = `
    <p style="margin:0 0 8px"><strong>${esc(e.tipo)} · ${esc(e.marca)} ${esc(e.modelo)}</strong><br>
    <span style="color:#5b6f77">S/N ${esc(e.serial)} · ${esc(e.servicio)}${e.sede ? ` · ${esc(e.sede)}` : ""} · ${esc(org?.nombre)}</span></p>
    <p style="margin:0 0 8px;white-space:pre-wrap">${esc(o.descripcion)}</p>
    <p style="margin:0;color:#5b6f77">Prioridad ${esc(o.prioridad.toLowerCase())} · reportó ${esc(o.reporta ?? "sin nombre")}</p>`;

  const internos = await emailsGestion(db, o.org_id, ["admin", "tecnico"], opciones.excluirUsuario);
  if (internos.length) {
    await enviarEmail({
      to: internos,
      subject: `${o.prioridad === "Alta" ? "[Prioridad alta] " : ""}${ot}: ${e.tipo} ${e.marca} ${e.modelo} — ${e.servicio}`,
      html: plantilla(`Nueva orden ${ot}`, detalle, { texto: "Ver la orden", ruta: `/ordenes/${o.id}` }),
    });
  }
  if (opciones.avisarProveedor && p?.email) {
    await enviarEmail({
      to: [p.email],
      subject: `Pedido de servicio ${ot} — ${org?.nombre}: ${e.marca} ${e.modelo}`,
      html: plantilla(
        `Pedido de servicio técnico ${ot}`,
        `<p style="margin:0 0 12px">${esc(org?.nombre)} solicita servicio técnico para el siguiente equipo:</p>${detalle}`,
        undefined,
        `Enviado por ${org?.nombre ?? "la institución"} a través de Monitor. Para responder, comunicate directamente con la institución.`,
      ),
    });
  }
}
