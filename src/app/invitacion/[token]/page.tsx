import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { aceptar } from "./actions";

export const metadata = { title: "Invitación", robots: { index: false } };

const ROLES: Record<string, string> = {
  admin: "administrador",
  tecnico: "técnico",
  direccion: "dirección (solo lectura)",
};

export default async function Invitacion({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: auth }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("ver_invitacion", { p_token: token }),
  ]);
  const inv = Array.isArray(data) ? data[0] : null;
  const next = encodeURIComponent(`/invitacion/${token}`);

  return (
    <div className="auth">
      <div className="card">
        <div className="actions"><Logo size={24} /><span className="eyebrow">Invitación</span></div>
        {!inv ? (
          <p>Este enlace de invitación no existe. Pedile uno nuevo a quien te invitó.</p>
        ) : !inv.valida ? (
          <p>La invitación a <strong>{inv.organizacion}</strong> ya fue usada o venció. Pedí una nueva.</p>
        ) : (
          <>
            <h1 style={{ fontSize: 20 }}>{inv.organizacion}</h1>
            <p className="muted" style={{ margin: 0 }}>
              Te invitaron a sumarte como <strong>{ROLES[inv.rol] ?? inv.rol}</strong>
              {inv.tipo === "proveedor" ? ", con acceso a los equipos de todos sus clientes." : " para gestionar su parque de equipos."}
            </p>
            {sp.error && <div className="error">{sp.error}</div>}
            {auth.user ? (
              <form action={aceptar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="hidden" name="token" value={token} />
                <label className="muted" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
                  Tu nombre
                  <input id="nombre" name="nombre" required placeholder="Nombre y apellido" />
                </label>
                <p className="sub" style={{ margin: 0 }}>Vas a entrar como {auth.user.email}.</p>
                <button className="btn primary" style={{ justifyContent: "center" }}>Aceptar invitación</button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link className="btn primary" style={{ justifyContent: "center" }} href={`/login?modo=registro&next=${next}`}>Crear mi cuenta</Link>
                <Link className="btn" style={{ justifyContent: "center" }} href={`/login?next=${next}`}>Ya tengo cuenta</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
