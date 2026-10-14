import { ingresar, registrarse } from "./actions";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Ingresar" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; aviso?: string; modo?: string; next?: string }> }) {
  const sp = await searchParams;
  const registro = sp.modo === "registro";
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  const q = next ? `next=${encodeURIComponent(next)}` : "";
  return (
    <div className="auth">
      <form className="card" action={registro ? registrarse : ingresar}>
        <div className="actions"><Logo size={28} /><h1>Monitor</h1></div>
        <p className="muted" style={{ margin: 0 }}>
          {registro ? "Creá tu cuenta para gestionar el parque de equipos." : "Inventario y mantenimiento de equipos médicos."}
        </p>
        {sp.error && <div className="error">{sp.error}</div>}
        {sp.aviso && <div className="notice">{sp.aviso}</div>}
        <input type="hidden" name="next" value={next} />
        <div className="form">
          <label className="full">Email<input id="email" name="email" type="email" required autoComplete="email" /></label>
          <label className="full">Contraseña<input id="password" name="password" type="password" required minLength={registro ? 8 : undefined} autoComplete={registro ? "new-password" : "current-password"} /></label>
        </div>
        <button className="btn primary" style={{ justifyContent: "center" }}>{registro ? "Crear cuenta" : "Ingresar"}</button>
        <a className="btn link" href={registro ? `/login${q ? "?" + q : ""}` : `/login?modo=registro${q ? "&" + q : ""}`}>
          {registro ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
        </a>
      </form>
    </div>
  );
}
