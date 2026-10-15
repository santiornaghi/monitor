import type { Metadata } from "next";
import { Cabecera, MenuCelular, Pie } from "@/components/sitio/Cabecera";
import { GRUPO, TURNERO } from "@/lib/marca";
import "../sitio.css";

export const metadata: Metadata = {
  title: { absolute: `${TURNERO}: turnos, sala de espera e historia clínica | ${GRUPO}` },
  description: "Agenda por profesional y sede, turnos online para pacientes, recordatorios por WhatsApp, sala de espera, historia clínica e indicadores.",
};

// Dirección de la demo pública, cuando esté publicada (ver turnero/deploy/RENDER.md)
const DEMO = process.env.NEXT_PUBLIC_TURNERO_DEMO ?? "https://turnero-wpbw.onrender.com";

const FUNCIONES = [
  { t: "Agenda por profesional y por sede", d: "Cada profesional con sus días, horarios y duración de turno. La recepción ve todas las agendas juntas y nunca se pueden dar dos turnos en el mismo horario, aunque dos personas lo intenten a la vez." },
  { t: "Turnos online para pacientes", d: "Cada institución tiene su portal: el paciente elige profesional, día y horario, recibe un código y con su DNI puede ver o cancelar el turno. No revela quién se atiende en la institución." },
  { t: "Recordatorios por WhatsApp", d: "Un día antes el paciente recibe el recordatorio y responde SI o NO: el turno se confirma o se libera solo. También se pueden mandar a mano desde la recepción." },
  { t: "Sala de espera", d: "La recepción marca la llegada, el profesional llama al paciente y finaliza la atención. La pantalla se actualiza sola en cada puesto." },
  { t: "Historia clínica que no se puede alterar", d: "Evoluciones con plantillas por especialidad. Solo los profesionales las ven y escriben, no se pueden modificar ni borrar, y queda registro de cada acceso." },
  { t: "Indicadores", d: "Turnos dados, atendidos, ausentes y cancelados por período, sede y profesional, para ordenar la agenda y bajar el ausentismo." },
  { t: "Teleconsulta", d: "Los profesionales que la ofrecen reciben turnos virtuales y el paciente ve el enlace de la videollamada el día del turno." },
  { t: "Varias sedes, una cuenta", d: "Una institución con varias sedes las maneja juntas; cada institución ve solo sus datos, protegidos en la base de datos." },
];

export default function Turnero() {
  return (
    <div className="lp">
      <Cabecera actual="turnero" />
      <MenuCelular />
      <main>
        <section className="lp-ancho lp-hero" style={{ gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }}>
          <div>
            <h1 className="lp-h1" style={{ fontSize: "clamp(36px, 5vw, 58px)" }}>Menos ausentes, la sala de espera ordenada.</h1>
            <p className="lp-bajada">
              {TURNERO} organiza los turnos de consultorios y clínicas: agenda por profesional, turnos online, recordatorios por WhatsApp,
              sala de espera e historia clínica, en una sola herramienta.
            </p>
            <div className="lp-ctas">
              {DEMO && <a className="lp-boton lleno" href={`${DEMO}/p/demo`}>Probar el portal de turnos</a>}
              <a className={DEMO ? "lp-boton" : "lp-boton lleno"} href={`/contacto?interes=${encodeURIComponent(TURNERO)}`}>Quiero usarlo en mi institución</a>
            </div>
          </div>
          <img src="/img/turnero/agenda.webp" alt="Agenda del día con los turnos de tres profesionales" style={{ width: "100%", borderRadius: 10, border: "1px solid var(--lp-linea)", boxShadow: "0 18px 40px -24px rgba(7,63,70,.45)" }} />
        </section>

        <section className="lp-bloque">
          <div className="lp-ancho">
            <h2 className="lp-h2">Todo el recorrido del paciente, del turno a la historia clínica.</h2>
            <div className="lp-funciones" style={{ marginTop: 32 }}>
              {FUNCIONES.map((f) => <div className="lp-funcion" key={f.t}><h3>{f.t}</h3><p>{f.d}</p></div>)}
            </div>
          </div>
        </section>

        <section className="lp-banda">
          <div className="lp-ancho lp-banda-grid" style={{ alignItems: "center" }}>
            <div>
              <h2 className="lp-h2">El paciente saca el turno solo, a cualquier hora.</h2>
              <p className="lp-intro">Con el portal de la institución, el paciente reserva desde el celular y recibe un código para consultar o cancelar. Un día antes le llega el recordatorio por WhatsApp.</p>
            </div>
            <img src="/img/turnero/portal.webp" alt="Confirmación de un turno en el portal de pacientes" style={{ width: "100%", maxWidth: 420, borderRadius: 10, justifySelf: "center" }} />
          </div>
        </section>

        <section className="lp-cierre">
          <div className="lp-ancho">
            <h2 className="lp-h2">Estamos sumando las primeras instituciones.</h2>
            <p className="lp-intro">Contanos cuántos profesionales y sedes tenés y te mostramos {TURNERO} con tu agenda.</p>
            <div className="lp-ctas">
              <a className="lp-boton lleno" href={`/contacto?interes=${encodeURIComponent(TURNERO)}`}>Pedir una demostración</a>
            </div>
          </div>
        </section>
      </main>
      <Pie />
    </div>
  );
}
