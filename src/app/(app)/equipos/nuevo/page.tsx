import Link from "next/link";
import { contexto } from "@/lib/contexto";
import { TIPOS } from "@/lib/protocolos";
import { hoyISO, sumarDias } from "@/lib/formato";
import { crearEquipo } from "../actions";

export const metadata = { title: "Nuevo equipo" };

export default async function NuevoEquipo({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const { supabase, instituciones, alcance, orgIds } = await contexto();
  const { data: provs } = await supabase.from("proveedores").select("id,nombre,org_id").in("org_id", orgIds).order("nombre");
  return (
    <>
      <div className="top"><h1>Nuevo equipo</h1></div>
      <form className="card form" action={crearEquipo}>
        {sp.error && <div className="error full">{sp.error}</div>}
        <label className="full">Institución
          <select id="org_id" name="org_id" required defaultValue={alcance !== "todas" ? alcance : undefined}>
            {instituciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </label>
        <label>Tipo<select id="tipo" name="tipo">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label>Serial<input id="serial" name="serial" required className="mono" /></label>
        <label>Marca<input id="marca" name="marca" required placeholder="Dräger" /></label>
        <label>Modelo<input id="modelo" name="modelo" required placeholder="Savina 300" /></label>
        <label>Servicio<input id="servicio" name="servicio" required placeholder="UTI" /></label>
        <label>Sede<input id="sede" name="sede" placeholder="Edificio central" /></label>
        <label>N.º de inventario<input id="nro_inventario" name="nro_inventario" /></label>
        <label>Código UMDNS<input id="umdns" name="umdns" placeholder="17-429" /></label>
        <label>Proveedor de servicio
          <select id="proveedor_id" name="proveedor_id"><option value="">Sin asignar</option>{(provs ?? []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
        </label>
        <label>Garantía hasta<input id="garantia_hasta" name="garantia_hasta" type="date" /></label>
        <label>Horas de uso (si tiene contador)<input id="horas_uso" name="horas_uso" type="number" min="0" /></label>
        <label>Frecuencia de preventivo (días)<input id="frecuencia" name="frecuencia" type="number" min="1" placeholder="Según tipo" /></label>
        <label>Próximo preventivo<input id="proxima" name="proxima" type="date" defaultValue={sumarDias(hoyISO(), 30)} /></label>
        <div className="full actions end"><Link className="btn" href="/equipos">Cancelar</Link><button className="btn primary">Agregar equipo</button></div>
      </form>
    </>
  );
}
