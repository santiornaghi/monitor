"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { baseURL } from "@/lib/qr";

export async function ingresar(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) {
    const msg =
      error.code === "email_not_confirmed"
        ? "Todavía no confirmaste el email. Abrí el enlace que te mandamos o pedí ayuda al administrador."
        : error.code === "invalid_credentials"
          ? "Email o contraseña incorrectos."
          : `No se pudo ingresar: ${error.message}`;
    redirect("/login?error=" + encodeURIComponent(msg));
  }
  redirect("/");
}

export async function registrarse(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? baseURL();
  const password = String(formData.get("password"));
  if (password.length < 8) redirect("/login?modo=registro&error=" + encodeURIComponent("La contraseña debe tener al menos 8 caracteres."));
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) redirect("/login?modo=registro&error=" + encodeURIComponent(error.message));
  if (!data.session) redirect("/login?aviso=" + encodeURIComponent("Te mandamos un email para confirmar la cuenta. Abrí el enlace y volvé a ingresar."));
  redirect("/bienvenida");
}

export async function salir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
