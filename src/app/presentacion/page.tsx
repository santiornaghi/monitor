import type { Metadata } from "next";
import QRCode from "qrcode";
import { Cabecera, MenuCelular, Pie } from "@/components/sitio/Cabecera";
import { MARCA, WHATSAPP } from "@/lib/marca";
import { baseURL } from "@/lib/qr";
import "../sitio.css";

export const metadata: Metadata = {
  title: { absolute: `${MARCA}: gestión de equipos médicos para bioingeniería y servicio técnico` },
  description:
    "Inventario con QR, hoja de vida, preventivos por fecha y por horas de uso, órdenes de trabajo, repuestos y avisos por email. Para clínicas, hospitales y empresas de servicio técnico.",
  openGraph: {
    title: `${MARCA}: que ningún preventivo se venza sin que nadie se entere`,
    description: "Inventario con QR, hoja de vida, preventivos, órdenes de trabajo y repuestos para equipos médicos de cualquier marca.",
    locale: "es_AR",
    type: "website",
  },
};

const FUNCIONES = [
  {
    t: "Preventivos por fecha o por horas de uso",
    d: "Cada plan vence por calendario, por horas del contador o por lo que llegue primero. Los vencidos y los de la semana aparecen en el panel y en el resumen diario.",
    ej: "Respirador: cada 180 días o 5.000 h",
  },
  {
    t: "Protocolos con mediciones",
    d: "El preventivo se completa con un checklist por tipo de equipo: alarmas, fugas, volumen entregado, energía del desfibrilador, corriente de fuga. Si una medición sale de rango, se abre sola la orden correctiva.",
    ej: "Corriente de fuga 600 µA: se abre una orden correctiva",
  },
  {
    t: "Hoja de vida que no se puede adulterar",
    d: "Altas, órdenes, preventivos, lecturas de horas y repuestos quedan fechados y firmados por quien los cargó. Las correcciones se agregan, no se borran. Se imprime como PDF para auditorías.",
  },
  {
    t: "Repuestos y stock",
    d: "Los repuestos usados en cada orden descuentan stock, suman al costo del equipo y quedan en su historial. Avisa cuando un repuesto baja del mínimo.",
  },
  {
    t: "Manuales y certificados en el equipo",
    d: "El manual de usuario se carga una vez por modelo y aparece al escanear la etiqueta. Los certificados de calibración guardan su vencimiento y avisan antes de que caduquen.",
  },
  {
    t: "Avisos por email",
    d: "Cada orden nueva llega al instante a técnicos y administradores. De lunes a viernes, un resumen con lo que vence, lo urgente y los repuestos que faltan. Solo si hay algo que avisar.",
  },
  {
    t: "Tu planilla, importada",
    d: "Subí el inventario que ya tenés en Excel y Monitor arma las fichas y los QR. Exportás todo cuando quieras: los datos son de la institución.",
  },
  {
    t: "Cada persona con su permiso",
    d: "Técnicos que cargan y cierran órdenes, administradores que invitan usuarios, dirección que solo mira el panel. Enfermería reporta fallas desde el QR sin necesidad de cuenta.",
  },
];

const PLANES = [
  { n: "Inicial", para: "Consultorios y clínicas chicas", p: "Gratis", u: "", items: ["Hasta 50 equipos", "2 usuarios", "1 sede", "Etiquetas QR y reporte de fallas"], cta: "Crear cuenta gratis" },
  { n: "Institución", para: "Clínicas y sanatorios", p: "USD 59", u: "por mes, en pesos", items: ["Hasta 2.000 equipos", "10 usuarios y reportantes sin límite", "Hasta 3 sedes", "Repuestos, documentos y avisos"], cta: "Probar gratis", dest: true },
  { n: "Servicio técnico", para: "Empresas que atienden varias instituciones", p: "USD 99", u: "por mes más USD 10 por cliente", items: ["Clientes sin límite", "10 técnicos", "Panel con todos tus clientes", "Pedidos de servicio por email"], cta: "Probar gratis" },
  { n: "Hospital", para: "Hospitales y grupos de clínicas", p: "A medida", u: "", items: ["Equipos y sedes sin límite", "Carga inicial y etiquetado asistido", "Capacitación del equipo", "Apto para licitación"], cta: "Consultar" },
];

const PREGUNTAS = [
  { q: "¿Hay que instalar algo?", a: "No. Funciona desde el navegador de la computadora y del celular. La cámara del celular lee el QR sin ninguna aplicación." },
  { q: "¿Sirve para equipos de cualquier marca?", a: "Sí, para todas las marcas, no solo las que comercializamos. Tu inventario es tuyo: no usamos los datos que cargás para ofrecerte equipos." },
  { q: "¿Guarda datos de pacientes?", a: "No. Registra equipos, mantenimientos y a las personas que los gestionan. No pide ni guarda información de salud." },
  { q: "¿Cuánto tarda la puesta en marcha?", a: "Si ya tenés el inventario en una planilla, lo importás en minutos e imprimís las etiquetas el mismo día. Si preferís, la carga inicial y el pegado de etiquetas se hacen como servicio aparte." },
  { q: "¿Puedo llevarme mis datos?", a: "Sí. El inventario completo se exporta a Excel cuando quieras y cada hoja de vida se imprime como PDF." },
];

export default async function Presentacion() {
  const qr = await QRCode.toString(`${baseURL()}/presentacion`, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#12232a", light: "#ffffff" } });
  const wa = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, quiero conocer ${MARCA} para gestionar equipos médicos.`)}` : "";
  const contacto = wa || "/login?modo=registro";

  return (
    <div className="lp">
      <Cabecera actual="monitor" acciones={<>
        <a className="lp-boton chico" href="/login">Ingresar</a>
        <a className="lp-boton chico lleno" href="/login?modo=registro">Crear cuenta</a>
      </>} />
      <MenuCelular />

      <main>
        <section className="lp-ancho lp-hero">
          <div>
            <h1 className="lp-h1">Que ningún preventivo se venza sin que nadie se entere.</h1>
            <p className="lp-bajada">
              {MARCA} ordena el parque de equipos médicos de una institución: inventario con etiqueta QR, hoja de vida,
              preventivos por fecha y por horas de uso, órdenes de trabajo y repuestos. Hecho para bioingeniería y para
              empresas de servicio técnico.
            </p>
            <div className="lp-ctas">
              <a className="lp-boton lleno" href="/login?modo=registro">Crear cuenta gratis</a>
              <a className="lp-boton" href="#como-funciona">Ver cómo funciona</a>
            </div>
            <p className="lp-nota">Gratis hasta 50 equipos. Sin tarjeta.</p>
          </div>
          <div className="lp-etiqueta-zona" aria-label="Ejemplo de etiqueta QR pegada en un equipo">
            <div className="lp-etiqueta">
              <div dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="tipo">Respirador</div>
              <div className="modelo">Equipo de ejemplo</div>
              <div className="serie">S/N EJ-0412 · INV-1041</div>
              <div className="pie">Escaneá para ver el manual o reportar una falla</div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">La etiqueta en el equipo hace el trabajo.</h2>
            <p className="lp-intro">Cada equipo lleva su código QR. Lo que pasa cuando alguien lo escanea depende de quién es.</p>
            <ol className="lp-pasos">
              <li>
                <h3>Enfermería escanea</h3>
                <p>Ve el manual de usuario del modelo y puede reportar una falla en dos renglones, sin cuenta y sin llamar a nadie.</p>
              </li>
              <li>
                <h3>Se abre la orden</h3>
                <p>La orden queda asignada al proveedor del equipo y los técnicos reciben el aviso por email en el momento.</p>
              </li>
              <li>
                <h3>Queda en la hoja de vida</h3>
                <p>El técnico escanea el mismo QR, ve el historial completo y cierra la orden con el trabajo, los repuestos y el costo.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="funciones" className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">Lo que pide un área de bioingeniería, sin planillas sueltas.</h2>
            <p className="lp-intro">Pensado por gente que hace servicio técnico de respiradores y equipos de laboratorio todos los días.</p>
            <div className="lp-funciones">
              {FUNCIONES.map((f) => (
                <div className="lp-funcion" key={f.t}>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                  {f.ej && <span className="lp-ejemplo">{f.ej}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="servicio-tecnico" className="lp-banda">
          <div className="lp-ancho lp-banda-grid">
            <div>
              <h2 className="lp-h2">Si atendés equipos de varias instituciones, una sola cuenta alcanza.</h2>
              <p className="lp-intro">Las empresas de servicio técnico ven el parque de todos sus clientes juntos, sin mezclar los datos de uno con los de otro.</p>
              <ul>
                <li><strong>Un panel con todos tus clientes</strong>Preventivos vencidos, órdenes abiertas y equipos fuera de servicio de cada institución, en una pantalla.</li>
                <li><strong>Cada cliente ve solo lo suyo</strong>La clínica entra con su propia cuenta y consulta su inventario y su historial cuando quiera.</li>
                <li><strong>Agenda de la semana armada</strong>El resumen diario te dice qué preventivos tocan y en qué institución, para planificar la ruta.</li>
              </ul>
            </div>
            <div className="lp-clientes" aria-label="Vista de ejemplo del panel de un servicio técnico">
              <table>
                <caption style={{ textAlign: "left", color: "#9cc3c6", fontSize: 13, paddingBottom: 10 }}>Vista de ejemplo</caption>
                <thead><tr><th>Institución</th><th style={{ textAlign: "right" }}>Equipos</th><th style={{ textAlign: "right" }}>Vencidos</th></tr></thead>
                <tbody>
                  <tr><td>Clínica Norte</td><td className="n">142</td><td className="n lp-alerta">3</td></tr>
                  <tr><td>Sanatorio Centro</td><td className="n">88</td><td className="n">0</td></tr>
                  <tr><td>Instituto de Diálisis Sur</td><td className="n">36</td><td className="n lp-alerta">1</td></tr>
                  <tr><td>Laboratorio Oeste</td><td className="n">19</td><td className="n">0</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="precios" className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">Precios según el tamaño del parque.</h2>
            <p className="lp-intro">Precios de lanzamiento. Los planes pagos se facturan en pesos al tipo de cambio del día. Se prueban gratis antes de pagar.</p>
            <div className="lp-planes">
              {PLANES.map((p) => (
                <div className={p.dest ? "lp-plan destacado" : "lp-plan"} key={p.n}>
                  <h3>{p.n}</h3>
                  <p className="para">{p.para}</p>
                  <p className="lp-precio">{p.p}{p.u && <><br /><small>{p.u}</small></>}</p>
                  <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                  <a className={p.dest ? "lp-boton lleno" : "lp-boton"} href={p.cta === "Crear cuenta gratis" || !wa ? "/login?modo=registro" : wa}>{p.cta}</a>
                </div>
              ))}
            </div>
            <p className="lp-letra-chica">Carga inicial del inventario y etiquetado en la institución: se cotiza aparte según la cantidad de equipos.</p>
          </div>
        </section>

        <section className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">Preguntas frecuentes</h2>
            <div className="lp-faq">
              {PREGUNTAS.map((p) => (
                <details key={p.q}><summary>{p.q}</summary><p>{p.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-cierre">
          <div className="lp-ancho">
            <h2 className="lp-h2">Cargá tu primer equipo hoy y pegale su etiqueta mañana.</h2>
            <div className="lp-ctas" style={{ marginTop: 24 }}>
              <a className="lp-boton lleno" href="/login?modo=registro">Crear cuenta gratis</a>
              {wa && <a className="lp-boton" href={contacto}>Hablar por WhatsApp</a>}
            </div>
          </div>
        </section>
      </main>

      <Pie />
    </div>
  );
}
