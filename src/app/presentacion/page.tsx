import type { Metadata } from "next";
import QRCode from "qrcode";
import { Cabecera, Pie } from "@/components/sitio/Cabecera";
import { BarraFija, TextoRevelado } from "@/components/sitio/Revelar";
import { MARCA, WHATSAPP } from "@/lib/marca";
import { baseURL } from "@/lib/qr";
import "../sitio.css";
import "./mon.css";

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
  { n: "Inicial", color: "#c5d0c3", tag: "Para empezar", para: "Consultorios y clínicas chicas", p: "Gratis", u: "", items: ["Hasta 50 equipos", "2 usuarios", "1 sede", "Etiquetas QR y reporte de fallas"], cta: "Crear cuenta gratis" },
  { n: "Institución", color: "#0b6e79", tag: "El más elegido", para: "Clínicas y sanatorios", p: "USD 59", u: "por mes, en pesos", items: ["Hasta 2.000 equipos", "10 usuarios y reportantes sin límite", "Hasta 3 sedes", "Repuestos, documentos y avisos"], cta: "Probar gratis", dest: true },
  { n: "Servicio técnico", color: "#d39b3c", tag: "Para empresas de service", para: "Empresas que atienden varias instituciones", p: "USD 99", u: "por mes más USD 10 por cliente", items: ["Clientes sin límite", "10 técnicos", "Panel con todos tus clientes", "Pedidos de servicio por email"], cta: "Probar gratis" },
  { n: "Hospital", color: "#141817", tag: "Para redes y licitaciones", para: "Hospitales y grupos de clínicas", p: "A medida", u: "", items: ["Equipos y sedes sin límite", "Carga inicial y etiquetado asistido", "Capacitación del equipo", "Apto para licitación"], cta: "Consultar" },
];

const PREGUNTAS = [
  { q: "¿Hay que instalar algo?", a: "No. Funciona desde el navegador de la computadora y del celular. La cámara del celular lee el QR sin ninguna aplicación." },
  { q: "¿Sirve para equipos de cualquier marca?", a: "Sí, para todas las marcas, no solo las que comercializamos. Tu inventario es tuyo: no usamos los datos que cargás para ofrecerte equipos." },
  { q: "¿Guarda datos de pacientes?", a: "No. Registra equipos, mantenimientos y a las personas que los gestionan. No pide ni guarda información de salud." },
  { q: "¿Cuánto tarda la puesta en marcha?", a: "Si ya tenés el inventario en una planilla, lo importás en minutos e imprimís las etiquetas el mismo día. Si preferís, la carga inicial y el pegado de etiquetas se hacen como servicio aparte." },
  { q: "¿Puedo llevarme mis datos?", a: "Sí. El inventario completo se exporta a Excel cuando quieras y cada hoja de vida se imprime como PDF." },
];

export default async function Presentacion() {
  const qr = await QRCode.toString(`${baseURL()}/presentacion`, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#141817", light: "#ffffff" } });
  const wa = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, quiero conocer ${MARCA} para gestionar equipos médicos.`)}` : "";
  const demo = wa || `/contacto?interes=${encodeURIComponent(MARCA)}`;

  return (
    <div className="lp mon">
      <Cabecera actual="monitor" acciones={<>
        <a className="lp-boton chico" href="/login">Ingresar</a>
        <a className="lp-boton chico lleno" href="/login?modo=registro">Crear cuenta</a>
      </>} />

      <main>
        <section id="hero" className="mon-hero">
          <div className="lp-ancho">
            <span className="mon-sobre">Software de mantenimiento de equipos médicos</span>
            <h1>Que ningún preventivo se venza sin que nadie se entere.</h1>
            <p className="mon-p">Inventario con etiqueta QR, hoja de vida, preventivos por fecha y por horas de uso, órdenes de trabajo y repuestos. Para bioingeniería y servicio técnico.</p>
            <div className="lp-ctas">
              <a className="lp-boton lleno" href="/login?modo=registro">Crear cuenta gratis</a>
              <a className="lp-boton" href={demo}>Pedir una demostración</a>
            </div>
          </div>
          <div className="mon-escena" aria-label="Ejemplo de etiqueta QR pegada en un equipo">
            <div className="mon-palabra" aria-hidden="true">{MARCA}</div>
            <div className="mon-etiqueta">
              <div dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="tipo">Respirador</div>
              <div className="modelo">Equipo de ejemplo · UTI</div>
              <div className="serie">S/N EJ-0412 · INV-1041</div>
              <div className="pie">Escaneá para ver el manual o reportar una falla</div>
            </div>
          </div>
        </section>

        <section className="mon-sec">
          <div className="lp-ancho">
            <TextoRevelado className="mon-revela" texto="Cada equipo con su etiqueta. Cada falla con su orden. Cada preventivo a tiempo. Y la hoja de vida completa, lista para la auditoría." />
          </div>
        </section>

        <section id="como-funciona" className="mon-sec" style={{ paddingTop: 0 }}>
          <div className="lp-ancho mon-dos">
            <div>
              <span className="mon-num">01</span>
              <h2 className="mon-h2">La etiqueta en el equipo hace el trabajo.</h2>
              <p className="mon-p">Cada equipo lleva su QR. Quien lo escanea con la cámara del celular ve lo que le corresponde, sin instalar nada.</p>
              <ol className="mon-pasos">
                <li><div><strong>Enfermería escanea</strong><p>Ve el manual de usuario del modelo y reporta una falla en dos renglones, sin cuenta.</p></div><small>Paso 1</small></li>
                <li><div><strong>Se abre la orden</strong><p>Queda asignada al proveedor del equipo y los técnicos reciben el aviso por email al instante.</p></div><small>Paso 2</small></li>
                <li><div><strong>Queda en la hoja de vida</strong><p>El técnico escanea el mismo QR, ve el historial y cierra la orden con trabajo, repuestos y costo.</p></div><small>Paso 3</small></li>
              </ol>
            </div>
            <div className="mon-tel" aria-label="Lo que ve en el celular quien escanea la etiqueta">
              <div className="mon-tel-pantalla">
                <div className="mon-tel-barra"><span>9:41</span><span>{MARCA}</span></div>
                <div className="mon-tel-cuerpo">
                  <span className="chip">INV-1041</span>
                  <h3>Respirador</h3>
                  <p className="sub">Equipo de ejemplo · UTI · Clínica del Centro</p>
                  <span className="mon-estado">En servicio</span>
                  <div className="mon-docs">
                    <div>Manual de usuario <span>PDF ↗</span></div>
                    <div>Guía rápida de alarmas <span>PDF ↗</span></div>
                    <div>Próximo preventivo <span>en 34 días</span></div>
                  </div>
                  <div className="fondo" aria-hidden="true">{MARCA}</div>
                </div>
                <div className="mon-tel-accion">
                  <div className="mini"><b>¿Algo no anda?</b>Avisá al equipo técnico</div>
                  <span className="btn">Reportar falla</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funciones" className="mon-sec" style={{ background: "#fff" }}>
          <div className="lp-ancho">
            <span className="mon-num">02</span>
            <h2 className="mon-h2">Lo que pide bioingeniería, sin planillas sueltas.</h2>
            <p className="mon-p">Pensado por gente que hace servicio técnico de respiradores y equipos de laboratorio todos los días.</p>
            <div className="mon-ingredientes">
              {FUNCIONES.map((f, i) => (
                <div key={f.t}>
                  <h3>{f.t}</h3>
                  <div><p>{f.d}</p>{f.ej && <span className="ej">{f.ej}</span>}</div>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="servicio-tecnico" className="mon-sec">
          <div className="lp-ancho">
            <div className="mon-tarjeta">
              <div>
                <span className="mon-num" style={{ background: "#fff" }}>03</span>
                <h2 className="mon-h2">Si atendés varias instituciones, una sola cuenta alcanza.</h2>
                <p className="mon-p">Las empresas de servicio técnico ven el parque de todos sus clientes juntos, sin mezclar los datos de uno con los de otro.</p>
                <ul>
                  <li><b>Un panel con todos tus clientes</b>Vencidos, órdenes abiertas y equipos fuera de servicio de cada institución.</li>
                  <li><b>Cada cliente ve solo lo suyo</b>La clínica entra con su cuenta y consulta su inventario y su historial.</li>
                  <li><b>La semana armada</b>El resumen diario dice qué preventivos tocan y dónde, para planificar la ruta.</li>
                </ul>
              </div>
              <div className="mon-tabla" aria-label="Vista de ejemplo del panel de un servicio técnico">
                <table>
                  <caption>Vista de ejemplo</caption>
                  <thead><tr><th>Institución</th><th className="n">Equipos</th><th className="n">Vencidos</th></tr></thead>
                  <tbody>
                    <tr><td>Clínica Norte</td><td className="n">142</td><td className="n alerta">3</td></tr>
                    <tr><td>Sanatorio Centro</td><td className="n">88</td><td className="n">0</td></tr>
                    <tr><td>Instituto de Diálisis Sur</td><td className="n">36</td><td className="n alerta">1</td></tr>
                    <tr><td>Laboratorio Oeste</td><td className="n">19</td><td className="n">0</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section id="precios" className="mon-oscuro">
          <div className="lp-ancho">
            <div className="mon-centro">
              <span className="mon-pastilla">Precios</span>
              <h2 className="mon-h2">Precios según el tamaño del parque.</h2>
              <p className="mon-p">Precios de lanzamiento. Los planes pagos se facturan en pesos al tipo de cambio del día y se prueban gratis antes de pagar.</p>
            </div>
            <div className="mon-planes">
              {PLANES.map((p) => (
                <div className={p.dest ? "mon-plan dest" : "mon-plan"} key={p.n}>
                  <div className="franja" style={{ background: p.color }} />
                  <div className="cuerpo">
                    <h3>{p.n}</h3>
                    <p className="para">{p.para}</p>
                    <p className="precio">{p.p}</p>
                    <p className="u">{p.u}</p>
                    <span className="tag">{p.tag}</span>
                    <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                    <a className="lp-boton" href={p.cta === "Crear cuenta gratis" || !wa ? "/login?modo=registro" : wa}>{p.cta}</a>
                  </div>
                </div>
              ))}
            </div>
            <p className="mon-letra">Carga inicial del inventario y etiquetado en la institución: se cotiza aparte según la cantidad de equipos.</p>

            <div className="mon-faq">
              <div className="mon-centro" style={{ marginBottom: 36 }}>
                <span className="mon-pastilla">FAQ</span>
                <h2 className="mon-h2" style={{ fontSize: "clamp(28px, 3.4vw, 40px)" }}>Preguntas frecuentes</h2>
              </div>
              {PREGUNTAS.map((p) => (
                <details key={p.q}><summary>{p.q}</summary><p>{p.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="mon-cierre">
          <div className="lp-ancho">
            <span className="mon-num">→</span>
            <h2 className="mon-h2">Cargá tu primer equipo hoy y pegale su etiqueta mañana.</h2>
            <div className="lp-ctas" style={{ marginTop: 28 }}>
              <a className="lp-boton lleno" href="/login?modo=registro">Crear cuenta gratis</a>
              {wa && <a className="lp-boton" href={wa}>Hablar por WhatsApp</a>}
            </div>
          </div>
        </section>
      </main>

      <BarraFija despuesDe="hero">
        <span className="mini-qr" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141817" strokeWidth="1.8"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><path d="M14 14h2v2h-2zM18 18h2v2h-2z" /></svg>
        </span>
        <span className="txt"><b>{MARCA}</b><span>Gratis hasta 50 equipos, sin tarjeta</span></span>
        <a className="lp-boton" href={demo}>Demo</a>
        <a className="lp-boton lleno" href="/login?modo=registro">Crear cuenta</a>
      </BarraFija>

      <Pie gigante={MARCA} />
    </div>
  );
}
