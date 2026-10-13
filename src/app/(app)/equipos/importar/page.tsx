import Link from "next/link";
import { contexto } from "@/lib/contexto";
import { TIPOS } from "@/lib/protocolos";
import { importarCSV } from "../actions";

export const metadata = { title: "Importar equipos" };

const EJEMPLO = `tipo,marca,modelo,serial,servicio,inventario
Bomba de infusión,B. Braun,Infusomat Space,IS-30115,Internación,INV-2001
Monitor multiparamétrico,Mindray,ePM 12,EP12-10442,Guardia,INV-2002`;

export default async function Importar({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const { instituciones, alcance } = await contexto();
  return (
    <>
      <div className="top"><h1>Importar equipos</h1></div>
      <form className="card form" action={importarCSV}>
        {sp.error && <div className="error full">{sp.error}</div>}
        <p className="full muted" style={{ margin: 0 }}>
          Exportá tu planilla como CSV (coma o punto y coma). Columnas obligatorias: <span className="mono">tipo</span> y <span className="mono">serial</span>.
          Opcionales: <span className="mono">marca, modelo, servicio, inventario</span>. Los seriales repetidos se descartan.
          Tipos reconocidos: {TIPOS.join(", ")}; cualquier otro se guarda como “Otro”.
        </p>
        <label className="full">Institución
          <select id="org_id" name="org_id" required defaultValue={alcance !== "todas" ? alcance : undefined}>
            {instituciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </label>
        <label className="full">Archivo CSV<input id="archivo" name="archivo" type="file" accept=".csv,text/csv" /></label>
        <label className="full">o pegá las filas acá<textarea id="csv" name="csv" rows={7} className="mono" defaultValue={EJEMPLO} /></label>
        <div className="full actions end"><Link className="btn" href="/equipos">Cancelar</Link><button className="btn primary">Importar</button></div>
      </form>
    </>
  );
}
