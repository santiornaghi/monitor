import Link from "next/link";
import { notFound } from "next/navigation";
import { contexto } from "@/lib/contexto";
import { PROTOCOLOS, rangoTexto } from "@/lib/protocolos";
import { fecha, horas } from "@/lib/formato";
import { uno } from "@/lib/eventos";
import { realizarPreventivo, reprogramar } from "../actions";

export const metadata = { title: "Realizar preventivo" };

export default async function Realizar({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; aviso?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await contexto();
  const { data: plan } = await supabase.from("planes_preventivo").select("id,proxima,frecuencia_dias,ultima,frecuencia_horas,proximas_horas,ultimas_horas,equipos(id,tipo,marca,modelo,serial,horas_uso)").eq("id", id).maybeSingle();
  if (!plan) notFound();
  const eq = uno<any>(plan.equipos);
  const pasos = PROTOCOLOS[eq.tipo] ?? PROTOCOLOS["Otro"];
  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">Protocolo de preventivo · {eq.tipo}</div>
          <h1>{eq.marca} {eq.modelo} <span className="mono muted" style={{ fontSize: 14 }}>{eq.serial}</span></h1>
          <div className="muted">
            Vence {fecha(plan.proxima)}{plan.proximas_horas != null ? ` o a las ${horas(plan.proximas_horas)}` : ""} · último {fecha(plan.ultima)}{plan.ultimas_horas != null ? ` (${horas(plan.ultimas_horas)})` : ""}
          </div>
        </div>
      </div>
      {sp.error && <div className="error" style={{ marginBottom: 12 }}>{sp.error}</div>}
      {sp.aviso && <div className="notice" style={{ marginBottom: 12 }}>{sp.aviso}</div>}
      <form className="card" action={realizarPreventivo} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="hidden" name="plan_id" value={plan.id} />
        {(plan.frecuencia_horas || eq.horas_uso != null) && (
          <label className="row" style={{ display: "flex", gap: 10, alignItems: "center", background: "var(--accent-soft)", padding: "10px 12px", borderRadius: 6, flexWrap: "wrap" }}>
            <span style={{ flex: "1 1 200px" }}>Horas del contador al momento del service</span>
            <input id="lectura_horas" name="lectura_horas" type="number" min="0" step="1" required={!!plan.frecuencia_horas} defaultValue={eq.horas_uso ?? undefined} style={{ width: 140 }} />
            <span className="sub">Última lectura: {horas(eq.horas_uso)}</span>
          </label>
        )}
        <div className="chk">
          {pasos.map((p, i) => p.unidad ? (
            <label className="row" key={i}>
              <span style={{ flex: "1 1 200px" }}>{p.texto}</span>
              <input id={`p${i}`} name={`p${i}`} type="number" step="any" required inputMode="decimal" aria-label={p.texto} />
              <span className="sub">Aceptable: {rangoTexto(p)}</span>
            </label>
          ) : (
            <label className="row" key={i}><input id={`p${i}`} name={`p${i}`} type="checkbox" style={{ width: "auto" }} /> {p.texto}</label>
          ))}
        </div>
        <label className="muted" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>Observaciones<textarea id="observaciones" name="observaciones" rows={2} /></label>
        <p className="sub" style={{ margin: 0 }}>Si una medición queda fuera de rango, se abre una orden correctiva y el equipo pasa a reparación.</p>
        <div className="actions end"><Link className="btn" href="/preventivos">Cancelar</Link><button className="btn primary">Firmar y registrar</button></div>
      </form>
      <h2 style={{ marginTop: 24 }}>Plan</h2>
      <form className="card form" action={reprogramar}>
        <input type="hidden" name="plan_id" value={plan.id} />
        <label>Frecuencia (días)<input id="frecuencia" name="frecuencia" type="number" min="1" defaultValue={plan.frecuencia_dias} required /></label>
        <label>Próxima fecha<input id="proxima" name="proxima" type="date" defaultValue={plan.proxima} required /></label>
        <label>Frecuencia (horas de uso, opcional)<input id="frecuencia_horas" name="frecuencia_horas" type="number" min="1" defaultValue={plan.frecuencia_horas ?? undefined} placeholder="Ej.: 5000" /></label>
        <label>Próximo a las (horas)<input id="proximas_horas" name="proximas_horas" type="number" min="0" defaultValue={plan.proximas_horas ?? undefined} placeholder="Se calcula si lo dejás vacío" /></label>
        <p className="full sub" style={{ margin: 0 }}>Con frecuencia en días y en horas, el preventivo vence con lo que ocurra primero.</p>
        <div className="full actions end"><button className="btn">Guardar plan</button></div>
      </form>
    </>
  );
}
