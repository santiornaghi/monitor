import Link from "next/link";
import { contexto } from "@/lib/contexto";
import { crearOrden } from "../actions";

export const metadata = { title: "Nueva orden" };

export default async function NuevaOrden({ searchParams }: { searchParams: Promise<{ equipo?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, orgIds } = await contexto();
  const [{ data: eqs }, { data: provs }] = await Promise.all([
    supabase.from("equipos").select("id,tipo,marca,modelo,serial,servicio").in("org_id", orgIds).neq("estado", "baja").order("tipo"),
    supabase.from("proveedores").select("id,nombre").in("org_id", orgIds).order("nombre"),
  ]);
  return (
    <>
      <div className="top"><h1>Nueva orden de trabajo</h1></div>
      <form className="card form" action={crearOrden}>
        {sp.error && <div className="error full">{sp.error}</div>}
        <label className="full">Equipo
          <select id="equipo_id" name="equipo_id" required defaultValue={sp.equipo}>
            {(eqs ?? []).map((e) => <option key={e.id} value={e.id}>{e.tipo} · {e.marca} {e.modelo} · {e.serial} · {e.servicio}</option>)}
          </select>
        </label>
        <label className="full">Qué pasa<textarea id="descripcion" name="descripcion" rows={3} required placeholder="Ej.: alarma de batería baja aunque está enchufado" /></label>
        <label>Tipo<select id="tipo" name="tipo"><option>Correctivo</option><option>Calibración</option><option>Instalación</option></select></label>
        <label>Prioridad<select id="prioridad" name="prioridad" defaultValue="Media"><option>Alta</option><option>Media</option><option>Baja</option></select></label>
        <label>Quién reporta<input id="reporta" name="reporta" placeholder="Nombre y servicio" /></label>
        <label>Asignar a<select id="proveedor_id" name="proveedor_id"><option value="">Proveedor del equipo</option>{(provs ?? []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
        <label className="full" style={{ flexDirection: "row", alignItems: "center", gap: 8, color: "var(--fg)" }}>
          <input id="fuera" name="fuera" type="checkbox" style={{ width: "auto" }} /> El equipo no se puede usar (pasa a fuera de servicio)
        </label>
        <label className="full" style={{ flexDirection: "row", alignItems: "center", gap: 8, color: "var(--fg)" }}>
          <input id="avisar_proveedor" name="avisar_proveedor" type="checkbox" style={{ width: "auto" }} /> Mandar el pedido por email al proveedor asignado (si tiene email cargado)
        </label>
        <div className="full actions end"><Link className="btn" href="/ordenes">Cancelar</Link><button className="btn primary">Abrir orden</button></div>
      </form>
    </>
  );
}
