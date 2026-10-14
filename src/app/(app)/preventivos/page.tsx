import Link from "next/link";
import { contexto, nombreOrg } from "@/lib/contexto";
import { Encabezado, Pill } from "@/components/Encabezado";
import { estadoPlan, cuandoVence, fecha, horas } from "@/lib/formato";
import { uno } from "@/lib/eventos";

export const metadata = { title: "Preventivos" };

export default async function Preventivos() {
  const { supabase, orgIds, orgs, instituciones, alcance } = await contexto();
  const { data } = await supabase.from("planes_preventivo").select("id,proxima,ultima,frecuencia_dias,frecuencia_horas,proximas_horas,equipos(id,org_id,tipo,marca,modelo,serial,servicio,estado,horas_uso)").in("org_id", orgIds).order("proxima").limit(500);
  const peso = (c: string) => (c === "p-crit" ? 0 : c === "p-warn" ? 1 : 2);
  const P = (data ?? []).map((p: any) => ({ ...p, eq: uno<any>(p.equipos) }))
    .filter((p) => p.eq && p.eq.estado !== "baja")
    .map((p) => ({ ...p, st: estadoPlan(p, p.eq.horas_uso) }))
    .sort((a, b) => peso(a.st.clase) - peso(b.st.clase) || a.proxima.localeCompare(b.proxima));
  const varias = alcance === "todas" && instituciones.length > 1;
  return (
    <>
      <Encabezado titulo="Preventivos" instituciones={instituciones} alcance={alcance} />
      <div className="tablewrap">
        <table>
          <thead><tr><th>Estado</th><th>Equipo</th><th className="hide-sm">Serial</th><th>Vence</th><th className="hide-sm">Frecuencia</th><th className="hide-sm">Último</th><th></th></tr></thead>
          <tbody>
            {P.map((p) => {
              const s = p.st;
              return (
                <tr key={p.id}>
                  <td><Pill texto={s.label} clase={s.clase} /></td>
                  <td><Link className="row-link" href={`/equipos/${p.eq.id}`}><div className="t">{p.eq.tipo} · {p.eq.marca} {p.eq.modelo}</div><div className="sub">{p.eq.servicio}{varias ? ` · ${nombreOrg(orgs, p.eq.org_id)}` : ""}</div></Link></td>
                  <td className="mono hide-sm">{p.eq.serial}</td>
                  <td><span className="mono">{fecha(p.proxima)}</span>{p.proximas_horas != null && <span className="mono"> · {horas(p.proximas_horas)}</span>}<div className="sub">{cuandoVence(s)}</div></td>
                  <td className="hide-sm">cada {p.frecuencia_dias} días{p.frecuencia_horas ? ` o ${horas(p.frecuencia_horas)}` : ""}</td>
                  <td className="mono hide-sm">{fecha(p.ultima)}</td>
                  <td><Link className="btn sm" href={`/preventivos/${p.id}`}>Realizar</Link></td>
                </tr>
              );
            })}
            {P.length === 0 && <tr><td colSpan={7} className="muted">No hay planes de preventivo.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
