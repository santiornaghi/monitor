import { redirect } from "next/navigation";
import { contexto } from "@/lib/contexto";
import { crearCliente } from "../proveedores/actions";

export const metadata = { title: "Clientes" };

export default async function Clientes({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const { supabase, proveedorPropio, instituciones } = await contexto();
  if (!proveedorPropio) redirect("/");
  const { data: eqs } = await supabase.from("equipos").select("org_id,estado").in("org_id", instituciones.map((i) => i.id).concat("00000000-0000-0000-0000-000000000000")).neq("estado", "baja");
  return (
    <>
      <div className="top"><h1>Clientes de {proveedorPropio.nombre}</h1></div>
      <div className="tablewrap" style={{ marginBottom: 24 }}>
        <table>
          <thead><tr><th>Institución</th><th>Ciudad</th><th>Equipos</th><th>Operativos</th></tr></thead>
          <tbody>
            {instituciones.map((o) => {
              const x = (eqs ?? []).filter((e) => e.org_id === o.id);
              return <tr key={o.id}><td>{o.nombre}</td><td>{[o.ciudad, o.provincia].filter(Boolean).join(", ") || "—"}</td><td className="mono">{x.length}</td><td className="mono">{x.filter((e) => e.estado === "operativo").length}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <h2>Agregar cliente</h2>
      <form className="card form" action={crearCliente}>
        {sp.error && <div className="error full">{sp.error}</div>}
        <label className="full">Nombre de la institución<input id="nombre" name="nombre" required /></label>
        <label>Ciudad<input id="ciudad" name="ciudad" /></label>
        <label>Provincia<input id="provincia" name="provincia" /></label>
        <div className="full actions end"><button className="btn primary">Agregar y cargar equipos</button></div>
      </form>
    </>
  );
}
