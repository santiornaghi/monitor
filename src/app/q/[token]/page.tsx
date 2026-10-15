import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { ESTADOS, numeroOT } from "@/lib/formato";
import "./qr.css";
import { reportar } from "./actions";
import { TIPOS_DOC, enlaces, type Doc } from "@/lib/documentos";

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

  const [{ data }, { data: docsData }] = await Promise.all([
    supabase.rpc("qr_equipo", { p_token: token }),
    supabase.rpc("qr_documentos", { p_token: token }),
  ]);
  const e = Array.isArray(data) ? data[0] : null;
  const docs = (await enlaces(supabase, (Array.isArray(docsData) ? docsData : []) as Doc[])).filter((d) => d.href);
  const estado = e ? ESTADOS[e.estado] : null;
  const documentos = docs.length > 0 && (
    <div className="qr-docs">
      <h2>Documentación</h2>
      {docs.map((d, i) => (
        <a key={i} href={d.href!} target="_blank" rel="noopener noreferrer">
          {d.nombre !== TIPOS_DOC[d.tipo] ? d.nombre : TIPOS_DOC[d.tipo]}
          <span>Abrir ↗</span>
        </a>
      ))}
    </div>
  );

  return (
    <div className="qrp">
      <header className="qr-top"><Logo size={22} /><span>{e ? "Equipo" : "NAYA LAB"}</span></header>
      {!e ? (
        <main className="qr-cuerpo"><h1>Código no válido</h1><p className="qr-sub">Este código no corresponde a un equipo activo.</p></main>
      ) : (
        <main className="qr-cuerpo">
          <div className="qr-marca" aria-hidden="true">{e.marca}</div>
          <p className="qr-servicio">{e.servicio} · {e.institucion}</p>
          <h1>{e.tipo}</h1>
          <p className="qr-sub">{e.marca} {e.modelo}</p>
          {estado && <span className={`qr-estado ${e.estado}`}>{estado.label}</span>}

          {sp.ok ? (
            <div className="qr-ok"><strong>Falla reportada.</strong> Se abrió la orden {numeroOT(Number(sp.ok))}. El equipo de mantenimiento ya la ve en su lista.</div>
          ) : null}

          {documentos}

          {!sp.ok && (
            <form id="reportar" action={reportar} className="qr-form">
              <input type="hidden" name="token" value={token} />
              <h2>Reportar una falla</h2>
              {sp.error && <div className="qr-error">{sp.error}</div>}
              <label>Qué pasa con el equipo
                <textarea id="descripcion" name="descripcion" rows={4} required minLength={5} maxLength={1000} placeholder="Ej.: suena una alarma de batería aunque está enchufado" />
              </label>
              <label>Tu nombre y servicio (opcional)
                <input id="reporta" name="reporta" maxLength={120} placeholder="Enf. Lucía Ferreyra, UTI" />
              </label>
              <button className="qr-boton">Enviar reporte</button>
              <p className="qr-aviso">Si el equipo representa un riesgo para el paciente, dejá de usarlo y avisá también por los canales habituales.</p>
            </form>
          )}
        </main>
      )}
      {e && !sp.ok && (
        <div className="qr-barra">
          <div><b>¿Algo no anda?</b>Avisá al equipo técnico</div>
          <a href="#reportar">Reportar falla</a>
        </div>
      )}
    </div>
  );
}
