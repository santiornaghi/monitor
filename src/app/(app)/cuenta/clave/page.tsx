import { cambiarClave } from "./actions";

export const metadata = { title: "Cambiar contraseña" };

export default async function Clave({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <div style={{ maxWidth: 460 }}>
      <h1>Cambiar contraseña</h1>
      {sp.ok ? (
        <div className="notice">Listo, la contraseña quedó cambiada. La próxima vez ingresá con la nueva.</div>
      ) : (
        <form className="panel form" action={cambiarClave} style={{ marginTop: 16 }}>
          {sp.error && <div className="error full">{sp.error}</div>}
          <label className="full">Contraseña nueva<input id="clave" name="clave" type="password" required minLength={8} autoComplete="new-password" /></label>
          <label className="full">Repetila<input id="repetida" name="repetida" type="password" required minLength={8} autoComplete="new-password" /></label>
          <div className="full"><button className="btn primary">Guardar contraseña</button></div>
        </form>
      )}
    </div>
  );
}
