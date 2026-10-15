import type { Metadata } from "next";
import QRCode from "qrcode";
import { Cabecera, Pie } from "@/components/sitio/Cabecera";
import { Cabeza, Chip, Icono, Numeros, Preguntas, Puntos } from "@/components/sitio/Bloques";
import { GRUPO, MARCA, TURNERO, enlaceWhatsApp } from "@/lib/marca";
import { EQUIPOS, MARCAS, PRODUCTOS } from "@/lib/catalogo";
import { baseURL } from "@/lib/qr";
import "../sitio.css";

export const metadata: Metadata = {
  title: { absolute: `${GRUPO}: equipamiento médico, mantenimiento y turnos` },
  description: `Venta de equipamiento médico y de laboratorio, ${MARCA} para gestionar el mantenimiento del parque de equipos y ${TURNERO} para organizar los turnos de pacientes.`,
};

const foto = (nombre: string) => PRODUCTOS.find((p) => p.nombre === nombre)?.imagen ?? "";

const CRITICOS = [
  { t: "Ventiladores Brina", d: "Terapia intensiva de neonatos a adultos, con pantalla de 18,5\" y diseño modular.", img: "/img/tecme/brina-portada.webp", href: "/catalogo/tecme-brina" },
  { t: "Ventiladores Neumovent", d: "Advance, Neo y TS: robustos para uso continuo en UCI.", img: "/img/tecme/neumovent-equipo.webp", href: "/catalogo/tecme-neumovent-advance" },
  { t: "Monitores Serie iX", d: "Conectados al ventilador y a la central de monitoreo.", img: "/img/tecme/ix15-lateral.webp", href: "/catalogo/tecme-monitor-multiparametrico-ix15" },
  { t: "Alto flujo Humidoflo", d: "Oxigenoterapia calefaccionada de 2 a 60 L/min.", img: "/img/tecme/humidoflo-portada.webp", href: "/catalogo/tecme-humidoflo" },
  { t: "Compresores de aire", d: "Aire medicinal libre de aceite, 24/7.", img: "/img/tecme/compresor-dk50.webp", href: "/catalogo/tecme-compresor-dk50-ds-smart" },
  { t: "Humidificadores", d: "Para ventilación invasiva y no invasiva.", img: "/img/tecme/humidificador-vh2600a.webp", href: "/catalogo/tecme-humidificador-vh-2600a" },
];

const LABORATORIO = [
  { t: "Química clínica", d: "Autoanalizadores Wiener Lab CM, de mesada a alto volumen.", img: foto("CM 260"), href: "/catalogo?q=Química" },
  { t: "Quimioluminiscencia", d: "Inmunoensayos CLIA para hormonas, marcadores y serología.", img: foto("CLIA 1000"), href: "/catalogo?q=Quimioluminiscencia" },
  { t: "Hematología y hemostasia", d: "Contadores hematológicos y coagulómetros.", img: foto("Counter 31 AL"), href: "/catalogo?q=Hemato" },
  { t: "Electrolitos y gases", d: "Ionógrafos Diestro y gasometría AADEE.", img: foto("V4r"), href: "/catalogo?q=Electrolitos" },
  { t: "Infusión", d: "Bombas volumétricas y de jeringa Feas Electrónica.", img: foto("Bomba de Infusión Volumétrica SN-1500H"), href: "/catalogo?q=Infusión" },
  { t: "Emergencias", d: "Desfibriladores, DEA y marcapasos externos.", img: foto("DEA Heart+ResQ NT-381.C"), href: "/catalogo?q=Emergencia" },
];

const PREGUNTAS = [
  { p: "¿Venden equipos de todas las marcas del catálogo?", r: "Sí. Los equipos nuevos se comercializan a través de Urani Biomédica, con su garantía y el respaldo del fabricante." },
  { p: "¿Hacen instalación y capacitación?", r: "Sí. Se pueden cotizar junto con el equipo, además del plan de mantenimiento preventivo." },
  { p: `¿Necesito comprar equipos para usar ${MARCA}?`, r: `No. ${MARCA} funciona con equipos de cualquier marca y los datos que cargás no se usan para ofrecerte equipos.` },
  { p: "¿Atienden fuera de Córdoba?", r: "Sí. Cotizamos para todo el país; la instalación y el servicio se coordinan según la zona." },
  { p: `¿${TURNERO} sirve para un consultorio chico?`, r: "Sí. Funciona con un solo profesional y crece a varias sedes y especialidades." },
  { p: "¿Cómo pido una cotización?", r: "Desde la ficha de cada equipo, por el formulario de contacto o por WhatsApp. Respondemos con una propuesta concreta." },
];

export default async function Inicio() {
  const wa = enlaceWhatsApp("Hola, quiero hacer una consulta.");
  const qr = await QRCode.toString(`${baseURL()}/presentacion`, { type: "svg", margin: 0, color: { dark: "#1b2f63", light: "#ffffff" } });
  return (
    <div className="lp">
      <Cabecera actual="inicio" />
      <main>
        <section className="lp-hero">
          <div className="lp-ancho">
            <div className="lp-hero-texto">
              <Chip>Equipamiento · Mantenimiento · Turnos</Chip>
              <h1 className="lp-h1">Equipos, mantenimiento y turnos para tu institución de salud.</h1>
              <p className="lp-bajada">Te asesoramos en la compra del equipamiento y te damos las herramientas para mantenerlo funcionando y organizar la atención. Un solo interlocutor que conoce los equipos por dentro.</p>
              <div className="lp-ctas">
                <a className="lp-boton lleno" href="/catalogo">Ver equipamiento</a>
                <a className="lp-boton" href="/contacto">Contactar especialista</a>
              </div>
            </div>
            <div className="lp-hero-foto trio" aria-hidden="true">
              <img src="/img/tecme/brina-portada.webp" alt="" />
              <img src="/img/tecme/ix15-lateral.webp" alt="" />
              <img src="/img/tecme/humidificador-vh2600a-on.webp" alt="" />
            </div>
          </div>
        </section>
        <nav className="lp-pestanas" aria-label="Líneas de negocio">
          <div className="lp-ancho">
            <a href="#equipamiento">Equipamiento<small>{EQUIPOS.length} equipos de {MARCAS.length} marcas</small></a>
            <a href="#software">{MARCA}<small>Mantenimiento con etiqueta QR</small></a>
            <a href="#software">{TURNERO}<small>Turnos y sala de espera</small></a>
          </div>
        </nav>

        <section className="lp-sec">
          <div className="lp-ancho">
            <Cabeza chip="Por qué elegirnos" titulo="Venimos del servicio técnico." intro="Te recomendamos lo que vas a poder mantener, no solo lo que se vende." />
            <div className="lp-tarjetas">
              <div className="lp-tarjeta"><Icono nombre="llave" /><h3 className="lp-h3">Asesoramiento técnico</h3><p>Conocemos respiradores y equipos de laboratorio por dentro: qué falla, qué repuestos piden y cuánto cuesta mantenerlos.</p></div>
              <div className="lp-tarjeta"><Icono nombre="qr" /><h3 className="lp-h3">Llega con su hoja de vida</h3><p>Si usás {MARCA}, el equipo nuevo se carga con su etiqueta QR, su manual y su plan de preventivos desde el primer día.</p></div>
              <div className="lp-tarjeta"><Icono nombre="documento" /><h3 className="lp-h3">Una sola propuesta</h3><p>Equipo, instalación, capacitación del personal y plan de mantenimiento en la misma cotización.</p></div>
            </div>
          </div>
        </section>

        <section id="equipamiento" className="lp-sec celeste">
          <div className="lp-ancho">
            <Cabeza chip="Cuidados críticos" titulo="Ventilación, monitoreo y soporte respiratorio" intro="Línea completa TECME para terapia intensiva, de neonatos a adultos." />
            <div className="lp-porta grande">
              {CRITICOS.map((c) => (
                <a key={c.t} href={c.href}>
                  <div className="foto"><img src={c.img} alt={c.t} loading="lazy" /></div>
                  <div className="txt"><h3 className="lp-h3">{c.t}</h3><p>{c.d}</p><span className="mas">Ver detalles →</span></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-sec">
          <div className="lp-ancho">
            <Cabeza chip="Laboratorio y guardia" titulo="Del laboratorio clínico a la emergencia" intro="Analizadores, reactivos, bombas de infusión, desfibriladores y estufas." />
            <div className="lp-porta">
              {LABORATORIO.map((c) => (
                <a key={c.t} href={c.href}>
                  <div className="foto">{c.img ? <img src={c.img} alt={c.t} loading="lazy" /> : null}</div>
                  <div className="txt"><h3 className="lp-h3">{c.t}</h3><p>{c.d}</p><span className="mas">Ver equipos →</span></div>
                </a>
              ))}
            </div>
            <div className="lp-ctas" style={{ justifyContent: "center", marginTop: 40 }}>
              <a className="lp-boton lleno" href="/catalogo">Ver todo el catálogo</a>
              <a className="lp-boton" href="/catalogo?ver=reactivos">Reactivos e insumos</a>
            </div>
          </div>
        </section>

        <section className="lp-sec hondo chica">
          <div className="lp-ancho">
            <p className="lp-raya" style={{ marginBottom: 28 }}><Puntos />Marcas que comercializamos</p>
            <ul className="lp-marcas">
              {MARCAS.map((m) => <li key={m}><a href={`/catalogo?marca=${encodeURIComponent(m)}`}>{m}</a></li>)}
            </ul>
          </div>
        </section>

        <section id="software" className="lp-sec">
          <div className="lp-ancho">
            <Cabeza chip="Software" titulo="Lo que pasa después de la compra también importa" intro="Dos herramientas propias para el día a día de la institución." />
            <div className="lp-porta" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              <a href="/presentacion">
                <div className="foto" style={{ aspectRatio: "16 / 9" }}>
                  <div style={{ background: "#fff", padding: 18, borderRadius: 10, boxShadow: "0 18px 40px -22px rgba(27,47,99,.5)", textAlign: "center", transform: "rotate(-2deg)", outline: "2px dashed #b9c8de", outlineOffset: 6 }}>
                    <div style={{ width: 120, height: 120 }} dangerouslySetInnerHTML={{ __html: qr }} />
                    <div style={{ font: "600 14px var(--titulo)", color: "var(--az-hondo)", marginTop: 8 }}>Respirador · UTI</div>
                  </div>
                </div>
                <div className="txt"><h3 className="lp-h3">{MARCA}</h3><p>Inventario con etiqueta QR, hoja de vida, preventivos por fecha y por horas, órdenes de trabajo y repuestos. Para equipos de cualquier marca.</p><span className="mas">Conocer {MARCA} →</span></div>
              </a>
              <a href="/turnero">
                <div className="foto" style={{ aspectRatio: "16 / 9", padding: 24 }}><img src="/img/turnero/agenda.webp" alt="Agenda del día de Turnero" loading="lazy" style={{ borderRadius: 6, boxShadow: "0 18px 40px -22px rgba(27,47,99,.5)" }} /></div>
                <div className="txt"><h3 className="lp-h3">{TURNERO}</h3><p>Agenda por profesional y sede, turnos online, recordatorios por WhatsApp, sala de espera e historia clínica.</p><span className="mas">Conocer {TURNERO} →</span></div>
              </a>
            </div>
          </div>
        </section>

        <section className="lp-sec celeste">
          <div className="lp-ancho lp-dos">
            <div>
              <Chip>Cómo trabajamos</Chip>
              <h2 className="lp-h2">De la consulta al equipo funcionando</h2>
              <p className="lp-intro" style={{ marginBottom: 28 }}>Acompañamos la compra completa, no solo la factura.</p>
              <a className="lp-boton mayus" href="/contacto"><span className="flecha">↳</span> Iniciar consulta</a>
            </div>
            <Numeros items={[
              { t: "Relevamiento", d: "Nos contás qué necesitás, qué equipo reemplazás y en qué servicio va. Si hace falta, lo vemos en el lugar." },
              { t: "Propuesta", d: "Equipo, accesorios, instalación, capacitación y plan de mantenimiento en una sola cotización." },
              { t: "Puesta en marcha", d: `Instalación, capacitación del personal y alta del equipo en ${MARCA} con su etiqueta QR.` },
            ]} />
          </div>
        </section>

        <section className="lp-sec">
          <div className="lp-ancho lp-dos" style={{ alignItems: "center" }}>
            <ul className="lp-canales">
              {wa && <li><Icono nombre="chat" solo /><a href={wa}>WhatsApp<span>Respuesta en el día</span></a></li>}
              <li><Icono nombre="documento" solo /><a href="/contacto">Formulario de cotización<span>Equipos, reactivos y software</span></a></li>
              <li><Icono nombre="llave" solo /><a href={`/contacto?interes=${encodeURIComponent(MARCA)}`}>Mantenimiento y {MARCA}<span>Demostración con tu inventario</span></a></li>
              <li><Icono nombre="calendario" solo /><a href={`/contacto?interes=${encodeURIComponent(TURNERO)}`}>{TURNERO}<span>Demostración con tu agenda</span></a></li>
            </ul>
            <div>
              <Chip>Contacto</Chip>
              <h2 className="lp-h2">Elegí el canal para tu consulta</h2>
              <p className="lp-intro" style={{ marginBottom: 28 }}>Contanos qué necesitás y te respondemos con una propuesta concreta.</p>
              <a className="lp-boton mayus" href="/contacto"><span className="flecha">↳</span> Iniciar consulta</a>
            </div>
          </div>
        </section>

        <section className="lp-sec celeste">
          <div className="lp-ancho">
            <div className="lp-cabeza izq"><Chip>FAQ</Chip><h2 className="lp-h2">Preguntas frecuentes</h2></div>
            <Preguntas items={PREGUNTAS} />
          </div>
        </section>
      </main>
      <Pie />
    </div>
  );
}
