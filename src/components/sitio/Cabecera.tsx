import { Logo } from "@/components/Logo";
import { GRUPO, MARCA, TURNERO, WHATSAPP } from "@/lib/marca";

type Seccion = "inicio" | "catalogo" | "monitor" | "turnero" | "contacto";

const SECCIONES: { href: string; id: Seccion; texto: string }[] = [
  { href: "/catalogo", id: "catalogo", texto: "Equipamiento" },
  { href: "/presentacion", id: "monitor", texto: MARCA },
  { href: "/turnero", id: "turnero", texto: TURNERO },
  { href: "/contacto", id: "contacto", texto: "Contacto" },
];

export function Cabecera({ actual, acciones }: { actual?: Seccion; acciones?: React.ReactNode }) {
  const cta = acciones ?? <a className="lp-boton chico lleno" href="/contacto">Pedir cotización</a>;
  return (
    <header className="lp-cab">
      <div className="lp-ancho">
        <a className="lp-logo" href="/inicio"><Logo size={28} />{GRUPO}</a>
        <nav className="lp-nav" aria-label="Secciones del sitio">
          {SECCIONES.map((s) => (
            <a key={s.id} href={s.href} aria-current={actual === s.id ? "page" : undefined}>{s.texto}</a>
          ))}
        </nav>
        <div className="lp-acceso">{cta}</div>
        <details className="lp-menu">
          <summary aria-label="Abrir el menú">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </summary>
          <nav aria-label="Secciones del sitio">
            {SECCIONES.map((s) => (
              <a key={s.id} href={s.href} aria-current={actual === s.id ? "page" : undefined}>{s.texto}</a>
            ))}
            <a href="/login">Ingresar</a>
            <a className="lp-boton lleno" href="/contacto">Pedir cotización</a>
          </nav>
        </details>
      </div>
    </header>
  );
}

/** Se mantiene por compatibilidad: el menú de celular ahora está en la cabecera. */
export function MenuCelular() {
  return null;
}

export function Pie({ gigante }: { gigante?: string }) {
  const email = "santiornaghi@gmail.com";
  return (
    <footer className="lp-pie">
      <div className="lp-ancho">
        <div className="lp-pie-cols">
          <div>
            <div className="marca"><Logo size={26} />{GRUPO}</div>
            <p style={{ margin: 0, maxWidth: "22em" }}>Equipamiento médico, software de mantenimiento y gestión de turnos para instituciones de salud.</p>
          </div>
          <div>
            <h4>Sitio</h4>
            <ul>
              <li><a href="/catalogo">Equipamiento</a></li>
              <li><a href="/catalogo?ver=reactivos">Reactivos e insumos</a></li>
              <li><a href="/presentacion">{MARCA}</a></li>
              <li><a href="/turnero">{TURNERO}</a></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              {WHATSAPP && <li><a href={`https://wa.me/${WHATSAPP}`}>WhatsApp</a></li>}
              <li><a href={`mailto:${email}`}>{email}</a></li>
              <li><a href="/contacto">Pedir cotización</a></li>
            </ul>
          </div>
          <div>
            <h4>Clientes</h4>
            <ul>
              <li><a href="/login">Ingresar a {MARCA}</a></li>
              <li><a href="/login?modo=registro">Crear cuenta</a></li>
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>© {new Date().getFullYear()} {GRUPO}. Río Cuarto, Córdoba.</span>
          <span>Equipos nuevos comercializados a través de Urani Biomédica.</span>
        </div>
        {gigante && <div className="lp-gigante" aria-hidden="true">{gigante}</div>}
      </div>
    </footer>
  );
}
