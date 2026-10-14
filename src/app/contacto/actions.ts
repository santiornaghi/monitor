"use server";

import { redirect } from "next/navigation";
import { enviarEmail, esc, plantilla } from "@/lib/email";

const txt = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);

export async function enviarConsulta(formData: FormData) {
  // Campo trampa: las personas no lo ven; los robots lo completan
  if (txt(formData, "sitio_web")) redirect("/contacto?ok=1");
  const d = {
    nombre: txt(formData, "nombre", 120),
    institucion: txt(formData, "institucion", 160),
    ciudad: txt(formData, "ciudad", 120),
    email: txt(formData, "email", 160),
    telefono: txt(formData, "telefono", 60),
    interes: txt(formData, "interes", 60),
    producto: txt(formData, "producto", 300),
    mensaje: txt(formData, "mensaje", 3000),
  };
  if (!d.nombre || (!d.email && !d.telefono)) redirect("/contacto?error=" + encodeURIComponent("Dejanos tu nombre y un email o teléfono para responderte."));
  const destino = process.env.CONTACTO_EMAIL || "santiornaghi@gmail.com";
  if (!destino) redirect("/contacto?error=" + encodeURIComponent("El formulario todavía no está configurado. Escribinos por WhatsApp."));
  const filas = Object.entries({
    Nombre: d.nombre, Institución: d.institucion, Ciudad: d.ciudad, Email: d.email, Teléfono: d.telefono,
    Interés: d.interes, Producto: d.producto,
  }).filter(([, v]) => v).map(([k, v]) => `<tr><td style="color:#5b6f77;padding:4px 12px 4px 0">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join("");
  const r = await enviarEmail({
    to: [destino],
    subject: `Consulta web: ${d.interes || "general"}${d.producto ? ` — ${d.producto}` : ""} (${d.nombre})`,
    html: plantilla("Nueva consulta desde la web", `<table>${filas}</table>${d.mensaje ? `<p style="white-space:pre-wrap;margin-top:12px">${esc(d.mensaje)}</p>` : ""}`, undefined, "Consulta recibida desde el formulario de contacto del sitio."),
  });
  if (!r.ok) redirect("/contacto?error=" + encodeURIComponent("No pudimos enviar la consulta. Probá de nuevo o escribinos por WhatsApp."));
  redirect("/contacto?ok=1");
}
