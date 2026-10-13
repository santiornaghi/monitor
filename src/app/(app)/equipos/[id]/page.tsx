import Link from "next/link";
import { notFound } from "next/navigation";
import { contexto, nombreOrg } from "@/lib/contexto";
import { Pill } from "@/components/Encabezado";
import { ESTADOS, estadoPreventivo, fecha, pesos } from "@/lib/formato";
import { svgQR, urlQR } from "@/lib/qr";
import { uno } from "@/lib/eventos";
import { cambiarEstado, agregarNota } from "../actions";
import { EnviarAlCambiar } from "@/components/EnviarAlCambiar";

export const metadata = { title: "Hoja de vida" };

export default async function Ficha({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, orgs } = await contexto();
  const { data: e } = await supabase.from("equipos").select("*,proveedores(nombre,telefono),planes_preventivo(id,proxima,frecuencia_dias,ultima)").eq("id", id).maybeSingle();
  if (!e) notFound();
  const [{ data: evs }, { data: ots }] = await Promise.all([
    supabase.from("eventos").select("id,fecha,tipo,texto,usuario_nombre").eq("equipo_id", id).order("fecha", { ascending: false }),
    supabase.from("ordenes").select("costo").eq("equipo_id", id),
  ]);
  const plan = uno<any>(e.planes_preventivo);
  const prov = uno<any>(e.proveedores);
  const ps = plan && estadoPreventivo(plan.proxima);
  const costo = (ots ?? []).reduce((s, o) => s + Number(o.costo || 0), 0);
  const qr = await svgQR(e.qr_token);

  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">Hoja de vida{e.nro_inventario ? ` · ${e.nro_inventario}` : ""}</div>
          <h1>{e.marca} {e.modelo}</h1>
          <div className="muted">{e.tipo} · {e.servicio}{e.sede ? ` · ${e.sede}` : ""} · {nombreOrg(orgs, e.org_id)}</div>
        </div>
      </div>
      {sp.aviso && <div className="notice" style={{ marginBottom: 12 }}>{sp.aviso}</div>}
      {sp.error && <div className="error" style={{ marginBottom: 12 }}>{sp.error}</div>}
      <div className="ficha">
        <dl className="kv">
          <dt>Estado</dt><dd><Pill texto={ESTADOS[e.estado].label} clase={ESTADOS[e.estado].clase} /></dd>
          <dt>Serial</dt><dd className="mono">{e.serial}</dd>
          {e.umdns && <><dt>UMDNS</dt><dd className="mono">{e.umdns}</dd></>}
          <dt>Alta</dt><dd className="mono">{fecha(e.fecha_alta)}</dd>
          {e.garantia_hasta && <><dt>Garantía</dt><dd className="mono">hasta {fecha(e.garantia_hasta)}</dd></>}
          {e.horas_uso != null && <><dt>Horas de uso</dt><dd className="mono">{Number(e.horas_uso).toLocaleString("es-AR")} h</dd></>}
          <dt>Proveedor</dt><dd>{prov ? `${prov.nombre}${prov.telefono ? ` · ${prov.telefono}` : ""}` : "Sin asignar"}</dd>
          <dt>Preventivo</dt><dd>{plan ? <><span className="mono">{fecha(plan.proxima)}</span> <Pill texto={ps!.label} clase={ps!.clase} /> <span className="sub">cada {plan.frecuencia_dias} días</span></> : "Sin plan"}</dd>
          <dt>Costo de mantenimiento</dt><dd className="mono">{pesos(costo)}</dd>
        </dl>
        <div className="qr">
          <div dangerouslySetInnerHTML={{ __html: qr }} />
          <span className="mono muted" style={{ fontSize: 11, maxWidth: 160, overflowWrap: "anywhere", textAlign: "center" }}>{urlQR(e.qr_token)}</span>
        </div>
      </div>
      <div className="actions" style={{ marginBottom: 20 }}>
        <Link className="btn primary" href={`/ordenes/nueva?equipo=${e.id}`}>Abrir orden de trabajo</Link>
        {plan && <Link className="btn" href={`/preventivos/${plan.id}`}>Realizar preventivo</Link>}
        <Link className="btn" href={`/equipos/etiquetas?ids=${e.id}`}>Imprimir etiqueta</Link>
        <form action={cambiarEstado}>
          <input type="hidden" name="id" value={e.id} />
          <EnviarAlCambiar name="estado" valor={e.estado} etiqueta="Cambiar estado" opciones={Object.entries(ESTADOS).map(([k, v]) => [k, v.label])} />
        </form>
      </div>
      <h2>Historial</h2>
      <p className="sub" style={{ marginTop: -8 }}>{(evs ?? []).length} registros. Los registros no se editan ni se borran; las correcciones se agregan como novedad.</p>
      <form action={agregarNota} className="actions" style={{ marginBottom: 12 }}>
        <input type="hidden" name="id" value={e.id} />
        <input id="nota" name="nota" placeholder="Agregar una novedad (traslado, calibración externa, observación)" style={{ flex: "1 1 260px" }} />
        <button className="btn">Agregar</button>
      </form>
      <div className="timeline">
        {(evs ?? []).map((v) => (
          <div className="ev" key={v.id}>
            <span className="mono">{fecha(v.fecha)}</span>
            <div><div>{v.texto}</div><div className="sub">{v.tipo} · {v.usuario_nombre}</div></div>
          </div>
        ))}
      </div>
    </>
  );
}
