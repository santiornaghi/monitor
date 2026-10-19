"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cambiarClave(formData: FormData) {
  const clave = String(formData.get("clave") ?? "");
  const repetida = String(formData.get("repetida") ?? "");
  const volver = (error: string) => redirect("/cuenta/clave?error=" + encodeURIComponent(error));
  if (clave.length < 8) volver("La contraseña debe tener al menos 8 caracteres.");
  if (clave !== repetida) volver("Las dos contraseñas no coinciden.");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: clave });
  if (error) {
    volver(error.code === "same_password" ? "La contraseña nueva tiene que ser distinta de la anterior." : `No se pudo cambiar: ${error.message}`);
  }
  redirect("/cuenta/clave?ok=1");
}
