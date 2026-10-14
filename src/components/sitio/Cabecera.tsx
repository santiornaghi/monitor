import { Logo } from "@/components/Logo";
import { GRUPO, MARCA, TURNERO } from "@/lib/marca";

export function Cabecera({ actual, acciones }: { actual?: "inicio" | "catalogo" | "monitor" | "turnero" | "contacto"; acciones?: React.ReactNode }) {
  const enlace = (href: string, id: string, texto: string) => (
    <a href={href} aria-current={actual === id ? "page" : undefined}>{texto}</a>
  );
  return (
    <header className="lp-ancho lp-top">
      <a className="lp-logo" href="/inicio"><Logo size={28} />{GRUPO}</a>
      <nav className="lp-nav" aria-label="Secciones del sitio">
        {enlace("/catalogo", "catalogo", "Equipamiento")}
        {enlace("/presentacion", "monitor", MARCA)}
        {enlace("/turnero", "turnero", TURNERO)}
        {enlace("/contacto", "contacto", "Contacto")}
      </nav>
      <div className="lp-acceso">
        {acciones ?? <a className="lp-boton chico lleno" href="/contacto">Pedir cotización</a>}
      </div>
    </header>
  );
}

export function Pie() {
  return (
    <footer className="lp-ancho lp-pie">
      <span>{GRUPO}. Equipamiento médico, software de mantenimiento y gestión de turnos.</span>
      <span>
        <a href="/catalogo">Equipamiento</a> · <a href="/presentacion">{MARCA}</a> · <a href="/turnero">{TURNERO}</a> · <a href="/login">Ingresar</a>
      </span>
    </footer>
  );
}

/** Menú inferior para celular, donde el menú superior no entra. */
export function MenuCelular() {
  return (
    <nav className="lp-menu-cel" aria-label="Secciones del sitio">
      <a href="/catalogo">Equipamiento</a>
      <a href="/presentacion">{MARCA}</a>
      <a href="/turnero">{TURNERO}</a>
      <a href="/contacto">Contacto</a>
    </nav>
  );
}
