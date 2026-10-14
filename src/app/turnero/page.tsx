import type { Metadata } from "next";
import { Cabecera, MenuCelular, Pie } from "@/components/sitio/Cabecera";
import { GRUPO, TURNERO } from "@/lib/marca";
import "../sitio.css";

export const metadata: Metadata = { title: { absolute: `${TURNERO}: gestión de turnos | ${GRUPO}` } };

// Contenido provisorio: se completa con las funciones reales del turnero.
export default function Turnero() {
  return (
    <div className="lp">
      <Cabecera actual="turnero" />
      <MenuCelular />
      <main className="lp-ancho" style={{ paddingBlock: "24px 80px" }}>
        <h1 className="lp-h1" style={{ fontSize: "clamp(32px, 4.4vw, 52px)", margin: "16px 0 12px", maxWidth: "14em" }}>{TURNERO}: la agenda y la sala de espera, ordenadas.</h1>
        <p className="lp-bajada">Gestión de turnos de pacientes para consultorios y clínicas. Estamos sumando las primeras instituciones.</p>
        <div className="lp-ctas">
          <a className="lp-boton lleno" href={`/contacto?interes=${encodeURIComponent(TURNERO)}`}>Quiero probarlo</a>
        </div>
      </main>
      <Pie />
    </div>
  );
}
