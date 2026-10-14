import { baseURL } from "./qr";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function emailConfigurado() {
  return !!process.env.RESEND_API_KEY;
}

/** Envía un email con Resend. No lanza errores: los avisos nunca deben romper una acción. */
export async function enviarEmail(m: { to: string[]; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = [...new Set(m.to.filter(Boolean))];
  if (!key || !to.length) return { ok: false, motivo: key ? "sin destinatarios" : "RESEND_API_KEY no configurada" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Monitor <onboarding@resend.dev>", to, subject: m.subject, html: m.html }),
    });
    if (!r.ok) {
      const motivo = await r.text();
      console.error("Resend", r.status, motivo);
      return { ok: false, motivo };
    }
    return { ok: true };
  } catch (e) {
    console.error("Resend", e);
    return { ok: false, motivo: String(e) };
  }
}

/** Plantilla simple, legible en cualquier cliente de correo. `cuerpo` ya viene escapado. */
const PIE_USUARIO = "Recibís este aviso porque sos usuario de Monitor. Un administrador puede desactivarlo desde Usuarios.";

export function plantilla(titulo: string, cuerpo: string, boton?: { texto: string; ruta: string }, pie = PIE_USUARIO) {
  const url = boton ? `${baseURL()}${boton.ruta}` : "";
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f3f6f7;font-family:Segoe UI,Arial,sans-serif;color:#14242b">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
  <div style="font-weight:700;font-size:18px;color:#0b6e79;margin-bottom:16px">Monitor</div>
  <div style="background:#fff;border:1px solid #d3dde1;border-radius:8px;padding:20px">
    <h1 style="font-size:18px;margin:0 0 12px">${esc(titulo)}</h1>
    ${cuerpo}
    ${boton ? `<p style="margin:20px 0 0"><a href="${esc(url)}" style="background:#0b6e79;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;display:inline-block">${esc(boton.texto)}</a></p>` : ""}
  </div>
  <p style="font-size:12px;color:#5b6f77;margin-top:16px">${esc(pie)}</p>
</div></body></html>`;
}

export function lista(items: string[], max = 15) {
  if (!items.length) return "";
  const extra = items.length > max ? `<li style="color:#5b6f77">y ${items.length - max} más</li>` : "";
  return `<ul style="padding-left:18px;margin:6px 0 14px">${items.slice(0, max).map((i) => `<li style="margin:4px 0">${i}</li>`).join("")}${extra}</ul>`;
}
