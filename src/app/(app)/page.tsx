import Link from "next/link";
import { contexto, nombreOrg } from "@/lib/contexto";
import { Encabezado, Pill } from "@/components/Encabezado";
import { estadoPlan, cuandoVence, numeroOT } from "@/lib/formato";
import { uno } from "@/lib/eventos";

export const metadata = { title: "Panel" };

type Eq = { id: string; org_id: string; tipo: string; marca: string; modelo: string; servicio: string; estado: string; horas_uso?: number | null };

export default async function Panel() {
  const { supabase, orgIds, orgs, instituciones, alcance } = await contexto();
  const [{ data: eqData }, { data: prevData }, { data: otData }, { data: repData }] = await Promise.all([
    supabase.from("equipos").select("id,org_id,tipo,marca,modelo,servicio,estado").in("org_id", orgIds).neq("estado", "baja"),
    supabase.from("planes_preventivo").select("id,proxima,frecuencia_horas,proximas_horas,equipo_id,equipos(id,org_id,tipo,marca,modelo,servicio,estado,horas_uso)").in("org_id", orgIds).order("proxima"),
    supabase.from("ordenes").select("id,numero,prioridad,estado,descripcion,equipos(id,org_id,tipo,marca,modelo,servicio,estado)").in("org_id", orgIds).neq("estado", "Cerrada").order("abierta_en"),
    supabase.from("repuestos").select("id,descripcion,codigo,stock,stock_minimo").in("org_id", orgIds).gt("stock_minimo", 0),
  ]);
  const E = (eqData ?? []) as Eq[];
  const op = E.filter((e) => e.estado === "operativo").length;
  const pct = E.length ? Math.round((op / E.length) * 100) : 0;
  const prevs = (prevData ?? []).map((p: any) => ({ ...p, eq: uno<Eq>(p.equipos) }))
    .filter((p) => p.eq && p.eq.estado !== "baja")
    .map((p) => ({ ...p, st: estadoPlan(p, p.eq!.horas_uso) }));
  const venc = prevs.filter((p) => p.st.clase === "p-crit");
  const proximos = prevs.filter((p) => p.st.clase === "p-warn");
  const ots = (otData ?? []).map((o: any) => ({ ...o, eq: uno<Eq>(o.equipos) })).filter((o) => o.eq);
  const fuera = E.filter((e) => e.estado === "fuera");
  const stockBajo = (repData ?? []).filter((r) => r.stock <= r.stock_minimo).sort((a, b) => a.stock - b.stock);

  const porServicio = new Map<string, [number, number]>();
  E.forEach((e) => {
    const v = porServicio.get(e.servicio) ?? [0, 0];
    v[1]++; if (e.estado === "operativo") v[0]++;
    porServicio.set(e.servicio, v);
  });
  const servicios = [...porServicio.entries()].sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
  const porOrg = instituciones.map((o) => {
    const x = E.filter((e) => e.org_id === o.id);
    return { nombre: o.nombre, op: x.filter((e) => e.estado === "operativo").length, total: x.length };
  });
  const varias = alcance === "todas" && instituciones.length > 1;

  const accion = [
    ...venc.map((p) => ({ eq: p.eq!, texto: `Preventivo vencido (${cuandoVence(p.st)})`, clase: "p-crit", tag: "Vencido" })),
    ...ots.filter((o) => o.prioridad === "Alta").map((o) => ({ eq: o.eq!, texto: `${numeroOT(o.numero)} · ${o.descripcion}`, clase: "p-warn", tag: o.estado })),
    ...fuera.map((e) => ({ eq: e, texto: "Fuera de servicio", clase: "p-crit", tag: "Fuera" })),
  ];

  return (
    <>
      <Encabezado titulo="Panel" instituciones={instituciones} alcance={alcance} />
      {E.length === 0 ? (
        <div className="card">
          <h2>Todavía no hay equipos cargados</h2>
          <p className="muted">Cargá el primero a mano o importá tu planilla.</p>
          <div className="actions editar"><Link className="btn primary" href="/equipos/nuevo">Nuevo equipo</Link><Link className="btn" href="/equipos/importar">Importar CSV</Link></div>
        </div>
      ) : (
        <>
          <div className="kpis">
            <div className={`kpi ${pct >= 90 ? "ok" : pct >= 75 ? "warn" : "crit"}`}><div className="l">Parque operativo</div><div className="v">{pct}%</div><div className="s">{op} de {E.length} equipos</div></div>
            <div className={`kpi ${venc.length ? "crit" : "ok"}`}><div className="l">Preventivos vencidos</div><div className="v">{venc.length}</div><div className="s">{proximos.length} próximos a vencer</div></div>
            <div className={`kpi ${ots.length ? "warn" : "ok"}`}><div className="l">Órdenes abiertas</div><div className="v">{ots.length}</div><div className="s">{ots.filter((o) => o.prioridad === "Alta").length} de prioridad alta</div></div>
            <div className={`kpi ${fuera.length ? "crit" : "ok"}`}><div className="l">Fuera de servicio</div><div className="v">{fuera.length}</div><div className="s">{E.filter((e) => e.estado === "reparacion").length} más en reparación</div></div>
          </div>
          <div className="grid2">
            <section className="panel">
              <h2>Requiere acción</h2>
              <div className="list">
                {accion.length ? accion.map((a, i) => (
                  <Link key={i} className="li" href={`/equipos/${a.eq.id}`}>
                    <div style={{ minWidth: 0 }}>
                      <div className="t">{a.eq.tipo} · {a.eq.marca} {a.eq.modelo}</div>
                      <div className="sub">{a.texto} · {a.eq.servicio}{varias ? ` · ${nombreOrg(orgs, a.eq.org_id)}` : ""}</div>
                    </div>
                    <div className="r"><Pill texto={a.tag} clase={a.clase} /></div>
                  </Link>
                )) : <div className="empty">Nada pendiente.</div>}
              </div>
            </section>
            {stockBajo.length > 0 && (
              <section className="panel">
                <h2>Repuestos bajo mínimo</h2>
                <div className="list">
                  {stockBajo.slice(0, 8).map((r) => (
                    <Link key={r.id} className="li" href={`/repuestos/${r.id}`}>
                      <div style={{ minWidth: 0 }}><div className="t">{r.descripcion}</div><div className="sub">{r.codigo ? `${r.codigo} · ` : ""}stock {r.stock}, mínimo {r.stock_minimo}</div></div>
                      <div className="r"><Pill texto={r.stock === 0 ? "Sin stock" : "Bajo mínimo"} clase={r.stock === 0 ? "p-crit" : "p-warn"} /></div>
                    </Link>
                  ))}
                </div>
                {stockBajo.length > 8 && <Link className="btn sm" href="/repuestos?bajo=1" style={{ marginTop: 8 }}>Ver los {stockBajo.length}</Link>}
              </section>
            )}
            <section className="panel">
              <h2>Operatividad por servicio</h2>
              <div className="bars">
                {servicios.map(([s, [a, t]]) => (
                  <div className="bar" key={s}><span>{s}</span><div className="track"><div className="fill" style={{ width: `${(a / t) * 100}%` }} /></div><span className="n">{a}/{t}</span></div>
                ))}
              </div>
              {varias && (
                <>
                  <h2 style={{ marginTop: 20 }}>Por institución</h2>
                  <div className="bars">
                    {porOrg.map((o) => (
                      <div className="bar" key={o.nombre}><span>{o.nombre}</span><div className="track"><div className="fill" style={{ width: `${o.total ? (o.op / o.total) * 100 : 0}%` }} /></div><span className="n">{o.op}/{o.total}</span></div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
