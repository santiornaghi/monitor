"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function reportar(formData: FormData) {
  const token = String(formData.get("token"));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("qr_reportar", {
    p_token: token, p_descripcion: String(formData.get("descripcion") ?? ""), p_reporta: String(formData.get("reporta") ?? ""),
  });
  if (error) redirect(`/q/${token}?error=` + encodeURIComponent(error.message));
  redirect(`/q/${token}?ok=${data}`);
}
