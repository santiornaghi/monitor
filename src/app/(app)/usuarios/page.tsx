import { redirect } from "next/navigation";
import { contexto } from "@/lib/contexto";
import { baseURL } from "@/lib/qr";
import { fecha } from "@/lib/formato";
import { Copiar } from "@/components/Copiar";
import { EnviarAlCambiar } from "@/components/EnviarAlCambiar";
import { crearInvitacion, anularInvitacion, cambiarRol, quitarMiembro, cambiarAvisos, probarAvisos } from "./actions";

export const metadata = { title: "Usuarios" };

const ROLES: [string, string][] = [["admin", "Administrador"], ["tecnico", "Técnico"], ["direccion", "Dirección (solo lectura)"]];

export default async function Usuarios({ searchParams }: { searchParams: Promise<{ error?: string; aviso?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, orgs, membresias } = await contexto();
  const mias = orgs.filter((o) => membresias.some((m) => m.org_id === o.id && m.rol === "admin"));
  if (!mias.length) redirect("/");
  const ids = mias.map((o) => o.id);
  const [{ data: miembros }, { data: invs }] = await Promise.all([
    supabase.from("miembros").select("org_id,user_id,rol,nombre,email,created_at,recibe_avisos").in("org_id", ids).order("created_at"),
    supabase.from("invitaciones").select("id,org_id,rol,token,nota,expira_en").in("org_id", ids).is("usada_por", null).gt("expira_en", new Date().toISOString()).order("creada_en", { ascending: false }),
  ]);
  const base = baseURL();

  return (
    <>
      <div className="top"><h1>Usuarios</h1></div>
      {sp.error && <div className="error" style={{ marginBottom: 12 }}>{sp.error}</div>}
      {sp.aviso && <div className="notice" style={{ marginBottom: 12 }}>{sp.aviso}</div>}

      {mias.map((o) => {
        const ms = (miembros ?? []).filter((m) => m.org_id === o.id);
        const is = (invs ?? []).filter((i) => i.org_id === o.id);
        return (
          <section key={o.id} style={{ marginBottom: 28 }}>
            <h2>{o.nombre}{o.tipo === "proveedor" ? " · acceso a todos sus clientes" : ""}</h2>
            <div className="tablewrap" style={{ marginBottom: 12 }}>
              <table>
                <thead><tr><th>Nombre</th><th className="hide-sm">Email</th><th>Rol</th><th>Avisos por email</th><th></th></tr></thead>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.user_id}>
                      <td>{m.nombre || "—"}{m.user_id === user.id && <span className="sub"> (vos)</span>}</td>
                      <td className="hide-sm mono">{m.email ?? "—"}</td>
                      <td>
                        {m.user_id === user.id ? ROLES.find((r) => r[0] === m.rol)?.[1] : (
                          <form action={cambiarRol}>
                            <input type="hidden" name="org_id" value={o.id} />
                            <input type="hidden" name="user_id" value={m.user_id} />
                            <EnviarAlCambiar name="rol" valor={m.rol} etiqueta="Rol" opciones={ROLES} />
                          </form>
                        )}
                      </td>
                      <td>
                        <form action={cambiarAvisos}>
                          <input type="hidden" name="org_id" value={o.id} />
                          <input type="hidden" name="user_id" value={m.user_id} />
                          <EnviarAlCambiar name="valor" valor={m.recibe_avisos === false ? "no" : "si"} etiqueta="Avisos por email" opciones={[["si", "Recibe"], ["no", "No recibe"]]} />
                        </form>
                      </td>
                      <td>
                        {m.user_id !== user.id && (
                          <form action={quitarMiembro}>
                            <input type="hidden" name="org_id" value={o.id} />
                            <input type="hidden" name="user_id" value={m.user_id} />
                            <button className="btn sm">Quitar acceso</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {is.length > 0 && (
              <div className="tablewrap" style={{ marginBottom: 12 }}>
                <table>
                  <thead><tr><th>Invitación pendiente</th><th>Rol</th><th className="hide-sm">Vence</th><th></th></tr></thead>
                  <tbody>
                    {is.map((i) => {
                      const link = `${base}/invitacion/${i.token}`;
                      return (
                        <tr key={i.id}>
                          <td style={{ minWidth: 220 }}>
                            {i.nota && <div>{i.nota}</div>}
                            <div className="mono sub" style={{ overflowWrap: "anywhere" }}>{link}</div>
                          </td>
                          <td>{ROLES.find((r) => r[0] === i.rol)?.[1]}</td>
                          <td className="hide-sm mono">{fecha(i.expira_en)}</td>
                          <td>
                            <div className="actions">
                              <Copiar texto={link} />
                              <form action={anularInvitacion}><input type="hidden" name="id" value={i.id} /><button className="btn sm">Anular</button></form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <form className="actions" action={crearInvitacion}>
              <input type="hidden" name="org_id" value={o.id} />
              <input name="nota" placeholder="Para quién es (opcional)" aria-label="Para quién es" style={{ flex: "1 1 200px" }} />
              <select name="rol" defaultValue="tecnico" aria-label="Rol">{ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              <button className="btn primary">Crear invitación</button>
            </form>
          </section>
        );
      })}
      <section className="panel" style={{ marginBottom: 16 }}>
        <h2>Avisos por email</h2>
        <p className="sub" style={{ marginTop: 0 }}>
          Cuando se abre una orden (desde la app o desde un QR), se avisa a administradores y técnicos. De lunes a viernes a las 8 se envía un resumen
          con preventivos vencidos o de la semana, órdenes de prioridad alta, certificados por vencer y repuestos bajo mínimo. Solo se manda si hay algo que avisar.
        </p>
        <form action={probarAvisos}><button className="btn">Enviarme un email de prueba</button></form>
      </section>
      <p className="sub">Cada enlace sirve para una sola persona y vence a los 7 días. Quien lo abre crea su cuenta (o ingresa) y queda con el rol elegido.</p>
    </>
  );
}
