import Link from "next/link";
import { notFound } from "next/navigation";
import { contexto } from "@/lib/contexto";
import { Pill } from "@/components/Encabezado";
import { ESTADOS_OT, fecha, numeroOT, pesos } from "@/lib/formato";
import { uno } from "@/lib/eventos";
import { actualizarOrden, cerrarOrden } from "../actions";

export const metadata = { title: "Orden de trabajo" };

export default async function Orden({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, orgIds } = await contexto();
  const { data: o } = await supabase.from("ordenes").select("*,equipos(id,tipo,marca,modelo,serial,servicio,estado),proveedores(id,nombre,telefono)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const e = uno<any>(o.equipos), p = uno<any>(o.proveedores);
  const { data: provs } = await supabase.from("proveedores").select("id,nombre").in("org_id", orgIds).order("nombre");
  const abierta = o.estado !== "Cerrada";
  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">{o.tipo} · prioridad {o.prioridad.toLowerCase()}</div>
          <h1>{numeroOT(o.numero)} <Pill texto={o.estado} clase={ESTADOS_OT[o.estado] ?? "p-n"} /></h1>
        </div>
      </div>
      {sp.error && <div className="error" style={{ marginBottom: 12 }}>{sp.error}</div>}
      <div className="ficha" style={{ gridTemplateColumns: "1fr" }}>
        <dl className="kv">
          <dt>Equipo</dt><dd><Link href={`/equipos/${e.id}`}>{e.tipo} · {e.marca} {e.modelo}</Link> <span className="mono muted">{e.serial}</span></dd>
          <dt>Servicio</dt><dd>{e.servicio}</dd>
          <dt>Problema</dt><dd>{o.descripcion}</dd>
          <dt>Reportó</dt><dd>{o.reporta ?? "—"}</dd>
          <dt>Abierta</dt><dd className="mono">{fecha(o.abierta_en)}</dd>
          <dt>Asignado</dt><dd>{p ? `${p.nombre}${p.telefono ? ` · ${p.telefono}` : ""}` : "Sin asignar"}</dd>
          {!abierta && <><dt>Cerrada</dt><dd className="mono">{fecha(o.cerrada_en)}</dd><dt>Trabajo</dt><dd>{o.trabajo}</dd><dt>Costo</dt><dd className="mono">{pesos(o.costo)}</dd></>}
        </dl>
      </div>
      {abierta && (
        <div className="grid2">
          <form className="panel form" action={actualizarOrden}>
            <h2 className="full">Seguimiento</h2>
            <input type="hidden" name="id" value={o.id} />
            <label>Estado<select id="estado" name="estado" defaultValue={o.estado}><option>Abierta</option><option>En curso</option><option>Esperando repuesto</option></select></label>
            <label>Asignado a<select id="proveedor_id" name="proveedor_id" defaultValue={p?.id ?? ""}><option value="">Sin asignar</option>{(provs ?? []).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label>
            <div className="full actions end"><button className="btn">Guardar</button></div>
          </form>
          <form className="panel form" action={cerrarOrden}>
            <h2 className="full">Cerrar orden</h2>
            <input type="hidden" name="id" value={o.id} />
            <label className="full">Trabajo realizado<textarea id="trabajo" name="trabajo" rows={3} required /></label>
            <label>Costo total ($)<input id="costo" name="costo" type="number" min="0" step="0.01" defaultValue="0" /></label>
            <label>Estado del equipo
              <select id="estado_equipo" name="estado_equipo" defaultValue="operativo">
                <option value="operativo">Operativo</option><option value="fuera">Fuera de servicio</option><option value="baja">Dar de baja</option>
              </select>
            </label>
            <div className="full actions end"><button className="btn primary">Cerrar orden</button></div>
          </form>
        </div>
      )}
    </>
  );
}
