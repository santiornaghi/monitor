"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { contexto } from "@/lib/contexto";

const ROLES = ["admin", "tecnico", "direccion"];
const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function crearInvitacion(formData: FormData) {
  const { supabase, user, esAdminDe } = await contexto();
  const org_id = txt(formData, "org_id");
  const rol = txt(formData, "rol");
  if (!esAdminDe(org_id) || !ROLES.includes(rol)) redirect("/usuarios?error=" + encodeURIComponent("No podés invitar a esa organización."));
  const { error } = await supabase.from("invitaciones").insert({ org_id, rol, nota: txt(formData, "nota") || null, creada_por: user.id });
  if (error) redirect("/usuarios?error=" + encodeURIComponent(error.message));
  revalidatePath("/usuarios");
  redirect("/usuarios?aviso=" + encodeURIComponent("Invitación creada. Copiá el enlace y mandáselo a la persona."));
}

export async function anularInvitacion(formData: FormData) {
  const { supabase } = await contexto();
  await supabase.from("invitaciones").delete().eq("id", txt(formData, "id")).is("usada_por", null);
  revalidatePath("/usuarios");
}

export async function cambiarRol(formData: FormData) {
  const { supabase, user } = await contexto();
  const user_id = txt(formData, "user_id"), org_id = txt(formData, "org_id"), rol = txt(formData, "rol");
  if (user_id === user.id || !ROLES.includes(rol)) return;
  await supabase.from("miembros").update({ rol }).eq("org_id", org_id).eq("user_id", user_id);
  revalidatePath("/usuarios");
}

export async function quitarMiembro(formData: FormData) {
  const { supabase, user } = await contexto();
  const user_id = txt(formData, "user_id"), org_id = txt(formData, "org_id");
  if (user_id === user.id) redirect("/usuarios?error=" + encodeURIComponent("No podés quitarte a vos mismo."));
  await supabase.from("miembros").delete().eq("org_id", org_id).eq("user_id", user_id);
  revalidatePath("/usuarios");
}

export async function cambiarAvisos(formData: FormData) {
  const { supabase } = await contexto();
  await supabase.from("miembros")
    .update({ recibe_avisos: txt(formData, "valor") === "si" })
    .eq("org_id", txt(formData, "org_id")).eq("user_id", txt(formData, "user_id"));
  revalidatePath("/usuarios");
}

export async function probarAvisos() {
  const { user } = await contexto();
  const { enviarEmail, plantilla, emailConfigurado } = await import("@/lib/email");
  const { enviarResumenes } = await import("@/lib/resumen");
  if (!emailConfigurado()) redirect("/usuarios?error=" + encodeURIComponent("Falta configurar RESEND_API_KEY en Vercel."));
  const r = await enviarEmail({
    to: [user.email!],
    subject: "Monitor: prueba de avisos",
    html: plantilla("Los avisos por email funcionan", "<p>Si recibiste este mensaje, Monitor puede enviarte avisos de órdenes nuevas y el resumen diario de vencimientos.</p>"),
  });
  if (!r.ok) redirect("/usuarios?error=" + encodeURIComponent(`No se pudo enviar: ${r.motivo}`));
  const res = await enviarResumenes(user.email!);
  redirect("/usuarios?aviso=" + encodeURIComponent(
    `Te mandamos un email de prueba a ${user.email}.` +
    (res.error ? ` El resumen diario no se pudo armar: ${res.error}.` : res.enviados ? " También te llegó el resumen de hoy." : " Hoy no hay vencimientos para resumir."),
  ));
}
