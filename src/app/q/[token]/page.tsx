import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { numeroOT } from "@/lib/formato";
import { reportar } from "./actions";

export const metadata = { title: "Reportar falla", robots: { index: false } };

export default async function QR({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { token } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // Usuarios del sistema con acceso al equipo van directo a la hoja de vida
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user && !sp.ok) {
    const { data: eq } = await supabase.from("equipos").select("id").eq("qr_token", token).maybeSingle();
    if (eq) redirect(`/equipos/${eq.id}`);
  }

  const { data } = await supabase.rpc("qr_equipo", { p_token: token });
  const e = Array.isArray(data) ? data[0] : null;

  return (
    <div className="auth">
      <div className="card">
        <div className="actions"><Logo size={24} /><span className="eyebrow">Reporte de falla</span></div>
        {!e ? (
          <p>Este código no corresponde a un equipo activo.</p>
        ) : sp.ok ? (
          <>
            <h1 style={{ fontSize: 20 }}>Falla reportada</h1>
            <div className="notice">Se abrió la orden {numeroOT(Number(sp.ok))}. El equipo de mantenimiento ya la ve en su lista.</div>
            <p className="muted" style={{ margin: 0 }}>{e.tipo} · {e.marca} {e.modelo} · {e.servicio}</p>
          </>
        ) : (
          <form action={reportar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="token" value={token} />
            <div>
              <h1 style={{ fontSize: 20 }}>{e.tipo}</h1>
              <div className="muted">{e.marca} {e.modelo} · {e.servicio} · {e.institucion}</div>
            </div>
            {sp.error && <div className="error">{sp.error}</div>}
            <label className="muted" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
              Qué pasa con el equipo
              <textarea id="descripcion" name="descripcion" rows={4} required minLength={5} maxLength={1000} placeholder="Ej.: suena una alarma de batería aunque está enchufado" />
            </label>
            <label className="muted" style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
              Tu nombre y servicio (opcional)
              <input id="reporta" name="reporta" maxLength={120} placeholder="Enf. Lucía Ferreyra, UTI" />
            </label>
            <button className="btn primary" style={{ justifyContent: "center" }}>Enviar reporte</button>
            <p className="sub" style={{ margin: 0 }}>Si el equipo representa un riesgo para el paciente, dejá de usarlo y avisá también por los canales habituales.</p>
          </form>
        )}
      </div>
    </div>
  );
}
