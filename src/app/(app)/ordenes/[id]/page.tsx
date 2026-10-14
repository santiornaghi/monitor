import Link from "next/link";
import { notFound } from "next/navigation";
import { contexto } from "@/lib/contexto";
import { Pill } from "@/components/Encabezado";
import { ESTADOS_OT, fecha, numeroOT, pesos } from "@/lib/formato";
import { uno } from "@/lib/eventos";
import { actualizarOrden, cerrarOrden } from "../actions";
import { usarRepuesto, devolverRepuesto } from "../../repuestos/actions";

export const metadata = { title: "Orden de trabajo" };

export default async function Orden({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, orgIds } = await contexto();
  const { data: o } = await supabase.from("ordenes").select("*,equipos(id,tipo,marca,modelo,serial,servicio,estado),proveedores(id,nombre,telefono)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const e = uno<any>(o.equipos), p = uno<any>(o.proveedores);
  const [{ data: provs }, { data: lineas }, { data: disponibles }] = await Promise.all([
    supabase.from("proveedores").select("id,nombre").in("org_id", orgIds).order("nombre"),
    supabase.from("ordenes_repuestos").select("id,cantidad,costo_unitario,repuestos(id,descripcion,codigo)").eq("orden_id", id).order("created_at"),
    supabase.from("repuestos").select("id,descripcion,codigo,stock,compatible").eq("org_id", o.org_id).gt("stock", 0).order("descripcion"),
  ]);
  const totalRepuestos = (lineas ?? []).reduce((s, l) => s + l.cantidad * Number(l.costo_unitario), 0);
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
          {!abierta && <><dt>Cerrada</dt><dd className="mono">{fecha(o.cerrada_en)}</dd><dt>Trabajo</dt><dd>{o.trabajo}</dd><dt>Mano de obra y otros</dt><dd className="mono">{pesos(o.costo)}</dd></>}
          <dt>Repuestos</dt><dd className="mono">{pesos(totalRepuestos)}</dd>
          {!abierta && <><dt>Costo total</dt><dd className="mono"><strong>{pesos(Number(o.costo) + totalRepuestos)}</strong></dd></>}
        </dl>
      </div>
      <h2>Repuestos usados</h2>
      <div className="tablewrap" style={{ marginBottom: 12 }}>
        <table>
          <thead><tr><th>Repuesto</th><th>Cant.</th><th className="hide-sm">Costo unit.</th><th>Subtotal</th>{abierta && <th></th>}</tr></thead>
          <tbody>
            {(lineas ?? []).map((l: any) => {
              const r = uno<any>(l.repuestos);
              return (
                <tr key={l.id}>
                  <td>{r ? <Link href={`/repuestos/${r.id}`}>{r.descripcion}</Link> : "—"}{r?.codigo && <span className="mono sub"> {r.codigo}</span>}</td>
                  <td className="mono">{l.cantidad}</td>
                  <td className="mono hide-sm">{pesos(Number(l.costo_unitario))}</td>
                  <td className="mono">{pesos(l.cantidad * Number(l.costo_unitario))}</td>
                  {abierta && <td className="editar"><form action={devolverRepuesto}><input type="hidden" name="orden_id" value={o.id} /><input type="hidden" name="linea_id" value={l.id} /><button className="btn sm">Quitar</button></form></td>}
                </tr>
              );
            })}
            {!lineas?.length && <tr><td colSpan={5} className="muted">Sin repuestos.</td></tr>}
          </tbody>
        </table>
      </div>
      {abierta && (
        <form className="actions editar" action={usarRepuesto} style={{ marginBottom: 24 }}>
          <input type="hidden" name="orden_id" value={o.id} />
          <select id="repuesto_id" name="repuesto_id" required aria-label="Repuesto" style={{ flex: "1 1 260px" }}>
            <option value="">{disponibles?.length ? "Elegí un repuesto en stock" : "No hay repuestos con stock"}</option>
            {(disponibles ?? []).map((r) => <option key={r.id} value={r.id}>{r.descripcion}{r.codigo ? ` (${r.codigo})` : ""} · stock {r.stock}{r.compatible ? ` · ${r.compatible}` : ""}</option>)}
          </select>
          <input id="cantidad" name="cantidad" type="number" min="1" step="1" defaultValue="1" required aria-label="Cantidad" style={{ width: 90 }} />
          <button className="btn">Agregar repuesto</button>
        </form>
      )}
      {abierta && (
        <div className="grid2 editar">
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
            <label>Mano de obra y otros ($, sin repuestos)<input id="costo" name="costo" type="number" min="0" step="0.01" defaultValue="0" /></label>
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
