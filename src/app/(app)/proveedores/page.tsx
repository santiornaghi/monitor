import { contexto, nombreOrg } from "@/lib/contexto";
import { Encabezado } from "@/components/Encabezado";
import { crearProveedor } from "./actions";

export const metadata = { title: "Proveedores" };

export default async function Proveedores({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const { supabase, orgIds, orgs, instituciones, alcance } = await contexto();
  const [{ data: provs }, { data: eqs }, { data: ots }] = await Promise.all([
    supabase.from("proveedores").select("*").in("org_id", orgIds).order("nombre"),
    supabase.from("equipos").select("proveedor_id").in("org_id", orgIds).neq("estado", "baja"),
    supabase.from("ordenes").select("proveedor_id").in("org_id", orgIds).neq("estado", "Cerrada"),
  ]);
  const cuenta = (lista: { proveedor_id: string | null }[] | null, id: string) => (lista ?? []).filter((x) => x.proveedor_id === id).length;
  const varias = alcance === "todas" && instituciones.length > 1;
  return (
    <>
      <Encabezado titulo="Proveedores" instituciones={instituciones} alcance={alcance} />
      <div className="tablewrap" style={{ marginBottom: 24 }}>
        <table>
          <thead><tr><th>Empresa</th><th>Especialidad</th><th>Localidad</th><th className="hide-sm">Contacto</th>{varias && <th className="hide-sm">Institución</th>}<th>Equipos</th><th className="hide-sm">OT abiertas</th></tr></thead>
          <tbody>
            {(provs ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td><td className="muted">{p.especialidad}</td>
                <td>{[p.localidad, p.provincia].filter(Boolean).join(", ")}</td>
                <td className="mono hide-sm">{[p.telefono, p.email].filter(Boolean).join(" · ")}</td>
                {varias && <td className="hide-sm">{nombreOrg(orgs, p.org_id)}</td>}
                <td className="mono">{cuenta(eqs, p.id)}</td><td className="mono hide-sm">{cuenta(ots, p.id)}</td>
              </tr>
            ))}
            {!provs?.length && <tr><td colSpan={7} className="muted">Todavía no hay proveedores cargados.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="editar">Agregar proveedor</h2>
      <form className="card form editar" action={crearProveedor}>
        {sp.error && <div className="error full">{sp.error}</div>}
        <label className="full">Institución<select id="org_id" name="org_id" required defaultValue={alcance !== "todas" ? alcance : undefined}>{instituciones.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></label>
        <label className="full">Empresa<input id="nombre" name="nombre" required /></label>
        <label className="full">Especialidad<input id="especialidad" name="especialidad" placeholder="Respiradores, monitores" /></label>
        <label>Localidad<input id="localidad" name="localidad" /></label>
        <label>Provincia<input id="provincia" name="provincia" /></label>
        <label>Teléfono<input id="telefono" name="telefono" /></label>
        <label>Email<input id="email" name="email" type="email" /></label>
        <div className="full actions end"><button className="btn primary">Agregar proveedor</button></div>
      </form>
    </>
  );
}
