"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function aceptar(formData: FormData) {
  const token = String(formData.get("token"));
  const supabase = await createClient();
  const { data: orgId, error } = await supabase.rpc("aceptar_invitacion", {
    p_token: token,
    p_nombre: String(formData.get("nombre") ?? ""),
  });
  if (error) redirect(`/invitacion/${token}?error=` + encodeURIComponent(error.message));
  (await cookies()).set("org", "todas", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  void orgId;
  redirect("/");
}
