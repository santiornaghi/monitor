import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { crearOrganizacion } from "./actions";
import { Logo } from "@/components/Logo";
import { TipoOrg } from "./TipoOrg";

export const metadata = { title: "Bienvenida" };

export default async function Bienvenida({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { count } = await supabase.from("organizaciones").select("id", { count: "exact", head: true });
  if (count) redirect("/");
  const sp = await searchParams;

  return (
    <div className="auth">
      <form className="card" action={crearOrganizacion} style={{ maxWidth: 520 }}>
        <div className="actions"><Logo size={28} /><h1>Configurá tu cuenta</h1></div>
        {sp.error && <div className="error">{sp.error}</div>}
        <div className="form">
          <label className="full">Tu nombre<input id="usuario" name="usuario" required placeholder="Nombre y apellido" /></label>
          <TipoOrg />
          <label className="full">Nombre de la organización<input id="nombre" name="nombre" required placeholder="Clínica del Sur / Servicio Técnico Centro" /></label>
          <label>Ciudad<input id="ciudad" name="ciudad" placeholder="Río Cuarto" /></label>
          <label>Provincia<input id="provincia" name="provincia" placeholder="Córdoba" /></label>
          <label className="full" style={{ flexDirection: "row", alignItems: "center", gap: 8, color: "var(--fg)" }}>
            <input id="ejemplo" name="ejemplo" type="checkbox" defaultChecked style={{ width: "auto" }} />
            Cargar equipos de ejemplo para probar (se pueden borrar después)
          </label>
        </div>
        <button className="btn primary" style={{ justifyContent: "center" }}>Empezar</button>
      </form>
    </div>
  );
}
