import Link from "next/link";
import { contexto, nombreOrg } from "@/lib/contexto";
import { Encabezado, Pill } from "@/components/Encabezado";
import { pesos } from "@/lib/formato";
import { crearRepuesto } from "./actions";

export const metadata = { title: "Repuestos" };

export default async function Repuestos({ searchParams }: { searchParams: Promise<{ q?: string; bajo?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, orgIds, orgs, instituciones, alcance } = await contexto();
  let q = supabase.from("repuestos").select("id,org_id,codigo,descripcion,compatible,ubicacion,stock,stock_minimo,costo_unitario").in("org_id", orgIds).order("descripcion");
  if (sp.q) {
    const s = sp.q.replace(/[%,()]/g, " ").trim();
    q = q.or(`descripcion.ilike.%${s}%,codigo.ilike.%${s}%,compatible.ilike.%${s}%`);
  }
  const [{ data }, { data: provs }] = await Promise.all([
    q.limit(1000),
    supabase.from("proveedores").select("id,nombre").in("org_id", orgIds).order("nombre"),
  ]);
  let R = data ?? [];
  const bajo = (r: { stock: number; stock_minimo: number }) => r.stock_minimo > 0 && r.stock <= r.stock_minimo;
  const cantBajo = R.filter(bajo).length;
  if (sp.bajo) R = R.filter(bajo);
  const valor = R.reduce((s, r) => s + r.stock * Number(r.costo_unitario), 0);
  const varias = alcance === "todas" && instituciones.length > 1;

  return (
    <>
      <Encabezado titulo="Repuestos" instituciones={instituciones} alcance={alcance} />
      <form className="filters">
        <input id="q" name="q" type="search" defaultValue={sp.q} placeholder="Buscar por descripción, código o modelo compatible" aria-label="Buscar" />
        <label className="btn" style={{ gap: 6 }}><input type="checkbox" name="bajo" value="1" defaultChecked={!!sp.bajo} style={{ width: "auto" }} /> Solo bajo mínimo ({cantBajo})</label>
        <button className="btn">Filtrar</button>
      </form>
      <div className="tablewrap" style={{ marginBottom: 8 }}>
        <table>
          <thead><tr><th>Repuesto</th><th className="hide-sm">Código</th><th className="hide-sm">Compatible con</th><th>Stock</th><th className="hide-sm">Costo unit.</th>{varias && <th className="hide-sm">Institución</th>}</tr></thead>
          <tbody>
            {R.map((r) => (
              <tr key={r.id}>
                <td><Link className="row-link" href={`/repuestos/${r.id}`}><div className="t">{r.descripcion}</div>{r.ubicacion && <div className="sub">{r.ubicacion}</div>}</Link></td>
                <td className="mono hide-sm">{r.codigo ?? "—"}</td>
                <td className="hide-sm">{r.compatible ?? "—"}</td>
                <td><span className="mono">{r.stock}</span> {bajo(r) ? <Pill texto={r.stock === 0 ? "Sin stock" : "Bajo mínimo"} clase={r.stock === 0 ? "p-crit" : "p-warn"} /> : null}<div className="sub">mínimo {r.stock_minimo}</div></td>
                <td className="mono hide-sm">{pesos(Number(r.costo_unitario))}</td>
                {varias && <td className="hide-sm">{nombreOrg(orgs, r.org_id)}</td>}
              </tr>
            ))}
            {R.length === 0 && <tr><td colSpan={6} className="muted">No hay repuestos cargados.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="sub" style={{ marginBottom: 24 }}>{R.length} repuestos · valor en stock {pesos(valor)}</p>

      <div className="editar">
        <h2>Nuevo repuesto</h2>
        <form className="card form" action={crearRepuesto}>
          {sp.error && <div className="error full">{sp.error}</div>}
          <label className="full">Institución<select id="org_id" name="org_id" required defaultValue={alcance !== "todas" ? alcance : undefined}>{instituciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></label>
          <label className="full">Descripción<input id="descripcion" name="descripcion" required placeholder="Sensor de flujo" /></label>
          <label>Código<input id="codigo" name="codigo" className="mono" placeholder="Código del fabricante" /></label>
          <label>Compatible con<input id="compatible" name="compatible" placeholder="Dräger Savina 300" /></label>
          <label>Ubicación<input id="ubicacion" name="ubicacion" placeholder="Pañol, estante 3" /></label>
          <label>Proveedor<select id="proveedor_id" name="proveedor_id"><option value="">Sin asignar</option>{(provs ?? []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
          <label>Stock inicial<input id="stock_inicial" name="stock_inicial" type="number" min="0" step="1" defaultValue="0" /></label>
          <label>Stock mínimo<input id="stock_minimo" name="stock_minimo" type="number" min="0" step="1" defaultValue="0" /></label>
          <label>Costo unitario ($)<input id="costo_unitario" name="costo_unitario" type="number" min="0" step="0.01" defaultValue="0" /></label>
          <div className="full actions end"><button className="btn primary">Agregar repuesto</button></div>
        </form>
      </div>
    </>
  );
}
