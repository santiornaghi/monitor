import type { Metadata } from "next";
import { Cabecera, MenuCelular, Pie } from "@/components/sitio/Cabecera";
import { GRUPO, MARCA, TURNERO } from "@/lib/marca";
import { EQUIPOS, MARCAS, REACTIVOS } from "@/lib/catalogo";
import "../sitio.css";

export const metadata: Metadata = {
  title: { absolute: `${GRUPO}: equipamiento médico, mantenimiento y turnos` },
  description: `Venta de equipamiento médico y de laboratorio, ${MARCA} para gestionar el mantenimiento del parque de equipos y ${TURNERO} para organizar los turnos de pacientes.`,
};

export default function Inicio() {
  return (
    <div className="lp">
      <Cabecera actual="inicio" />
      <MenuCelular />
      <main>
        <section className="lp-ancho" style={{ paddingBlock: "40px 56px" }}>
          <h1 className="lp-h1" style={{ maxWidth: "15em" }}>Equipos, mantenimiento y turnos para tu institución de salud.</h1>
          <p className="lp-bajada">
            Te asesoramos en la compra del equipamiento, te damos las herramientas para mantenerlo funcionando y para
            organizar la atención de tus pacientes. Un solo interlocutor que conoce los equipos por dentro.
          </p>
        </section>

        <section className="lp-ancho" style={{ paddingBottom: 72 }}>
          <div className="lp-lineas">
            <article className="lp-linea">
              <span className="quien">Para comprar o renovar equipos</span>
              <h2>Equipamiento médico y de laboratorio</h2>
              <p>
                {EQUIPOS.length} equipos de {MARCAS.length} marcas y {REACTIVOS.length} reactivos e insumos: ventilación, monitoreo, bombas de infusión,
                química clínica, hematología y estufas. Asesoramiento técnico antes de comprar.
              </p>
              <a className="lp-boton lleno" href="/catalogo">Ver el catálogo</a>
            </article>
            <article className="lp-linea">
              <span className="quien">Para bioingeniería y servicio técnico</span>
              <h2>{MARCA}</h2>
              <p>
                Inventario con etiqueta QR, hoja de vida, preventivos por fecha y por horas de uso, órdenes de trabajo y repuestos,
                para equipos de cualquier marca.
              </p>
              <a className="lp-boton" href="/presentacion">Conocer {MARCA}</a>
            </article>
            <article className="lp-linea">
              <span className="quien">Para consultorios y clínicas</span>
              <h2>{TURNERO}</h2>
              <p>Agenda por profesional y sede, turnos online, recordatorios por WhatsApp, sala de espera e historia clínica.</p>
              <a className="lp-boton" href="/turnero">Conocer {TURNERO}</a>
            </article>
          </div>
        </section>

        <section className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">Marcas que comercializamos</h2>
            <p className="lp-intro">Equipos nuevos, comercializados a través de Urani Biomédica.</p>
            <ul className="lp-marcas">
              {MARCAS.map((m) => <li key={m}><a href={`/catalogo?marca=${encodeURIComponent(m)}`}>{m}</a></li>)}
            </ul>
          </div>
        </section>

        <section className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">Por qué comprar con nosotros</h2>
            <div className="lp-funciones" style={{ marginTop: 28 }}>
              <div className="lp-funcion"><h3>Conocemos los equipos por dentro</h3><p>Venimos del servicio técnico de respiradores y equipos de laboratorio. Te recomendamos lo que vas a poder mantener, no solo lo que se vende.</p></div>
              <div className="lp-funcion"><h3>El equipo llega con su hoja de vida</h3><p>Si usás {MARCA}, el equipo nuevo se carga con su etiqueta QR, manual y plan de preventivos desde el primer día.</p></div>
              <div className="lp-funcion"><h3>Una sola propuesta</h3><p>Pedí en la misma cotización el equipo, la instalación, la capacitación del personal y el plan de mantenimiento.</p></div>
              <div className="lp-funcion"><h3>Tu inventario es tuyo</h3><p>{MARCA} funciona con cualquier marca. Los datos que cargás no se usan para ofrecerte equipos.</p></div>
            </div>
          </div>
        </section>

        <section id="contacto" className="lp-cierre">
          <div className="lp-ancho">
            <h2 className="lp-h2">Contanos qué necesitás y te respondemos con una propuesta.</h2>
            <div className="lp-ctas" style={{ marginTop: 24 }}>
              <a className="lp-boton lleno" href="/contacto">Pedir cotización</a>
              <a className="lp-boton" href="/catalogo">Ver el catálogo</a>
            </div>
          </div>
        </section>
      </main>
      <Pie />
    </div>
  );
}
