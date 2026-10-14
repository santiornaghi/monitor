"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { avisarNuevaOT } from "@/lib/avisos";

export async function reportar(formData: FormData) {
  const token = String(formData.get("token"));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("qr_reportar", {
    p_token: token, p_descripcion: String(formData.get("descripcion") ?? ""), p_reporta: String(formData.get("reporta") ?? ""),
  });
  if (error) redirect(`/q/${token}?error=` + encodeURIComponent(error.message));
  after(async () => {
    const db = clienteAdmin();
    if (!db) return;
    const { data: o } = await db.from("ordenes").select("id").eq("numero", data).single();
    if (o) await avisarNuevaOT(o.id);
  });
  redirect(`/q/${token}?ok=${data}`);
}
