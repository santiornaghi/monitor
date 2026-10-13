import Link from "next/link";
export default function NotFound() {
  return (
    <div className="auth"><div className="card"><h1>No encontrado</h1><p className="muted">La página no existe o no tenés acceso.</p><Link className="btn" href="/">Volver al panel</Link></div></div>
  );
}
