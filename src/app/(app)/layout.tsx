import Link from "next/link";
import { contexto } from "@/lib/contexto";
import { Navegacion } from "@/components/Navegacion";
import { Logo } from "@/components/Logo";
import { salir } from "@/app/login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, orgIds, nombreUsuario, proveedorPropio, membresias } = await contexto();
  const esAdmin = membresias.some((m) => m.rol === "admin");
  // Dirección: solo lectura. La base de datos ya rechaza sus cambios; acá se ocultan los controles.
  const soloLectura = membresias.length > 0 && membresias.every((m) => m.rol === "direccion");
  const hoy = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const [{ data: vencidos }, { count: abiertas }] = await Promise.all([
    supabase.rpc("preventivos_vencidos", { p_orgs: orgIds, p_hoy: hoy }),
    supabase.from("ordenes").select("id", { count: "exact", head: true }).in("org_id", orgIds).neq("estado", "Cerrada"),
  ]);
  return (
    <div className={soloLectura ? "app solo-lectura" : "app"}>
      <nav className="side" aria-label="Módulos">
        <Link href="/" className="brand"><Logo />QR <small style={{ fontWeight: 500, opacity: .6, fontSize: "0.72em", letterSpacing: ".08em" }}>NAYA LAB</small></Link>
        <Navegacion contadores={{ "/preventivos": Number(vencidos ?? 0), "/ordenes": abiertas ?? 0 }} />
        <div className="foot">
          {proveedorPropio && <Link href="/clientes" className="btn sm">Clientes de {proveedorPropio.nombre}</Link>}
          {esAdmin && <Link href="/usuarios" className="btn sm">Usuarios</Link>}
          <span>{nombreUsuario}</span>
          <form action={salir}><button className="btn sm">Salir</button></form>
        </div>
      </nav>
      <main>{children}</main>
      <nav className="mobnav" aria-label="Módulos"><Navegacion movil /></nav>
    </div>
  );
}
