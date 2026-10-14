import Link from "next/link";
import { contexto } from "@/lib/contexto";
import { Encabezado, Pill } from "@/components/Encabezado";
import { ESTADOS_OT, fecha, numeroOT } from "@/lib/formato";
import { uno } from "@/lib/eventos";

export const metadata = { title: "Órdenes de trabajo" };

export default async function Ordenes({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const sp = await searchParams;
  const cerradas = sp.ver === "cerradas";
  const { supabase, orgIds, instituciones, alcance } = await contexto();
  let q = supabase.from("ordenes").select("id,numero,tipo,prioridad,estado,descripcion,reporta,abierta_en,cerrada_en,equipos(id,tipo,marca,modelo,servicio),proveedores(nombre)").in("org_id", orgIds);
  q = cerradas ? q.eq("estado", "Cerrada").order("cerrada_en", { ascending: false }) : q.neq("estado", "Cerrada").order("abierta_en", { ascending: false });
  const { data } = await q.limit(300);
  const O = data ?? [];
  return (
    <>
      <Encabezado titulo="Órdenes de trabajo" instituciones={instituciones} alcance={alcance}>
        <Link className="btn primary editar" href="/ordenes/nueva">Nueva orden</Link>
      </Encabezado>
      <div className="actions" style={{ marginBottom: 12 }}>
        <Link className="btn sm" href="/ordenes" aria-current={!cerradas ? "page" : undefined} style={!cerradas ? { borderColor: "var(--accent)" } : undefined}>Abiertas</Link>
        <Link className="btn sm" href="/ordenes?ver=cerradas" style={cerradas ? { borderColor: "var(--accent)" } : undefined}>Cerradas</Link>
      </div>
      <div className="tablewrap">
        <table>
          <thead><tr><th>OT</th><th>Equipo</th><th>Problema</th><th className="hide-sm">Prioridad</th><th>Estado</th><th className="hide-sm">Asignado</th><th className="hide-sm">{cerradas ? "Cerrada" : "Abierta"}</th></tr></thead>
          <tbody>
            {O.map((o: any) => {
              const e = uno<any>(o.equipos), p = uno<any>(o.proveedores);
              return (
                <tr key={o.id}>
                  <td><Link className="mono" href={`/ordenes/${o.id}`}>{numeroOT(o.numero)}</Link></td>
                  <td>{e && <Link className="row-link" href={`/equipos/${e.id}`}><div className="t">{e.tipo}</div><div className="sub">{e.marca} {e.modelo} · {e.servicio}</div></Link>}</td>
                  <td style={{ minWidth: 200 }}><Link className="row-link" href={`/ordenes/${o.id}`}>{o.descripcion}<div className="sub">{o.tipo} · {o.reporta}</div></Link></td>
                  <td className="hide-sm">{o.prioridad}</td>
                  <td><Pill texto={o.estado} clase={ESTADOS_OT[o.estado] ?? "p-n"} /></td>
                  <td className="hide-sm">{p?.nombre ?? "—"}</td>
                  <td className="mono hide-sm">{fecha(cerradas ? o.cerrada_en : o.abierta_en)}</td>
                </tr>
              );
            })}
            {O.length === 0 && <tr><td colSpan={7} className="muted">{cerradas ? "No hay órdenes cerradas." : "No hay órdenes abiertas."}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
