import Link from "next/link";
import { notFound } from "next/navigation";
import { contexto, nombreOrg } from "@/lib/contexto";
import { Pill } from "@/components/Encabezado";
import { fecha, pesos } from "@/lib/formato";
import { editarRepuesto, moverStock } from "../actions";

export const metadata = { title: "Repuesto" };

export default async function Repuesto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, orgs } = await contexto();
  const { data: r } = await supabase.from("repuestos").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();
  const [{ data: movs }, { data: provs }] = await Promise.all([
    supabase.from("movimientos_stock").select("id,fecha,cantidad,motivo,orden_id,usuario_nombre").eq("repuesto_id", id).order("fecha", { ascending: false }).limit(200),
    supabase.from("proveedores").select("id,nombre").eq("org_id", r.org_id).order("nombre"),
  ]);
  const bajo = r.stock_minimo > 0 && r.stock <= r.stock_minimo;
  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">Repuesto{r.codigo ? ` · ${r.codigo}` : ""} · {nombreOrg(orgs, r.org_id)}</div>
          <h1>{r.descripcion}</h1>
          <div className="muted">Stock <strong className="mono">{r.stock}</strong> · mínimo {r.stock_minimo} · {pesos(Number(r.costo_unitario))} c/u {bajo && <Pill texto={r.stock === 0 ? "Sin stock" : "Bajo mínimo"} clase={r.stock === 0 ? "p-crit" : "p-warn"} />}</div>
        </div>
      </div>
      {sp.aviso && <div className="notice" style={{ marginBottom: 12 }}>{sp.aviso}</div>}
      {sp.error && <div className="error" style={{ marginBottom: 12 }}>{sp.error}</div>}

      <div className="grid2 editar" style={{ marginBottom: 24 }}>
        <form className="panel form" action={moverStock}>
          <h2 className="full">Movimiento de stock</h2>
          <input type="hidden" name="id" value={r.id} />
          <label>Tipo<select id="sentido" name="sentido"><option value="entrada">Ingreso (compra, devolución)</option><option value="salida">Salida o ajuste</option></select></label>
          <label>Cantidad<input id="cantidad" name="cantidad" type="number" min="1" step="1" required /></label>
          <label>Motivo<input id="motivo" name="motivo" placeholder="Compra a proveedor, inventario…" /></label>
          <label>Nuevo costo unitario ($, opcional)<input id="costo" name="costo" type="number" min="0" step="0.01" /></label>
          <p className="full sub" style={{ margin: 0 }}>Para usar el repuesto en un equipo, agregalo desde la orden de trabajo: así queda en la hoja de vida.</p>
          <div className="full actions end"><button className="btn primary">Registrar</button></div>
        </form>
        <form className="panel form" action={editarRepuesto}>
          <h2 className="full">Datos</h2>
          <input type="hidden" name="id" value={r.id} />
          <label className="full">Descripción<input id="descripcion" name="descripcion" required defaultValue={r.descripcion} /></label>
          <label>Código<input id="codigo" name="codigo" className="mono" defaultValue={r.codigo ?? ""} /></label>
          <label>Compatible con<input id="compatible" name="compatible" defaultValue={r.compatible ?? ""} /></label>
          <label>Ubicación<input id="ubicacion" name="ubicacion" defaultValue={r.ubicacion ?? ""} /></label>
          <label>Proveedor<select id="proveedor_id" name="proveedor_id" defaultValue={r.proveedor_id ?? ""}><option value="">Sin asignar</option>{(provs ?? []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
          <label>Stock mínimo<input id="stock_minimo" name="stock_minimo" type="number" min="0" step="1" defaultValue={r.stock_minimo} /></label>
          <label>Costo unitario ($)<input id="costo_unitario" name="costo_unitario" type="number" min="0" step="0.01" defaultValue={r.costo_unitario} /></label>
          <div className="full actions end"><button className="btn">Guardar</button></div>
        </form>
      </div>

      <h2>Movimientos</h2>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Fecha</th><th>Cantidad</th><th>Motivo</th><th className="hide-sm">Usuario</th></tr></thead>
          <tbody>
            {(movs ?? []).map((m) => (
              <tr key={m.id}>
                <td className="mono">{fecha(m.fecha)}</td>
                <td className="mono" style={{ color: m.cantidad < 0 ? "var(--crit)" : "var(--ok)" }}>{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</td>
                <td>{m.orden_id ? <Link href={`/ordenes/${m.orden_id}`}>{m.motivo}</Link> : m.motivo}</td>
                <td className="hide-sm">{m.usuario_nombre ?? "—"}</td>
              </tr>
            ))}
            {!movs?.length && <tr><td colSpan={4} className="muted">Sin movimientos.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
