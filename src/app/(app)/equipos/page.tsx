import Link from "next/link";
import { contexto, nombreOrg } from "@/lib/contexto";
import { Encabezado, Pill } from "@/components/Encabezado";
import { ESTADOS, estadoPreventivo, fecha } from "@/lib/formato";
import { TIPOS } from "@/lib/protocolos";
import { uno } from "@/lib/eventos";

export const metadata = { title: "Equipos" };

export default async function Equipos({ searchParams }: { searchParams: Promise<{ q?: string; tipo?: string; estado?: string; aviso?: string }> }) {
  const sp = await searchParams;
  const { supabase, orgIds, orgs, instituciones, alcance } = await contexto();
  let query = supabase.from("equipos").select("id,org_id,tipo,marca,modelo,serial,servicio,estado,planes_preventivo(proxima)").in("org_id", orgIds).order("tipo").order("servicio");
  if (sp.tipo) query = query.eq("tipo", sp.tipo);
  if (sp.estado) query = query.eq("estado", sp.estado);
  if (sp.q) {
    const s = sp.q.replace(/[%,()]/g, " ").trim();
    query = query.or(`serial.ilike.%${s}%,marca.ilike.%${s}%,modelo.ilike.%${s}%,servicio.ilike.%${s}%,nro_inventario.ilike.%${s}%,tipo.ilike.%${s}%`);
  }
  const { data } = await query.limit(500);
  const E = data ?? [];
  const varias = alcance === "todas" && instituciones.length > 1;

  return (
    <>
      <Encabezado titulo="Equipos" instituciones={instituciones} alcance={alcance}>
        <a className="btn" href="/equipos/exportar">Exportar a Excel</a>
        <Link className="btn" href="/equipos/etiquetas">Etiquetas QR</Link>
        <Link className="btn" href="/equipos/importar">Importar CSV</Link>
        <Link className="btn primary" href="/equipos/nuevo">Nuevo equipo</Link>
      </Encabezado>
      {sp.aviso && <div className="notice" style={{ marginBottom: 12 }}>{sp.aviso}</div>}
      <form className="filters">
        <input id="q" name="q" type="search" defaultValue={sp.q} placeholder="Buscar por serial, marca, modelo, inventario o servicio" aria-label="Buscar" />
        <select id="tipo" name="tipo" defaultValue={sp.tipo ?? ""} aria-label="Tipo">
          <option value="">Todos los tipos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select id="estado" name="estado" defaultValue={sp.estado ?? ""} aria-label="Estado">
          <option value="">Todos los estados</option>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="btn">Filtrar</button>
      </form>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Equipo</th><th>Serial</th><th className="hide-sm">Servicio</th>{varias && <th className="hide-sm">Institución</th>}<th>Estado</th><th className="hide-sm">Próximo preventivo</th></tr></thead>
          <tbody>
            {E.map((e: any) => {
              const plan = uno<{ proxima: string }>(e.planes_preventivo);
              const ps = plan && estadoPreventivo(plan.proxima);
              return (
                <tr key={e.id}>
                  <td><Link className="row-link" href={`/equipos/${e.id}`}><div className="t">{e.tipo}</div><div className="sub">{e.marca} {e.modelo}</div></Link></td>
                  <td className="mono">{e.serial}</td>
                  <td className="hide-sm">{e.servicio}</td>
                  {varias && <td className="hide-sm">{nombreOrg(orgs, e.org_id)}</td>}
                  <td><Pill texto={ESTADOS[e.estado].label} clase={ESTADOS[e.estado].clase} /></td>
                  <td className="hide-sm">{plan ? <><span className="mono">{fecha(plan.proxima)}</span> {ps!.label !== "Al día" && <Pill texto={ps!.label} clase={ps!.clase} />}</> : "—"}</td>
                </tr>
              );
            })}
            {E.length === 0 && <tr><td colSpan={6} className="muted">No hay equipos que coincidan.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
